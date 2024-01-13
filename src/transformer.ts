import { FileTreeNode } from "./mocks";
import { RenderableFileTreeNode } from "./types";

export const transformFileTreeArrayIntoRenderableNode = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  arr: FileTreeNode[],
): RenderableFileTreeNode => {
  // actually do the transform

  return {
    id: 1,
    name: "hi",
    parentId: null,
    editable: true,
    writable: true,
    movable: true,
    children: [
      {
        id: 2,
        parentId: 1,
        name: "hi2.md",
        children: null,
        editable: true,
        writable: false,
        movable: true,
      },
    ],
  };
};
