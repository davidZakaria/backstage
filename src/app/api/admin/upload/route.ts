import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

function safeExt(file: File): string {
  const n = file.name.trim();
  const i = n.lastIndexOf(".");
  if (i <= 0 || i === n.length - 1) return "bin";
  const ext = n
    .slice(i + 1)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return (ext || "bin").slice(0, 8);
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET?.trim() || "product-media";

  if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const path = `products/${auth.session.sub}/${Date.now()}-${randomUUID()}.${safeExt(file)}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from(bucket).upload(path, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) {
      const raw = error.message ?? "Supabase upload failed";
      const bucketHint =
        /bucket not found|not found/i.test(raw)
          ? ` In Supabase → Storage, create a public bucket exactly named “${bucket}” (or set SUPABASE_STORAGE_BUCKET in .env to match an existing bucket).`
          : "";
      return NextResponse.json({ error: raw + bucketHint }, { status: 400 });
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    await writeAudit({
      adminUserId: auth.session.sub,
      action: "media.upload",
      entityType: "SupabaseStorage",
      metadata: { bytes: file.size, bucket, path },
    });
    return NextResponse.json({ url: pub.publicUrl });
  }

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (cloud && preset) {
    const up = new FormData();
    up.append("file", file);
    up.append("upload_preset", preset);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/auto/upload`,
      {
        method: "POST",
        body: up,
      },
    );
    const j = (await res.json()) as {
      secure_url?: string;
      error?: { message?: string };
    };
    if (!res.ok) {
      return NextResponse.json(
        { error: j.error?.message ?? "Upload failed" },
        { status: 400 },
      );
    }
    await writeAudit({
      adminUserId: auth.session.sub,
      action: "media.upload",
      entityType: "Cloudinary",
      metadata: { bytes: file.size },
    });
    return NextResponse.json({ url: j.secure_url });
  }

  return NextResponse.json(
    {
      error:
        "Configure Supabase Storage (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, public bucket) or Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET).",
    },
    { status: 501 },
  );
}
