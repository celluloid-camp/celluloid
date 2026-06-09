"use client";

import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import { useEffect } from "react";

function shouldIgnoreKeyboardShortcut(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  if (tag === "BUTTON" || tag === "A") {
    return true;
  }
  return Boolean(
    target.closest(
      '[role="button"], [role="link"], [role="menuitem"], [role="option"], [role="textbox"]',
    ),
  );
}

export function useMediaKeyboardShortcuts() {
  const dispatch = useMediaDispatch();
  const mediaPaused = useMediaSelector(
    (state) => typeof state.mediaPaused !== "boolean" || state.mediaPaused,
  );
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyboardShortcut(event.target)) {
        return;
      }

      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        dispatch({
          type: mediaPaused
            ? MediaActionTypes.MEDIA_PLAY_REQUEST
            : MediaActionTypes.MEDIA_PAUSE_REQUEST,
        });
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        dispatch({
          type: MediaActionTypes.MEDIA_SEEK_REQUEST,
          detail: mediaCurrentTime - 30,
        });
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        dispatch({
          type: MediaActionTypes.MEDIA_SEEK_REQUEST,
          detail: mediaCurrentTime + 30,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, mediaPaused, mediaCurrentTime]);
}
