"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function LoginPage() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl">{t("login")}</h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          const fd = new FormData(e.currentTarget);
          const r = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: fd.get("email"),
              password: fd.get("password"),
            }),
          });
          const j = await r.json();
          if (!r.ok) {
            setErr(j.error ?? "Failed");
            return;
          }
          if (j.role === "ADMIN") router.push("/admin");
          else router.push("/my-stage");
        }}
      >
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-black/10 px-3 py-2"
          placeholder="Email"
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
          {t("login")}
        </button>
      </form>
    </div>
  );
}
