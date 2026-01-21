// Utility Functions
export const randomRange = (min: number, max: number): number => 
  Math.random() * (max - min) + min;

export const randomChoice = <T,>(arr: T[]): T => 
  arr[Math.floor(Math.random() * arr.length)];
