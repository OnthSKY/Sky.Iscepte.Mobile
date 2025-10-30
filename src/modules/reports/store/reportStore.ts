import { create } from 'zustand';

export interface Report { id: string; title: string }

interface ReportState {
  items: Report[];
  setItems: (items: Report[]) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useReportStore;


