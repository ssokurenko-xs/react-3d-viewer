import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

const ROTATE_STEP: number = 0.2; // Rotation step in radians
const DEPTH_SCALE_DEFAULT: number = 0.1; // Default scale for depth (z) values
const SCALE_STEP: number = 0.01; // Step for depth scale adjustment
const ROTATION: [number, number, number] = [0, Math.PI / 2, Math.PI / 2]; // Default rotation angles in radians
const FRAME_DURATION_MS: number = 200; // Duration for each frame in milliseconds

interface Props {
  data: any[];
  gridHeight: number;
  gridWidth: number;
}

export default function Viewer({ data = [], gridHeight = 512, gridWidth = 256 }: Props) {
  const [rotation, setRotation] = useState<[number, number, number]>(ROTATION);
  const [frame, setFrame] = useState(0);
  // Type for frameData
  const [frameData, setFrameData] = useState<{ x: number; y: number; z: number }[]>([]);
  // Depth scale state
  const [depthScale, setDepthScale] = useState(DEPTH_SCALE_DEFAULT);
  const [isAlertOpen, setIsAlertOpen] = useState(true);
  // Animation state
  const [playing, setPlaying] = useState(false);

  // Play/pause frame animation
  useEffect(() => {
    if (!playing) return;
    if (!data?.length) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % data.length);
    }, FRAME_DURATION_MS);
    return () => clearInterval(interval);
  }, [playing, data]);

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
      if (e.key === "+" || e.key === "=") setDepthScale((s) => Math.min(1, s + SCALE_STEP));
      if (e.key === "-") setDepthScale((s) => Math.max(0, s - SCALE_STEP));
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        positions[i * 3 + 1] = 0 - frameData[i].z * depthScale; // Use state for depth scale
        positions[i * 3 + 2] = -frameData[i].y;
        const t = (frameData[i].z - minZ) / (maxZ - minZ || 1);
        colors[i * 3] = t * 1 + (1 - t) * 0.5;           // R: 0.5 (blue) to 1 (red)
        colors[i * 3 + 1] = t * 0.1 + (1 - t) * 0.7;     // G: 0.7 (blue) to 0.1 (red)
        colors[i * 3 + 2] = t * 0.1 + (1 - t) * 1;       // B: 1 (blue) to 0.1 (red)
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
      positions[i * 3 + 1] = 0 - frameData[i].z * depthScale;
      positions[i * 3 + 2] = -frameData[i].y;
      // Heatmap color: t=0 (minZ, blue), t=1 (maxZ, strong red)
      const t = (frameData[i].z - minZ) / (maxZ - minZ || 1);
      colors[i * 3] = t * 1 + (1 - t) * 0.5;           // R: 0.5 (blue) to 1 (red)
      colors[i * 3 + 1] = t * 0.1 + (1 - t) * 0.7;     // G: 0.7 (blue) to 0.1 (red)
      colors[i * 3 + 2] = t * 0.1 + (1 - t) * 1;       // B: 1 (blue) to 0.1 (red)
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
  }, [frameData, gridHeight, gridWidth, depthScale]);

  // Dispose geometry to prevent memory leaks
  useEffect(() => {
    return () => {
      if (!geometry) return;
      geometry.dispose();
    };
  }, [geometry]);

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
    <div className="card w-200 h-160 m-auto bg-base-100 shadow-sm">
      <div className="card-body !p-3">
        <Canvas camera={{ position: [0, 0, 0], near: 0.6, far: 100000 }}>
          {geometry && geometry.index ? (
            <mesh
              geometry={geometry}
              rotation={[rotation[0], rotation[1], rotation[2]]}
              position={[0, -center.y + 30, -center.z]}
            >
              <meshStandardMaterial vertexColors side={THREE.DoubleSide} wireframe={false} />
            </mesh>
          ) : geometry ? (
            <points
              geometry={geometry}
              rotation={[rotation[0], rotation[1], rotation[2]]}
              position={[0, -center.y + 30, -center.z]}
            >
              <pointsMaterial vertexColors size={2} />
            </points>
          ) : (
            <mesh rotation={rotation} position={[0, 30, 0]}>
              <boxGeometry args={[2, 2, 2]} />
              <meshPhongMaterial />
            </mesh>
          )}
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 3]} color="white" />
        </Canvas>

        <div className="flex flex-row mt-4 border-t pt-2 border-gray-200 w-full">
          <div className="ml-8 flex items-center w-1/2">
            {playing ? (
              <div className="tooltip" data-tip="Pause animation">
                <button
                  onClick={() => setPlaying(false)}
                  aria-label="Pause Animation"
                  className="btn btn-circle btn-error mr-2"
                  style={{ minWidth: 36 }}
                >
                  ⏸︎
                </button>
              </div>
            ) : (
              <div className="tooltip" data-tip="Play animation">
                <button
                  onClick={() => setPlaying(true)}
                  aria-label="Play Animation"
                  className="btn btn-circle btn-success mr-2"
                  style={{ minWidth: 36 }}
                >
                  ⏵︎
                </button>
              </div>
            )}
            <div className="tooltip" data-tip="Previous frame">
              <button
                onClick={() => setFrame((f) => Math.max(0, f - 1))}
                aria-label="Previous Frame"
                className="btn btn-ghost btn-sm mr-1"
              >
                ⏪︎
              </button>
            </div>
            <div className="relative w-full flex-1">
              <input
                type="range"
                min={0}
                max={data?.length ? data?.length - 1 : 0}
                className="range range-sm range-success w-full"
                aria-label="Frame range"
                onChange={(e) => setFrame(Number(e.target.value))}
                value={frame}
                style={{ zIndex: 1 }}
              />
              <div
                className="absolute -top-6 left-1/2 text-xs font-bold select-none pointer-events-none"
                style={{
                  transform: 'translateX(-50%)',
                }}
              >
                Frame: <span className="text-success">{frame + 1}</span>
              </div>
            </div>
            <div className="tooltip" data-tip="Next frame">
              <button
                onClick={() => setFrame((f) => Math.min(data.length - 1, f + 1))}
                aria-label="Previous Frame"
                className="btn btn-ghost btn-sm ml-1"
              >
                ⏩︎
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center w-1/2">
            <div className="w-50 flex flex-col items-center">
              <div className="tooltip" data-tip="Rotate up">
                <button
                  onClick={() => rotate("x", -ROTATE_STEP)}
                  aria-label="Rotate Up"
                  className="btn btn-circle mb-1"
                >
                  ↑
                </button>
              </div>
              <div className="flex flex-row justify-between w-37 mt-1 mb-1 items-center">
                <div className="tooltip" data-tip="Rotate left">
                  <button
                    onClick={() => rotate("y", -ROTATE_STEP)}
                    aria-label="Rotate Left"
                    className="btn btn-circle"
                  >
                    ←
                  </button>
                </div>
                <div className="tooltip" data-tip="Reset rotation">
                  <button
                    onClick={() => setRotation(ROTATION)}
                    aria-label="Reset Rotation"
                    className="btn btn-ghost btn-error btn-circle mx-2"
                  >
                    ⟳
                  </button>
                </div>
                <div className="tooltip" data-tip="Rotate right">
                  <button
                    onClick={() => rotate("y", ROTATE_STEP)}
                    aria-label="Rotate Right"
                    className="btn btn-circle"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="tooltip" data-tip="Rotate down">
                <button
                  onClick={() => rotate("x", ROTATE_STEP)}
                  aria-label="Rotate Down"
                  className="btn btn-circle mt-1"
                >
                  ↓
                </button>
              </div>
              <div className="flex flex-row items-center mt-4">
                <div className="tooltip" data-tip="Decrease depth scale">
                  <button
                    className="btn btn-xs mr-2"
                    onClick={() => setDepthScale((s) => Math.max(0, s - SCALE_STEP))}
                    aria-label="Decrease Z Scale"
                  >
                    -
                  </button>
                </div>
                <div className="text-xs font-mono select-none">
                  Depth: {!!depthScale ? `${(depthScale * 100).toFixed(0)}%` : 'flat'}
                </div>
                <div className="tooltip" data-tip="Increase depth scale">
                  <button
                    className="btn btn-xs ml-2"
                    onClick={() => setDepthScale((s) => Math.min(1, s + SCALE_STEP))}
                    aria-label="Increase Z Scale"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
        {isAlertOpen && (<div role="alert" className="alert alert-info alert-outline justify-between mt-2">
          <div className="flex-1 text-black">Tip: Use your keyboard arrow keys to rotate the shape. Press + or - to increase or decrease the depth scale.</div>
          <div className="tooltip" data-tip="Hide tip">
            <button
              className="btn btn-xs btn-ghost ml-2 flex-shrink-0"
              onClick={() => setIsAlertOpen(false)}
              aria-label="Close Alert"
            >
              OK
            </button>
          </div>
        </div>)}
      </ div>
    </div>
  );
}
