import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'owner' | 'staff' | 'calendar_only';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  isApproved: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user roles and approval status
          setTimeout(async () => {
            const [rolesResult, profileResult] = await Promise.all([
              supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id),
              supabase
                .from('profiles')
                .select('is_approved')
                .eq('user_id', session.user.id)
                .single()
            ]);
            
            if (rolesResult.data) {
              setRoles(rolesResult.data.map(r => r.role as AppRole));
            }
            
            setIsApproved(profileResult.data?.is_approved ?? false);
          }, 0);
        } else {
          setRoles([]);
          setIsApproved(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const [rolesResult, profileResult] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id),
          supabase
            .from('profiles')
            .select('is_approved')
            .eq('user_id', session.user.id)
            .single()
        ]);
        
        if (rolesResult.data) {
          setRoles(rolesResult.data.map(r => r.role as AppRole));
        }
        
        setIsApproved(profileResult.data?.is_approved ?? false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setIsApproved(false);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      roles,
      isApproved,
      signUp,
      signIn,
      signOut,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
