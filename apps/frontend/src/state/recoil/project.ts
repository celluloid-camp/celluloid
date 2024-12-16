import { atom, useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";

import type { PeerTubeVideoDataResult } from "~services/peertube";

export type ProjectFormInput = {
  title: string;
  description: string;
  keywords: string[];
  public: boolean;
  collaborative: boolean;
  videoInfo: PeerTubeVideoDataResult | undefined;
  shared: boolean;
};

export const projectInputInitialValueAtom = atom<ProjectFormInput>({
  key: "ProjectFormInput",
  default: {
    title: "",
    description: "",
    keywords: [],
    public: false,
    collaborative: false,
    shared: false,
    videoInfo: undefined,
  },
});


export const useProjectInputIntialState = () => useRecoilState(
  projectInputInitialValueAtom
);

export const userResetProjectInputIntialState = () => useResetRecoilState(projectInputInitialValueAtom);


export const useProjectInputIntialValue = () => useRecoilValue(projectInputInitialValueAtom);
