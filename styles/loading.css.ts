import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import {
  contentStack,
  loaderSweep,
  loaderTrack,
  screen,
  sectionLabel,
} from "./ui.css";

export const loading = style([
  screen,
  {
    height: "100%",
    minHeight: "100%",
    justifyContent: "center",
  },
]);

export const loadingInner = style([
  contentStack,
  {
    maxWidth: vars.size.loaderWidth,
    textAlign: "center",
  },
]);

export const eyebrow = sectionLabel;

export const timelineTrack = loaderTrack;

export const timelineSweep = loaderSweep;
