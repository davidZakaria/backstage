"use client";

"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { pushDataLayer } from "@/lib/analytics/dataLayer";

type Step = { id: string; questionEn: string; questionAr: string };

const steps: Step[] = [
  { id: "1", questionEn: "Your space needs…", questionAr: "مساحتك تحتاج…" },
  { id: "2", questionEn: "You reach for textures that feel…", questionAr: "تلمس نسيجاً يبدو…" },
  { id: "3", questionEn: "Lighting in your home is mostly…", questionAr: "الإضاءة في بيتك غالباً…" },
];

export default function MixMatchPage() {
  const t = useTranslations("mixMatch");
  const locale = useLocale();
  const [phase, setPhase] = useState<"idle" | "quiz" | "done">("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [resultKey, setResultKey] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<{
    title: string;
    description: string;
    imageUrl?: string;
  } | null>(null);

  async function loadOutcome(key: string) {
    const r = await fetch("/api/quiz/outcomes");
    const j = (await r.json()) as {
      outcomes?: Record<
        string,
        { title: string; description: string; imageUrl?: string }
      >;
    };
    setOutcome(j.outcomes?.[key] ?? null);
  }

  function completeWith(finalAnswers: string[]) {
    const key =
      finalAnswers.filter((a) => a === "a").length >= 2 ? "sculptural" : "layered";
    setResultKey(key);
    setPhase("done");
    pushDataLayer({ event: "Personality_Result", result: key });
    void loadOutcome(key);
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-4xl">{t("title")}</h1>
      {phase === "idle" ? (
        <button
          type="button"
          className="mt-10 rounded-full bg-[var(--color-brand-ink)] px-8 py-3 text-sm font-medium text-[var(--color-brand-primary)]"
          onClick={() => {
            pushDataLayer({ event: "Quiz_Start", quiz: "partner_compatibility" });
            setPhase("quiz");
            setStepIdx(0);
            setAnswers([]);
          }}
        >
          {t("start")}
        </button>
      ) : null}
      {phase === "quiz" ? (
        <div className="mt-10 space-y-4">
          <p className="font-display text-2xl">
            {locale === "ar" ? steps[stepIdx].questionAr : steps[stepIdx].questionEn}
          </p>
          <div className="flex flex-col gap-2">
            {["a", "b"].map((opt) => (
              <button
                key={opt}
                type="button"
                className="rounded-xl border border-black/10 bg-white px-4 py-3 text-left text-sm"
                onClick={() => {
                  const next = [...answers, opt];
                  setAnswers(next);
                  if (stepIdx >= steps.length - 1) {
                    completeWith(next);
                  } else {
                    setStepIdx(stepIdx + 1);
                  }
                }}
              >
                {opt === "a"
                  ? locale === "ar"
                    ? "بساطة وهدوء"
                    : "Calm structure"
                  : locale === "ar"
                    ? "طبقات ودفء"
                    : "Warm layers"}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {phase === "done" && resultKey ? (
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-3xl">{t("result")}</h2>
          {outcome ? (
            <>
              <p className="text-lg">{outcome.title}</p>
              <p className="text-[var(--color-brand-muted)]">{outcome.description}</p>
            </>
          ) : (
            <p className="text-sm text-[var(--color-brand-muted)]">{resultKey}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
