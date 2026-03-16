import { style } from "@vanilla-extract/css";
import { media } from "./foundation";
import { vars } from "./theme.css";

export const home = style({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: "100%",
});

export const wrapper = style({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  marginLeft: "auto",
  marginRight: "auto",
  minHeight: "100dvh",
  padding: `0 ${vars.space.xl}`,
  position: "relative",
  textAlign: "center",
  width: `min(100%, ${vars.size.pageWidth})`,
  "@media": {
    [media.compact]: {
      padding: `0 ${vars.space.lg}`,
      width: "100%",
    },
  },
});

export const stage = style({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: vars.space["5xl"],
  width: `min(100%, ${vars.size.contentWidth})`,
});

export const actions = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.lg,
  width: "100%",
});

export const about = style({});
export const footer = style({
  bottom: 0,
  left: "50%",
  marginTop: 0,
  paddingBottom: `calc(${vars.space.lg} + env(safe-area-inset-bottom, 0px))`,
  paddingLeft: vars.space.xl,
  paddingRight: vars.space.xl,
  position: "fixed",
  transform: "translateX(-50%)",
  width: `min(100%, ${vars.size.pageWidth})`,
  "@media": {
    [media.compact]: {
      paddingBottom: `calc(${vars.space.md} + env(safe-area-inset-bottom, 0px))`,
      paddingLeft: vars.space.lg,
      paddingRight: vars.space.lg,
      width: "100%",
    },
  },
});

export const githubButtonSlot = style({});
