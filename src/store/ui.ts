import { create } from 'zustand';
import type { RoleId } from '@/app/roles';

interface UiState {
  role: RoleId;
  setRole: (role: RoleId) => void;
}

// Presentation state only (current persona). Scripted demo state lives in the demo store (milestone 6).
export const useUi = create<UiState>((set) => ({
  role: 'director',
  setRole: (role) => set({ role }),
}));
