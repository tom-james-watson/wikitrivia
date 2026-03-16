export const media = {
  compact: "screen and (max-width: 48rem)",
  narrow: "screen and (max-width: 36rem)",
  wide: "screen and (min-width: 48.0625rem)",
  dark: "(prefers-color-scheme: dark)",
  coarsePointer: "(pointer: coarse)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
} as const;

export const breakpointScale = {
  compact: "48rem",
  narrow: "36rem",
} as const;

export const spaceScale = {
  none: "0",
  hairline: "0.125rem",
  xxs: "0.25rem",
  xs: "0.375rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  "4xl": "2.5rem",
  "5xl": "3rem",
  "6xl": "4rem",
} as const;

export const radiusScale = {
  none: "0",
  sm: "0.5rem",
  md: "0.875rem",
  lg: "1.125rem",
  xl: "1.5rem",
  pill: "999rem",
} as const;

export const fontSizeScale = {
  xs: "0.6875rem",
  sm: "0.75rem",
  control: "0.8125rem",
  base: "0.9375rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.375rem",
  "2xl": "1.875rem",
  hero: "6.25rem",
  heroCompact: "4rem",
  display: "clamp(3.5rem, 9vw, 5.75rem)",
} as const;

export const lineHeightScale = {
  tight: "1.1",
  snug: "1.25",
  body: "1.5",
  relaxed: "1.7",
} as const;

export const fontWeightScale = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  black: "800",
} as const;

export const layoutScale = {
  pageWidth: "46rem",
  contentWidth: "28rem",
  contentWidthWide: "34rem",
  modalWidth: "26rem",
  cardWidth: "9.375rem",
  cardHeight: "12.5rem",
  deckWidth: "13.125rem",
  headerHeight: "4.5rem",
  controlHeight: "3.375rem",
  chipHeight: "2.375rem",
  borderWidth: "0.0625rem",
  outlineWidth: "0.1875rem",
  timelineThickness: "0.125rem",
  lifeSize: "1.375rem",
  loaderTrackHeight: "0.3125rem",
  loaderWidth: "21rem",
  heroMeasure: "30rem",
  boardStatusWidth: "28rem",
  deckStackWidth: "10.625rem",
  compactBreadcrumbWidth: "6ch",
  cardPerspective: "37.5rem",
  datePillHeight: "2rem",
  datePillWidth: "5.125rem",
  deckMarkSize: "4.625rem",
  menuGap: "1rem",
  chipStackGap: "0.75rem",
  controlInset: "0.3125rem",
  controlPaddingBlock: "0.625rem",
  controlPaddingInline: "0.9375rem",
  timelineBottomPadding: "2.0625rem",
  timelineOffsetBottom: "5.75rem",
  timelineInlinePadding: "2.5rem",
} as const;

export const durationScale = {
  instant: "0ms",
  fast: "140ms",
  normal: "220ms",
  slow: "320ms",
  slower: "480ms",
} as const;

export const easingScale = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.22, 1, 0.36, 1)",
  decisive: "cubic-bezier(0.33, 1, 0.68, 1)",
} as const;

export const zIndex = {
  base: 1,
  raised: 10,
  floating: 20,
  overlay: 40,
  modal: 50,
} as const;
