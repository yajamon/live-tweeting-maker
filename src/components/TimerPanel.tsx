import { Play, Square, RotateCcw, Minus, Plus } from "lucide-react";
import type { UseTimerReturn } from "../hooks/useTimer";
import { formatTime } from "../utils/format";

interface TimerPanelProps {
  timer: UseTimerReturn;
}

export function TimerPanel({ timer }: TimerPanelProps) {
  const offsets = [
    { label: "-10s", delta: -10 },
    { label: "-1s", delta: -1 },
    { label: "+1s", delta: +1 },
    { label: "+10s", delta: +10 },
  ];

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      {/* Timer display */}
      <div className="text-5xl sm:text-6xl font-mono font-bold tabular-nums text-gray-900 dark:text-gray-100 select-none">
        {timer.phase === "countdown" ? (
          <span className="text-yellow-500 animate-pulse">
            {timer.countdownRemaining}
          </span>
        ) : (
          formatTime(timer.elapsedSeconds)
        )}
      </div>

      {/* Main controls */}
      <div className="flex gap-2">
        {(timer.phase === "idle" || timer.phase === "stopped") && (
          <button
            onClick={() => timer.startWithCountdown(3)}
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
            onClick={timer.reset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <RotateCcw size={18} />
            リセット
          </button>
        )}
      </div>

      {/* Offset adjustments */}
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
