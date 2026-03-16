import { PreparedCard } from "../types/game";

export interface PlacementRequest {
  card: PreparedCard;
  displayLives: number;
  fromViewport: {
    x: number;
    y: number;
  };
}

export interface PlacementAnimationState {
  card: PreparedCard;
  containerX: number;
  displayLives: number;
  from: {
    x: number;
    y: number;
  };
  sourceOffsetX: number;
  startScrollLeft: number;
  targetOffsetX: number;
  targetScrollLeft: number;
  toY: number;
}

export function getPlacementDurationMs(
  transformDistance: number,
  scrollDistance: number,
  yDistance: number,
) {
  const travelDistance = Math.hypot(
    transformDistance + scrollDistance,
    yDistance,
  );

  return Math.max(560, Math.min(1240, 480 + travelDistance * 0.95));
}

function cubicBezierPoint(t: number, p1: number, p2: number) {
  const oneMinusT = 1 - t;

  return (
    3 * oneMinusT * oneMinusT * t * p1 + 3 * oneMinusT * t * t * p2 + t * t * t
  );
}

const LANDING_EASE_X1 = 0.12;
const LANDING_EASE_X2 = 0.38;
const LANDING_EASE_Y1 = 1;
const LANDING_EASE_Y2 = 1;

export const LANDING_EASE_CURVE = [
  LANDING_EASE_X1,
  LANDING_EASE_Y1,
  LANDING_EASE_X2,
  LANDING_EASE_Y2,
] as const;

export function timelineEase(progress: number) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  let low = 0;
  let high = 1;
  let t = clampedProgress;

  for (let index = 0; index < 14; index += 1) {
    const currentX = cubicBezierPoint(t, LANDING_EASE_X1, LANDING_EASE_X2);

    if (Math.abs(currentX - clampedProgress) < 0.0001) {
      break;
    }

    if (currentX < clampedProgress) {
      low = t;
    } else {
      high = t;
    }

    t = (low + high) / 2;
  }

  return cubicBezierPoint(t, LANDING_EASE_Y1, LANDING_EASE_Y2);
}

export function getOffsetWithinAncestor(
  element: HTMLElement,
  ancestor: HTMLElement,
): { x: number; y: number } | null {
  let currentElement: HTMLElement | null = element;
  let offsetX = 0;
  let offsetY = 0;

  while (currentElement && currentElement !== ancestor) {
    offsetX += currentElement.offsetLeft;
    offsetY += currentElement.offsetTop;
    currentElement = currentElement.offsetParent as HTMLElement | null;
  }

  if (currentElement !== ancestor) {
    return null;
  }

  return { x: offsetX, y: offsetY };
}

export function getLandingTargetScrollLeft(
  bottomEl: HTMLDivElement,
  targetOffsetLeft: number,
  targetWidth: number,
  baseScrollLeft: number = bottomEl.scrollLeft,
) {
  const leftThreshold = baseScrollLeft + bottomEl.clientWidth / 4;
  const rightThreshold =
    baseScrollLeft + (bottomEl.clientWidth / 4) * 3 - targetWidth;
  let scrollDistance = 0;

  if (targetOffsetLeft < leftThreshold || targetOffsetLeft > rightThreshold) {
    scrollDistance =
      targetOffsetLeft < leftThreshold
        ? targetOffsetLeft - leftThreshold
        : targetOffsetLeft - rightThreshold;

    if (baseScrollLeft + scrollDistance < 0) {
      scrollDistance = -baseScrollLeft;
    } else if (
      baseScrollLeft + scrollDistance >
      bottomEl.scrollWidth - bottomEl.clientWidth
    ) {
      scrollDistance =
        bottomEl.scrollWidth - bottomEl.clientWidth - baseScrollLeft;
    }
  }

  return baseScrollLeft + scrollDistance;
}

export function createPlacementAnimationState(options: {
  boardEl: HTMLDivElement;
  bottomEl: HTMLDivElement;
  request: PlacementRequest;
}): PlacementAnimationState | null {
  const { boardEl, bottomEl, request } = options;
  const targetEl = boardEl.querySelector<HTMLElement>(
    `[data-card-id="${request.card.id}"]`,
  );
  const targetRect = targetEl?.getBoundingClientRect();

  if (!targetEl || !targetRect) {
    return null;
  }

  const bottomRect = bottomEl.getBoundingClientRect();
  const boardRect = boardEl.getBoundingClientRect();
  const startScrollLeft = bottomEl.scrollLeft;
  const containerX = bottomRect.left - boardRect.left;
  const sourceOffsetX =
    startScrollLeft + (request.fromViewport.x - bottomRect.left);
  const targetOffsetX = startScrollLeft + (targetRect.left - bottomRect.left);
  const targetScrollLeft = getLandingTargetScrollLeft(
    bottomEl,
    targetOffsetX,
    targetEl.offsetWidth,
  );

  return {
    card: request.card,
    containerX,
    displayLives: request.displayLives,
    from: {
      x: request.fromViewport.x - boardRect.left,
      y: request.fromViewport.y - boardRect.top,
    },
    sourceOffsetX,
    startScrollLeft,
    targetOffsetX,
    targetScrollLeft,
    toY: targetRect.top - boardRect.top,
  };
}
