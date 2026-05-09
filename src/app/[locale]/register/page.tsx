"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function RegisterPage() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl">{t("register")}</h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          const fd = new FormData(e.currentTarget);
          const r = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: fd.get("email"),
              password: fd.get("password"),
              name: fd.get("name"),
            }),
          });
          const j = await r.json();
          if (!r.ok) {
            setErr(j.error ?? "Failed");
            return;
          }
          router.push("/my-stage");
        }}
      >
        <input
          name="name"
          className="w-full rounded-lg border border-black/10 px-3 py-2"
          placeholder="Name"
        />
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-black/10 px-3 py-2"
        />
        {err ? <p className="text-sm text-red-700">{err}</p> : null}
        <button
          type="submit"
          className="w-full rounded-full bg-[var(--color-brand-ink)] py-2 text-sm font-medium text-[var(--color-brand-primary)]"
        >
          {t("register")}
        </button>
      </form>
    </div>
  );
}
