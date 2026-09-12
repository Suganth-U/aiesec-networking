import { Group } from '../types';

export const GROUPS: Group[] = [
  { id: 1, name: "iGT - LB", color: "Blue" },
  { id: 2, name: "iGT - Member", color: "Green" },
  { id: 3, name: "iGV - LB", color: "Purple" },
  { id: 4, name: "iGV - Member", color: "Yellow" },
  { id: 5, name: "oGT - LB", color: "Red" },
  { id: 6, name: "oGT - Member", color: "Orange" },
  { id: 7, name: "oGV - LB", color: "Black" },
  { id: 8, name: "oGV - Member", color: "White" },
];

// 7-round deterministic round-robin tournament for 8 teams.
// Ensures no two teams meet twice, and everyone meets exactly one group per round.
export const MATCHMAKING_MATRIX = [
  // Round 1
  [[1, 8], [2, 7], [3, 6], [4, 5]],
  // Round 2
  [[1, 7], [8, 6], [2, 5], [3, 4]],
  // Round 3
  [[1, 6], [7, 5], [8, 4], [2, 3]],
  // Round 4
  [[1, 5], [6, 4], [7, 3], [8, 2]],
  // Round 5
  [[1, 4], [5, 3], [6, 2], [7, 8]],
  // Round 6
  [[1, 3], [4, 2], [5, 8], [6, 7]],
  // Round 7
  [[1, 2], [3, 8], [4, 7], [5, 6]],
];

/**
 * Gets the target group ID for a specific group in a specific round.
 * @param myGroupId The ID of the current group (1-8).
 * @param roundIndex The 0-indexed round number (0-6).
 * @returns The ID of the group to meet, or null if invalid round/group.
 */
export const getTargetGroupForRound = (myGroupId: number, roundIndex: number): number | null => {
  if (roundIndex < 0 || roundIndex >= MATCHMAKING_MATRIX.length) return null;
  const pairings = MATCHMAKING_MATRIX[roundIndex];
  
  for (const pair of pairings) {
    if (pair[0] === myGroupId) return pair[1];
    if (pair[1] === myGroupId) return pair[0];
  }
  
  return null;
};

/**
 * Resolves a group ID to its Group object.
 */
export const getGroupById = (groupId: number): Group | undefined => {
  return GROUPS.find((g) => g.id === groupId);
};
