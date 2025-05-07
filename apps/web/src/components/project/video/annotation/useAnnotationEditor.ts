import type { AnnotationByProjectId } from "@/lib/trpc/types";
import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

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
  formVisible: boolean;
  editedAnnotation?: AnnotationByProjectId;
  // Actions
  setContextualPosition: (position: ContextualPosition | undefined) => void;
  setHintsVisible: (visible: boolean) => void;
  setContextualEditorVisible: (visible: boolean) => void;
  setFormVisible: (visible: boolean) => void;
  setEditedAnnotation: (annotation: AnnotationByProjectId | undefined) => void;
};
const annotationEditorStore = create<AnnotationEditorState>()((set) => ({
  showHints: false,
  playerIsReady: false,
  contextualEditorVisible: false,
  formVisible: false,
  editedAnnotation: undefined,
  contextualPosition: undefined,

  setContextualPosition: (position) =>
    set((state) => ({ ...state, contextualPosition: position })),

  setHintsVisible: (visible) =>
    set((state) => ({
      ...state,
      showHints: visible,
      editedAnnotation: undefined,
      contextualPosition: undefined,
      contextualEditorVisible: false,
      formVisible: false,
    })),

  setContextualEditorVisible: (visible) =>
    set((state) => ({
      ...state,
      contextualEditorVisible: visible,
      showHints: false,
      contextualPosition: visible ? state.contextualPosition : undefined,
    })),

  setFormVisible: (visible) =>
    set((state) => ({
      ...state,
      formVisible: visible,
      editedAnnotation: undefined,
      contextualPosition: undefined,
      contextualEditorVisible: false,
      showHints: false,
    })),

  setEditedAnnotation: (annotation) =>
    set((state) => ({
      ...state,
      editedAnnotation: annotation,
      contextualPosition: undefined,
      showHints: false,
      contextualEditorVisible:
        annotation !== undefined &&
        Object.keys(annotation?.extra || {}).length > 0,
      formVisible: annotation !== undefined,
    })),
}));

// Helper hooks for specific state values
export const useContextualEditorVisible = () =>
  annotationEditorStore((state) => state.contextualEditorVisible);

export const useContextualEditorVisibleState = () => {
  const visible = annotationEditorStore(
    (state) => state.contextualEditorVisible,
  );
  const setVisible = annotationEditorStore(
    (state) => state.setContextualEditorVisible,
  );
  return [visible, setVisible] as const;
};

export const useContextualEditorPosition = () => {
  const position = annotationEditorStore((state) => state.contextualPosition);
  const setPosition = annotationEditorStore(
    (state) => state.setContextualPosition,
  );
  return [position, setPosition] as const;
};

export const useAnnotationHintsVisible = () => {
  const visible = annotationEditorStore((state) => state.showHints);
  const setVisible = annotationEditorStore((state) => state.setHintsVisible);
  return [visible, setVisible] as const;
};

export const useAnnotationFormVisible = () => {
  const visible = annotationEditorStore((state) => state.formVisible);
  const setVisible = annotationEditorStore((state) => state.setFormVisible);
  return [visible, setVisible] as const;
};

export const useEditAnnotation = () => {
  const annotation = annotationEditorStore((state) => state.editedAnnotation);
  const setAnnotation = annotationEditorStore(
    (state) => state.setEditedAnnotation,
  );
  return [annotation, setAnnotation] as const;
};

export const useEditAnnotationValue = () =>
  annotationEditorStore((state) => state.editedAnnotation);

export const useAnnotationEditorState = () =>
  useStoreWithEqualityFn(
    annotationEditorStore,
    (state) => ({
      showHints: state.showHints,
      playerIsReady: state.playerIsReady,
      contextualEditorVisible: state.contextualEditorVisible,
      formVisible: state.formVisible,
      editedAnnotation: state.editedAnnotation,
    }),
    shallow,
  );
