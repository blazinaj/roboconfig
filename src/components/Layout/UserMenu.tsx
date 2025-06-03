import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseContext';
import { LogIn, LogOut, User, UserCircle, Settings, Building, HelpCircle, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const UserMenu: React.FC = () => {
  const { session } = useSupabase();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setShowMenu(false);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!session) {
    return (
      <Link
        to="/signin"
        className="flex items-center px-3 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 w-full"
      >
        <LogIn size={16} className="mr-2" />
        <span>Sign In</span>
      </Link>
    );
  }

  // Get avatar URL and name from user metadata
  const userMeta = session.user.user_metadata || {};
  const avatarUrl = userMeta.avatar_url || userMeta.picture;
  const fullName = userMeta.full_name || userMeta.name || session.user.email;
  const displayName = typeof fullName === 'string' && fullName.length > 0 
    ? (fullName.split(' ')[0] || '') 
    : (session.user.email?.split('@')[0] || '');

  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 w-full bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-blue-700 flex-shrink-0">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle size={20} className="text-white" />
          )}
        </div>
        <div className="flex-1 text-left overflow-hidden">
          <p className="text-sm font-medium text-white truncate">{displayName}</p>
          <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
        </div>
      </button>

      {showMenu && (
        <div className="absolute left-0 right-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-30">
          <div className="py-1" role="menu">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={closeMenu}
            >
              <User size={16} className="mr-2" />
              Profile Settings
            </Link>
            
            <div className="border-t border-gray-100">
              <Link
                to="/organizations"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={closeMenu}
              >
                <Building size={16} className="mr-2" />
                Organizations
              </Link>
              
              <a
                href="https://docs.roboconfig.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={closeMenu}
              >
                <FileText size={16} className="mr-2" />
                Documentation
                <ExternalLink size={12} className="ml-1" />
              </a>

              <a
                href="mailto:support@roboconfig.com"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={closeMenu}
              >
                <HelpCircle size={16} className="mr-2" />
                Support
              </a>
            </div>

            <div className="border-t border-gray-100">
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};