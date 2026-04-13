import { useCallback, useEffect, useRef, useState } from "react";

export type TimerPhase = "idle" | "countdown" | "running" | "stopped";

export interface UseTimerReturn {
  /** Current elapsed seconds (adjusted by offset) */
  elapsedSeconds: number;
  phase: TimerPhase;
  countdownRemaining: number;
  startWithCountdown: (countdownFrom?: number) => void;
  stop: () => void;
  reset: () => void;
  adjustOffset: (delta: number) => void;
}

export function useTimer(): UseTimerReturn {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const [offset, setOffset] = useState(0);

  // When the main timer actually started (Date.now())
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIntervals = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startMainTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setPhase("running");
    intervalRef.current = setInterval(() => {
      const raw = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(raw);
    }, 200); // update frequently for accuracy
  }, []);

  const startWithCountdown = useCallback(
    (countdownFrom = 3) => {
      clearIntervals();
      setOffset(0);
      setElapsedSeconds(0);

      if (countdownFrom <= 0) {
        startMainTimer();
        return;
      }

      let remaining = countdownFrom;
      setCountdownRemaining(remaining);
      setPhase("countdown");

      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setCountdownRemaining(0);
          startMainTimer();
        } else {
          setCountdownRemaining(remaining);
        }
      }, 1000);
    },
    [clearIntervals, startMainTimer],
  );

  const stop = useCallback(() => {
    clearIntervals();
    setPhase("stopped");
  }, [clearIntervals]);

  const reset = useCallback(() => {
    clearIntervals();
    setElapsedSeconds(0);
    setOffset(0);
    setCountdownRemaining(0);
    setPhase("idle");
  }, [clearIntervals]);

  const adjustOffset = useCallback((delta: number) => {
    setOffset((prev) => prev + delta);
  }, []);

  // Cleanup on unmount
  useEffect(() => clearIntervals, [clearIntervals]);

  const adjusted = Math.max(0, elapsedSeconds + offset);

  return {
    elapsedSeconds: adjusted,
    phase,
    countdownRemaining,
    startWithCountdown,
    stop,
    reset,
    adjustOffset,
  };
}
