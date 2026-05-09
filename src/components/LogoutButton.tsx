"use client";

export function LogoutButton({ label, locale }: { label: string; locale: string }) {
  return (
    <button
      type="button"
      className="rounded-full border border-black/10 px-4 py-2 text-xs"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = `/${locale}/login`;
      }}
    >
      {label}
    </button>
  );
}
