import { FileTree } from "./components/FileTree";
import { MOCK_FILE_NODES } from "./mocks";
import { transformFileTreeArrayIntoRenderableNode } from "./transformer";

export default function App() {
  // make this call `fetchFileTree` and store in zustand
  const nodes = MOCK_FILE_NODES;
  const rootNode = transformFileTreeArrayIntoRenderableNode(nodes);

  return <FileTree root={rootNode} />;
}
