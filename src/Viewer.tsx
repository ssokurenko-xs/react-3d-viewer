import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

const ROTATE_STEP = 0.5; // Rotation step in radians

interface ViewerProps {
  data: any[];
  gridHeight: number;
  gridWidth: number;
}

export default function Viewer({ data = [], gridHeight = 512, gridWidth = 256 }: ViewerProps) {
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [frame, setFrame] = useState(0);
  // Type for frameData
  const [frameData, setFrameData] = useState<{ x: number; y: number; z: number }[]>([]);
  // Camera zoom state
  const [zoom, setZoom] = useState(1);

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

  // Handle + and - keys for zoom
  useEffect(() => {
    const handleZoomKey = (e: KeyboardEvent) => {
      if (e.key === "+") setZoom((z) => Math.min(z * 1.2, 20));
      if (e.key === "-") setZoom((z) => Math.max(z / 1.2, 0.05));
    };
    window.addEventListener("keydown", handleZoomKey);
    return () => window.removeEventListener("keydown", handleZoomKey);
  }, []);

  // Generate indexed BufferGeometry from frameData as a surface or fallback to point cloud
  const geometry = React.useMemo(() => {
    if (!frameData || frameData.length === 0) return null;
    // Find min/max z for color mapping
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < frameData.length; i++) {
      if (frameData[i].z < minZ) minZ = frameData[i].z;
      if (frameData[i].z > maxZ) maxZ = frameData[i].z;
    }
    // If not enough points for a surface, fallback to points
    if (frameData.length < 4) {
      const positions = new Float32Array(frameData.length * 3);
      const colors = new Float32Array(frameData.length * 3);
      for (let i = 0; i < frameData.length; i++) {
        positions[i * 3] = frameData[i].x;
        positions[i * 3 + 1] = 0 - frameData[i].z;
        positions[i * 3 + 2] = -frameData[i].y;
        // Heatmap color: t=0 (minZ, light blue), t=1 (maxZ, strong red)
        const t = (frameData[i].z - minZ) / (maxZ - minZ || 1);
        // Light blue: rgb(0.7, 0.85, 1), Red: rgb(1, 0.1, 0.1)
        colors[i * 3] = t * 1 + (1 - t) * 0.7;      // R: 0.7 (blue) to 1 (red)
        colors[i * 3 + 1] = t * 0.1 + (1 - t) * 0.85; // G: 0.85 (blue) to 0.1 (red)
        colors[i * 3 + 2] = t * 0.1 + (1 - t) * 1;    // B: 1 (blue) to 0.1 (red)
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      return geom;
    }
    // Surface mesh for regular grid
    const positions = new Float32Array(frameData.length * 3);
    const colors = new Float32Array(frameData.length * 3);
    for (let i = 0; i < frameData.length; i++) {
      positions[i * 3] = frameData[i].x;
      positions[i * 3 + 1] = 0 - frameData[i].z;
      positions[i * 3 + 2] = -frameData[i].y;
      // Heatmap color: t=0 (minZ, light blue), t=1 (maxZ, strong red)
      const t = (frameData[i].z - minZ) / (maxZ - minZ || 1);
      // Light blue: rgb(0.7, 0.85, 1), Red: rgb(1, 0.1, 0.1)
      colors[i * 3] = t * 1 + (1 - t) * 0.7;      // R: 0.7 (blue) to 1 (red)
      colors[i * 3 + 1] = t * 0.1 + (1 - t) * 0.85; // G: 0.85 (blue) to 0.1 (red)
      colors[i * 3 + 2] = t * 0.1 + (1 - t) * 1;    // B: 1 (blue) to 0.1 (red)
    }
    const indices = [];
    for (let y = 0; y < gridHeight - 1; y++) {
      for (let x = 0; x < gridWidth - 1; x++) {
        const i = y * gridWidth + x;
        indices.push(i, i + 1, i + gridWidth);
        indices.push(i + 1, i + gridWidth + 1, i + gridWidth);
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [frameData, gridHeight, gridWidth]);

  const center = React.useMemo(() => {
    if (!frameData || frameData.length === 0) return { x: 0, y: 0, z: 0 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const p of frameData) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    }
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      z: (minZ + maxZ) / 2,
    };
  }, [frameData]);

  return (
    <div className="card w-200 h-200 m-auto bg-base-100 card-xs shadow-sm">
      <div className="card-body pt-4">
        <Canvas camera={{ position: [0, 0, Math.max(gridHeight, gridWidth) * 1.5 / zoom], near: 0.1, far: 10000 }}>
          {geometry && geometry.index ? (
            <mesh geometry={geometry} rotation={[rotation[0], rotation[1], rotation[2]]} position={[-center.x, -center.y, -center.z]}>
              <meshStandardMaterial vertexColors side={THREE.DoubleSide} wireframe={false} />
            </mesh>
          ) : geometry ? (
            <points geometry={geometry} rotation={[rotation[0], rotation[1], rotation[2]]} position={[-center.x, -center.y, -center.z]}>
              <pointsMaterial vertexColors size={2} />
            </points>
          ) : (
            <mesh rotation={rotation}>
              <boxGeometry args={[2, 2, 2]} />
              <meshPhongMaterial />
            </mesh>
          )}
          <ambientLight intensity={0.3} />
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
