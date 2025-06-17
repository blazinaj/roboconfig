import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request
    const { 
      inventoryItemId, 
      transactionType, 
      quantity, 
      notes, 
      referenceId, 
      referenceType, 
      organizationId
    } = await req.json();
    
    if (!inventoryItemId || !transactionType || quantity === undefined) {
      throw new Error('Missing required parameters');
    }

    // Get the current inventory item
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', inventoryItemId)
      .single();
      
    if (inventoryError) {
      throw new Error(`Error fetching inventory item: ${inventoryError.message}`);
    }

    // Calculate new quantity based on transaction type
    let newQuantity = inventoryItem.quantity;
    
    switch (transactionType) {
      case 'receipt':
        newQuantity += quantity;
        break;
      case 'issue':
        if (quantity > inventoryItem.quantity) {
          throw new Error('Insufficient inventory quantity for issue transaction');
        }
        newQuantity -= quantity;
        break;
      case 'adjustment':
        newQuantity = quantity;
        break;
      case 'transfer':
        if (quantity > inventoryItem.quantity) {
          throw new Error('Insufficient inventory quantity for transfer transaction');
        }
        newQuantity -= quantity;
        break;
      default:
        throw new Error(`Invalid transaction type: ${transactionType}`);
    }

    // Execute transaction (in a transaction block)
    // 1. Create the inventory transaction record
    // 2. Update the inventory item quantity
    const { data: transaction, error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert([
        {
          inventory_item_id: inventoryItemId,
          transaction_type: transactionType,
          quantity,
          reference_id: referenceId,
          reference_type: referenceType,
          notes,
          created_by: user.id,
          organization_id: organizationId
        }
      ])
      .select()
      .single();
      
    if (transactionError) {
      throw new Error(`Error creating inventory transaction: ${transactionError.message}`);
    }

    // Update inventory quantity
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({ quantity: newQuantity })
      .eq('id', inventoryItemId);
      
    if (updateError) {
      throw new Error(`Error updating inventory quantity: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction,
        newQuantity
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing inventory transaction:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});