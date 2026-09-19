export type FrontOffice = 'iGT' | 'iGV' | 'oGT' | 'oGV';
export type Role = 'LB' | 'Member';
export type UserStatus = 'waiting' | 'networking' | 'finished_round';
export type SessionStatus = 'waiting' | 'active' | 'finished';

export interface User {
  id: string; // Firebase Auth UID
  name: string;
  frontOffice: FrontOffice;
  role: Role;
  color: string; // Mapped from role/office
  status: UserStatus;
  metUsers: string[]; // Array of UIDs they successfully met
}

export interface Session {
  status: SessionStatus | 'ended';
  currentRound: number; // 0-3
  totalRounds?: number; // Configurable number of rounds
  timeRemaining: number; // seconds
  questions: string[]; // Discussion prompts for the current round
  isPaused?: boolean;
  broadcastMessage?: {
    text: string;
    id: string; // Unique ID to trigger re-renders/animations
  };
}

export type Group = {
  id: number;
  name: string;
  color: string;
};
