import { useRef, useState } from "react";
import { Download, Upload, Trash2, Copy, FileText } from "lucide-react";
import type { UsePostsReturn, ImportMode } from "../hooks/usePosts";

interface HeaderProps {
  posts: UsePostsReturn;
}

export function Header({ posts }: HeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (posts.posts.length > 0) {
      setPendingFile(file);
      setShowImportDialog(true);
    } else {
      doImport(file, "replace");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const doImport = async (file: File, mode: ImportMode) => {
    try {
      await posts.importJSON(file, mode);
    } catch {
      alert("ファイルの読み込みに失敗しました");
    }
  };

  const handleImportChoice = (mode: ImportMode) => {
    if (pendingFile && mode !== "cancel") {
      doImport(pendingFile, mode);
    }
    setShowImportDialog(false);
    setPendingFile(null);
  };

  const handleCopy = async () => {
    await posts.copyToClipboard();
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleExportText = () => {
    const text = posts.exportText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `live-tweeting-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="flex flex-col gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sm:flex-row sm:items-start sm:justify-between">
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
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="shrink-0">サフィックス</span>
            <input
              type="text"
              value={posts.suffix}
              onChange={(event) => posts.setSuffix(event.target.value)}
              placeholder="#ハッシュタグ"
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-56"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={posts.exportJSON}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            title="JSONエクスポート"
          >
            <Download size={16} />
            <span className="hidden sm:inline">JSON</span>
          </button>
          <button
            onClick={handleExportText}
            disabled={posts.posts.length === 0}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="テキストエクスポート"
          >
            <FileText size={16} />
            <span className="hidden sm:inline">テキスト</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={posts.posts.length === 0}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
              copyFeedback
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="クリップボードにコピー"
          >
            <Copy size={16} />
            <span className="hidden sm:inline">
              {copyFeedback ? "コピー済" : "コピー"}
            </span>
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
            onChange={handleFileSelect}
          />
        </div>
      </header>

      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mx-4 max-w-sm w-full space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              インポート方法を選択
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              既存の投稿が {posts.posts.length} 件あります。
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleImportChoice("replace")}
                className="w-full px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                置き換え（既存データを削除）
              </button>
              <button
                onClick={() => handleImportChoice("append")}
                className="w-full px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                追記（既存データに追加）
              </button>
              <button
                onClick={() => handleImportChoice("cancel")}
                className="w-full px-4 py-2 text-sm rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
