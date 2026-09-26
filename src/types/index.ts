export type FrontOffice = 'iGT' | 'iGV' | 'oGT' | 'oGV';
export type Role = 'LB' | 'Member';
export type UserStatus = 'waiting' | 'networking' | 'finished_round';
export type SessionStatus = 'waiting' | 'active' | 'finished';

export interface PartnerInfo {
  uid: string;
  name: string;
  frontOffice: FrontOffice;
  role: Role;
}

export interface User {
  id: string; // Firebase Auth UID
  name: string;
  frontOffice: FrontOffice;
  role: Role;
  color: string; // Mapped from role/office
  status: UserStatus;
  metUsers: string[]; // Array of UIDs they successfully met
  partners?: PartnerInfo[]; // Current round partner(s) — 1 normally, 2 for triplet
}

export interface MatchPair {
  users: string[];  // UIDs [uid1, uid2] or [uid1, uid2, uid3]
  names: string[];  // Display names
}

export interface Session {
  status: SessionStatus | 'ended';
  currentRound: number; // 0-indexed
  totalRounds?: number; // Configurable number of rounds (default 4)
  timeRemaining: number; // seconds
  questions: string[]; // Discussion prompts for the current round
  isPaused?: boolean;
  broadcastMessage?: {
    text: string;
    id: string; // Unique ID to trigger re-renders/animations
  };
  currentMatches?: MatchPair[]; // Generated pairings for the current round
}

export type Group = {
  id: number;
  name: string;
  color: string;
};
