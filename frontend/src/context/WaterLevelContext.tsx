import { createContext, useContext, useState, type ReactNode } from 'react';

interface WaterLevelContextType {
  scheduleStep: number | null;
  setScheduleStep: (step: number | null) => void;
}

const WaterLevelContext = createContext<WaterLevelContextType>({
  scheduleStep: null,
  setScheduleStep: () => {},
});

export function WaterLevelProvider({ children }: { children: ReactNode }) {
  const [scheduleStep, setScheduleStep] = useState<number | null>(null);

  return (
    <WaterLevelContext.Provider value={{ scheduleStep, setScheduleStep }}>
      {children}
    </WaterLevelContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useWaterLevel() {
  return useContext(WaterLevelContext);
}
