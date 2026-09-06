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

/**
 * The other games, stacked. There are two now, so they are a group rather than
 * a one-off — and the same chip either way: they are alternatives to each
 * other, and ranking them by styling one louder would be saying something
 * neither of them means.
 */
export const otherGames = style({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: vars.space.md,
  width: "100%",
});

export const gameLink = style({
  alignItems: "center",
  alignSelf: "center",
  background: vars.color.medalGoldFill,
  border: `${vars.size.borderWidth} solid ${vars.color.medalGoldBorder}`,
  borderRadius: vars.radius.lg,
  color: vars.color.medalGoldText,
  display: "inline-flex",
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.medium,
  gap: vars.space.sm,
  lineHeight: vars.lineHeight.body,
  minHeight: vars.size.chipHeight,
  padding: `${vars.space.xs} ${vars.space.lg}`,
  selectors: {
    "&:hover": {
      background: vars.color.medalGoldFill,
      borderColor: vars.color.medalGoldBorder,
      color: vars.color.medalGoldText,
    },
    "&:focus-visible": {
      boxShadow: vars.shadow.focus,
    },
  },
  textAlign: "center",
  textDecoration: "none",
});

export const gameIcon = style({
  flex: "0 0 auto",
  height: vars.space.xl,
  width: vars.space.xl,
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
