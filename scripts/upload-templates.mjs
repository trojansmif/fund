// One-shot uploader for SMIF template files.
// Reads .env.upload.tmp (pulled via `vercel env pull`), connects to Supabase
// with the service-role key, and uploads each file into the fund-docs bucket
// + inserts a matching row into public.documents.
//
// Usage (from project root):
//   node scripts/upload-templates.mjs
//
// This script is safe to re-run; duplicate storage_path uploads are skipped
// rather than overwritten. Delete rows in the admin UI if you want to retry.

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const FILES = [
  "C:/Users/conno/OneDrive/Desktop/SMIF Templates/Investment_Memo_Template.docx",
  "C:/Users/conno/OneDrive/Desktop/SMIF Templates/Pitch_Deck_Template.pptx",
  "C:/Users/conno/OneDrive/Desktop/SMIF Templates/SMIF_Fund_Portfolio_Tracker.xlsx",
  "C:/Users/conno/OneDrive/Desktop/SMIF Templates/TROJAN_SMIF_HANDBOOK_Simplified.docx",
  "C:/Users/conno/OneDrive/Desktop/SMIF Templates/Valuation_Model_Template.xlsx",
];

const MIME = {
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".pdf": "application/pdf",
};

function loadEnv(file) {
  if (!fs.existsSync(file)) throw new Error(`env file not found: ${file}`);
  const text = fs.readFileSync(file, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function main() {
  const env = loadEnv(path.resolve(".env.upload.tmp"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  for (const fp of FILES) {
    const name = path.basename(fp);
    if (!fs.existsSync(fp)) {
      console.error(`  [skip] ${name} — file not found at ${fp}`);
      skipped++;
      continue;
    }
    const buf = fs.readFileSync(fp);
    const ext = path.extname(name).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const stamp = Date.now();
    const safeName = name.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const storagePath = `${stamp}_${safeName}`;

    console.log(`  uploading ${name} (${(buf.length / 1024).toFixed(0)} KB)…`);
    const upload = await admin.storage
      .from("fund-docs")
      .upload(storagePath, buf, { contentType, upsert: false });
    if (upload.error) {
      console.error(`  [fail] storage: ${upload.error.message}`);
      failed++;
      continue;
    }
    const insert = await admin.from("documents").insert({
      storage_path: storagePath,
      display_name: name,
      mime_type: contentType,
      size_bytes: buf.length,
    });
    if (insert.error) {
      console.error(`  [fail] metadata: ${insert.error.message}`);
      failed++;
      continue;
    }
    ok++;
    console.log(`  ok`);
  }

  console.log(`\nDone — ${ok} uploaded, ${skipped} skipped, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
