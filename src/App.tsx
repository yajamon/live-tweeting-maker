import { useTimer } from "./hooks/useTimer";
import { usePosts } from "./hooks/usePosts";
import { Header } from "./components/Header";
import { TimerPanel } from "./components/TimerPanel";
import { Timeline } from "./components/Timeline";
import { Composer } from "./components/Composer";

function App() {
  const timer = useTimer();
  const posts = usePosts();

  const handleSubmit = (text: string) => {
    posts.addPost(timer.elapsedSeconds, text);
    posts.setDraftText("");
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <Header posts={posts} />
      <TimerPanel timer={timer} />
      <Timeline
        posts={posts.posts}
        suffix={posts.suffix}
        onDelete={posts.deletePost}
        onEdit={posts.editPost}
      />
      <Composer
        draftText={posts.draftText}
        onDraftChange={posts.setDraftText}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default App;
