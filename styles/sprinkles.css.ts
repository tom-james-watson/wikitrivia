import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles";
import { media } from "./foundation";
import { vars } from "./theme.css";

const responsiveProperties = defineProperties({
  conditions: {
    mobile: {},
    wide: { "@media": media.wide },
  },
  defaultCondition: "mobile",
  properties: {
    alignItems: ["stretch", "center", "flex-start", "flex-end"],
    borderRadius: vars.radius,
    columnGap: vars.space,
    display: ["none", "block", "flex", "grid", "inline-flex"],
    flexDirection: ["row", "column"],
    flexWrap: ["nowrap", "wrap"],
    fontSize: vars.fontSize,
    gap: vars.space,
    justifyContent: [
      "flex-start",
      "center",
      "flex-end",
      "space-between",
      "space-around",
    ],
    lineHeight: vars.lineHeight,
    marginBottom: vars.space,
    marginLeft: vars.space,
    marginRight: vars.space,
    marginTop: vars.space,
    paddingBottom: vars.space,
    paddingLeft: vars.space,
    paddingRight: vars.space,
    paddingTop: vars.space,
    rowGap: vars.space,
    textAlign: ["left", "center", "right"],
  },
  shorthands: {
    margin: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
    marginX: ["marginLeft", "marginRight"],
    marginY: ["marginTop", "marginBottom"],
    padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
    paddingX: ["paddingLeft", "paddingRight"],
    paddingY: ["paddingTop", "paddingBottom"],
  },
});

const layoutProperties = defineProperties({
  properties: {
    minHeight: {
      full: "100%",
      none: "0",
    },
    minWidth: {
      full: "100%",
      none: "0",
    },
    overflow: ["auto", "hidden", "visible"],
    position: ["absolute", "relative"],
    textTransform: ["none", "uppercase"],
    whiteSpace: ["normal", "nowrap"],
    width: {
      auto: "auto",
      fit: "fit-content",
      full: "100%",
      max: "max-content",
    },
  },
});

export const atoms = createSprinkles(responsiveProperties, layoutProperties);
