import React from 'react';
import { useStripe } from '../hooks/useStripe';
import { useSubscription } from '../hooks/useSubscription';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { Loader2, LogIn } from 'lucide-react';
import { useUser } from '@supabase/auth-helpers-react';

export const Pricing: React.FC = () => {
  const { createCheckoutSession, loading, error } = useStripe();
  const { subscription, isActive } = useSubscription();
  const user = useUser();

  const handleUpgrade = async () => {
    if (!user) {
      return;
    }

    try {
      await createCheckoutSession({
        priceId: STRIPE_PRODUCTS.ROBOCONFIG.priceId,
        mode: STRIPE_PRODUCTS.ROBOCONFIG.mode,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/dashboard?success=false`,
      });
    } catch (err) {
      console.error('Failed to create checkout session:', err);
    }
  };

  if (isActive) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="text-green-800 font-medium">Active Subscription</h3>
          <p className="text-green-600 text-sm">You have access to all features</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          Pro
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Upgrade to Pro</h3>
          <p className="text-gray-600 mt-1">Get access to all features and premium support</p>
          <ul className="mt-3 space-y-2">
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              Unlimited machines and components
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              Advanced risk assessment tools
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              Priority support
            </li>
          </ul>
        </div>
        <div className="w-full md:w-auto">
          <div className="text-center md:text-right mb-4">
            <div className="text-3xl font-bold text-gray-900">$1.00</div>
            <div className="text-sm text-gray-600">per month</div>
          </div>
          <button
            onClick={handleUpgrade}
            disabled={loading || !user}
            className={`w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium 
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Processing...
              </>
            ) : !user ? (
              <>
                <LogIn size={16} className="mr-2" />
                Sign in to upgrade
              </>
            ) : (
              'Upgrade Now'
            )}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};