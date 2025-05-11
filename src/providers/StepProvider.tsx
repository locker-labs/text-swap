"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface StepType {
    activeStep: number;
    setActiveStep: (step: number) => void;
}

const StepContext = createContext<StepType>({
    activeStep: 1,
    setActiveStep: () => {},
});

export function StepProvider({ children }: { children: ReactNode }) {
    const [activeStep, setActiveStep] = useState<number>(1);
    console.log('activeStep', activeStep);

    return (
        <StepContext.Provider
            value={{
                activeStep,
                setActiveStep,
            }}
        >
            {children}
        </StepContext.Provider>
    );
}

export function useSteps() {
    return useContext(StepContext);
}