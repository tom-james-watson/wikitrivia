import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const header = style({
  padding: vars.space["3xl"],
  width: "100%",
});

export const inner = style({
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  marginLeft: "auto",
  marginRight: "auto",
  maxWidth: vars.size.pageWidth,
  width: "100%",
});

export const wordmark = style({
  alignItems: "baseline",
  color: vars.color.text,
  display: "inline-flex",
  fontFamily: vars.font.display,
  fontSize: vars.fontSize["2xl"],
  fontWeight: vars.fontWeight.bold,
  letterSpacing: "-0.04em",
  lineHeight: "0.96",
  textDecoration: "none",
});
