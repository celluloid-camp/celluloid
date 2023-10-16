import { atom, DefaultValue, selector, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

type ContextualPosition =
  { relativeX: number, relativeY: number, x: number, y: number, parentWidth: number, parentHeight: number }


type AnnotationEditorState = {
  showHints: boolean;
  playerIsReady: boolean;
  contextualEditorVisible: boolean;
  contextualPosition?: ContextualPosition;
  formVisible: boolean;
}
const annotationEditorState = atom<AnnotationEditorState>({
  key: 'contextualEditorState', // unique ID (with respect to other atoms/selectors)
  default: {
    showHints: false,
    playerIsReady: false,
    contextualEditorVisible: false,
    formVisible: false
  }, // default value (aka initial value)
});



const contextualEditorPosition = selector({
  key: 'contextualPosition', // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(annotationEditorState);
    return state.contextualPosition ? state.contextualPosition : undefined;
  },

  set: ({ set }, newValue) => set(annotationEditorState, (previousState) => {
    return { ...previousState, contextualPosition: newValue as ContextualPosition }
  }),
  cachePolicy_UNSTABLE: {
    eviction: 'most-recent',
  },
});


const annotationHintsVisible = selector({
  key: 'showHints', // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(annotationEditorState);
    return state.showHints;
  },
  set: ({ set }, newValue) => set(annotationEditorState, (previousState) => {
    return { ...previousState, contextualPosition: undefined, contextualEditorVisible: false, formVisible: false, showHints: newValue as boolean }
  })
});


const contextualEditorVisible = selector({
  key: 'contextualEditorVisible', // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(annotationEditorState);
    return state.contextualEditorVisible;
  },
  set: ({ set }, newValue) => set(annotationEditorState, (previousState) => {
    return { ...previousState, showHints: false, contextualEditorVisible: newValue as boolean }
  })
});




const annotationFormVisible = selector({
  key: 'annotationFormVisible', // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const state = get(annotationEditorState);
    return state.formVisible;
  },
  set: ({ set }, newValue) => set(annotationEditorState, (previousState) => {
    return { ...previousState, contextualPosition: undefined, contextualEditorVisible: false, showHints: false, formVisible: newValue as boolean }
  })
});





export const useContextualEditorVisible = () => useRecoilValue(contextualEditorVisible);
export const useContextualEditorVisibleState = () => useRecoilState(contextualEditorVisible);

export const useContextualEditorPosition = () => useRecoilState(contextualEditorPosition);



export const useAnnotationHintsVisible = () => useRecoilState(annotationHintsVisible);

export const useSetAnnotationEditorState = () => useSetRecoilState(annotationEditorState);
export const useAnnotationEditorState = () => useRecoilValue(annotationEditorState);


export const useAnnotationFormVisible = () => useRecoilState(annotationFormVisible);
