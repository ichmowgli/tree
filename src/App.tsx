import { Loader } from "lucide-react";
import { FileTree } from "./components/FileTree";
import { useFilesStore } from "./store";
import { SearchBar } from "./components/SearchBar";

export default function App() {
  const { filtered, fetchFiles } = useFilesStore();

  if (!filtered) {
    fetchFiles();
    return <Loader />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-10">
        <SearchBar />
        {filtered.children?.length ? (
          <FileTree node={filtered as any} />
        ) : (
          "Nothing to show 😔"
        )}
      </div>
    </main>
  );
}
