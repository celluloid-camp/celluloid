import { create } from 'zustand';
import type { PeerTubeVideoDataResult } from "@/services/peertube";

export type ProjectFormInput = {
  title: string;
  description: string;
  keywords: string[];
  public: boolean;
  collaborative: boolean;
  videoInfo: PeerTubeVideoDataResult | undefined;
  shared: boolean;
};

const initialState: ProjectFormInput = {
  title: "",
  description: "",
  keywords: [],
  public: false,
  collaborative: false,
  shared: false,
  videoInfo: undefined,
};

type ProjectStore = ProjectFormInput & {
  setState: (state: Partial<ProjectFormInput>) => void;
  reset: () => void;
};

const useProjectStore = create<ProjectStore>((set) => ({
  ...initialState,
  setState: (newState) => set((state) => ({ ...state, ...newState })),
  reset: () => set(initialState),
}));

// Hook aliases for backward compatibility
export const useProjectInputIntialState = () => {
  const store = useProjectStore();
  return [store, store.setState] as [ProjectFormInput, (state: Partial<ProjectFormInput>) => void];
};

export const userResetProjectInputIntialState = () => {
  useProjectStore.getState().reset();
};

export const useProjectInputIntialValue = () => useProjectStore();
