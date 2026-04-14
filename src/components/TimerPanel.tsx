import { useState } from "react";
import { Play, Square, RotateCcw, Minus, Plus } from "lucide-react";
import type { UseTimerReturn } from "../hooks/useTimer";
import { formatTime, parseTimeInput } from "../utils/format";

interface TimerPanelProps {
  timer: UseTimerReturn;
}

export function TimerPanel({ timer }: TimerPanelProps) {
  const [startTimeInput, setStartTimeInput] = useState(formatTime(timer.initialSeconds));
  const [countdownInput, setCountdownInput] = useState(String(timer.countdownDuration));
  const offsets = [
    { label: "-10s", delta: -10 },
    { label: "-1s", delta: -1 },
    { label: "+1s", delta: +1 },
    { label: "+10s", delta: +10 },
  ];

  const applyInitialSeconds = () => {
    const parsed = parseTimeInput(startTimeInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setStartTimeInput(formatTime(timer.initialSeconds));
      return;
    }
    timer.setInitialSeconds(parsed);
    setStartTimeInput(formatTime(parsed));
  };

  const applyCountdown = () => {
    const parsed = Number(countdownInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setCountdownInput(String(timer.countdownDuration));
      return;
    }
    const next = Math.max(0, Math.round(parsed));
    timer.setCountdownDuration(next);
    setCountdownInput(String(next));
  };

  const handleReset = () => {
    if (confirm("タイマーをリセットしますか？（投稿は残ります）")) {
      timer.reset();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full">
        <div className="text-5xl sm:text-6xl font-mono font-bold tabular-nums text-gray-900 dark:text-gray-100 select-none text-center">
          {timer.phase === "countdown" ? (
            <span className="text-yellow-500 animate-pulse">
              {Math.ceil(timer.countdownRemaining)}
            </span>
          ) : (
            formatTime(timer.elapsedSeconds)
          )}
        </div>
        {timer.phase === "countdown" && (
          <div className="mt-3 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-50"
              style={{
                width: `${Math.max(0, (timer.countdownRemaining / timer.countdownDuration) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>開始時刻</span>
          <input
            type="text"
            inputMode="decimal"
            value={startTimeInput}
            onChange={(event) => setStartTimeInput(event.target.value)}
            onBlur={applyInitialSeconds}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyInitialSeconds();
            }}
            disabled={timer.phase !== "idle"}
            placeholder="0:00 / 1:23:45"
            className="w-36 rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 font-mono text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>カウントダウン</span>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={countdownInput}
            onChange={(event) => setCountdownInput(event.target.value)}
            onBlur={applyCountdown}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyCountdown();
            }}
            disabled={timer.phase !== "idle"}
            className="w-16 rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 font-mono text-sm text-gray-900 text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">秒</span>
        </label>
      </div>

      <div className="flex gap-2">
        {(timer.phase === "idle" || timer.phase === "stopped") && (
          <button
            onClick={timer.start}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
          >
            <Play size={18} />
            スタート
          </button>
        )}
        {timer.phase === "running" && (
          <button
            onClick={timer.stop}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
          >
            <Square size={18} />
            ストップ
          </button>
        )}
        {timer.phase === "countdown" && (
          <button
            disabled
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-500 text-white font-medium opacity-80 cursor-not-allowed"
          >
            カウントダウン中…
          </button>
        )}
        {timer.phase !== "idle" && timer.phase !== "countdown" && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <RotateCcw size={18} />
            リセット
          </button>
        )}
      </div>

      {(timer.phase === "running" || timer.phase === "stopped") && (
        <div className="flex gap-1.5">
          {offsets.map(({ label, delta }) => (
            <button
              key={label}
              onClick={() => timer.adjustOffset(delta)}
              className="inline-flex items-center gap-0.5 px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {delta < 0 ? <Minus size={12} /> : <Plus size={12} />}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
