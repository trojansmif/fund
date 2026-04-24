import { NextResponse } from "next/server";

// Redacted Supabase configuration diagnostic.
// Returns just enough info to verify the URL shape is valid; never exposes keys.
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  let urlValid = false;
  let urlHost: string | null = null;
  let urlHasTrailingSlash = false;
  let urlHasWhitespace = false;
  try {
    const u = new URL(url);
    urlValid = true;
    urlHost = u.host;
    urlHasTrailingSlash = url.endsWith("/");
    urlHasWhitespace = /\s/.test(url);
  } catch {
    urlValid = false;
  }

  return NextResponse.json({
    urlConfigured: !!url,
    urlValid,
    urlHost,
    urlHasTrailingSlash,
    urlHasWhitespace,
    urlLength: url.length,
    anonKeyPresent: !!anonKey,
    anonKeyLength: anonKey.length,
    anonKeyStartsWith: anonKey.slice(0, 6) || null,
    serviceKeyPresent: !!serviceKey,
    serviceKeyLength: serviceKey.length,
  });
}
