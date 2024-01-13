export type RenderableFileTreeNode = {
  id: number;
  parentId: number | null;
  name: string;

  /** `children = null` means that we're looking at a file  */
  children: RenderableFileTreeNode[] | null;

  /** can we move this file/dir? */
  movable: boolean;
  /** can we rename this file/dir? */
  editable: boolean;
  /** can we move files to this dir? */
  writable: boolean;
};
