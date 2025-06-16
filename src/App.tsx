
import useGenerateMockPressureData from "./mocks";
import Viewer from "./Viewer";

export default function App() {
  const mockData = useGenerateMockPressureData();

  return (
    <Viewer data={mockData}>
      {(rotation: [number, number, number]) => (
        <>
          <mesh rotation={rotation}>
            <boxGeometry args={[2, 2, 2]} />
            <meshPhongMaterial />
          </mesh>
          <ambientLight intensity={0.1} />
          <directionalLight position={[0, 0, 5]} color="#62c087" />
        </>
      )}
    </Viewer>
  );
}