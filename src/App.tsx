import { Loader, Search } from "lucide-react";
import { FileTree } from "./components/FileTree";
import { useFilesStore } from "./store";
import { ElementRef, useRef } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

const SearchBar = () => {
  const { searchTerm, setSearchTerm } = useFilesStore();

  const ref = useRef<ElementRef<"input">>();

  return (
    <div>
      <Input
        defaultValue={searchTerm}
        placeholder="search term..."
        ref={ref as any}
      />
      <Button
        onClick={() => {
          setSearchTerm(ref.current!.value);
        }}
      >
        <Search />
      </Button>
    </div>
  );
};

export default function App() {
  const { filtered, fetchFiles } = useFilesStore();

  if (!filtered) {
    fetchFiles();
    return <Loader />;
  }

  return (
    <div>
      <SearchBar />
      {filtered.map((node) => (
        <FileTree node={node} />
      ))}
    </div>
  );
}
