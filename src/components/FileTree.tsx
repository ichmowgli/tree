import {
  ChevronDown,
  ChevronUp,
  Edit2,
  File,
  Folder,
  Minus,
  Trash,
} from "lucide-react";
import { RenderableFileTreeNode } from "../types";
import { RootNode, useFilesStore } from "../store";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

type DescendantProps = {
  node: RenderableFileTreeNode;
};

const RenameButton: React.FC<DescendantProps> = ({ node }) => {
  const { renameFile } = useFilesStore();
  const [newName, setNewName] = useState(node.name);
  const nodeType = node.children ? "directory" : "file";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Edit2 className="mr-1 icon" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename the {nodeType}</DialogTitle>
          {!node.editable && (
            <DialogDescription>
              You don't have permissions to rename this {nodeType} 😔
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newName}
              className="col-span-3"
              disabled={!node.editable}
              onChange={(e) => {
                setNewName(e.target.value);
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              onClick={() => {
                renameFile(node.id, newName);
              }}
              disabled={!node.editable}
            >
              Save changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteButton: React.FC<DescendantProps> = ({ node }) => {
  const { deleteFile } = useFilesStore();
  const nodeType = node.children ? "directory" : "file";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Trash className="mr-0 ml-1 icon" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this {nodeType}?
          </DialogTitle>
          <DialogDescription>
            {node.writable
              ? "This action cannot be reversed"
              : `You don't have permissions to delete this ${nodeType} 😔`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant={"destructive"}
              type="submit"
              onClick={() => {
                deleteFile(node.id);
              }}
              disabled={!node.writable}
            >
              Confirm deletion
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FileTreeItem: React.FC<DescendantProps> = ({ node }) => {
  const { triggerCollapsed } = useFilesStore();

  const isFolder = node.children !== null;
  const isFile = !isFolder;
  const hasChildren = isFolder && node.children!.length > 0;

  const chevron = isFile ? null : !hasChildren ? (
    <Minus />
  ) : node.isCollapsed ? (
    <ChevronUp />
  ) : (
    <ChevronDown />
  );
  const icon = isFolder ? <Folder className="mr-1 ml-1" /> : <File />;

  const shouldRenderChildren = isFolder && !node.isCollapsed;
  const childrenNodes =
    shouldRenderChildren &&
    node.children!.map((child) => (
      <FileTreeItem node={child} key={node.id + child.id} />
    ));

  return (
    <div>
      <div className="flex flex-row w-full mb-2 justify-between">
        <div className="flex flex-row">
          {isFolder && (
            <div
              className="flex icon justify-center items-center"
              onClick={() => triggerCollapsed(node.id)}
            >
              {chevron}
            </div>
          )}
          {icon}
          {node.name}
        </div>
        <div className="flex flex-row">
          <RenameButton node={node} />
          <DeleteButton node={node} />
        </div>
      </div>
      <div className="ml-6">{childrenNodes}</div>
    </div>
  );
};

type FileTreeProps = {
  node: RootNode;
  className?: string;
};

export const FileTree: React.FC<FileTreeProps> = ({ node, className }) => {
  return (
    <div className={cn("w-60 ", className)}>
      {node.children!.map((child) => (
        <FileTreeItem node={child} key={"root-" + child.id} />
      ))}
    </div>
  );
};
