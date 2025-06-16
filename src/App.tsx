import useGenerateMockPressureData from "./mocks";
import Viewer from "./Viewer";

export default function App() {
  const mockData = useGenerateMockPressureData();

  return <Viewer data={mockData} />;
}