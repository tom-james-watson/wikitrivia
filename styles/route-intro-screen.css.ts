import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import {
  bodyText,
  embeddedScreen as embeddedScreenBase,
  screen as screenBase,
  sectionLabel,
  stage as stageBase,
} from "./ui.css";

export const screen = screenBase;

export const embeddedScreen = embeddedScreenBase;

export const stage = stageBase;

export const content = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.lg,
  marginLeft: "auto",
  marginRight: "auto",
  maxWidth: vars.size.contentWidth,
  width: "100%",
});

export const sectionTitle = sectionLabel;

export const introCopy = style([
  bodyText,
  {
    textAlign: "center",
  },
]);
