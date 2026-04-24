import { getSupabaseBrowser } from "@/lib/supabase/client";

// Shape mirrors the Supabase `pitches` table.
export type Pitch = {
  id: string;
  submitted_by_member_id: string | null;
  ticker: string;
  company: string;
  recommendation: "BUY" | "HOLD" | "SELL";
  entry_price: number | null;
  target_price: number | null;
  upside_pct: number | null;
  thesis: string;
  catalysts: string | null;
  risks: string | null;
  status: "PITCHED" | "APPROVED" | "DENIED" | "VETOED" | "WITHDRAWN";
  faculty_veto_reason: string | null;
  decided_at: string | null;
  created_at: string;
  memo_path: string | null;
  memo_filename: string | null;
  share_to_research: boolean;
};

export function publicMemoUrl(memoPath: string | null): string | null {
  if (!memoPath) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/pitch-memos/${memoPath}`;
}

export async function uploadPitchMemo(
  file: File,
  authUserId: string
): Promise<{ ok: true; path: string; filename: string } | { ok: false; error: string }> {
  const sb = getSupabaseBrowser();
  if (!sb) return { ok: false, error: "Not signed in" };
  const ext = file.name.split(".").pop() || "bin";
  const path = `${authUserId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from("pitch-memos").upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, path, filename: file.name };
}

export type VoteDecision = "APPROVE" | "DENY" | "VETO";

export type PitchVote = {
  id: string;
  pitch_id: string;
  voter_member_id: string;
  decision: VoteDecision;
  note: string | null;
  created_at: string;
};

/** Member-facing helpers */

export async function listMyPitches(authUserId: string): Promise<Pitch[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];
  const { data: me } = await sb
    .from("members")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (!me?.id) return [];
  const { data } = await sb
    .from("pitches")
    .select("*")
    .eq("submitted_by_member_id", me.id)
    .order("created_at", { ascending: false });
  return (data as Pitch[]) ?? [];
}

export async function submitPitch(input: {
  memberId: string;
  ticker: string;
  company: string;
  recommendation: "BUY" | "HOLD" | "SELL";
  entry_price: number | null;
  target_price: number | null;
  upside_pct: number | null;
  thesis: string;
  catalysts: string | null;
  risks: string | null;
  memo_path?: string | null;
  memo_filename?: string | null;
  share_to_research?: boolean;
}): Promise<{ ok: true; pitch: Pitch } | { ok: false; error: string }> {
  const sb = getSupabaseBrowser();
  if (!sb) return { ok: false, error: "Not signed in" };
  const { data, error } = await sb
    .from("pitches")
    .insert({
      submitted_by_member_id: input.memberId,
      ticker: input.ticker.toUpperCase().trim(),
      company: input.company.trim(),
      recommendation: input.recommendation,
      entry_price: input.entry_price,
      target_price: input.target_price,
      upside_pct: input.upside_pct,
      thesis: input.thesis.trim(),
      catalysts: input.catalysts,
      risks: input.risks,
      memo_path: input.memo_path ?? null,
      memo_filename: input.memo_filename ?? null,
      share_to_research: input.share_to_research ?? false,
      status: "PITCHED",
    })
    .select("*")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, pitch: data as Pitch };
}

export async function withdrawPitch(pitchId: string): Promise<boolean> {
  const sb = getSupabaseBrowser();
  if (!sb) return false;
  const { error } = await sb
    .from("pitches")
    .update({ status: "WITHDRAWN", decided_at: new Date().toISOString() })
    .eq("id", pitchId);
  return !error;
}

/** Admin / IC helpers */

export async function listAllPitches(): Promise<Pitch[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];
  const { data } = await sb.from("pitches").select("*").order("created_at", { ascending: false });
  return (data as Pitch[]) ?? [];
}

export async function listVotesForPitch(pitchId: string): Promise<PitchVote[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];
  const { data } = await sb
    .from("pitch_votes")
    .select("*")
    .eq("pitch_id", pitchId)
    .order("created_at");
  return (data as PitchVote[]) ?? [];
}

export async function castVote(input: {
  pitchId: string;
  voterMemberId: string;
  decision: VoteDecision;
  note?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabaseBrowser();
  if (!sb) return { ok: false, error: "Not signed in" };
  const { error } = await sb.from("pitch_votes").upsert(
    {
      pitch_id: input.pitchId,
      voter_member_id: input.voterMemberId,
      decision: input.decision,
      note: input.note?.trim() || null,
    },
    { onConflict: "pitch_id,voter_member_id" }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function clearVote(pitchId: string, voterMemberId: string) {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  await sb.from("pitch_votes").delete().eq("pitch_id", pitchId).eq("voter_member_id", voterMemberId);
}

export function computeUpside(entry: number | null, target: number | null): number | null {
  if (entry == null || target == null || entry <= 0) return null;
  return ((target - entry) / entry) * 100;
}

export const STATUS_COPY: Record<Pitch["status"], { label: string; tone: "neutral" | "positive" | "negative" | "warning" | "veto" }> = {
  PITCHED: { label: "Pending IC vote", tone: "neutral" },
  APPROVED: { label: "Approved by IC", tone: "positive" },
  DENIED: { label: "Denied by IC", tone: "negative" },
  VETOED: { label: "Vetoed by Faculty Advisor", tone: "veto" },
  WITHDRAWN: { label: "Withdrawn", tone: "warning" },
};
