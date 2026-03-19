import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContext {
  user: User | null;
  session: Session | null;
  loading: boolean;
  displayName: string;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthCtx = createContext<AuthContext>({
  user: null,
  session: null,
  loading: true,
  displayName: "",
  signOut: async () => {},
  updateDisplayName: async () => {},
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateDisplayName = async (name: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { display_name: name.trim() },
    });
    if (error) throw error;
  };

  const user = session?.user ?? null;
  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <AuthCtx.Provider value={{ user, session, loading, displayName, signOut, updateDisplayName }}>
      {children}
    </AuthCtx.Provider>
  );
}
