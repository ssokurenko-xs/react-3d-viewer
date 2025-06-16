import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { ReactNode, ReactElement } from "react";

interface ViewerProps {
  children: ((rotation: [number, number, number]) => ReactElement) | ReactNode;
}

export default function Viewer({ children }: ViewerProps) {
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);

  const rotate = (axis: "x" | "y", dir: 1 | -1) => {
    setRotation((r) => {
      if (axis === "x") return [r[0] + dir * 0.2, r[1], r[2]];
      if (axis === "y") return [r[0], r[1] + dir * 0.2, r[2]];
      return r;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") rotate("x", -1);
      if (e.key === "ArrowDown") rotate("x", 1);
      if (e.key === "ArrowLeft") rotate("y", -1);
      if (e.key === "ArrowRight") rotate("y", 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="card w-200 h-200 m-auto bg-base-100 card-xs shadow-sm ">
      <div className="card-body pt-4">
        <Canvas>
          {typeof children === "function"
            ? (children as (rotation: [number, number, number]) => ReactElement)(rotation)
            : children}
        </Canvas>
        <div className="flex flex-col items-center mt-4 border-t pt-2 border-gray-200">
          <button
            onClick={() => rotate("x", -1)}
            aria-label="Rotate Up"
            className="btn btn-circle mb-1"
          >
            ↑
          </button>
          <div className="flex flex-row justify-between w-32 mt-1 mb-1">
            <button
              onClick={() => rotate("y", -1)}
              aria-label="Rotate Left"
              className="btn btn-circle"
            >
              ←
            </button>
            <button
              onClick={() => rotate("y", 1)}
              aria-label="Rotate Right"
              className="btn btn-circle"
            >
              →
            </button>
          </div>
          <button
            onClick={() => rotate("x", 1)}
            aria-label="Rotate Down"
            className="btn btn-circle mt-1"
          >
            ↓
          </button>
        </div>
      </ div>
    </div>
  );
}
