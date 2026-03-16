import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import { bodyText, modalCard, overlay as overlayBase } from "./ui.css";

export const overlay = overlayBase;

export const modal = modalCard;

export const title = style({
  color: vars.color.text,
  fontFamily: vars.font.display,
  fontSize: vars.fontSize["2xl"],
  fontWeight: vars.fontWeight.bold,
  letterSpacing: "-0.03em",
  lineHeight: vars.lineHeight.tight,
  margin: 0,
});

export const body = style([
  bodyText,
  {
    textAlign: "left",
  },
]);

export const actions = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.md,
  width: "100%",
});
