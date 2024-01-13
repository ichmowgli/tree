import { RenderableFileTreeNode } from "../types";
import { File } from "./File";

type Props = {
  root: RenderableFileTreeNode;
};

export const FileTree: React.FC<Props> = ({ root }) => {
  return (
    <div>
      <File
        data={root}
        onClick={
          root.children?.length ? () => console.log("expand") : undefined
        }
      />
    </div>
  );
};
