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

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (action === 'create') {
      return await handleCreate(req, user);
    } else if (action === 'invite') {
      return await handleInvite(req, user);
    } else if (action === 'accept-invite') {
      return await handleAcceptInvite(req, user);
    } else if (action === 'remove-member') {
      return await handleRemoveMember(req, user);
    }

    throw new Error(`Unknown action: ${action}`);
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

async function handleCreate(req: Request, user: any) {
  const { name } = await req.json();
  
  if (!name) {
    throw new Error('Organization name is required');
  }

  // Generate slug from name
  const slug = name.toLowerCase()
    .replace(/[^\w\s]/gi, '')   // Remove special chars
    .replace(/\s+/g, '-');      // Replace spaces with hyphens

  // Create the organization
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert([{ name, slug }])
    .select('id')
    .single();
    
  if (orgError) {
    if (orgError.code === '23505') { // Unique violation
      throw new Error('An organization with this name already exists');
    }
    throw orgError;
  }

  // Add the user as the owner
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert([{ 
      organization_id: orgData.id, 
      user_id: user.id, 
      role: 'owner' 
    }]);
    
  if (memberError) {
    // Roll back the organization creation if we can't add the member
    await supabase
      .from('organizations')
      .delete()
      .eq('id', orgData.id);
    
    throw memberError;
  }

  return new Response(
    JSON.stringify({ 
      id: orgData.id,
      name,
      slug
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleInvite(req: Request, user: any) {
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

  return new Response(
    JSON.stringify({ 
      message: 'Invitation sent',
      inviteLink: `${supabaseUrl}/accept-invite?token=${token}`
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleAcceptInvite(req: Request, user: any) {
  const { token } = await req.json();
  
  if (!token) {
    throw new Error('Invitation token is required');
  }

  // Get the invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('token', token)
    .single();
    
  if (inviteError) {
    throw new Error('Invalid or expired invitation');
  }

  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation has expired');
  }

  // Check if the user's email matches the invitation
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error('This invitation was sent to a different email address');
  }

  // Add the user as a member
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert([{ 
      organization_id: invitation.organization_id, 
      user_id: user.id, 
      role: invitation.role 
    }]);
    
  if (memberError) {
    if (memberError.code === '23505') { // Unique violation
      throw new Error('You are already a member of this organization');
    }
    throw memberError;
  }

  // Delete the invitation
  await supabase
    .from('organization_invitations')
    .delete()
    .eq('id', invitation.id);

  return new Response(
    JSON.stringify({ 
      message: 'You have successfully joined the organization',
      organizationId: invitation.organization_id
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleRemoveMember(req: Request, user: any) {
  const { organizationId, memberId } = await req.json();
  
  if (!organizationId || !memberId) {
    throw new Error('Missing required fields');
  }

  // Check if user has permission (must be owner)
  const { data: memberData, error: memberError } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single();
    
  if (memberError) {
    throw new Error('Failed to verify permissions');
  }

  if (memberData.role !== 'owner') {
    throw new Error('Only organization owners can remove members');
  }

  // Check if trying to remove self as owner
  if (memberId === user.id && memberData.role === 'owner') {
    // Count other owners
    const { data: ownersData, error: ownersError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('role', 'owner');
      
    if (ownersError) {
      throw ownersError;
    }

    if (ownersData.length <= 1) {
      throw new Error('Cannot remove yourself as the only owner. Transfer ownership first.');
    }
  }

  // Remove the member
  const { error: removeError } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', memberId);
    
  if (removeError) {
    throw removeError;
  }

  return new Response(
    JSON.stringify({ 
      message: 'Member removed successfully'
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}