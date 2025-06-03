import { useEffect, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';

interface Subscription {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useSubscription() {
  const { supabase } = useSupabase();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setError('Supabase client is not initialized');
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (fetchError) throw fetchError;

        setSubscription(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Subscribe to changes only if supabase is available
    const channel = supabase
      .channel('stripe_subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stripe_subscriptions'
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  return {
    subscription,
    loading,
    error,
    isActive: subscription?.subscription_status === 'active',
  };
}