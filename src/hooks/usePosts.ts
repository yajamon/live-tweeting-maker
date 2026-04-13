import { useCallback, useEffect, useState } from "react";
import type { Post, SessionData } from "../types";

const STORAGE_KEY = "live-tweeting-maker:posts";

function loadPosts(): Post[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: Post[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePosts(posts: Post[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export interface UsePostsReturn {
  posts: Post[];
  addPost: (timestamp: number, text: string) => void;
  deletePost: (id: string) => void;
  editPost: (id: string, text: string) => void;
  clearAll: () => void;
  exportJSON: () => void;
  importJSON: (file: File) => Promise<void>;
}

export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>(loadPosts);

  useEffect(() => {
    savePosts(posts);
  }, [posts]);

  const addPost = useCallback((timestamp: number, text: string) => {
    const post: Post = {
      id: crypto.randomUUID(),
      timestamp,
      text,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [...prev, post]);
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const editPost = useCallback((id: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, text } : p)),
    );
  }, []);

  const clearAll = useCallback(() => {
    setPosts([]);
  }, []);

  const exportJSON = useCallback(() => {
    const data: SessionData = { posts, version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `live-tweeting-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [posts]);

  const importJSON = useCallback(async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text) as SessionData;
    if (!data.posts || !Array.isArray(data.posts)) {
      throw new Error("Invalid file format");
    }
    setPosts(data.posts);
  }, []);

  return { posts, addPost, deletePost, editPost, clearAll, exportJSON, importJSON };
}
