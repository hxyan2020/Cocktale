"use client";

import { useMeasureUnit } from "@/components/MeasureUnitProvider";
import { useI18n } from "@/components/LanguageProvider";
import type { MeasureUnit } from "@/lib/units";

const LABELS: Record<MeasureUnit, string> = {
  oz: "oz",
  ml: "ml",
  cl: "cl",
};

type Props = {
  className?: string;
  size?: "sm" | "md";
};

export function UnitSwitcher({ className = "", size = "sm" }: Props) {
  const { unit, setUnit, units } = useMeasureUnit();
  const { t } = useI18n();
  const pad =
    size === "sm"
      ? "min-h-10 px-2 py-1 text-[10px] sm:min-h-0 sm:px-2.5 sm:py-1 sm:text-[11px]"
      : "min-h-10 px-3 py-2 text-xs";

  return (
    <div
      className={`inline-flex shrink-0 items-center rounded-full bg-[var(--chip)] p-0.5 ${className}`}
      role="group"
      aria-label={t("nav.measure")}
    >
      {units.map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => setUnit(u)}
          className={`flex-1 rounded-full font-medium uppercase tracking-wide transition ${pad} ${
            unit === u
              ? "bg-[var(--ink)] text-[var(--foam)]"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
        >
          {LABELS[u]}
        </button>
      ))}
    </div>
  );
}
