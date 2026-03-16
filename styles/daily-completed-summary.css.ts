import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import { sectionLabel } from "./ui.css";

export const summary = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.lg,
  width: `min(100%, ${vars.size.contentWidth})`,
});

export const dailyLabel = style([
  sectionLabel,
  {
    color: vars.color.text,
  },
]);

export const metaText = sectionLabel;

export const score = style({
  width: "100%",
});

export const shareButton = style({
  width: "100%",
});
