import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import { chip, chipText } from "./ui.css";

export const stack = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
  width: "100%",
});

export const frame = style([
  chip,
  {
    width: "100%",
  },
]);

export const text = chipText;

export const textCurrent = style({
  color: vars.color.accent,
});
