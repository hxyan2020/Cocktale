"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getStoredMeasureUnit,
  setStoredMeasureUnit,
  type MeasureUnit,
  MEASURE_UNITS,
} from "@/lib/units";

type MeasureContextValue = {
  unit: MeasureUnit;
  setUnit: (unit: MeasureUnit) => void;
  units: MeasureUnit[];
};

const MeasureContext = createContext<MeasureContextValue | null>(null);

export function MeasureUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<MeasureUnit>("oz");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnitState(getStoredMeasureUnit());
    setReady(true);
  }, []);

  const setUnit = useCallback((next: MeasureUnit) => {
    setUnitState(next);
    setStoredMeasureUnit(next);
  }, []);

  const value = useMemo(
    () => ({ unit, setUnit, units: MEASURE_UNITS }),
    [unit, setUnit],
  );

  // Avoid hydration mismatch flashing — still render children
  void ready;

  return <MeasureContext.Provider value={value}>{children}</MeasureContext.Provider>;
}

export function useMeasureUnit() {
  const ctx = useContext(MeasureContext);
  if (!ctx) throw new Error("useMeasureUnit must be used within MeasureUnitProvider");
  return ctx;
}
