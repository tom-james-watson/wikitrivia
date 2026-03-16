import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import { surface } from "./ui.css";

export const frame = style({
  width: "100%",
});

export const inner = surface({ density: "spacious", tone: "chrome" });

export const body = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.size.menuGap,
  minWidth: 0,
  width: "100%",
});
