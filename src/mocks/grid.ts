export const FRAME_COUNT = 100;
export const GRID_WIDTH = 256;
export const GRID_HEIGHT = 512;
export const PRESSURE_CENTERS = [
  {
    x: GRID_WIDTH * 0.5,
    y: GRID_HEIGHT * 0.1,
    maxIntensity: 600,
    maxRadius: 40,
    falloff: 0.3,
  }, // head
  {
    x: GRID_WIDTH * 0.3,
    y: GRID_HEIGHT * 0.4,
    maxIntensity: 800,
    maxRadius: 60,
    falloff: 0.8,
  }, // left shoulder
  {
    x: GRID_WIDTH * 0.7,
    y: GRID_HEIGHT * 0.4,
    maxIntensity: 800,
    maxRadius: 60,
    falloff: 0.8,
  }, // right shoulder
  {
    x: GRID_WIDTH * 0.5,
    y: GRID_HEIGHT * 0.6,
    maxIntensity: 1000,
    maxRadius: 100,
    falloff: 1.0,
  }, // hips
  {
    x: GRID_WIDTH * 0.4,
    y: GRID_HEIGHT * 0.7,
    maxIntensity: 500,
    maxRadius: 80,
    falloff: 0.6,
  }, // left thigh
  {
    x: GRID_WIDTH * 0.6,
    y: GRID_HEIGHT * 0.7,
    maxIntensity: 500,
    maxRadius: 80,
    falloff: 0.6,
  }, // right thigh
  {
    x: GRID_WIDTH * 0.4,
    y: GRID_HEIGHT * 0.9,
    maxIntensity: 300,
    maxRadius: 50,
    falloff: 0.2,
  }, // left calf
  {
    x: GRID_WIDTH * 0.6,
    y: GRID_HEIGHT * 0.9,
    maxIntensity: 300,
    maxRadius: 50,
    falloff: 0.2,
  }, // right calf
];

export const MAX_PRESSURE = 1000;
