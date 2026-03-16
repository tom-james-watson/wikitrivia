import React from "react";

type VisibilityPhase = "exiting" | "idle";

interface Options {
  collapseDelayMs: number;
  exitDurationMs: number;
  visible: boolean;
}

interface Result {
  height: number | "auto";
  isMounted: boolean;
  phase: VisibilityPhase;
  ref: React.MutableRefObject<HTMLDivElement | null>;
}

export function useCollapsibleVisibility(options: Options): Result {
  const { collapseDelayMs, exitDurationMs, visible } = options;
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = React.useState(visible);
  const [height, setHeight] = React.useState<number | "auto">(
    visible ? "auto" : 0,
  );
  const [phase, setPhase] = React.useState<VisibilityPhase>("idle");

  React.useEffect(() => {
    if (visible) {
      setIsMounted(true);
      setHeight("auto");
      setPhase("idle");
      return;
    }

    if (!isMounted) {
      setHeight(0);
      return;
    }

    setHeight(ref.current?.scrollHeight ?? "auto");
    setPhase("exiting");

    const collapseTimeoutId = window.setTimeout(() => {
      setHeight(0);
    }, collapseDelayMs);

    const unmountTimeoutId = window.setTimeout(() => {
      setIsMounted(false);
      setPhase("idle");
    }, exitDurationMs);

    return () => {
      window.clearTimeout(collapseTimeoutId);
      window.clearTimeout(unmountTimeoutId);
    };
  }, [collapseDelayMs, exitDurationMs, isMounted, visible]);

  return {
    height,
    isMounted,
    phase,
    ref,
  };
}
