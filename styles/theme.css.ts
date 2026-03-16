import {
  assignVars,
  createGlobalThemeContract,
  globalFontFace,
  globalStyle,
  style,
} from "@vanilla-extract/css";
import {
  breakpointScale,
  durationScale,
  easingScale,
  fontSizeScale,
  fontWeightScale,
  layoutScale,
  lineHeightScale,
  media,
  radiusScale,
  spaceScale,
} from "./foundation";

const sharedTokens = {
  duration: durationScale,
  easing: easingScale,
  font: {
    body: '"Inter", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
    display: '"Fraunces", "Iowan Old Style", Georgia, serif',
  },
  fontSize: fontSizeScale,
  fontWeight: fontWeightScale,
  lineHeight: lineHeightScale,
  breakpoint: breakpointScale,
  radius: radiusScale,
  size: layoutScale,
  space: spaceScale,
};

const lightTheme = {
  ...sharedTokens,
  color: {
    accent: "#000000",
    accentActive: "#000000",
    accentSoft: "rgba(255, 255, 255, 0.96)",
    accentText: "#ffffff",
    accentTint: "rgba(0, 0, 0, 0.06)",
    backdrop: "#f8f8f8",
    backdropStrong: "#ffffff",
    border: "rgba(0, 0, 0, 0.14)",
    borderStrong: "rgba(0, 0, 0, 0.24)",
    chip: "rgba(255, 255, 255, 0.96)",
    chipStrong: "rgba(242, 237, 230, 0.88)",
    danger: "#9f6861",
    dangerSoft: "rgba(191, 131, 123, 0.28)",
    heroGlowA: "rgba(255, 198, 132, 0.14)",
    heroGlowB: "rgba(150, 207, 255, 0.14)",
    heroGlowC: "rgba(255, 150, 166, 0.1)",
    link: "rgba(0, 0, 0, 0.85)",
    overlay: "rgba(18, 16, 15, 0.52)",
    pillText: "#ece8e2",
    selection: "rgba(19, 95, 119, 0.2)",
    selectionText: "#22170f",
    statusNeutral: "rgba(0, 0, 0, 0.56)",
    statusCorrectBorder: "#64886a",
    statusCorrectFill: "#7da982",
    statusIncorrectBorder: "#9f6861",
    statusIncorrectFill: "#bf837b",
    success: "#64886a",
    successSoft: "rgba(125, 169, 130, 0.28)",
    medalBronzeBorder: "rgba(186, 147, 114, 0.54)",
    medalBronzeFill: "rgba(224, 201, 182, 0.92)",
    medalBronzeText: "rgba(120, 71, 40, 0.88)",
    medalGoldBorder: "rgba(195, 167, 80, 0.7)",
    medalGoldFill: "rgba(230, 217, 164, 0.94)",
    medalGoldText: "rgba(123, 96, 27, 0.9)",
    medalSilverBorder: "rgba(160, 174, 193, 0.68)",
    medalSilverFill: "rgba(213, 221, 233, 0.94)",
    medalSilverText: "rgba(82, 94, 112, 0.88)",
    surface: "rgba(255, 255, 255, 0.96)",
    surfaceChrome: "rgba(244, 239, 232, 0.72)",
    surfaceStrong: "rgba(255, 255, 255, 0.96)",
    text: "rgba(0, 0, 0, 0.85)",
    textMuted: "rgba(0, 0, 0, 0.56)",
    textSubtle: "rgba(0, 0, 0, 0.32)",
    timeline: "rgba(0, 0, 0, 0.08)",
  },
  shadow: {
    card: "none",
    focus: "0 0 0 0.1875rem rgba(0, 0, 0, 0.08)",
    panel: "none",
  },
};

