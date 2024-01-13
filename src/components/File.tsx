import { RenderableFileTreeNode } from "../types";

type Props = {
  data: RenderableFileTreeNode;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (...args: any[]) => void;
};

export const File: React.FC<Props> = ({ data, onClick }) => {
  return <div onClick={onClick}>{data.name}</div>;
};
