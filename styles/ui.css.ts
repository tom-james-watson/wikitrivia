import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { media, zIndex } from "./foundation";
import { atoms } from "./sprinkles.css";
import { vars } from "./theme.css";

const shimmer = keyframes({
  "0%": { transform: "translateX(-120%)" },
  "100%": { transform: "translateX(365%)" },
});

const appChromeBackground = `radial-gradient(circle at 12% 14%, ${vars.color.heroGlowA} 0%, transparent 28%), radial-gradient(circle at 84% 12%, ${vars.color.heroGlowB} 0%, transparent 24%), radial-gradient(circle at 50% 100%, ${vars.color.heroGlowC} 0%, transparent 30%), linear-gradient(180deg, ${vars.color.backdropStrong} 0%, ${vars.color.backdrop} 48%, ${vars.color.backdropStrong} 100%)`;

export const pageTransitionRoot = style({
  background: appChromeBackground,
  minHeight: "100%",
  position: "relative",
  zIndex: 0,
  selectors: {
    "&::before": {
      background: appChromeBackground,
      content: '""',
      height: "100lvh",
      left: 0,
      pointerEvents: "none",
      position: "fixed",
      right: 0,
      top: 0,
      zIndex: -1,
    },
  },
});

export const pageTransitionPane = style({
  minHeight: "100%",
});

export const appPage = style([
  atoms({
    display: "grid",
    minHeight: "full",
    minWidth: "full",
  }),
  {
    gridTemplateRows: "auto minmax(0, 1fr)",
    height: "100dvh",
    minHeight: "100dvh",
  },
]);

export const appPageContent = style([
  atoms({
    minWidth: "full",
    position: "relative",
  }),
  {
    minHeight: 0,
  },
]);

export const pageWrap = style([
  atoms({
    display: "grid",
    minHeight: "full",
    minWidth: "full",
    paddingX: { mobile: "xl", wide: "2xl" },
    paddingY: { mobile: "xl", wide: "2xl" },
    width: "full",
  }),
  {
    alignContent: "start",
    gap: vars.space["2xl"],
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: vars.size.pageWidth,
  },
]);

export const pageWrapCentered = style([
  pageWrap,
  {
    alignContent: "center",
  },
]);

export const pageWrapTight = style([
  pageWrap,
  {
    paddingBottom: vars.space["3xl"],
    paddingTop: vars.space.lg,
  },
]);

export const boardViewport = style([
  atoms({
    minHeight: "full",
    minWidth: "full",
    overflow: "hidden",
    position: "relative",
    width: "full",
  }),
  {
    height: "100%",
  },
]);

export const screen = style([
  atoms({
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    minWidth: "full",
    paddingBottom: { mobile: "3xl", wide: "4xl" },
    paddingTop: { mobile: "xl", wide: "2xl" },
    paddingX: { mobile: "xl", wide: "2xl" },
    width: "full",
  }),
  {
    minHeight: "100%",
  },
]);

export const embeddedScreen = style({
  minHeight: 0,
  padding: 0,
});

export const stage = style([
  atoms({
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: "xl",
    width: "full",
  }),
  {
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: vars.size.contentWidthWide,
    textAlign: "center",
  },
]);

export const contentStack = style([
  atoms({
    display: "flex",
    flexDirection: "column",
    gap: "lg",
    width: "full",
  }),
  {
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: vars.size.contentWidth,
    minWidth: 0,
  },
]);

export const sectionLabel = style({
  color: vars.color.text,
  fontFamily: vars.font.body,
  fontSize: vars.fontSize.control,
  fontWeight: vars.fontWeight.semibold,
  letterSpacing: "0.16em",
  lineHeight: vars.lineHeight.tight,
  textAlign: "center",
  textTransform: "uppercase",
});

export const bodyText = style({
  color: vars.color.text,
  fontFamily: vars.font.body,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.regular,
  letterSpacing: "-0.02em",
  lineHeight: vars.lineHeight.body,
  margin: 0,
  textWrap: "balance",
});

