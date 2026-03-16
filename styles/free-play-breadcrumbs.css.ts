import { style } from "@vanilla-extract/css";
import { media } from "./foundation";
import { vars } from "./theme.css";

export const breadcrumbs = style({
  alignItems: "center",
  display: "flex",
  flexWrap: "nowrap",
  gap: vars.space.xs,
  justifyContent: "center",
  width: "100%",
});

export const breadcrumbItem = style({
  alignItems: "center",
  display: "inline-flex",
  gap: vars.space.xs,
  minWidth: 0,
  whiteSpace: "nowrap",
});

export const breadcrumbSeparator = style({
  color: vars.color.textSubtle,
  fontSize: vars.fontSize.control,
  fontWeight: vars.fontWeight.semibold,
});

export const breadcrumbLink = style({
  color: vars.color.textMuted,
  fontFamily: vars.font.body,
  fontSize: vars.fontSize.control,
  fontWeight: vars.fontWeight.semibold,
  letterSpacing: "0.12em",
  lineHeight: vars.lineHeight.tight,
  textDecoration: "none",
  textTransform: "uppercase",
  selectors: {
    "&:hover": {
      color: vars.color.text,
    },
  },
});

export const breadcrumbCurrent = style([
  breadcrumbLink,
  {
    color: vars.color.accent,
  },
]);

export const compactEllipsis = style({
  "@media": {
    [media.narrow]: {
      maxWidth: vars.size.compactBreadcrumbWidth,
    },
  },
});
