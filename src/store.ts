import { create } from "zustand";
import { FileTreeNode } from "./mocks";
import { RenderableFileTreeNode } from "./types";
import * as Api from "./mocks";

type FileStore = {
  _files: FileTreeNode[] | undefined;
  transformed: RootNode | undefined;
  searchTerm: string | undefined;
  filtered: RootNode | undefined;

  triggerCollapsed: (id: number) => void;
  setSearchTerm: (term: string | undefined) => void;
  setFiles: (files: FileTreeNode[]) => void;
  fetchFiles: () => Promise<void>;
  renameFile: (id: number, name: string) => void;
  deleteFile: (id: number) => void;
  moveFile: (id: number, destinationId: number) => void;
  transformFilesIntoRenderableNodes: (files: FileTreeNode[]) => RootNode;
  updateFiltered: () => void;
};

export type RootNode = Omit<
  RenderableFileTreeNode,
  "parentId" | "id" | "children"
> & {
  id: null;
  parentId: null;
  children: RenderableFileTreeNode[];
};

const findInTreeById = (
  tree: RenderableFileTreeNode | RootNode,
  id: number,
): RenderableFileTreeNode | null => {
  if (tree.id === id) {
    return tree;
  }

  if (tree.children === null) {
    return null;
  }

  for (const child of tree.children) {
    const result = findInTreeById(child, id);
    if (result) {
      return result;
    }
  }

  return null;
};

export const canMoveAIntoB = (
  id: number,
  destinationId: number,
  tree: RootNode,
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
      canMoveAIntoB(child.id, destinationId, tree),
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
      .transformed!.children!.filter(hasMatchingDescendant)
      .map(filterOutUnmatchingDescendants);

    set({ filtered: { ...get().transformed!, children: filtered } });
  },
  fetchFiles: async () => {
    const backendResponse = await Api.fetchFileTree();
    get().setFiles(backendResponse);
  },
  renameFile: async (id, name) => {
    const file = findInTreeById(get().transformed!, id);

    if (file && !file.editable) {
      throw new Error("File is not editable");
    }

    const backendResponse = await Api.renameFile(id, name);
    const _files = get()._files!.map((file) =>
      file.id === id ? backendResponse : file,
    );
    get().setFiles(_files);
  },
  deleteFile: async (id) => {
    await Api.deleteFile(id);
    get().fetchFiles();
  },
  moveFile: async (id, destinationId) => {
    if (!canMoveAIntoB(id, destinationId, get().transformed!)) {
      throw new Error("Cannot move file into itself");
    }

    const backendResponse = await Api.moveFile(id, destinationId);
    const _files = get()._files!.map((file) =>
      file.id === id ? backendResponse : file,
    );
    get().setFiles(_files);
  },
  transformFilesIntoRenderableNodes: (files) => {
    const map = new Map();

    map.set(null, {
      id: null,
      name: "root",
      parentId: null,
      children: [],
      isCollapsed: false,
      editable: false,
      writable: true,
      movable: false,
    });

    for (const file of files) {
      map.set(file.id, {
        id: file.id,
        name: file.name,
        parentId: file.parentId,
        children: file.childrenIds ? [] : null,
        isCollapsed: false,
        editable: file.editable,
        writable: file.writable,
        movable: file.movable,
      });
    }

    for (const file of files) {
      const node = map.get(file.id);
      if (!node) {
        continue;
      }

      const parent = map.get(file.parentId);
      if (!parent) {
        continue;
      }

      if (parent.children === null) {
        continue;
      }

      parent.children.push(node);
    }

    return map.get(null);
  },
}));
