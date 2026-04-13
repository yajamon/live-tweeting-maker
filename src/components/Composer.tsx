import { useEffect, useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { twitterWeightedLength } from "../utils/format";

const MAX_WEIGHT = 280;

interface ComposerProps {
  draftText: string;
  onDraftChange: (text: string) => void;
  onSubmit: (text: string) => void;
}

export function Composer({ draftText, onDraftChange, onSubmit }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const weight = twitterWeightedLength(draftText);
  const overLimit = weight > MAX_WEIGHT;

  const submit = useCallback(() => {
    const trimmed = draftText.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onDraftChange("");
    textareaRef.current?.focus();
  }, [draftText, onSubmit, onDraftChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  // Auto-focus when tab becomes active
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        textareaRef.current?.focus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={draftText}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="実況コメントを入力…（Ctrl+Enter / Cmd+Enter で送信）"
          rows={3}
          className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 text-base leading-7 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={submit}
          disabled={!draftText.trim()}
          className="shrink-0 p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="送信"
        >
          <Send size={18} />
        </button>
      </div>
      <div className="flex justify-end mt-1">
        <span
          className={`text-xs tabular-nums ${
            overLimit
              ? "text-red-500 font-bold"
              : weight > MAX_WEIGHT * 0.9
                ? "text-yellow-500"
                : "text-gray-400"
          }`}
        >
          {weight} / {MAX_WEIGHT}
        </span>
      </div>
    </div>
  );
}
