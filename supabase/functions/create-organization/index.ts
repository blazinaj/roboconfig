import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

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