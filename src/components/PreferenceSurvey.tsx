"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { useI18n } from "@/components/LanguageProvider";
import { useTranslatedTexts } from "@/components/useTranslatedContent";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { SurveyPreferences } from "@/lib/types";

export type SurveyLocationStatus =
  | "checking"
  | "prompt"
  | "requesting"
  | "granted"
  | "blocked"
  | "unavailable"
  | "dismissed";

type Props = {
  open: boolean;
  locationStatus: SurveyLocationStatus;
  onRequestLocation: () => void;
  onUseDefaultLocation: () => void;
  onSubmit: (preferences: SurveyPreferences) => void;
  onDone: () => void;
};

const MOODS = ["cozy", "celebratory", "sophisticated", "adventurous", "romantic"] as const;
const FLAVORS = ["citrus", "sweet", "bitter", "herbal", "smoky", "spicy", "dry"] as const;

const ENGLISH_COPY = [
  "Tune tonight's recommendations",
  "Four quick signals help us choose cocktails for this moment.",
  "Location",
  "Your local weather changes which drinks rise to the top.",
  "Use my location",
  "Continue without location",
  "Location received",
  "Location is blocked",
  "Location is unavailable",
  "What mood do you want to feel?",
  "What flavor are you craving?",
  "How adventurous should the recipe be?",
  "Simple steps",
  "Quick to make with fewer ingredients",
  "Complex & fun",
  "More ingredients and technique to explore",
  "Continue",
  "Build my recommendations",
  "What we collected",
  "Weather signal",
  "Mood",
  "Flavor",
  "Recipe style",
  "",
  "Local weather",
  "Not selected yet",
  "Analyzing your preferences",
  "Reading the weather context",
  "Matching mood tags",
  "Comparing flavor profiles",
  "Balancing recipe complexity",
  "Preparing your ranked cocktail list",
  "Your recommendations are ready",
  "Step {step} of 4",
  "citrus",
  "sweet",
  "bitter",
  "herbal",
  "smoky",
  "spicy",
  "dry",
] as const;

