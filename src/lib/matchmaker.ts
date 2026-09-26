import { FrontOffice, Role } from '../types';

/**
 * Dynamic Matchmaking Algorithm
 * 
 * Generates 1:1 pairings (and one triplet if odd count) based on:
 * 1. LB ↔ Member from different Front Office (highest priority)
 * 2. LB ↔ Member from same Front Office
 * 3. Same role, different Front Office
 * 4. Same role, same Front Office (last resort)
 * 5. Avoids repeat pairings from previous rounds (via metUsers)
 */

export interface MatchUser {
  id: string;
  name: string;
  frontOffice: FrontOffice;
  role: Role;
  metUsers: string[];
}

/**
 * Compute a compatibility score between two users.
 * Higher score = better match.
 */
function getCompatibilityScore(a: MatchUser, b: MatchUser): number {
  const differentFO = a.frontOffice !== b.frontOffice;
  const differentRole = a.role !== b.role; // LB vs Member
  const notMet = !a.metUsers.includes(b.id) && !b.metUsers.includes(a.id);

  let score = 0;

  // Massive bonus for not having met before
  if (notMet) score += 1000;

  // Priority tiers for role/FO combination
  if (differentRole && differentFO) {
    score += 40; // Best: LB ↔ Member, different FO
  } else if (differentRole && !differentFO) {
    score += 30; // Good: LB ↔ Member, same FO
  } else if (!differentRole && differentFO) {
    score += 20; // OK: same role, different FO
  } else {
    score += 10; // Last resort: same role, same FO
  }

  // Small random jitter (0–4) to shuffle within same tier
  score += Math.floor(Math.random() * 5);

  return score;
}

/**
 * Generates optimal pairings for a set of users.
 * 
 * @param users - Array of users to match
 * @returns Array of pairs (each pair is an array of user IDs, length 2 or 3 for triplet)
 */
export function generateMatches(users: MatchUser[]): { pairs: string[][] } {
  if (users.length < 2) return { pairs: [] };

  const isOdd = users.length % 2 === 1;

  // Generate all possible pairs with scores
  const candidates: { a: string; b: string; score: number }[] = [];

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      candidates.push({
        a: users[i].id,
        b: users[j].id,
        score: getCompatibilityScore(users[i], users[j]),
      });
    }
  }

  // Sort by score descending (best matches first)
  candidates.sort((x, y) => y.score - x.score);

  // Greedy matching: pick the best available pair
  const matched = new Set<string>();
  const pairs: string[][] = [];

  for (const candidate of candidates) {
    if (matched.has(candidate.a) || matched.has(candidate.b)) continue;
    pairs.push([candidate.a, candidate.b]);
    matched.add(candidate.a);
    matched.add(candidate.b);

    // Early exit if everyone is matched
    if (matched.size >= users.length - (isOdd ? 1 : 0)) break;
  }

  // Handle odd count: merge unmatched user into the best existing pair
  if (isOdd) {
    const unmatchedUser = users.find(u => !matched.has(u.id));
    if (unmatchedUser && pairs.length > 0) {
      // Find the pair where adding this user creates the best triplet
      let bestPairIdx = 0;
      let bestScore = -Infinity;

      const userMap = new Map(users.map(u => [u.id, u]));

      for (let i = 0; i < pairs.length; i++) {
        let totalScore = 0;
        for (const partnerId of pairs[i]) {
          const partner = userMap.get(partnerId);
          if (partner) {
            totalScore += getCompatibilityScore(unmatchedUser, partner);
          }
        }
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestPairIdx = i;
        }
      }

      // Convert pair to triplet
      pairs[bestPairIdx].push(unmatchedUser.id);
    }
  }

  return { pairs };
}
