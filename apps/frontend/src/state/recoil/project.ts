import { atom, useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";

import { PeerTubeVideoDataResult } from "~services/peertube";

export type ProjectFormInput = {
  title: string;
  description: string;
  keywords: string[];
  public: boolean;
  collaborative: boolean;
  videoInfo: PeerTubeVideoDataResult | undefined;
};

export const projectInputInitialValueAtom = atom<ProjectFormInput>({
  key: `ProjectFormInput`,
  default: {
    title: "",
    description: "",
    keywords: [],
    public: false,
    collaborative: false,
    videoInfo: undefined,
  },
});


export const useProjectInputIntialState = () => useRecoilState(
  projectInputInitialValueAtom
);

export const userResetProjectInputIntialState = () => useResetRecoilState(projectInputInitialValueAtom);


export const useProjectInputIntialValue = () => useRecoilValue(projectInputInitialValueAtom);
