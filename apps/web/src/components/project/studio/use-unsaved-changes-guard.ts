"use client";

import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const confirmDialogProps = {
  title: "Unsaved changes",
  description: "You have unsaved changes. Leave this page without saving?",
  confirmationText: "Leave",
  cancellationText: "Stay",
  contentProps: {
    sx: {
      color: "white",
      backgroundColor: "background.dark",
    },
  },
  titleProps: {
    sx: {
      color: "white",
      backgroundColor: "background.dark",
    },
  },
  dialogActionsProps: {
    sx: {
      backgroundColor: "background.dark",
    },
  },
} as const;

function isInternalNavigationLink(anchor: HTMLAnchorElement) {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) {
    return false;
  }

  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) {
    return false;
  }

  return (
    url.pathname !== window.location.pathname ||
    url.search !== window.location.search ||
    url.hash !== window.location.hash
  );
}

export function useUnsavedChangesGuard(isDirty: boolean) {
  const confirm = useConfirm();
  const router = useRouter();
  const historyPushedRef = useRef(false);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) {
      historyPushedRef.current = false;
      return;
    }

    if (!historyPushedRef.current) {
      window.history.pushState(null, "", window.location.href);
      historyPushedRef.current = true;
    }

    const onPopState = () => {
      void confirm(confirmDialogProps)
        .then(() => {
          historyPushedRef.current = false;
          window.history.back();
        })
        .catch(() => {
          window.history.pushState(null, "", window.location.href);
        });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isDirty, confirm]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.closest('[role="dialog"], [role="presentation"]')) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor || !isInternalNavigationLink(anchor)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const url = new URL(anchor.href, window.location.href);
      const destination = `${url.pathname}${url.search}${url.hash}`;

      void confirm(confirmDialogProps)
        .then(() => {
          router.push(destination);
        })
        .catch(() => {
          // User chose to stay on the page.
        });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isDirty, confirm, router]);
}
