import { useState } from "react";
import { Play, Square, RotateCcw, Minus, Plus } from "lucide-react";
import type { UseTimerReturn } from "../hooks/useTimer";
import { formatTime } from "../utils/format";

interface TimerPanelProps {
  timer: UseTimerReturn;
}

export function TimerPanel({ timer }: TimerPanelProps) {
  const [startSecondsInput, setStartSecondsInput] = useState(timer.initialSeconds.toFixed(2));
  const offsets = [
    { label: "-10s", delta: -10 },
    { label: "-1s", delta: -1 },
    { label: "+1s", delta: +1 },
    { label: "+10s", delta: +10 },
  ];

  const applyInitialSeconds = () => {
    const parsed = Number(startSecondsInput);
    if (!Number.isFinite(parsed)) {
      setStartSecondsInput(timer.initialSeconds.toFixed(2));
      return;
    }

    const nextValue = Math.max(0, parsed);
    timer.setInitialSeconds(nextValue);
    setStartSecondsInput(nextValue.toFixed(2));
  };

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="text-5xl sm:text-6xl font-mono font-bold tabular-nums text-gray-900 dark:text-gray-100 select-none">
        {timer.phase === "countdown" ? (
          <span className="text-yellow-500 animate-pulse">
            {timer.countdownRemaining}
          </span>
        ) : (
          formatTime(timer.elapsedSeconds)
        )}
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>開始秒数</span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={startSecondsInput}
            onChange={(event) => setStartSecondsInput(event.target.value)}
            onBlur={applyInitialSeconds}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyInitialSeconds();
              }
            }}
            disabled={timer.phase !== "idle"}
            className="w-32 rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 font-mono text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          スタート前のみ変更可
        </span>
      </div>

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
