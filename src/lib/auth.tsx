
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  user_type: number;
  user_uuid: string;
  profile_image_url: string | null;
  organisation_id: number | null;
  phone: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (!cancelled) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const authUser = session.user;

      const { data: profileRow } = await supabase
        .from("user")
        .select(
          "id, name, email, user_type, user_uuid, profile_image_url, organisation_id, phone"
        )
        .eq("user_uuid", authUser.id)
        .maybeSingle();

      if (!cancelled) {
        setSession(session);
        setUser(authUser);
        setProfile(profileRow ?? null);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (!newSession) return;
            const authUser = newSession.user;
            const { data: profileRow } = await supabase
                .from("user")
                .select("id, name, email, user_type, user_uuid, profile_image_url, organisation_id, phone")
                .eq("user_uuid", authUser.id)
                .maybeSingle();
            
            setSession(newSession);
            setUser(authUser);
            setProfile(profileRow ?? null);
        } else if (event === 'SIGNED_OUT') {
            setSession(null);
            setUser(null);
            setProfile(null);
            router.replace('/login');
        }
        setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    const authUser = data.user!;
    const { data: profileRow, error: profileError } = await supabase
      .from("user")
      .select(
        "id, name, email, user_type, user_uuid, profile_image_url, organisation_id, phone"
      )
      .eq("user_uuid", authUser.id)
      .single();

    if (profileError) {
      setLoading(false);
      throw profileError;
    }

    setSession(data.session);
    setUser(authUser);
    setProfile(profileRow);
    setLoading(false);

    switch (profileRow.user_type) {
      case 2: router.replace('/livingspace'); break;
      case 3: router.replace('/super-admin/dashboard'); break;
      case 4: router.replace('/employee/dashboard'); break;
      case 6: router.replace('/sales/dashboard'); break;
      case 7: router.replace('/education/dashboard'); break;
      case 8: router.replace('/hospitality/dashboard'); break;
      case 9: router.replace('/arena/dashboard'); break;
      default: router.replace('/'); break;
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // onAuthStateChange will handle state clearing and redirect
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
