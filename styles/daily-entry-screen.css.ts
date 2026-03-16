import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import { sectionLabel, stage as stageBase } from "./ui.css";

export const screen = style({
  display: "flex",
  height: "100%",
  justifyContent: "center",
  minHeight: 0,
  width: "100%",
});

export const stage = stageBase;

export const content = style({
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

export const score = style({
  display: "flex",
  justifyContent: "center",
});
