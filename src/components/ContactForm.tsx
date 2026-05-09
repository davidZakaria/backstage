"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function ContactForm() {
  const t = useTranslations("contact");
  const [done, setDone] = useState(false);
  return (
    <form
      className="mx-auto mt-8 max-w-md space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fd.get("name"),
            email: fd.get("email"),
            message: fd.get("message"),
          }),
        });
        setDone(true);
      }}
    >
      <input name="name" required className="w-full rounded border px-3 py-2 text-sm" placeholder="Name" />
      <input name="email" type="email" required className="w-full rounded border px-3 py-2 text-sm" />
      <textarea name="message" required rows={4} className="w-full rounded border px-3 py-2 text-sm" />
      <button type="submit" className="rounded-full bg-black px-6 py-2 text-sm text-[#f5e8dd]">
        {t("submit")}
      </button>
      {done ? <p className="text-sm text-green-800">{t("thankYou")}</p> : null}
    </form>
  );
}
