import { create } from 'zustand';

export interface RootState {
  appReady: boolean;
  setAppReady: (ready: boolean) => void;
}

export const useRootStore = create<RootState>((set) => ({
  appReady: false,
  setAppReady: (ready) => set({ appReady: ready }),
}));

export default useRootStore;


