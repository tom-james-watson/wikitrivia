import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import { chip, chipText } from "./ui.css";

export const score = style([
  chip,
  {
    gap: vars.space.sm,
    justifyContent: "center",
    width: "100%",
    selectors: {
      '&[data-tone="bronze"]': {
        background: vars.color.medalBronzeFill,
        borderColor: vars.color.medalBronzeBorder,
        color: vars.color.medalBronzeText,
      },
      '&[data-tone="silver"]': {
        background: vars.color.medalSilverFill,
        borderColor: vars.color.medalSilverBorder,
        color: vars.color.medalSilverText,
      },
      '&[data-tone="gold"]': {
        background: vars.color.medalGoldFill,
        borderColor: vars.color.medalGoldBorder,
        color: vars.color.medalGoldText,
      },
    },
  },
]);

export const segment = chipText;

export const separator = style({
  color: "color-mix(in srgb, currentColor 52%, transparent)",
  fontFamily: vars.font.body,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  letterSpacing: "0.08em",
});
