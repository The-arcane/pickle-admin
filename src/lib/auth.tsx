"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import type { Session, User } from '@supabase/supabase-js';

type UserProfile = {
  id: number;
  name: string;
  email: string;
  profile_image_url: string | null;
  user_type: number;
} | null;

type AuthContextType = {
  session: Session | null;
  profile: UserProfile;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);

  async function loadSession() {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const activeSession = data?.session || null;
    setSession(activeSession);

    if (activeSession) {
      const { data: profileData } = await supabase
        .from("user")
        .select("*")
        .eq("user_uuid", activeSession.user.id)
        .single();
      setProfile(profileData || null);
    } else {
      setProfile(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // The onAuthStateChange callback is simpler now, just re-running loadSession
      // ensures both session and profile are synced correctly.
      loadSession();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = { session, profile, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
