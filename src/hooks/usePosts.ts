import { useCallback, useEffect, useState } from "react";
import type { Post, SessionData } from "../types";
import { formatTime } from "../utils/format";

const STORAGE_KEY = "live-tweeting-maker:posts";
const DRAFT_KEY = "live-tweeting-maker:draft";

const IMPORT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const IMPORT_MAX_POSTS = 10_000;
const IMPORT_MAX_TEXT_LENGTH = 10_000;
const IMPORT_MAX_META_LENGTH = 500;

export type ImportMode = "replace" | "append" | "cancel";

const IMPORT_MAX_ID_LENGTH = 200;

function normalizePost(post: unknown): Post | null {
  if (!post || typeof post !== "object") {
    return null;
  }

  const candidate = post as Record<string, unknown>;

  // text is required and must be a string
  if (typeof candidate.text !== "string") {
    return null;
  }

  // timestamp: must be a finite non-negative number; reject NaN / Infinity
  let timestamp: number;
  if (typeof candidate.timestamp === "number" && Number.isFinite(candidate.timestamp) && candidate.timestamp >= 0) {
    timestamp = candidate.timestamp;
  } else {
    return null;
  }

  // id: regenerate if missing, wrong type, empty, or excessively long
  let id: string;
  if (typeof candidate.id === "string" && candidate.id.length > 0 && candidate.id.length <= IMPORT_MAX_ID_LENGTH) {
    id = candidate.id;
  } else {
    id = crypto.randomUUID();
  }

  // createdAt: validate as parseable date string; regenerate if invalid
  let createdAt: string;
  if (typeof candidate.createdAt === "string" && !Number.isNaN(Date.parse(candidate.createdAt))) {
    createdAt = new Date(candidate.createdAt).toISOString();
  } else {
    createdAt = new Date().toISOString();
  }

  return { id, timestamp, text: candidate.text, createdAt };
}

function loadSession(): SessionData {
  const empty: SessionData = { authorName: "", suffix: "", posts: [], version: 3 };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return empty;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn("localStorage のセッションデータが破損しています。初期化します。");
    localStorage.removeItem(STORAGE_KEY);
    return empty;
  }

  if (Array.isArray(parsed)) {
    return {
      authorName: "",
      suffix: "",
      posts: parsed.map(normalizePost).filter((post): post is Post => post !== null),
      version: 3,
    };
  }

  if (parsed && typeof parsed === "object") {
    const session = parsed as Record<string, unknown>;

    return {
      authorName: typeof session.authorName === "string" ? session.authorName.slice(0, IMPORT_MAX_META_LENGTH) : "",
      suffix: typeof session.suffix === "string" ? session.suffix.slice(0, IMPORT_MAX_META_LENGTH) : "",
      posts: Array.isArray(session.posts)
        ? (session.posts as unknown[]).map(normalizePost).filter((post): post is Post => post !== null)
        : [],
      version: 3,
    };
  }

  return empty;
}

