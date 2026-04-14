import { useCallback, useEffect, useRef, useState } from "react";

export type TimerPhase = "idle" | "countdown" | "running" | "stopped";

export interface UseTimerReturn {
  /** Current elapsed seconds (adjusted by offset) */
  elapsedSeconds: number;
  initialSeconds: number;
  countdownDuration: number;
  phase: TimerPhase;
  countdownRemaining: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  adjustOffset: (delta: number) => void;
  setInitialSeconds: (seconds: number) => void;
  setCountdownDuration: (seconds: number) => void;
}

export function useTimer(): UseTimerReturn {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [initialSeconds, setInitialSecondsState] = useState(0);
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const [countdownDuration, setCountdownDurationState] = useState(10);
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
      const raw = (Date.now() - startTimeRef.current) / 1000;
      setElapsedSeconds(raw);
    }, 50);
  }, []);

  const startWithCountdown = useCallback(
    (countdownFrom: number) => {
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
        remaining -= 0.05;
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
      }, 50);
    },
    [clearIntervals, startMainTimer],
  );

  const stop = useCallback(() => {
    if (phase === "running") {
      setElapsedSeconds((Date.now() - startTimeRef.current) / 1000);
    }
    clearIntervals();
    setPhase("stopped");
  }, [clearIntervals, phase]);

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

  const start = useCallback(() => {
    startWithCountdown(countdownDuration);
  }, [startWithCountdown, countdownDuration]);

  const setCountdownDuration = useCallback((seconds: number) => {
    setCountdownDurationState(Math.max(0, Math.round(seconds)));
  }, []);

  const setInitialSeconds = useCallback((seconds: number) => {
    setInitialSecondsState(Math.max(0, seconds));
  }, []);

  // Cleanup on unmount
  useEffect(() => clearIntervals, [clearIntervals]);

  const adjusted = Math.max(0, initialSeconds + elapsedSeconds + offset);

  return {
    elapsedSeconds: adjusted,
    initialSeconds,
    countdownDuration,
    phase,
    countdownRemaining,
    start,
    stop,
    reset,
    adjustOffset,
    setInitialSeconds,
    setCountdownDuration,
  };
}
