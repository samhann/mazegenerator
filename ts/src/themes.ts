export interface MazeTheme {
  name: string;
  wallColor: string;
  backgroundColor: string;
  solutionColor: string;
  /** Optional: color walls flash when breaking during animation */
  breakColor: string;
}

export const THEMES: Record<string, MazeTheme> = {
  classic: {
    name: 'Classic',
    wallColor: '#1a1a2e',
    backgroundColor: '#ffffff',
    solutionColor: '#e94560',
    breakColor: '#e94560',
  },
  blueprint: {
    name: 'Blueprint',
    wallColor: '#e8e8ff',
    backgroundColor: '#1e3a5f',
    solutionColor: '#ffdd57',
    breakColor: '#ff6b6b',
  },
  neon: {
    name: 'Neon',
    wallColor: '#39ff14',
    backgroundColor: '#0a0a0a',
    solutionColor: '#ff00ff',
    breakColor: '#00ffff',
  },
  dungeon: {
    name: 'Dungeon',
    wallColor: '#8b7355',
    backgroundColor: '#2c1e0f',
    solutionColor: '#ffd700',
    breakColor: '#ff4500',
  },
  ice: {
    name: 'Ice',
    wallColor: '#4a90d9',
    backgroundColor: '#e8f4fd',
    solutionColor: '#ff6b6b',
    breakColor: '#00bcd4',
  },
  retro: {
    name: 'Retro',
    wallColor: '#33ff33',
    backgroundColor: '#000000',
    solutionColor: '#ff3333',
    breakColor: '#ffff33',
  },
  parchment: {
    name: 'Parchment',
    wallColor: '#5c4033',
    backgroundColor: '#f5e6c8',
    solutionColor: '#8b0000',
    breakColor: '#cc6600',
  },
  midnight: {
    name: 'Midnight',
    wallColor: '#7c3aed',
    backgroundColor: '#0f0f23',
    solutionColor: '#f472b6',
    breakColor: '#38bdf8',
  },
};

export function getTheme(name: string): MazeTheme {
  return THEMES[name] || THEMES.classic;
}