function saveSession(session: SessionData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export interface UsePostsReturn {
  authorName: string;
  suffix: string;
  posts: Post[];
  draftText: string;
  setAuthorName: (authorName: string) => void;
  setSuffix: (suffix: string) => void;
  setDraftText: (text: string) => void;
  addPost: (timestamp: number, text: string) => void;
  deletePost: (id: string) => void;
  editPost: (id: string, text: string) => void;
  clearAll: () => void;
  clearAllData: () => void;
  exportJSON: () => void;
  exportText: () => string;
  copyToClipboard: () => Promise<void>;
  importJSON: (file: File, mode: ImportMode) => Promise<void>;
}

export function usePosts(): UsePostsReturn {
  const [session, setSession] = useState<SessionData>(loadSession);
  const [draftText, setDraftTextState] = useState(() => localStorage.getItem(DRAFT_KEY) ?? "");
  const { authorName, suffix, posts } = session;

  useEffect(() => {
    saveSession(session);
  }, [session]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, draftText);
  }, [draftText]);

  const setDraftText = useCallback((text: string) => {
    setDraftTextState(text);
  }, []);

  const setAuthorName = useCallback((nextAuthorName: string) => {
    setSession((prev) => ({ ...prev, authorName: nextAuthorName }));
  }, []);

  const setSuffix = useCallback((nextSuffix: string) => {
    setSession((prev) => ({ ...prev, suffix: nextSuffix }));
  }, []);

  const addPost = useCallback((timestamp: number, text: string) => {
    const post: Post = {
      id: crypto.randomUUID(),
      timestamp,
      text,
      createdAt: new Date().toISOString(),
    };
    setSession((prev) => ({ ...prev, posts: [...prev.posts, post] }));
  }, []);

  const deletePost = useCallback((id: string) => {
    setSession((prev) => ({ ...prev, posts: prev.posts.filter((post) => post.id !== id) }));
  }, []);

  const editPost = useCallback((id: string, text: string) => {
    setSession((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => (post.id === id ? { ...post, text } : post)),
    }));
  }, []);

  const clearAll = useCallback(() => {
    setSession((prev) => ({ ...prev, posts: [] }));
  }, []);

  const clearAllData = useCallback(() => {
    setSession({ authorName: "", suffix: "", posts: [], version: 3 });
    setDraftTextState("");
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const buildTextLine = useCallback(
    (post: Post) => {
      const time = formatTime(post.timestamp);
      const sfx = suffix.trim();
      return sfx ? `${time} ${post.text} ${sfx}` : `${time} ${post.text}`;
    },
    [suffix],
  );

  const exportText = useCallback(() => {
    return posts.map(buildTextLine).join("\n");
  }, [posts, buildTextLine]);

  const copyToClipboard = useCallback(async () => {
    const text = exportText();
    await navigator.clipboard.writeText(text);
  }, [exportText]);

  const exportJSON = useCallback(() => {
    const data: SessionData = { authorName, suffix, posts, version: 3 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `live-tweeting-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [authorName, suffix, posts]);

  const importJSON = useCallback(async (file: File, mode: ImportMode) => {
    if (mode === "cancel") return;

    if (file.size > IMPORT_MAX_FILE_SIZE) {
      throw new Error(`ファイルサイズが上限（${IMPORT_MAX_FILE_SIZE / 1024 / 1024}MB）を超えています`);
    }

    const text = await file.text();
    const raw = JSON.parse(text) as unknown;

    let incomingPosts: Post[] = [];
    let incomingAuthor = "";
    let incomingSuffix = "";

    if (Array.isArray(raw)) {
      incomingPosts = raw.map(normalizePost).filter((p): p is Post => p !== null);
    } else if (raw && typeof raw === "object") {
      const data = raw as Record<string, unknown>;
      if (!Array.isArray(data.posts)) {
        throw new Error("Invalid file format");
      }
      incomingPosts = (data.posts as unknown[]).map(normalizePost).filter((p): p is Post => p !== null);
      incomingAuthor = typeof data.authorName === "string" ? data.authorName.slice(0, IMPORT_MAX_META_LENGTH) : "";
      incomingSuffix = typeof data.suffix === "string" ? data.suffix.slice(0, IMPORT_MAX_META_LENGTH) : "";
    } else {
      throw new Error("Invalid file format");
    }

    if (incomingPosts.length > IMPORT_MAX_POSTS) {
      throw new Error(`投稿件数が上限（${IMPORT_MAX_POSTS}件）を超えています`);
    }

    // Truncate excessively long post texts
    incomingPosts = incomingPosts.map((p) =>
      p.text.length > IMPORT_MAX_TEXT_LENGTH ? { ...p, text: p.text.slice(0, IMPORT_MAX_TEXT_LENGTH) } : p,
    );

    if (mode === "replace") {
      setSession({
        authorName: incomingAuthor,
        suffix: incomingSuffix,
        posts: incomingPosts,
        version: 3,
      });
    } else if (mode === "append") {
      setSession((prev) => ({
        ...prev,
        posts: [...prev.posts, ...incomingPosts],
      }));
    }
  }, []);

  return {
    authorName,
    suffix,
    posts,
    draftText,
    setAuthorName,
    setSuffix,
    setDraftText,
    addPost,
    deletePost,
    editPost,
    clearAll,
    clearAllData,
    exportJSON,
    exportText,
    copyToClipboard,
    importJSON,
  };
}
