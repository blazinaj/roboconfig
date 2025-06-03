import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { useSupabase } from '../context/SupabaseContext';
import { User, Mail, Key, Shield, Loader2, Save, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ProfilePage: React.FC = () => {
  const { session } = useSupabase();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // Populate user data
      const userMeta = session.user.user_metadata || {};
      setEmail(session.user.email || '');
      
      // Handle both custom and OAuth provider metadata
      setFullName(userMeta.full_name || userMeta.name || '');
      setAvatarUrl(userMeta.avatar_url || userMeta.picture || null);
      
      // Check if user is authenticated with OAuth
      const isOAuth = !!session.user.app_metadata.provider && 
                     session.user.app_metadata.provider !== 'email';
      setIsOAuthUser(isOAuth);
      
      loadUserProfile();
    }
  }, [session]);

  const loadUserProfile = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      // If no profile exists, create one
      if (!data) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: session.user.id,
              full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || '',
              avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture || null
            }
          ]);
          
        if (insertError) throw insertError;
      } else {
        // If you have additional profile fields, set them here
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        }
      });

      if (error) throw error;
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      setSuccess('Password changed successfully');
      setChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while changing your password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${session?.user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    setUploading(true);
    
    try {
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update the user's metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: data.publicUrl,
        }
      });
      
      if (updateError) throw updateError;
      
      setAvatarUrl(data.publicUrl);
      setSuccess('Avatar updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while uploading your avatar');
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
                  <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
                  <CheckCircle size={20} className="mr-2 flex-shrink-0" />
                  <p className="text-sm">{success}</p>
                </div>
              )}

              {isOAuthUser && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center text-blue-700">
                  <div className="mr-3">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Google Account Connected</p>
                    <p className="text-xs">Your profile is managed by Google</p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    readOnly
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  To change your email, please contact support.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Password */}
          {!isOAuthUser && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Password</h2>
              </div>
              <div className="p-6">
                {changePassword ? (
                  <form onSubmit={handleChangePassword}>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key size={20} className="text-gray-400" />
                          </div>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter current password"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key size={20} className="text-gray-400" />
                          </div>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter new password"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key size={20} className="text-gray-400" />
                          </div>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setChangePassword(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin mr-2" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-700 font-medium">Change your password</p>
                      <p className="text-sm text-gray-500">
                        Ensure your account is using a strong password for security.
                      </p>
                    </div>
                    <button
                      onClick={() => setChangePassword(true)}
                      className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700 font-medium">Two-factor authentication</p>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  Set up
                </button>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div>
                  <p className="text-gray-700 font-medium">Session management</p>
                  <p className="text-sm text-gray-500">
                    Manage your active sessions on different devices
                  </p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Profile Picture</h2>
            </div>
            <div className="p-6 text-center">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="w-full h-full p-8 text-gray-400" />
                )}
              </div>
              
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading || isOAuthUser}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                  disabled={uploading || isOAuthUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center mx-auto"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera size={16} className="mr-2" />
                      Upload New Image
                    </>
                  )}
                </button>
              </label>
              
              {isOAuthUser && (
                <p className="text-xs text-gray-500 mt-2">
                  Your profile picture is managed by your Google account
                </p>
              )}
              {!isOAuthUser && (
                <p className="text-xs text-gray-500 mt-2">
                  JPG, GIF or PNG. Max size 2MB.
                </p>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Authentication Provider</p>
                  <div className="flex items-center mt-1">
                    {isOAuthUser ? (
                      <>
                        <svg className="w-4 h-4 mr-2\" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <p className="font-medium text-gray-900">Google</p>
                      </>
                    ) : (
                      <>
                        <Mail size={16} className="mr-2 text-gray-400" />
                        <p className="font-medium text-gray-900">Email/Password</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {session?.user.created_at 
                      ? new Date(session.user.created_at).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Last Sign In</p>
                  <p className="font-medium text-gray-900">
                    {session?.user.last_sign_in_at 
                      ? new Date(session.user.last_sign_in_at).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Account ID</p>
                  <p className="font-mono text-xs text-gray-500 truncate">
                    {session?.user.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;