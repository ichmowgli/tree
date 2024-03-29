export type FileTreeNode = {
  id: number;
  parentId: number | null;
  name: string;

  childrenIds: number[] | null;

  movable: boolean;
  editable: boolean;
  writable: boolean;
};

let MOCK_FILE_NODES: FileTreeNode[] = [
  {
    id: 1,
    parentId: null,
    name: "root",
    childrenIds: [2, 3, 4],
    movable: false,
    editable: false,
    writable: false,
  },
  {
    id: 100,
    parentId: null,
    name: "root2",
    childrenIds: [],
    movable: false,
    editable: false,
    writable: false,
  },
  {
    id: 2,
    parentId: 1,
    name: "dir1",
    childrenIds: [5, 6],
    movable: true,
    editable: true,
    writable: true,
  },
  {
    id: 3,
    parentId: 1,
    name: "dir2",
    childrenIds: [7],
    movable: true,
    editable: true,
    writable: true,
  },
  {
    id: 4,
    parentId: 1,
    name: "dir3",
    childrenIds: null,
    movable: true,
    editable: true,
    writable: true,
  },
  {
    id: 5,
    parentId: 2,
    name: "dir1-1",
    childrenIds: null,
    movable: true,
    editable: true,
    writable: true,
  },
  {
    id: 6,
    parentId: 2,
    name: "dir1-2",
    childrenIds: null,
    movable: true,
    editable: false,
    writable: true,
  },
  {
    id: 7,
    parentId: 3,
    name: "dir2-1",
    childrenIds: null,
    movable: true,
    editable: true,
    writable: true,
  },
];

export async function fetchFileTree(): Promise<FileTreeNode[]> {
  return MOCK_FILE_NODES;
}

export async function renameFile(
  id: number,
  name: string,
): Promise<FileTreeNode> {
  const file = MOCK_FILE_NODES.find((file) => file.id === id);
  if (!file) {
    throw new Error("File not found");
  }

  file.name = name;
  return file;
}

export async function moveFile(
  id: number,
  parentId: number | null,
): Promise<FileTreeNode> {
  if (id === parentId) {
    throw new Error("Cannot move file into itself");
  }

  const file = MOCK_FILE_NODES.find((file) => file.id === id);
  if (!file) {
    throw new Error("File not found");
  }

  const oldParentId = file.parentId;

  if (oldParentId === parentId) {
    return file;
  }

  const newParent = MOCK_FILE_NODES.find((file) => file.id === parentId);
  if (!newParent) {
    throw new Error("Parent not found");
  }

  if (!newParent.writable) {
    throw new Error("Parent is not writable");
  }

  if (!newParent.childrenIds) {
    throw new Error("Parent is not a directory");
  }

  newParent.childrenIds = [...newParent.childrenIds, id];

  const oldParent = MOCK_FILE_NODES.find((file) => file.id === oldParentId);
  if (oldParent) {
    oldParent.childrenIds =
      oldParent.childrenIds?.filter((childId) => childId !== id) ?? null;
  }

  file.parentId = parentId;
  return file;
}

export const deleteFile = async (id: number): Promise<void> => {
  const file = MOCK_FILE_NODES.find((file) => file.id === id);
  if (!file) {
    throw new Error("File not found");
  }

  if (file.parentId === null) {
    MOCK_FILE_NODES = MOCK_FILE_NODES.filter((file) => file.id !== id);
    return;
  }

  if (!file.editable) {
    throw new Error("You can't delete this file");
  }

  const parent = MOCK_FILE_NODES.find(
    (pfile) => pfile.id === file.parentId,
  ) as FileTreeNode;

  parent.childrenIds = parent.childrenIds!.filter((childId) => childId !== id);
  MOCK_FILE_NODES = MOCK_FILE_NODES.filter((file) => file.id !== id);
};
