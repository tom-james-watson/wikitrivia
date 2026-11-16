import { style } from "@vanilla-extract/css";
import { media } from "./foundation";
import { vars } from "./theme.css";

export const wrapper = style({
  color: vars.color.text,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  position: "relative",
  width: "100%",
});

export const top = style({
  alignItems: "center",
  display: "flex",
  flex: "0 0 50%",
  flexDirection: "column",
  gap: vars.space.xl,
  justifyContent: "flex-end",
  minHeight: 0,
  paddingTop: vars.space.xl,
  position: "relative",
  // The top half holds the lives and the deck. On a short window they do
  // not fit at full spacing, and the overflow would push the lives out of
  // view, so the spacing gives way first.
  "@media": {
    [media.short]: {
      gap: vars.space.sm,
      paddingTop: vars.space.xxs,
    },
  },
});

export const topGameOver = style({
  justifyContent: "center",
  paddingBottom: vars.space.lg,
  paddingTop: vars.space.lg,
  "@media": {
    [media.short]: {
      paddingTop: vars.space.lg,
    },
  },
});

export const statusArea = style({
  position: "relative",
  width: `min(100%, ${vars.size.boardStatusWidth})`,
});

export const statusLayer = style({
  display: "flex",
  justifyContent: "center",
  width: "100%",
});

export const bottom = style({
  alignItems: "flex-start",
  display: "flex",
  flex: "0 0 50%",
  minHeight: 0,
  overflowX: "auto",
  overflowY: "hidden",
  paddingTop: vars.space.lg,
  position: "relative",
  width: "100%",
});
