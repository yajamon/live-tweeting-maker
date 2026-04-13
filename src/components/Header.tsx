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
    <header className="flex flex-col gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          実況ツイートメーカー
        </h1>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="shrink-0">投稿者名</span>
          <input
            type="text"
            value={posts.authorName}
            onChange={(event) => posts.setAuthorName(event.target.value)}
            placeholder="名前を入力"
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-56"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
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
