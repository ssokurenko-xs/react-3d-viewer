import { Canvas } from "@react-three/fiber";

export default function App() {
  return (
    <div className="card w-200 h-200 m-auto bg-base-100 card-xs shadow-sm ">
      <div className="card-body pt-4">
        <Canvas>
          <mesh>
            <boxGeometry args={[2, 2, 3]} />
            <meshPhongMaterial />
          </mesh>
          <ambientLight intensity={0.1} />
          <directionalLight position={[0, 0, 5]} color="red" />
        </Canvas>
      </div>
    </div>
  );
}