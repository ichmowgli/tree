import { useFilesStore } from "@/store";
import { ElementRef, useRef } from "react";
import { Input } from "./ui/input";

export const SearchBar = () => {
  const { searchTerm, setSearchTerm } = useFilesStore();

  const ref = useRef<ElementRef<"input">>();

  return (
    <div className="flex flex-row gap-4">
      <Input
        className="w-60"
        defaultValue={searchTerm}
        placeholder="filter by name"
        ref={ref as any}
        onChange={() => {
          setSearchTerm(ref.current!.value);
        }}
      />
    </div>
  );
};
