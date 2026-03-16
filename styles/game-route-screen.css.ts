import { style } from "@vanilla-extract/css";

export const page = style({
  display: "flex",
  flexDirection: "column",
  height: "100dvh",
  minHeight: "100dvh",
  overflow: "hidden",
});

export const pageWithoutHeader = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: "100%",
  minHeight: 0,
});

export const boardFrame = style({
  flex: 1,
  height: "100%",
  minHeight: 0,
  position: "relative",
  width: "100%",
});
