import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSupabase } from '../context/SupabaseContext';
import { Building, Loader2, CheckCircle, XCircle, LogIn } from 'lucide-react';
import { AuthModal } from '../components/Auth/AuthModal';

const AcceptInvitePage: React.FC = () => {
  const { session } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [invitation, setInvitation] = useState<{
    organization_id: string;
    organization_name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      fetchInvitationDetails(tokenParam);
    }
  }, [location]);

  const fetchInvitationDetails = async (inviteToken: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*, organizations(name)')
        .eq('token', inviteToken)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setInvitation({
          organization_id: data.organization_id,
          organization_name: data.organizations.name,
          email: data.email,
          role: data.role
        });
      }
    } catch (err) {
      console.error('Error fetching invitation:', err);
      setError('Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!session || !token) {
      setShowAuthModal(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the Edge Function to accept the invitation
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/organization-management/accept-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ token })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept invitation');
      }
      
      setSuccess(true);
      
      // Redirect to the dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invitation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <Loader2 size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading invitation...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <XCircle size={48} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Accepted</h2>
          <p className="text-gray-600 mb-6">
            You have successfully joined the organization. Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Organization Invitation</h2>
          
          {invitation && (
            <div className="mt-4">
              <p className="text-gray-600">
                You've been invited to join <strong>{invitation.organization_name}</strong> as a <strong>{invitation.role}</strong>.
              </p>
              {!session && (
                <p className="text-sm text-gray-500 mt-2">
                  You'll need to sign in or create an account to accept this invitation.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!session ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <LogIn size={18} className="mr-2" />
              Sign in to accept
            </button>
          ) : (
            <button
              onClick={handleAcceptInvite}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Accept Invitation
                </>
              )}
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    </div>
  );
};

export default AcceptInvitePage;