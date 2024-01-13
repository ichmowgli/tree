import { create } from "zustand";
import { FileTreeNode } from "./mocks";
import { RenderableFileTreeNode } from "./types";
import * as Api from "./mocks";

type FileStore = {
  _files: FileTreeNode[] | undefined;
  transformed: RenderableFileTreeNode[] | undefined;
  searchTerm: string | undefined;
  filtered: RenderableFileTreeNode[] | undefined;

  triggerCollapsed: (id: number) => void;
  setSearchTerm: (term: string | undefined) => void;
  setFiles: (files: FileTreeNode[]) => void;
  fetchFiles: () => Promise<void>;
  renameFile: (id: number, name: string) => void;
  moveFile: (id: number, destinationId: number) => void;
  transformFilesIntoRenderableNodes: (
    files: FileTreeNode[],
  ) => RenderableFileTreeNode[];
  updateFiltered: () => void;
};

const findInTreeById = (
  tree: RenderableFileTreeNode[],
  id: number,
): RenderableFileTreeNode | null => {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }

    if (node.children) {
      const found = findInTreeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

const canMove = (
  id: number,
  destinationId: number,
  tree: RenderableFileTreeNode[],
): boolean => {
  const node = findInTreeById(tree, id);
  if (!node) {
    return false;
  }

  if (node.id === destinationId) {
    return false;
  }

  if (node.parentId === destinationId) {
    return false;
  }

  if (node.children) {
    return node.children.every((child) =>
      canMove(child.id, destinationId, tree),
    );
  }

  return true;
};

export const useFilesStore = create<FileStore>((set, get) => ({
  _files: undefined,
  transformed: undefined,
  searchTerm: undefined,
  filtered: undefined,

  triggerCollapsed: (id) => {
    const file = findInTreeById(get().transformed!, id);
    if (!file) {
      return;
    }
    file.isCollapsed = !file.isCollapsed;
    set({});
  },
  setSearchTerm: (term) => {
    set({ searchTerm: term });

    get().updateFiltered();
  },
  setFiles: (files) => {
    set({ _files: files });
    const transformed = get().transformFilesIntoRenderableNodes(files);
    set({ transformed: transformed });
    set({ filtered: transformed });
    get().updateFiltered();
  },
  updateFiltered: () => {
    const term = get().searchTerm;
    if (!term) {
      set({ filtered: get().transformed });
      return;
    }

    const hasMatchingDescendant = (node: RenderableFileTreeNode): boolean => {
      if (node.name.includes(term)) {
        return true;
      }

      if (node.children === null) {
        return node.name.includes(term);
      }

      return node.children.some(hasMatchingDescendant);
    };

    const filterOutUnmatchingDescendants = (
      node: RenderableFileTreeNode,
    ): RenderableFileTreeNode => {
      if (node.children === null) {
        return node;
      }

      const filteredChildren = node.children
        .filter(hasMatchingDescendant)
        .map(filterOutUnmatchingDescendants);

      return {
        ...node,
        children: filteredChildren,
      };
    };

    const filtered = get()
      .transformed!.filter(hasMatchingDescendant)
      .map(filterOutUnmatchingDescendants);

    set({ filtered });
  },
  fetchFiles: async () => {
    const backendResponse = await Api.fetchFileTree();
    get().setFiles(backendResponse);
  },
  renameFile: async (id, name) => {
    const backendResponse = await Api.renameFile(id, name);
    const _files = get()._files!.map((file) =>
      file.id === id ? backendResponse : file,
    );
    get().setFiles(_files);
  },
  moveFile: async (id, destinationId) => {
    if (!canMove(id, destinationId, get().transformed!)) {
      throw new Error("Cannot move file into itself");
    }

    const backendResponse = await Api.moveFile(id, destinationId);
    const _files = get()._files!.map((file) =>
      file.id === id ? backendResponse : file,
    );
    get().setFiles(_files);
  },
  transformFilesIntoRenderableNodes: (files) => {
    function buildTree(parentId: number | null): RenderableFileTreeNode[] {
      const children: RenderableFileTreeNode[] = [];

      for (const node of files) {
        if (node.parentId === parentId) {
          const childNode = {
            id: node.id,
            parentId: node.parentId,
            name: node.name,
            children: node.childrenIds ? buildTree(node.id) : null,
            isCollapsed: false,
            movable: node.movable,
            editable: node.editable,
            writable: node.writable,
          };
          children.push(childNode);
        }
      }

      return children;
    }

    return buildTree(null);
  },
}));