export const bodyTextMuted = style([
  bodyText,
  {
    color: vars.color.textMuted,
  },
]);

export const heroWordmark = style({
  color: vars.color.text,
  fontFamily: vars.font.display,
  fontSize: vars.fontSize.hero,
  fontWeight: vars.fontWeight.bold,
  letterSpacing: "-0.04em",
  lineHeight: "0.94",
  margin: 0,
  textWrap: "balance",
  "@media": {
    [media.compact]: {
      fontSize: vars.fontSize.heroCompact,
    },
  },
});

export const heroStack = style([
  stage,
  {
    gap: vars.space.md,
  },
]);

export const heroTagline = style([
  {
    color: vars.color.textMuted,
    fontFamily: vars.font.body,
    fontSize: vars.fontSize.lg,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: 0,
    lineHeight: vars.lineHeight.snug,
    margin: 0,
    maxWidth: vars.size.heroMeasure,
    textWrap: "balance",
    "@media": {
      [media.compact]: {
        fontSize: vars.fontSize.md,
        maxWidth: "21rem",
      },
    },
  },
]);

export const chip = style([
  atoms({
    alignItems: "center",
    display: "inline-flex",
    justifyContent: "center",
    paddingX: "lg",
    whiteSpace: "nowrap",
  }),
  {
    background: vars.color.chip,
    border: `${vars.size.borderWidth} solid ${vars.color.border}`,
    borderRadius: vars.radius.pill,
    color: vars.color.text,
    minHeight: vars.size.chipHeight,
  },
]);

export const chipText = style({
  color: "inherit",
  fontFamily: vars.font.body,
  fontSize: vars.fontSize.control,
  fontWeight: vars.fontWeight.semibold,
  letterSpacing: "0.12em",
  lineHeight: vars.lineHeight.tight,
  textTransform: "uppercase",
});

export const placeholderBlock = style({
  background: vars.color.accentTint,
  borderRadius: vars.radius.lg,
  minHeight: vars.size.controlHeight,
  opacity: 0.7,
});

export const linkMuted = style({
  color: vars.color.textMuted,
  selectors: {
    "&:hover": {
      color: vars.color.text,
    },
  },
});

export const action = recipe({
  base: [
    atoms({
      alignItems: "center",
      display: "inline-flex",
      justifyContent: "center",
      paddingX: "xl",
      paddingY: "lg",
      textAlign: "center",
    }),
    {
      appearance: "none",
      background: vars.color.surfaceStrong,
      border: `${vars.size.borderWidth} solid ${vars.color.border}`,
      borderRadius: vars.radius.lg,
      color: vars.color.text,
      cursor: "pointer",
      fontFamily: vars.font.body,
      fontSize: vars.fontSize.control,
      fontWeight: vars.fontWeight.semibold,
      gap: vars.space.md,
      letterSpacing: "0.14em",
      lineHeight: vars.lineHeight.tight,
      minHeight: vars.size.controlHeight,
      outline: "none",
      textDecoration: "none",
      textTransform: "uppercase",
      transition: `border-color ${vars.duration.fast} ${vars.easing.standard}, background-color ${vars.duration.fast} ${vars.easing.standard}, color ${vars.duration.fast} ${vars.easing.standard}, box-shadow ${vars.duration.fast} ${vars.easing.standard}`,
      selectors: {
        "&:hover": {
          borderColor: vars.color.borderStrong,
        },
        "&:focus-visible": {
          boxShadow: vars.shadow.focus,
        },
        "&:disabled": {
          cursor: "not-allowed",
          opacity: 0.38,
        },
      },
    },
  ],
  defaultVariants: {
    fullWidth: false,
    tone: "primary",
    withIcon: false,
  },
  variants: {
    fullWidth: {
      false: {},
      true: {
        width: "100%",
      },
    },
    tone: {
      primary: {
        background: vars.color.text,
        borderColor: vars.color.text,
        color: vars.color.backdropStrong,
        selectors: {
          "&:hover": {
            background: vars.color.text,
            borderColor: vars.color.text,
            color: vars.color.backdropStrong,
          },
        },
      },
      secondary: {
        background: vars.color.surfaceStrong,
        borderColor: vars.color.border,
        color: vars.color.text,
        selectors: {
          "&:hover": {
            background: vars.color.chipStrong,
            borderColor: vars.color.borderStrong,
            color: vars.color.text,
          },
        },
      },
      quiet: {
        background: "transparent",
        borderColor: vars.color.border,
        color: vars.color.textMuted,
        selectors: {
          "&:hover": {
            background: `color-mix(in srgb, ${vars.color.text} 3%, transparent)`,
            borderColor: vars.color.border,
            color: vars.color.text,
          },
        },
      },
    },
    withIcon: {
      false: {},
      true: {
        justifyContent: "space-between",
      },
    },
  },
});

