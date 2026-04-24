"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "./client";

export type MemberProfile = {
  id: string;
  auth_user_id: string | null;
  username: string;
  full_name: string;
  team: string;
  role: string;
  linkedin_url: string | null;
  is_admin: boolean;
};

export type SessionState = {
  loading: boolean;
  configured: boolean;
  session: Session | null;
  user: User | null;
  profile: MemberProfile | null;
  refreshProfile: () => Promise<void>;
};

export function useSupabaseSession(): SessionState {
  const supabase = getSupabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  const loadProfile = async (user: User | null) => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from("members")
      .select("id, auth_user_id, username, full_name, team, role, linkedin_url, is_admin")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (error) {
      console.warn("[supabase] profile load failed:", error.message);
      setProfile(null);
      return;
    }
    setProfile(data as MemberProfile | null);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      loadProfile(data.session?.user ?? null).finally(() => {
        if (active) setLoading(false);
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      loadProfile(newSession?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading,
    configured: !!supabase,
    session,
    user: session?.user ?? null,
    profile,
    refreshProfile: () => loadProfile(session?.user ?? null),
  };
}
