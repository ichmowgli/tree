import { ChevronDown, ChevronUp, Edit2, File, Folder } from "lucide-react";
import { RenderableFileTreeNode } from "../types";
import { useFilesStore } from "../store";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";

type Props = {
  node: RenderableFileTreeNode;
};

export const FileTree: React.FC<Props> = ({ node }) => {
  const { renameFile, triggerCollapsed } = useFilesStore();

  const isFolder = node.children !== null;

  const chevron = node.isCollapsed ? <ChevronUp /> : <ChevronDown />;
  const icon = isFolder ? <Folder /> : <File />;

  const shouldRenderChildren = isFolder && !node.isCollapsed;
  const childrenNodes =
    shouldRenderChildren &&
    node.children!.map((child) => (
      <FileTree node={child} key={node.id + child.id} />
    ));

  const [newName, setNewName] = useState(node.name);

  return (
    <div>
      <div className="flex flex-row w-full mb-2">
        {isFolder && (
          <div onClick={() => triggerCollapsed(node.id)}>{chevron}</div>
        )}
        {icon}
        {node.name} {isFolder}
        {node.editable && (
          <Dialog>
            <DialogTrigger asChild>
              <Edit2 className="mr-0" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Rename the file</DialogTitle>
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
                  >
                    Save changes
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {!!childrenNodes && <div className="ml-6">{childrenNodes}</div>}
    </div>
  );
};
