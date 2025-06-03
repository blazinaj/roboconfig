import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface SupabaseContextType {
  session: Session | null;
  loading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  session: null,
  loading: true,
});

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for OAuth response
    const handleHashChange = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        // This is returning from an OAuth redirect
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) throw error;
          setSession(data.session);
          
          // Remove hash from URL to prevent issues with reloading
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('Error setting session:', err);
        }
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      // Check for hash params after setting initial session
      handleHashChange();
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Handle hash changes for OAuth redirects
    window.addEventListener('hashchange', handleHashChange);
    
    // If there's a hash on initial load, handle it
    if (window.location.hash.includes('access_token')) {
      handleHashChange();
    }

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ session, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
};