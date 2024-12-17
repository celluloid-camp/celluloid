import {
  atom,
  DefaultValue,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";

import type { AnnotationByProjectId } from "~utils/trpc";

type ContextualPosition = {
  relativeX: number;
  relativeY: number;
  x: number;
  y: number;
  parentWidth: number;
  parentHeight: number;
};

type AnnotationEditorState = {
  showHints: boolean;
  playerIsReady: boolean;
  contextualEditorVisible: boolean;
  contextualPosition?: ContextualPosition;
  emotion?: string;
  formVisible: boolean;
  editedAnnotation?: AnnotationByProjectId;
};
const annotationEditorState = atom<AnnotationEditorState>({
  key: "contextualEditorState", // unique ID (with respect to other atoms/selectors)
  default: {
    showHints: false,
    playerIsReady: false,
    contextualEditorVisible: false,
    formVisible: false,
    editedAnnotation: undefined,
  }, // default value (aka initial value)
});

const contextualEditorPosition = selector({
  key: "contextualPosition", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(annotationEditorState);
    return state.contextualPosition ? state.contextualPosition : undefined;
  },

  set: ({ set }, newValue) =>
    set(annotationEditorState, (previousState) => {
      return {
        ...previousState,
        contextualPosition: newValue as ContextualPosition,
      };
    }),
  cachePolicy_UNSTABLE: {
    eviction: "most-recent",
  },
});

const annotationHintsVisible = selector({
  key: "showHints", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(annotationEditorState);
    return state.showHints;
  },
  set: ({ set }, newValue) =>
    set(annotationEditorState, (previousState) => {
      return {
        ...previousState,
        editedAnnotation: undefined,
        contextualPosition: undefined,
        contextualEditorVisible: false,
        formVisible: false,
        showHints: newValue as boolean,
      };
    }),
});

const contextualEditorVisible = selector({
  key: "contextualEditorVisible", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(annotationEditorState);
    return state.contextualEditorVisible;
  },
  set: ({ set }, newValue) =>
    set(annotationEditorState, (previousState) => {
      return {
        ...previousState,
        showHints: false,
        contextualEditorVisible: newValue as boolean,
        contextualPosition: null,
      };
    }),
});

const annotationFormVisible = selector({
  key: "annotationFormVisible", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(annotationEditorState);
    return state.formVisible;
  },
  set: ({ set }, newValue) =>
    set(annotationEditorState, (previousState) => {
      return {
        ...previousState,
        editedAnnotation: undefined,
        contextualPosition: undefined,
        contextualEditorVisible: false,
        showHints: false,
        formVisible: newValue as boolean,
      };
    }),
});

const editedAnnotation = selector({
  key: "editedAnnotation", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(annotationEditorState);
    return state.editedAnnotation;
  },
  set: ({ set }, newValue) =>
    set(annotationEditorState, (previousState) => {
      return {
        ...previousState,
        editedAnnotation: newValue as AnnotationByProjectId,
        contextualPosition: undefined,
        showHints: false,
        contextualEditorVisible:
          newValue !== undefined &&
          Object.keys((newValue as AnnotationByProjectId).extra || {}).length >
          0,
        formVisible: newValue !== undefined,
      };
    }),
});

const emotionEditor = selector({
  key: "emotionEditor", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(annotationEditorState);
    return state.emotion ? state.emotion : undefined;
  },

  set: ({ set }, newValue) =>
    set(annotationEditorState, (previousState) => {
      return {
        ...previousState,
        emotion: newValue as string,
      };
    }),
  cachePolicy_UNSTABLE: {
    eviction: "most-recent",
  },
});


export const useContextualEditorVisible = () =>
  useRecoilValue(contextualEditorVisible);
export const useContextualEditorVisibleState = () =>
  useRecoilState(contextualEditorVisible);

export const useContextualEditorPosition = () =>
  useRecoilState(contextualEditorPosition);

export const useEmotionEditor = () => useRecoilState(emotionEditor);

export const useAnnotationHintsVisible = () =>
  useRecoilState(annotationHintsVisible);

export const useSetAnnotationEditorState = () =>
  useSetRecoilState(annotationEditorState);
export const useAnnotationEditorState = () =>
  useRecoilValue(annotationEditorState);

export const useAnnotationFormVisible = () =>
  useRecoilState(annotationFormVisible);

export const useEditAnnotation = () => useRecoilState(editedAnnotation);
export const useEditAnnotationValue = () => useRecoilValue(editedAnnotation);
