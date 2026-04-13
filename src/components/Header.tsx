import { useRef } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import type { UsePostsReturn } from "../hooks/usePosts";

interface HeaderProps {
  posts: UsePostsReturn;
}

export function Header({ posts }: HeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await posts.importJSON(file);
    } catch {
      alert("ファイルの読み込みに失敗しました");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        実況ツイートメーカー
      </h1>
      <div className="flex gap-2">
        <button
          onClick={posts.exportJSON}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          title="エクスポート"
        >
          <Download size={16} />
          <span className="hidden sm:inline">エクスポート</span>
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          title="インポート"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">インポート</span>
        </button>
        {posts.posts.length > 0 && (
          <button
            onClick={() => {
              if (confirm("すべての投稿を削除しますか？")) posts.clearAll();
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            title="全削除"
          >
            <Trash2 size={16} />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </header>
  );
}
