import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import { action, actionContent, actionIcon, actionLabel } from "./ui.css";

export const button = action({ tone: "primary" });

export const fullWidth = style({
  width: "100%",
});

export const minimal = style({
  background: "transparent",
  borderColor: vars.color.border,
  boxShadow: "none",
  color: vars.color.text,
  selectors: {
    "&:hover": {
      background: `color-mix(in srgb, ${vars.color.text} 3%, transparent)`,
      borderColor: vars.color.border,
      color: vars.color.text,
    },
  },
});

export const withTrailingIcon = style({
  justifyContent: "space-between",
});

export const content = actionContent;

export const label = actionLabel;

export const icon = actionIcon;
