import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "tutorial_completed";

export type TutorialStep = 1 | 2 | 3;

interface UseTutorialReturn {
  isActive: boolean;
  currentStep: TutorialStep;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
}

export function useTutorial(borrowerCount: number): UseTutorialReturn {
  const [currentStep, setCurrentStep] = useState<TutorialStep>(1);
  const [completed, setCompleted] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  // Once tutorial starts, keep it active until completed/skipped
  const [started, setStarted] = useState(false);

  // Auto-start when user has no borrowers and hasn't completed tutorial
  useEffect(() => {
    if (borrowerCount === 0 && !completed && !started) {
      setStarted(true);
    }
  }, [borrowerCount, completed, started]);

  // Tutorial stays active once started, until explicitly completed/skipped
  const isActive = started && !completed;

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= 3) return prev;
      return (prev + 1) as TutorialStep;
    });
  }, []);

  const skipTutorial = useCallback(() => {
    setCompleted(true);
    setStarted(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const completeTutorial = useCallback(() => {
    setCompleted(true);
    setStarted(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  return {
    isActive,
    currentStep,
    nextStep,
    skipTutorial,
    completeTutorial,
  };
}
