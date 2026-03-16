import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import { chip as chipBase, chipText } from "./ui.css";

export const row = style({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: vars.size.chipStackGap,
  width: "100%",
});

export const chipLabel = chipText;

export const chip = style([chipBase, chipText]);
