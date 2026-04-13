import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { Post } from "../types";
import { formatTime } from "../utils/format";

interface TimelineProps {
  posts: Post[];
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

export function Timeline({ posts, onDelete, onEdit }: TimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

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
        タイマーをスタートして実況を始めましょう
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
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                className="flex-1 px-2 py-1 text-sm rounded border border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none"
                autoFocus
              />
              <button
                onClick={confirmEdit}
                className="p-1 text-green-600 hover:text-green-700"
              >
                <Check size={16} />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
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
                  onClick={() => onDelete(post.id)}
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
