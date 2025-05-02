import React, { useState } from 'react';
import { useSupabase } from '../../context/SupabaseContext';
import { AuthModal } from '../Auth/AuthModal';
import { LogIn, LogOut, User } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { session } = useSupabase();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!session) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <LogIn size={20} className="mr-2" />
          Sign In
        </button>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-1">
        <User size={20} className="text-gray-400" />
        <span className="text-sm text-gray-700">{session.user.email}</span>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};