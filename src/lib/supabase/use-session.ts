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
  avatar_path: string | null;
  bio: string | null;
  pronouns: string | null;
  grad_year: string | null;
  resume_path: string | null;
  undergrad_school: string | null;
  prior_firm: string | null;
  post_grad_target: string | null;
  cfa_progress: string | null;
  sectors: string[] | null;
  theme_color: string | null;
  theme_font: string | null;
  skills: string[] | null;
  certifications: string[] | null;
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
      .select("id, auth_user_id, username, full_name, team, role, linkedin_url, is_admin, avatar_path, bio, pronouns, grad_year, resume_path, undergrad_school, prior_firm, post_grad_target, cfa_progress, sectors, theme_color, theme_font, skills, certifications")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (error) {
      // Surface the exact reason loudly so a missing migration doesn't
      // masquerade as a "no roster row" error — the profile tab renders
      // based on `profile === null`, which makes column-doesn't-exist
      // failures look like roster mismatches.
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

    // Cross-component profile refresh: when any part of the app updates the
    // member row (avatar, bio, etc.) it dispatches `profile-updated`, and
    // every useSupabaseSession consumer re-pulls from the DB. Keeps the
    // header avatar, profile tab, and /m/ preview in sync without reload.
    const onProfileUpdate = () => {
      loadProfile(session?.user ?? null);
    };
    window.addEventListener("profile-updated", onProfileUpdate);

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("profile-updated", onProfileUpdate);
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