export const actionContent = style([
  atoms({
    alignItems: "center",
    display: "inline-flex",
    justifyContent: "center",
    minWidth: "none",
    width: "full",
  }),
  {
    gap: vars.space.md,
  },
]);

export const actionLabel = style({
  minWidth: 0,
});

export const actionIcon = style([
  atoms({
    alignItems: "center",
    display: "inline-flex",
    justifyContent: "center",
  }),
  {
    flex: "0 0 auto",
  },
]);

export const surface = recipe({
  base: [
    atoms({
      display: "flex",
      flexDirection: "column",
      width: "full",
    }),
    {
      backdropFilter: "blur(1.5rem)",
      border: `${vars.size.borderWidth} solid ${vars.color.border}`,
      borderRadius: vars.radius.xl,
      boxShadow: vars.shadow.panel,
      gap: vars.space.lg,
      minWidth: 0,
    },
  ],
  defaultVariants: {
    density: "normal",
    tone: "default",
  },
  variants: {
    density: {
      compact: {
        gap: vars.space.md,
        padding: vars.space.lg,
      },
      normal: {
        gap: vars.space.lg,
        padding: vars.space.xl,
      },
      spacious: {
        gap: vars.space.xl,
        padding: vars.space["2xl"],
      },
    },
    tone: {
      chrome: {
        background: vars.color.surfaceChrome,
      },
      default: {
        background: vars.color.surfaceStrong,
      },
      soft: {
        background: vars.color.surface,
      },
    },
  },
});

export const footerNotes = style([
  atoms({
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: "xs",
    marginTop: "2xl",
    textAlign: "center",
    width: "full",
  }),
  {
    color: vars.color.textMuted,
    fontSize: vars.fontSize.sm,
    lineHeight: vars.lineHeight.body,
  },
]);

export const githubButtonSlot = style([
  atoms({
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  }),
  {
    minHeight: vars.size.chipHeight,
  },
]);

export const overlay = style({
  alignItems: "center",
  background: vars.color.overlay,
  bottom: 0,
  display: "flex",
  justifyContent: "center",
  left: 0,
  padding: vars.space.xl,
  position: "fixed",
  right: 0,
  top: 0,
  zIndex: zIndex.modal,
});

export const modalCard = style([
  surface({ density: "spacious", tone: "chrome" }),
  {
    maxWidth: vars.size.modalWidth,
  },
]);

export const loaderTrack = style({
  background: vars.color.accentTint,
  borderRadius: vars.radius.pill,
  height: vars.size.loaderTrackHeight,
  overflow: "hidden",
  position: "relative",
  width: "100%",
});

export const loaderSweep = style({
  background: `linear-gradient(90deg, transparent 0%, ${vars.color.accentSoft} 18%, ${vars.color.accent} 50%, ${vars.color.accentSoft} 82%, transparent 100%)`,
  borderRadius: vars.radius.pill,
  bottom: 0,
  left: 0,
  position: "absolute",
  top: 0,
  width: "38%",
  willChange: "transform",
  animation: `${shimmer} 1.6s ${vars.easing.standard} infinite`,
  "@media": {
    [media.reduceMotion]: {
      animation: "none",
    },
  },
});