export function PreferenceSurvey({
  open,
  locationStatus,
  onRequestLocation,
  onUseDefaultLocation,
  onSubmit,
  onDone,
}: Props) {
  const { t } = useI18n();
  const { texts } = useTranslatedTexts([...ENGLISH_COPY], "preference-survey", open);
  const copy = (index: number) => texts[index] || ENGLISH_COPY[index];
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<string | null>(null);
  const [flavor, setFlavor] = useState<string | null>(null);
  const [complexity, setComplexity] = useState<"simple" | "complex" | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(82);
  useBodyScrollLock(open);

  const progress = step === 4 ? analysisProgress : [12, 34, 57, 78][step] ?? 100;
  const locationSkipped = ["dismissed", "blocked", "unavailable"].includes(locationStatus);
  const locationLabel =
    locationStatus === "granted" ? copy(24) : locationSkipped ? "" : copy(25);

  const collected = useMemo(
    () => [
      { label: copy(19), value: locationLabel },
      { label: copy(20), value: mood ? t(`moods.${mood}`) : copy(25) },
      {
        label: copy(21),
        value: flavor ? copy(34 + FLAVORS.indexOf(flavor as (typeof FLAVORS)[number])) : copy(25),
      },
      {
        label: copy(22),
        value: complexity === "simple" ? copy(12) : complexity === "complex" ? copy(14) : copy(25),
      },
    ],
    [complexity, flavor, locationLabel, mood, t, texts], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (!open || step !== 4) return;
    const interval = window.setInterval(() => {
      setAnalysisProgress((value) => Math.min(100, value + 2));
    }, 90);
    const timeout = window.setTimeout(onDone, 1500);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [onDone, open, step]);

  if (!open) return null;

  const submit = () => {
    if (!mood || !flavor || !complexity) return;
    setAnalysisProgress(82);
    setStep(4);
    onSubmit({
      mood,
      flavor,
      complexity,
      completedAt: new Date().toISOString(),
    });
  };

  const canContinue =
    step === 0
      ? ["granted", "dismissed", "blocked", "unavailable"].includes(locationStatus)
      : step === 1
        ? Boolean(mood)
        : step === 2
          ? Boolean(flavor)
          : Boolean(complexity);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preference-survey-title"
        className="relative flex max-h-[100svh] w-full max-w-xl flex-col overflow-hidden rounded-t-[1.75rem] bg-[var(--surface)] shadow-2xl sm:max-h-[92vh] sm:rounded-[1.75rem]"
      >
        <div className="border-b border-[var(--line)] px-4 pt-5 pb-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] uppercase text-[var(--accent-deep)]">
                {step === 4 ? copy(26) : copy(33).replace("{step}", String(step + 1))}
              </p>
              <h2
                id="preference-survey-title"
                className="mt-1 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--ink)]"
              >
                {copy(0)}
              </h2>
            </div>
            <Sparkles className="h-6 w-6 shrink-0 text-[var(--accent)]" />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--chip)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--ink-muted)]">{progress}%</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          {step === 0 && (
            <section>
              <MapPin className="h-8 w-8 text-[var(--accent)]" />
              <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">{copy(2)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{copy(3)}</p>
              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={onRequestLocation}
                  disabled={locationStatus === "requesting"}
                  className="min-h-12 rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-medium text-[var(--foam)] disabled:opacity-60"
                >
                  {locationStatus === "requesting"
                    ? copy(27)
                    : locationStatus === "granted"
                      ? copy(6)
                      : locationStatus === "blocked"
                        ? copy(7)
                        : locationStatus === "unavailable"
                          ? copy(8)
                          : copy(4)}
                </button>
                {locationStatus !== "granted" && (
                  <button
                    type="button"
                    onClick={onUseDefaultLocation}
                    className="min-h-12 rounded-full bg-[var(--chip)] px-4 py-3 text-sm font-medium text-[var(--ink)]"
                  >
                    {copy(5)}
                  </button>
                )}
              </div>
            </section>
          )}

          {step === 1 && (
            <Question title={copy(9)}>
              {MOODS.map((option) => (
                <OptionButton
                  key={option}
                  selected={mood === option}
                  label={t(`moods.${option}`)}
                  onClick={() => setMood(option)}
                />
              ))}
            </Question>
          )}

          {step === 2 && (
            <Question title={copy(10)}>
              {FLAVORS.map((option, index) => (
                <OptionButton
                  key={option}
                  selected={flavor === option}
                  label={copy(34 + index)}
                  onClick={() => setFlavor(option)}
                />
              ))}
            </Question>
          )}

          {step === 3 && (
            <Question title={copy(11)}>
              <OptionButton
                selected={complexity === "simple"}
                label={copy(12)}
                description={copy(13)}
                onClick={() => setComplexity("simple")}
              />
              <OptionButton
                selected={complexity === "complex"}
                label={copy(14)}
                description={copy(15)}
                onClick={() => setComplexity("complex")}
              />
            </Question>
          )}

          {step === 4 && (
            <section>
              <h3 className="text-lg font-semibold text-[var(--ink)]">
                {analysisProgress >= 100 ? copy(32) : copy(26)}
              </h3>
              <ul className="mt-4 space-y-2">
                {(locationSkipped
                  ? [copy(28), copy(29), copy(30), copy(31)]
                  : [copy(27), copy(28), copy(29), copy(30), copy(31)]
                ).map((label, index) => {
                  const complete = analysisProgress >= 84 + index * 4;
                  return (
                    <li
                      key={label}
                      className={`flex items-center gap-2 text-sm ${
                        complete ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${
                          complete ? "bg-[var(--accent)] text-white" : "bg-[var(--chip)]"
                        }`}
                      >
                        {complete && <Check className="h-3 w-3" />}
                      </span>
                      {label}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-2xl bg-[var(--bg)] p-4 ring-1 ring-[var(--line)]">
            <h3 className="text-sm font-semibold text-[var(--ink)]">{copy(18)}</h3>
            <dl className="mt-3 grid gap-2 text-sm">
              {collected.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3">
                  <dt className="text-[var(--ink-muted)]">{item.label}</dt>
                  <dd className="text-end font-medium text-[var(--ink)]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {step < 4 && (
          <div className="border-t border-[var(--line)] bg-[var(--surface)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => (step === 3 ? submit() : setStep((value) => value + 1))}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {step === 3 ? copy(17) : copy(16)}
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Question({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-xl font-semibold text-[var(--ink)]">{title}</h3>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function OptionButton({
  selected,
  label,
  description,
  onClick,
}: {
  selected: boolean;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-2xl p-3 text-start ring-1 transition ${
        selected
          ? "bg-[var(--ink)] text-[var(--foam)] ring-[var(--ink)]"
          : "bg-[var(--bg)] text-[var(--ink)] ring-[var(--line)] hover:ring-[var(--accent)]"
      }`}
    >
      <span className="font-medium">{label}</span>
      {description && (
        <span className={`mt-1 block text-xs ${selected ? "text-white/70" : "text-[var(--ink-muted)]"}`}>
          {description}
        </span>
      )}
    </button>
  );
}
