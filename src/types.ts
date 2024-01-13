export type RenderableFileTreeNode = {
  id: number;
  parentId: number | null;
  name: string;

  children: RenderableFileTreeNode[] | null;

  isCollapsed: boolean;
  movable: boolean;
  editable: boolean;
  writable: boolean;
};
