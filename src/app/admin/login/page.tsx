"use client";

import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="font-display text-3xl">Admin sign in</h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
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
            alert(j.error ?? "Failed");
            return;
          }
          if (j.role !== "ADMIN") {
            alert("Not an admin");
            await fetch("/api/auth/logout", { method: "POST" });
            return;
          }
          window.location.href = "/admin";
        }}
      >
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
        <button
          type="submit"
          className="w-full rounded-full bg-black py-2 text-sm font-medium text-[#f5e8dd]"
        >
          Sign in
        </button>
      </form>
      <Link href="/en" className="mt-8 text-center text-sm text-black/50">
        ← Storefront
      </Link>
    </div>
  );
}
