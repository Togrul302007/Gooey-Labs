export interface FilterParams {
  blur: number;       // stdDeviation for feGaussianBlur
  multiplier: number; // feColorMatrix alpha multiplier
  offset: number;     // feColorMatrix alpha offset (usually negative)
}

export type PlaygroundMode = 'blobs' | 'particles' | 'text' | 'visualizer';

export interface BlobData {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isDragging?: boolean;
}

export interface ParticleData {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;     // Current life remaining (0 to 1)
  maxLife: number;  // Initial lifespan in frames
}

export interface ColorPreset {
  id: string;
  name: string;
  colors: string[];
  theme: 'dark' | 'light';
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    colors: ['#ff007f', '#7b2cbf', '#3a0ca3', '#4361ee', '#4cc9f0'],
    theme: 'dark',
  },
  {
    id: 'lava',
    name: 'Molten Magma',
    colors: ['#ffb703', '#fb8500', '#ff0054', '#9e0059', '#3f0071'],
    theme: 'dark',
  },
  {
    id: 'toxic',
    name: 'Bio-hazard Green',
    colors: ['#38b000', '#70e000', '#9ef01a', '#ccff33', '#007200'],
    theme: 'dark',
  },
  {
    id: 'ocean',
    name: 'Abyssal Deep',
    colors: ['#0077b6', '#0096c7', '#03045e', '#00b4d8', '#90e0ef'],
    theme: 'dark',
  },
  {
    id: 'sunset',
    name: 'Warm Horizon',
    colors: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'],
    theme: 'light',
  }
];
