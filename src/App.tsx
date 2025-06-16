import useGenerateMockPressureData from "./mocks";
import { GRID_HEIGHT, GRID_WIDTH } from "./mocks/grid";
import Viewer from "./Viewer";

export default function App() {
  const mockData = useGenerateMockPressureData();

  return <Viewer gridHeight={GRID_HEIGHT} gridWidth={GRID_WIDTH} data={mockData} />;
}