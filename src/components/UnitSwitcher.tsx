"use client";

import { useMeasureUnit } from "@/components/MeasureUnitProvider";
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
  const pad = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs";

  return (
    <div
      className={`inline-flex items-center rounded-full bg-[var(--chip)] p-0.5 ${className}`}
      role="group"
      aria-label="Measurement units"
    >
      {units.map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => setUnit(u)}
          className={`rounded-full font-medium uppercase tracking-wide transition ${pad} ${
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
