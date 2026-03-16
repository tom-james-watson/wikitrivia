import { style } from "@vanilla-extract/css";
import { media } from "./foundation";
import { vars } from "./theme.css";
import {
  appPage,
  appPageContent,
  pageWrap,
  pageWrapTight,
  sectionLabel,
  stage as stageBase,
} from "./ui.css";

export const page = appPage;

export const pageHome = style({
  gridTemplateRows: "minmax(0, 1fr)",
});

export const screen = appPageContent;

export const wrapper = pageWrap;

export const wrapperHome = style([
  wrapper,
  {
    alignContent: "stretch",
    gridTemplateRows: "minmax(0, 1fr) auto",
    minHeight: "100dvh",
    rowGap: vars.space["2xl"],
  },
]);

export const wrapperMenu = pageWrapTight;

export const stage = stageBase;

export const stageHome = style([
  stageBase,
  {
    flex: 1,
    gap: vars.space["5xl"],
    justifyContent: "center",
    minHeight: "100%",
    "@media": {
      [media.compact]: {
        gap: vars.space["3xl"],
      },
    },
  },
]);

export const stageMenu = style([
  stageBase,
  {
    justifyContent: "flex-start",
  },
]);

export const menuBlock = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.lg,
  width: `min(100%, ${vars.size.contentWidth})`,
});

export const homeFooter = style({
  marginTop: 0,
});

export const metaText = sectionLabel;

export const dailyCardPlaceholder = style([
  menuBlock,
  {
    width: `min(100%, ${vars.size.contentWidth})`,
  },
]);

export const dailyPlaceholderScore = style({
  background: `color-mix(in srgb, ${vars.color.text} 6%, transparent)`,
  minHeight: vars.size.chipHeight,
  opacity: 0.6,
  width: "100%",
});

export const dailyPlaceholderButton = style({
  background: `color-mix(in srgb, ${vars.color.text} 6%, transparent)`,
  minHeight: vars.size.controlHeight,
  opacity: 0.6,
  width: "100%",
});

export const dailyPlaceholderMeta = style({
  background: `color-mix(in srgb, ${vars.color.text} 6%, transparent)`,
  minHeight: vars.space.lg,
  opacity: 0.6,
  width: "100%",
});
