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
  peekStoredMeasureUnit,
  setStoredMeasureUnit,
  type MeasureUnit,
  MEASURE_UNITS,
  isMeasureUnit,
} from "@/lib/units";

type MeasureContextValue = {
  unit: MeasureUnit;
  setUnit: (unit: MeasureUnit) => void;
  units: MeasureUnit[];
  applyDefaultUnit: (unit: MeasureUnit) => void;
};

const MeasureContext = createContext<MeasureContextValue | null>(null);

export function MeasureUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<MeasureUnit>("oz");

  useEffect(() => {
    setUnitState(getStoredMeasureUnit());
  }, []);

  const setUnit = useCallback((next: MeasureUnit) => {
    setUnitState(next);
    setStoredMeasureUnit(next);
  }, []);

  const applyDefaultUnit = useCallback((next: MeasureUnit) => {
    if (peekStoredMeasureUnit()) return;
    if (!isMeasureUnit(next)) return;
    setUnitState(next);
    setStoredMeasureUnit(next);
  }, []);

  const value = useMemo(
    () => ({ unit, setUnit, units: MEASURE_UNITS, applyDefaultUnit }),
    [unit, setUnit, applyDefaultUnit],
  );

  return <MeasureContext.Provider value={value}>{children}</MeasureContext.Provider>;
}

export function useMeasureUnit() {
  const ctx = useContext(MeasureContext);
  if (!ctx) throw new Error("useMeasureUnit must be used within MeasureUnitProvider");
  return ctx;
}
