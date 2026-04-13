import { useCallback, useEffect, useState } from "react";
import type { Post, SessionData } from "../types";

const STORAGE_KEY = "live-tweeting-maker:posts";

function normalizePost(post: unknown): Post | null {
  if (!post || typeof post !== "object") {
    return null;
  }

  const candidate = post as Partial<Post>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.timestamp !== "number" ||
    typeof candidate.text !== "string" ||
    typeof candidate.createdAt !== "string"
  ) {
    return null;
  }

  return candidate as Post;
}

function loadSession(): SessionData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      authorName: "",
      posts: [],
      version: 2,
    };
  }

  const parsed: unknown = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return {
      authorName: "",
      posts: parsed.map(normalizePost).filter((post): post is Post => post !== null),
      version: 2,
    };
  }

  if (parsed && typeof parsed === "object") {
    const session = parsed as Partial<SessionData>;

    return {
      authorName: typeof session.authorName === "string" ? session.authorName : "",
      posts: Array.isArray(session.posts)
        ? session.posts.map(normalizePost).filter((post): post is Post => post !== null)
        : [],
      version: 2,
    };
  }

  return {
    authorName: "",
    posts: [],
    version: 2,
  };
}

function saveSession(session: SessionData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export interface UsePostsReturn {
  authorName: string;
  posts: Post[];
  setAuthorName: (authorName: string) => void;
  addPost: (timestamp: number, text: string) => void;
  deletePost: (id: string) => void;
  editPost: (id: string, text: string) => void;
  clearAll: () => void;
  exportJSON: () => void;
  importJSON: (file: File) => Promise<void>;
}

export function usePosts(): UsePostsReturn {
  const [session, setSession] = useState<SessionData>(loadSession);
  const { authorName, posts } = session;

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const setAuthorName = useCallback((nextAuthorName: string) => {
    setSession((prev) => ({
      ...prev,
      authorName: nextAuthorName,
    }));
  }, []);

  const addPost = useCallback((timestamp: number, text: string) => {
    const post: Post = {
      id: crypto.randomUUID(),
      timestamp,
      text,
      createdAt: new Date().toISOString(),
    };
    setSession((prev) => ({
      ...prev,
      posts: [...prev.posts, post],
    }));
  }, []);

  const deletePost = useCallback((id: string) => {
    setSession((prev) => ({
      ...prev,
      posts: prev.posts.filter((post) => post.id !== id),
    }));
  }, []);

  const editPost = useCallback((id: string, text: string) => {
    setSession((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => (post.id === id ? { ...post, text } : post)),
    }));
  }, []);

  const clearAll = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      posts: [],
    }));
  }, []);

  const exportJSON = useCallback(() => {
    const data: SessionData = {
      authorName,
      posts,
      version: 2,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `live-tweeting-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [authorName, posts]);

  const importJSON = useCallback(async (file: File) => {
    const text = await file.text();
    const raw = JSON.parse(text) as unknown;

    if (Array.isArray(raw)) {
      setSession({
        authorName: "",
        posts: raw.map(normalizePost).filter((post): post is Post => post !== null),
        version: 2,
      });
      return;
    }

    if (!raw || typeof raw !== "object") {
      throw new Error("Invalid file format");
    }

    const data = raw as Partial<SessionData>;
    if (!Array.isArray(data.posts)) {
      throw new Error("Invalid file format");
    }

    setSession({
      authorName: typeof data.authorName === "string" ? data.authorName : "",
      posts: data.posts.map(normalizePost).filter((post): post is Post => post !== null),
      version: 2,
    });
  }, []);

  return {
    authorName,
    posts,
    setAuthorName,
    addPost,
    deletePost,
    editPost,
    clearAll,
    exportJSON,
    importJSON,
  };
}
