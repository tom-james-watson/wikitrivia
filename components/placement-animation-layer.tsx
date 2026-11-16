import { animate, motion, useMotionValue, useTransform } from "motion/react";
import React from "react";
import {
  getLandingTargetScrollLeft,
  getOffsetWithinAncestor,
  getPlacementDurationMs,
  LANDING_EASE_CURVE,
  PlacementAnimationState,
  timelineEase,
} from "../lib/placement-animation";
import CardVisual from "./card-visual";

interface PlacementAnimationLayerProps {
  boardRef: React.MutableRefObject<HTMLDivElement | null>;
  flight: PlacementAnimationState;
  onComplete: () => void;
  scrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export default function PlacementAnimationLayer(
  props: PlacementAnimationLayerProps,
) {
  const { boardRef, flight, onComplete, scrollContainerRef } = props;
  const { card, containerX, from, sourceOffsetX, startScrollLeft } = flight;
  const x = useMotionValue(from.x);
  const y = useMotionValue(from.y);
  // The card arrives still in the hand that dropped it, travels at that
  // height, and is set down over the last stretch.
  const lift = useMotionValue(1);
  const scale = useTransform(lift, [0, 1], [1, 1.03]);

  React.useEffect(() => {
    let cancelled = false;
    let animationFrameId = 0;
    let startTime: null | number = null;

    const readTarget = () => {
      const boardEl = boardRef.current;
      const bottomEl = scrollContainerRef.current;
      const targetEl = boardEl?.querySelector<HTMLElement>(
        `[data-card-id="${card.id}"]`,
      );

      if (!boardEl || !bottomEl || !targetEl) {
        return;
      }

      const bottomOffset = getOffsetWithinAncestor(targetEl, bottomEl);
      const boardOffset = getOffsetWithinAncestor(targetEl, boardEl);

      if (!bottomOffset || !boardOffset) {
        return null;
      }

      const nextTargetOffsetX = bottomOffset.x;
      const nextTargetScrollLeft = getLandingTargetScrollLeft(
        bottomEl,
        nextTargetOffsetX,
        targetEl.offsetWidth,
        startScrollLeft,
      );

      return {
        targetOffsetX: nextTargetOffsetX,
        targetScrollLeft: nextTargetScrollLeft,
        toY: boardOffset.y,
      };
    };

    const waitForStableTarget = (
      resolve: (value: {
        targetOffsetX: number;
        targetScrollLeft: number;
        toY: number;
      }) => void,
    ) => {
      let previousTarget: null | {
        targetOffsetX: number;
        targetScrollLeft: number;
        toY: number;
      } = null;
      let stableFrameCount = 0;
      let frameCount = 0;

      const sample = () => {
        if (cancelled) {
          return;
        }

        frameCount += 1;
        const nextTarget = readTarget();

        if (!nextTarget) {
          animationFrameId = requestAnimationFrame(sample);
          return;
        }

        if (
          previousTarget &&
          Math.abs(previousTarget.targetOffsetX - nextTarget.targetOffsetX) <
            0.5 &&
          Math.abs(
            previousTarget.targetScrollLeft - nextTarget.targetScrollLeft,
          ) < 0.5 &&
          Math.abs(previousTarget.toY - nextTarget.toY) < 0.5
        ) {
          stableFrameCount += 1;
        } else {
          stableFrameCount = 0;
        }

        previousTarget = nextTarget;

        if (stableFrameCount >= 1 || frameCount >= 6) {
          resolve(nextTarget);
          return;
        }

        animationFrameId = requestAnimationFrame(sample);
      };

      animationFrameId = requestAnimationFrame(sample);
    };

    const startAnimation = (stableTarget: {
      targetOffsetX: number;
      targetScrollLeft: number;
      toY: number;
    }) => {
      const transformDistance = stableTarget.targetOffsetX - sourceOffsetX;
      const scrollDistance = stableTarget.targetScrollLeft - startScrollLeft;
      const yDistance = stableTarget.toY - from.y;
      const durationMs = getPlacementDurationMs(
        transformDistance,
        scrollDistance,
        yDistance,
      );

      const step = (timestamp: number) => {
        if (cancelled) {
          return;
        }

        if (startTime === null) {
          startTime = timestamp;
          void animate(lift, [1, 1, 0], {
            duration: durationMs / 1000,
            ease: ["linear", "easeIn"],
            times: [0, 0.55, 1],
          });
        }

        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const easedProgress = timelineEase(progress);
        const nextScrollLeft = startScrollLeft + scrollDistance * easedProgress;

        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = nextScrollLeft;
        }

        x.set(
          containerX +
            sourceOffsetX +
            transformDistance * easedProgress -
            nextScrollLeft,
        );
        y.set(from.y + yDistance * easedProgress);

        if (progress >= 1) {
          x.set(
            containerX +
              stableTarget.targetOffsetX -
              stableTarget.targetScrollLeft,
          );
          y.set(stableTarget.toY);
          lift.set(0);
          onComplete();
          return;
        }

        animationFrameId = requestAnimationFrame(step);
      };

      animationFrameId = requestAnimationFrame(step);
    };

    waitForStableTarget(startAnimation);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    boardRef,
    card.id,
    containerX,
    from.y,
    lift,
    onComplete,
    scrollContainerRef,
    sourceOffsetX,
    startScrollLeft,
    x,
    y,
  ]);

  return (
    <motion.div
      style={{
        left: 0,
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        x,
        y,
        zIndex: 12,
      }}
    >
      <motion.div style={{ scale }}>
        <CardVisual
          item={card}
          lift={lift}
          surface="timeline"
          transition={{
            duration:
              getPlacementDurationMs(
                flight.targetOffsetX - sourceOffsetX,
                flight.targetScrollLeft - startScrollLeft,
                flight.toY - from.y,
              ) / 1000,
            ease: LANDING_EASE_CURVE,
            times: [0, 0.86, 1],
          }}
        />
      </motion.div>
    </motion.div>
  );
}
