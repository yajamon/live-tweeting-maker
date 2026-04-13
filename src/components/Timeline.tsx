import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { Post } from "../types";
import { formatTime, twitterWeightedLength } from "../utils/format";

interface TimelineProps {
  posts: Post[];
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

export function Timeline({ posts, onDelete, onEdit }: TimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editWeight = twitterWeightedLength(editText);

  // Auto-scroll to bottom when new posts arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts.length]);

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setEditText(post.text);
  };

  const confirmEdit = () => {
    if (editingId && editText.trim()) {
      onEdit(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  if (posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 select-none">
        投稿はいつでも始められます
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 group"
        >
          <span className="shrink-0 font-mono text-sm text-blue-600 dark:text-blue-400 pt-0.5 tabular-nums">
            {formatTime(post.timestamp)}
          </span>

          {editingId === post.id ? (
            <div className="flex-1 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    confirmEdit();
                  }
                  if (e.key === "Escape") cancelEdit();
                }}
                rows={3}
                className="w-full resize-none rounded-lg border border-blue-400 bg-white px-3 py-2 text-base leading-6 text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-600 dark:bg-gray-900 dark:text-gray-100"
                autoFocus
              />
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`text-xs tabular-nums ${
                    editWeight > 280
                      ? "text-red-500 font-bold"
                      : editWeight > 252
                        ? "text-yellow-500"
                        : "text-gray-400"
                  }`}
                >
                  {editWeight} / 280
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={confirmEdit}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/40"
                  >
                    <Check size={16} />
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                  >
                    <X size={16} />
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="flex-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-left">
                {post.text}
              </p>
              <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(post)}
                  className="p-1 text-gray-400 hover:text-blue-500"
                  title="編集"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm("この投稿を削除しますか？")) {
                      onDelete(post.id);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
