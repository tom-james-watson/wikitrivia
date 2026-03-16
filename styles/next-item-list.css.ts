import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const container = style({
  alignItems: "flex-end",
  display: "flex",
  justifyContent: "center",
  pointerEvents: "none",
});

export const wrapper = style({
  pointerEvents: "auto",
  position: "relative",
  width: vars.size.deckWidth,
});

export const list = style({
  display: "flex",
  justifyContent: "center",
  padding: `${vars.space.xl} ${vars.space.md} ${vars.space["3xl"]}`,
});

export const stack = style({
  height: vars.size.cardHeight,
  position: "relative",
  width: vars.size.deckStackWidth,
});

export const stackBase = style({
  alignItems: "flex-start",
  display: "flex",
  inset: 0,
  justifyContent: "center",
  position: "absolute",
  zIndex: 1,
});

export const topCardSlot = style([
  stackBase,
  {
    zIndex: 2,
  },
]);

export const topCardAnchor = style({
  height: vars.size.cardHeight,
  position: "relative",
  width: vars.size.cardWidth,
});
