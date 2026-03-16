import { style } from "@vanilla-extract/css";
import { media } from "./foundation";
import { vars } from "./theme.css";

export const wrapper = style({
  minWidth: "100%",
  width: "max-content",
});

export const stage = style({
  minWidth: "100%",
  paddingBottom: vars.size.timelineBottomPadding,
  position: "relative",
  width: "max-content",
});

export const rail = style({
  display: "flex",
  justifyContent: "center",
  minWidth: "100%",
  paddingLeft: vars.size.timelineInlinePadding,
  paddingRight: vars.size.timelineInlinePadding,
  position: "relative",
  width: "max-content",
  "@media": {
    [media.compact]: {
      paddingLeft: vars.space.xl,
      paddingRight: vars.space.xl,
    },
  },
});

export const list = style({
  alignItems: "center",
  display: "flex",
  marginLeft: "auto",
  marginRight: "auto",
  position: "relative",
  width: "max-content",
});

export const items = style({
  alignItems: "center",
  display: "flex",
  gap: vars.space.xl,
  paddingBottom: vars.space["3xl"],
  width: "max-content",
});

export const itemSlot = style({
  display: "flex",
  flex: "0 0 auto",
  position: "relative",
});

export const hiddenCardPlaceholder = style({
  height: vars.size.cardHeight,
  pointerEvents: "none",
  width: vars.size.cardWidth,
});

export const previewGap = style({
  background: vars.color.accentTint,
  border: `${vars.size.borderWidth} solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  flex: "0 0 auto",
  height: vars.size.cardHeight,
  width: vars.size.cardWidth,
});

export const openingAnchor = style({
  display: "block",
  flex: "0 0 auto",
  height: vars.size.cardHeight,
  opacity: 0,
  pointerEvents: "none",
  width: vars.size.cardWidth,
});
