import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";
import { sectionLabel } from "./ui.css";

export const difficultyIndexVarName = "--difficulty-index";

export const difficultySection = style({
  width: "100%",
});

export const difficultyOptions = style({
  vars: {
    [difficultyIndexVarName]: "0",
  },
  alignItems: "center",
  background: "transparent",
  border: `${vars.size.borderWidth} solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  display: "grid",
  gap: vars.size.controlInset,
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  minHeight: vars.size.controlHeight,
  padding: vars.size.controlInset,
  position: "relative",
});

export const difficultySlider = style({
  background: vars.color.text,
  borderRadius: `calc(${vars.radius.lg} - ${vars.size.controlInset})`,
  bottom: vars.size.controlInset,
  left: vars.size.controlInset,
  pointerEvents: "none",
  position: "absolute",
  top: vars.size.controlInset,
  transform: `translateX(calc(var(${difficultyIndexVarName}) * (100% + ${vars.size.controlInset})))`,
  transition: `transform ${vars.duration.slow} ${vars.easing.emphasized}, background ${vars.duration.fast} ${vars.easing.standard}`,
  width: `calc((100% - (${vars.size.controlInset} * 4)) / 3)`,
});

export const difficultyOption = style({
  background: "transparent",
  border: `${vars.size.borderWidth} solid transparent`,
  borderRadius: `calc(${vars.radius.lg} - ${vars.size.controlInset})`,
  color: vars.color.textMuted,
  cursor: "pointer",
  minHeight: `calc(${vars.size.controlHeight} - (${vars.size.controlInset} * 2))`,
  padding: `${vars.size.controlPaddingBlock} ${vars.size.controlPaddingInline}`,
  position: "relative",
  textAlign: "center",
  transition: `color ${vars.duration.fast} ${vars.easing.standard}, opacity ${vars.duration.fast} ${vars.easing.standard}`,
  zIndex: 1,
  selectors: {
    "&:hover": {
      color: vars.color.text,
    },
    "&:disabled": {
      cursor: "not-allowed",
    },
  },
});

export const active = style({
  color: vars.color.accentText,
  selectors: {
    "&:hover": {
      color: vars.color.accentText,
    },
  },
});

export const disabled = style({
  color: vars.color.textSubtle,
});

export const optionTitle = style([
  sectionLabel,
  {
    color: "inherit",
  },
]);
