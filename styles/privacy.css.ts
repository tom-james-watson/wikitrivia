import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import { bodyText, contentStack, sectionLabel } from "./ui.css";

export const content = style([
  contentStack,
  {
    gap: vars.space["3xl"],
    padding: `0 ${vars.space.xl} ${vars.space["5xl"]}`,
  },
]);

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.md,
});

export const heading = style([
  sectionLabel,
  {
    color: vars.color.textMuted,
    margin: 0,
    textAlign: "left",
  },
]);

export const text = style([bodyText, { textWrap: "pretty" }]);
