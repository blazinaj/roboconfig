import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { v4 as uuidv4 } from 'npm:uuid@9.0.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get request body
    const { organizationId, email, role } = await req.json();
    
    if (!organizationId || !email || !role) {
      throw new Error('Missing required fields');
    }

    if (!['admin', 'member'].includes(role)) {
      throw new Error('Invalid role. Must be "admin" or "member"');
    }

    // Check if user has permission (must be owner or admin)
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();
      
    if (memberError) {
      throw new Error('Failed to verify permissions');
    }

    if (!['owner', 'admin'].includes(memberData.role)) {
      throw new Error('You do not have permission to invite members');
    }

    // Check if user already exists
    const { data: existingUserData, error: existingUserError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    // Generate invitation token
    const token = uuidv4();
    
    // Set expiry (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create invitation
    const { error: inviteError } = await supabase
      .from('organization_invitations')
      .insert([{
        organization_id: organizationId,
        email,
        role,
        token,
        expires_at: expiresAt.toISOString()
      }]);
      
    if (inviteError) {
      if (inviteError.code === '23505') { // Unique violation
        throw new Error('An invitation has already been sent to this email');
      }
      throw inviteError;
    }

    // Here you would typically send an email with the invitation link
    // For this example, we're just returning the token
    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent',
        inviteLink: `${supabaseUrl}/accept-invite?token=${token}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});