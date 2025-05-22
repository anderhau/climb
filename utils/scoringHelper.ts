
import { ClimbLog } from '../types';
import { TRIES_BONUS_MULTIPLIERS } from '../constants';

export const calculateClimbScore = (basePoints: number, tries: number): number => {
  const multiplier = TRIES_BONUS_MULTIPLIERS[tries] || 1.0; // Default to 1.0 (no bonus) for 4+ tries
  return Math.round(basePoints * multiplier);
};

export const calculateTotalUserScore = (userId: string, allClimbs: ClimbLog[]): number => {
  return allClimbs
    .filter(climb => climb.userId === userId)
    .reduce((total, climb) => total + climb.score, 0);
};
