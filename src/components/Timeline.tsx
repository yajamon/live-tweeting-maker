import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Check, X, ArrowDown } from "lucide-react";
import type { Post } from "../types";
import { formatTime, twitterWeightedLength } from "../utils/format";

interface TimelineProps {
  posts: Post[];
  suffix: string;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

export function Timeline({ posts, suffix, onDelete, onEdit }: TimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const editWeight = twitterWeightedLength(editText);
  const prevCountRef = useRef(posts.length);

  // Auto-scroll only when a new post is added (not on edit/delete)
  useEffect(() => {
    if (posts.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = posts.length;
  }, [posts.length]);

  // Show/hide scroll-to-bottom button based on scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollBtn(distanceFromBottom > 200);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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

  const handleDelete = (post: Post) => {
    const preview = post.text.length > 30 ? post.text.slice(0, 30) + "…" : post.text;
    if (confirm(`この投稿を削除しますか？\n\n[${formatTime(post.timestamp)}] ${preview}`)) {
      onDelete(post.id);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 select-none">
        投稿はいつでも始められます
      </div>
    );
  }

  const sfx = suffix.trim();

  return (
    <div ref={containerRef} className="relative flex-1 overflow-y-auto px-4 py-3 space-y-2">
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
                {sfx && (
                  <span className="text-gray-400 dark:text-gray-500"> {sfx}</span>
                )}
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
                  onClick={() => handleDelete(post)}
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
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="sticky bottom-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
          title="最新の投稿へスクロール"
        >
          <ArrowDown size={14} />
          最新へ
        </button>
      )}
    </div>
  );
}
