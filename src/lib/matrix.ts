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

// 3-round bipartite matching for 8 teams (4 LBs, 4 Members).
// Rules:
// 1. LB (1,3,5,7) must ONLY match with Member (2,4,6,8).
// 2. Cannot match same Front Office.
export const MATCHMAKING_MATRIX = [
  // Round 1: Shift 1 (1->4, 3->6, 5->8, 7->2)
  [[1, 4], [3, 6], [5, 8], [7, 2]],
  // Round 2: Shift 2 (1->6, 3->8, 5->2, 7->4)
  [[1, 6], [3, 8], [5, 2], [7, 4]],
  // Round 3: Shift 3 (1->8, 3->2, 5->4, 7->6)
  [[1, 8], [3, 2], [5, 4], [7, 6]],
  // Round 4: Shift 0 (1->2, 3->4, 5->6, 7->8) (Matching same FO)
  [[1, 2], [3, 4], [5, 6], [7, 8]],
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
