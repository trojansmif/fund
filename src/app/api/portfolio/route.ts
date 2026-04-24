import { NextResponse } from "next/server";
import { loadSnapshot } from "@/lib/live-portfolio";

export const revalidate = 900; // ISR: 15 minutes

export async function GET() {
  const snapshot = await loadSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "cache-control":
        "public, s-maxage=900, stale-while-revalidate=86400",
    },
  });
}
