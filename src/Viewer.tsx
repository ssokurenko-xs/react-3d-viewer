import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";

const ROTATE_STEP = 0.5; // Rotation step in radians

interface ViewerProps {
  data: any[];
  gridHeight: number;
  gridWidth: number;
}

export default function Viewer({ data = [], gridHeight = 512, gridWidth = 256 }: ViewerProps) {
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [frame, setFrame] = useState(0);
  const [frameData, setFrameData] = useState([]);

  useEffect(() => {
    if (data.length > 0) {
      setFrameData(data[frame]?.data || []);
    }
  }, [data, frame]);

  useEffect(() => {
    console.log("🧈Frame Data:", frameData);
  }, [frameData]);

  const rotate = (axis: "x" | "y", dir: number) => {
    setRotation((r) => {
      if (axis === "x") return [r[0] + dir * 0.2, r[1], r[2]];
      if (axis === "y") return [r[0], r[1] + dir * 0.2, r[2]];
      return r;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") rotate("x", -ROTATE_STEP);
      if (e.key === "ArrowDown") rotate("x", ROTATE_STEP);
      if (e.key === "ArrowLeft") rotate("y", -ROTATE_STEP);
      if (e.key === "ArrowRight") rotate("y", ROTATE_STEP);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="card w-200 h-200 m-auto bg-base-100 card-xs shadow-sm">
      <div className="card-body pt-4">
        <Canvas>
          <mesh rotation={rotation}>
            <boxGeometry args={[2, 2, 2]} />
            <meshPhongMaterial />
          </mesh>
          <ambientLight intensity={0.1} />
          <directionalLight position={[0, 0, 5]} color="#62c087" />
        </Canvas>

        <div className="flex flex-row mt-4 border-t py-3 border-gray-200 w-full">
          {/* Frame range slider on the left */}
          <div className="ml-8 flex items-center w-1/2">
            <button
              onClick={() => setFrame((f) => Math.max(0, f - 1))}
              aria-label="Previous Frame"
              className="btn btn-sm mr-2"
            >
              Prev
            </button>
            <div className="relative w-full flex-1">
              <input
                type="range"
                min={0}
                max={data?.length ? data?.length - 1 : 0}
                className="range text-green-400 w-full"
                aria-label="Frame range"
                onChange={(e) => setFrame(Number(e.target.value))}
                value={frame}
                style={{ zIndex: 1 }}
              />
              <div
                className="absolute -top-6 left-1/2 text-xs font-bold select-none pointer-events-none transition-all duration-100"
                style={{
                  minWidth: '2em',
                  textAlign: 'center',
                  transform: 'translateX(-50%)',
                }}
              >
                Frame: <span className="text-green-600">{frame + 1}</span>
              </div>
            </div>
            <button
              onClick={() => setFrame((f) => Math.min(data.length - 1, f + 1))}
              aria-label="Previous Frame"
              className="btn btn-sm ml-2"
            >
              Next
            </button>
          </div>
          <div className="flex flex-col items-center w-1/2">
            <div className="w-50 flex flex-col items-center">
              <button
                onClick={() => rotate("x", -ROTATE_STEP)}
                aria-label="Rotate Up"
                className="btn btn-circle mb-1"
              >
                ↑
              </button>
              <div className="flex flex-row justify-between w-30 mt-1 mb-1">
                <button
                  onClick={() => rotate("y", -ROTATE_STEP)}
                  aria-label="Rotate Left"
                  className="btn btn-circle"
                >
                  ←
                </button>
                <button
                  onClick={() => rotate("y", ROTATE_STEP)}
                  aria-label="Rotate Right"
                  className="btn btn-circle"
                >
                  →
                </button>
              </div>
              <button
                onClick={() => rotate("x", ROTATE_STEP)}
                aria-label="Rotate Down"
                className="btn btn-circle mt-1"
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      </ div>
    </div>
  );
}