const darkTheme = {
  ...sharedTokens,
  color: {
    accent: "#eef3f5",
    accentActive: "#eef3f5",
    accentSoft: "rgba(31, 41, 48, 0.94)",
    accentText: "#202830",
    accentTint: "rgba(238, 243, 245, 0.08)",
    backdrop: "#161c21",
    backdropStrong: "#202830",
    border: "rgba(234, 240, 243, 0.14)",
    borderStrong: "rgba(234, 240, 243, 0.24)",
    chip: "rgba(28, 36, 42, 0.84)",
    chipStrong: "rgba(36, 46, 53, 0.92)",
    danger: "#cb8f84",
    dangerSoft: "rgba(85, 47, 42, 0.84)",
    heroGlowA: "rgba(132, 104, 76, 0.12)",
    heroGlowB: "rgba(68, 97, 110, 0.1)",
    heroGlowC: "rgba(96, 84, 102, 0.08)",
    link: "#eef3f5",
    overlay: "rgba(4, 6, 8, 0.72)",
    pillText: "#202830",
    selection: "rgba(121, 195, 218, 0.2)",
    selectionText: "#eef3f5",
    statusNeutral: "rgba(222, 231, 235, 0.56)",
    statusCorrectBorder: "#64886a",
    statusCorrectFill: "#7da982",
    statusIncorrectBorder: "#9f6861",
    statusIncorrectFill: "#bf837b",
    success: "#8dbb90",
    successSoft: "rgba(44, 78, 48, 0.88)",
    medalBronzeBorder: "rgba(185, 147, 112, 0.54)",
    medalBronzeFill: "rgba(88, 66, 51, 0.92)",
    medalBronzeText: "rgba(229, 193, 161, 0.94)",
    medalGoldBorder: "rgba(201, 171, 86, 0.58)",
    medalGoldFill: "rgba(88, 76, 36, 0.92)",
    medalGoldText: "rgba(241, 226, 168, 0.96)",
    medalSilverBorder: "rgba(146, 164, 183, 0.52)",
    medalSilverFill: "rgba(58, 69, 82, 0.92)",
    medalSilverText: "rgba(224, 232, 240, 0.94)",
    surface: "rgba(27, 35, 41, 0.76)",
    surfaceChrome: "rgba(35, 45, 52, 0.9)",
    surfaceStrong: "rgba(31, 41, 48, 0.94)",
    text: "#eef3f5",
    textMuted: "rgba(238, 243, 245, 0.68)",
    textSubtle: "rgba(238, 243, 245, 0.48)",
    timeline: "rgba(223, 233, 238, 0.18)",
  },
  shadow: {
    card: "0 1rem 2rem rgba(0, 0, 0, 0.28)",
    focus: "0 0 0 0.1875rem rgba(121, 195, 218, 0.18)",
    panel: "0 1.25rem 3rem rgba(0, 0, 0, 0.24)",
  },
};

function createContractShape<T extends Record<string, unknown>>(
  value: T,
): {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? ReturnType<typeof createContractShape<T[K]>>
    : null;
} {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      typeof entry === "object" && entry !== null
        ? createContractShape(entry as Record<string, unknown>)
        : null,
    ]),
  ) as {
    [K in keyof T]: T[K] extends Record<string, unknown>
      ? ReturnType<typeof createContractShape<T[K]>>
      : null;
  };
}

export const vars = createGlobalThemeContract(
  createContractShape(lightTheme),
  (_value, path) => `wt-${path.join("-")}`,
);

globalFontFace("Inter", {
  fontDisplay: "swap",
  fontStyle: "normal",
  fontWeight: "400 800",
  src: 'url("/fonts/inter-latin.woff2") format("woff2")',
});

globalFontFace("Fraunces", {
  fontDisplay: "swap",
  fontStyle: "normal",
  fontWeight: "700 800",
  src: 'url("/fonts/fraunces-latin.woff2") format("woff2")',
});

export const appThemeClass = style({
  vars: assignVars(vars, lightTheme),
  colorScheme: "light",
  minHeight: "100%",
  "@media": {
    [media.dark]: {
      vars: assignVars(vars, darkTheme),
      colorScheme: "dark",
    },
  },
});

const pageBackground = `radial-gradient(circle at 12% 14%, ${vars.color.heroGlowA} 0%, transparent 28%), radial-gradient(circle at 84% 12%, ${vars.color.heroGlowB} 0%, transparent 24%), radial-gradient(circle at 50% 100%, ${vars.color.heroGlowC} 0%, transparent 30%), linear-gradient(180deg, ${vars.color.backdropStrong} 0%, ${vars.color.backdrop} 48%, ${vars.color.backdropStrong} 100%)`;

globalStyle("html", {
  background: pageBackground,
  color: vars.color.text,
  fontSize: "100%",
  minHeight: "100%",
  scrollBehavior: "smooth",
});

globalStyle("body", {
  margin: 0,
  minHeight: "100%",
  background: "transparent",
  color: vars.color.text,
  fontFamily: vars.font.body,
  fontFeatureSettings: '"ss01" 1, "cv03" 1, "cv11" 1',
  fontOpticalSizing: "auto",
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.body,
  overflowX: "hidden",
  textRendering: "optimizeLegibility",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  overscrollBehaviorY: "contain",
});

globalStyle("html, body, #__next", {
  width: "100%",
  minHeight: "100%",
});

globalStyle("#__next", {
  isolation: "isolate",
});

globalStyle("a", {
  color: vars.color.link,
  textDecorationColor: "color-mix(in srgb, currentColor 30%, transparent)",
  textUnderlineOffset: spaceScale.xxs,
  transition: `color ${vars.duration.fast} ${vars.easing.standard}, text-decoration-color ${vars.duration.fast} ${vars.easing.standard}`,
});

globalStyle("a:hover", {
  color: vars.color.link,
  textDecorationColor: "currentColor",
});

globalStyle("button, input, select, textarea", {
  font: "inherit",
});

globalStyle("*", {
  boxSizing: "border-box",
  WebkitTapHighlightColor: "transparent",
});

globalStyle("img", {
  display: "block",
  maxWidth: "100%",
});

globalStyle(".gamePageNoSelect, .gamePageNoSelect *", {
  userSelect: "none",
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
});

globalStyle(".gamePageNoSelect", {
  overflow: "hidden",
});

globalStyle("::selection", {
  backgroundColor: vars.color.selection,
  color: vars.color.selectionText,
});
