import { useMemo } from "react";
import { FRAME_COUNT, GRID_HEIGHT, GRID_WIDTH, PRESSURE_CENTERS, MAX_PRESSURE } from "./grid";

export function useGenerateMockPressureData() {
  const frames = useMemo(() => {
    const arr = new Array(FRAME_COUNT).fill(0);

    return arr.map((id) => {
      const data = [];

      // Generate radius variation for each frame
      const radiusVariations = PRESSURE_CENTERS.map((center) => ({
        ...center,
        currentRadius: center.maxRadius * (0.8 + Math.random() * 0.4), // 80-120% of maxRadius
      }));

      // Generate pressure values for each cell
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          let totalPressure = 0;

          // Calculate combined pressure from all centers
          radiusVariations.forEach((center) => {
            const dx = x - center.x;
            const dy = y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only apply pressure if within the current radius
            if (distance <= center.currentRadius) {
              // Calculate normalized distance (0 at center, 1 at radius)
              const normalizedDist = distance / center.currentRadius;

              // Apply falloff curve - higher falloff means pressure drops more quickly
              // Using a power function where the falloff controls the curve
              const pressureFactor = Math.pow(
                1 - normalizedDist,
                1 / center.falloff
              );

              // Add this center's contribution to total pressure
              totalPressure += center.maxIntensity * pressureFactor;
            }
          });

          // Cap at max pressure and add to data
          totalPressure = Math.min(MAX_PRESSURE, totalPressure);
          data.push({ x, y, z: totalPressure });
        }
      }

      return { id, data };
    });
  }, []);

  return frames;
}
