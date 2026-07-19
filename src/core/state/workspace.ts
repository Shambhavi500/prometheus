'use client';

/**
 * Workspace/UI state — transient layout & interaction state (Zustand).
 * Server state lives in TanStack Query; graph/streaming state stays local
 * to its components (05_FRONTEND §6).
 */

import { create } from 'zustand';

export interface ToastItem {
  id: number;
  text: string;
  kind: 'info' | 'error';
}

interface WorkspaceState {
  selectedDecisionId: string | null;
  drawerEntityId: string | null;
  drawerReturnFocus: HTMLElement | null;
  decisionDrawerId: string | null;
  paletteOpen: boolean;
  alertAcknowledged: boolean;
  recentEntityIds: string[];
  toasts: ToastItem[];
  splitRatio: number;
  selectDecision: (id: string | null) => void;
  openDrawer: (entityId: string, returnFocus?: HTMLElement | null) => void;
  closeDrawer: () => void;
  openDecisionDrawer: (decisionId: string) => void;
  closeDecisionDrawer: () => void;
  setPaletteOpen: (open: boolean) => void;
  acknowledgeAlert: () => void;
  pushToast: (text: string, kind?: 'info' | 'error') => void;
  dismissToast: (id: number) => void;
  setSplitRatio: (r: number) => void;
  projectInitialized: boolean;
  setProjectInitialized: (initialized: boolean) => void;
}

let toastSeq = 0;

export const useWorkspace = create<WorkspaceState>((set) => ({
  selectedDecisionId: null,
  drawerEntityId: null,
  drawerReturnFocus: null,
  decisionDrawerId: null,
  paletteOpen: false,
  alertAcknowledged: false,
  recentEntityIds: [],
  toasts: [],
  splitRatio: 0.44,
  selectDecision: (id) => set({ selectedDecisionId: id }),
  openDrawer: (entityId, returnFocus = null) =>
    set((s) => ({
      drawerEntityId: entityId,
      drawerReturnFocus: returnFocus,
      recentEntityIds: [entityId, ...s.recentEntityIds.filter((x) => x !== entityId)].slice(0, 6),
    })),
  closeDrawer: () =>
    set((s) => {
      s.drawerReturnFocus?.focus();
      return { drawerEntityId: null, drawerReturnFocus: null };
    }),
  openDecisionDrawer: (id) => set({ decisionDrawerId: id }),
  closeDecisionDrawer: () => set({ decisionDrawerId: null }),
  setPaletteOpen: (open) => set({ paletteOpen: open }),
  acknowledgeAlert: () => set({ alertAcknowledged: true }),
  pushToast: (text, kind = 'info') =>
    set((s) => {
      const id = ++toastSeq;
      setTimeout(() => useWorkspace.getState().dismissToast(id), 4000);
      return { toasts: [...s.toasts, { id, text, kind }] };
    }),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setSplitRatio: (r) => set({ splitRatio: Math.min(0.75, Math.max(0.25, r)) }),
  projectInitialized: false,
  setProjectInitialized: (initialized) => set({ projectInitialized: initialized }),
}));
