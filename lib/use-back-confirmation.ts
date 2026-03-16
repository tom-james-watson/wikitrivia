import React from "react";

interface Options {
  enabled: boolean;
  onConfirmExit: () => void;
}

interface GuardHistoryState {
  __wikitriviaBackGuard?: true;
}

interface BackConfirmationResult {
  cancelNavigation: () => void;
  confirmNavigation: () => void;
  isPromptOpen: boolean;
}

export function useBackConfirmation(options: Options): BackConfirmationResult {
  const { enabled, onConfirmExit } = options;
  const [isPromptOpen, setIsPromptOpen] = React.useState(false);
  const bypassGuardRef = React.useRef(false);
  const popStateHandlerRef = React.useRef<(() => void) | null>(null);
  const pushedGuardRef = React.useRef(false);

  const withGuardFlag = React.useCallback((): GuardHistoryState => {
    const currentState = window.history.state as GuardHistoryState | null;

    return {
      ...(currentState ?? {}),
      __wikitriviaBackGuard: true,
    };
  }, []);

  const removePopStateHandler = React.useCallback(() => {
    if (popStateHandlerRef.current) {
      window.removeEventListener("popstate", popStateHandlerRef.current);
      popStateHandlerRef.current = null;
    }
  }, []);

  const confirmNavigation = React.useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    bypassGuardRef.current = true;
    setIsPromptOpen(false);
    removePopStateHandler();
    onConfirmExit();
    window.history.back();
  }, [onConfirmExit, removePopStateHandler]);

  const cancelNavigation = React.useCallback(() => {
    setIsPromptOpen(false);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      setIsPromptOpen(false);
      removePopStateHandler();
      pushedGuardRef.current = false;
      bypassGuardRef.current = false;
      return;
    }

    if (!enabled) {
      const currentState = window.history.state as GuardHistoryState | null;

      setIsPromptOpen(false);
      removePopStateHandler();
      if (
        pushedGuardRef.current &&
        currentState?.__wikitriviaBackGuard &&
        !bypassGuardRef.current
      ) {
        window.history.back();
      }
      pushedGuardRef.current = false;
      bypassGuardRef.current = false;
      return;
    }

    const currentState = window.history.state as GuardHistoryState | null;

    if (!currentState?.__wikitriviaBackGuard) {
      window.history.pushState(withGuardFlag(), "", window.location.href);
    }
    pushedGuardRef.current = true;

    const handlePopState = () => {
      if (bypassGuardRef.current) {
        return;
      }

      window.history.pushState(withGuardFlag(), "", window.location.href);
      pushedGuardRef.current = true;
      setIsPromptOpen(true);
    };

    removePopStateHandler();
    popStateHandlerRef.current = handlePopState;
    window.addEventListener("popstate", handlePopState);

    return () => {
      removePopStateHandler();
    };
  }, [enabled, removePopStateHandler, withGuardFlag]);

  return {
    cancelNavigation,
    confirmNavigation,
    isPromptOpen,
  };
}
