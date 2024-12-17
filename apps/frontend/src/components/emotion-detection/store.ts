import { create } from 'zustand'

interface AutoDetectionState {
  isEnabled: boolean
  setIsEnabled: (enabled: boolean) => void
  autoDetection: boolean
  setAutoDetection: (autoDetection: boolean) => void
  detectedEmotion: string | null
  setDetectedEmotion: (detectedEmotion: string | null) => void
}

export const useAutoDetectionStore = create<AutoDetectionState>((set) => ({
  isEnabled: true,
  setIsEnabled: (enabled) => set({ isEnabled: enabled }),
  autoDetection: false,
  setAutoDetection: (autoDetection) => set({ autoDetection, detectedEmotion: null }),
  detectedEmotion: null,
  setDetectedEmotion: (detectedEmotion) => set({ detectedEmotion }),
}))


interface PlayerModeState {
  mode: "performance" | "analysis";
  setMode: (mode: "performance" | "analysis") => void;
}

export const usePlayerModeStore = create<PlayerModeState>((set) => ({
  mode: "analysis",
  setMode: (mode) => set({ mode }),
}))
