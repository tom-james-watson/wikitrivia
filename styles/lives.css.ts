import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const lives = style({
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
});

export const dots = style({
  display: "flex",
  gap: vars.space.sm,
});

export const life = style({
  background: `color-mix(in srgb, ${vars.color.statusIncorrectFill} 12%, transparent)`,
  border: `${vars.size.borderWidth} solid color-mix(in srgb, ${vars.color.statusIncorrectBorder} 44%, ${vars.color.backdropStrong})`,
  borderRadius: vars.radius.pill,
  height: vars.size.lifeSize,
  transition: `border-color ${vars.duration.normal} ${vars.easing.standard}, background-color ${vars.duration.normal} ${vars.easing.standard}`,
  width: vars.size.lifeSize,
});

export const filled = style({
  background: vars.color.statusIncorrectFill,
  borderColor: vars.color.statusIncorrectBorder,
});
