import { createVar, globalStyle, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const cardBorderVar = createVar();
export const cardFaceShadowVar = createVar();
export const cardFillVar = createVar();
export const cardForegroundVar = createVar();
export const cardImageBorderVar = createVar();
export const cardImageShadowVar = createVar();
export const cardMutedVar = createVar();
export const datePillTintVar = createVar();
export const datePillBorderVar = createVar();

const faceBase = style({
  backfaceVisibility: "hidden",
  background: cardFillVar,
  border: `${vars.size.borderWidth} solid ${cardBorderVar}`,
  borderRadius: vars.radius.md,
  bottom: 0,
  color: cardForegroundVar,
  display: "flex",
  flexDirection: "column",
  left: 0,
  overflow: "visible",
  position: "absolute",
  right: 0,
  top: 0,
  WebkitBackfaceVisibility: "hidden",
});

export const itemCard = style({
  vars: {
    [cardBorderVar]: `color-mix(in srgb, ${vars.color.accent} 28%, ${vars.color.border})`,
    [cardFaceShadowVar]: vars.shadow.card,
    [cardFillVar]: `color-mix(in srgb, ${vars.color.accentSoft} 74%, ${vars.color.surfaceStrong})`,
    [cardForegroundVar]: vars.color.text,
    [cardImageBorderVar]: `color-mix(in srgb, ${vars.color.accent} 44%, ${vars.color.border})`,
    [cardImageShadowVar]: vars.shadow.card,
    [cardMutedVar]: vars.color.textMuted,
    [datePillBorderVar]: `color-mix(in srgb, ${vars.color.danger} 36%, ${vars.color.border})`,
    [datePillTintVar]: `color-mix(in srgb, ${vars.color.dangerSoft} 60%, ${vars.color.surfaceChrome})`,
  },
  display: "block",
  height: vars.size.cardHeight,
  perspective: vars.size.cardPerspective,
  position: "relative",
  width: vars.size.cardWidth,
});

export const deckCard = style({});

export const played = style({});

export const flipped = style({});

export const cardScene = style({
  inset: 0,
  position: "absolute",
  transformStyle: "preserve-3d",
});

export const cardFaces = style({
  borderRadius: vars.radius.md,
  inset: 0,
  position: "absolute",
  transformStyle: "preserve-3d",
  willChange: "transform",
});

export const front = style([
  faceBase,
  {
    overflow: "hidden",
  },
]);

export const back = style([
  faceBase,
  {
    gap: vars.space.md,
    padding: vars.space.md,
    transform: "rotateY(180deg)",
  },
]);

export const cardContent = style({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  position: "relative",
  userSelect: "none",
  WebkitUserSelect: "none",
});

export const top = style({
  padding: vars.space.md,
});

export const image = style({
  alignItems: "flex-end",
  display: "flex",
  flex: 1,
  justifyContent: "center",
  minHeight: 0,
  padding: `0 ${vars.space.md} ${vars.space.md}`,
});

export const imageFrame = style({
  alignItems: "flex-end",
  containerType: "size",
  display: "flex",
  height: "100%",
  justifyContent: "center",
  pointerEvents: "none",
  userSelect: "none",
  width: "100%",
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
});

export const imageInner = style({
  alignSelf: "flex-end",
  background: `radial-gradient(circle at 50% 38%, color-mix(in srgb, white 16%, transparent), transparent 68%), color-mix(in srgb, ${cardBorderVar} 84%, ${cardFillVar} 16%)`,
  borderRadius: vars.radius.sm,
  height: "fit-content",
  isolation: "isolate",
  maxHeight: "100cqh",
  maxWidth: "100cqw",
  overflow: "hidden",
  pointerEvents: "none",
  position: "relative",
  width: "fit-content",
  selectors: {
    "&::after": {
      border: `${vars.size.borderWidth} solid ${cardBorderVar}`,
      borderRadius: "inherit",
      content: '""',
      inset: 0,
      pointerEvents: "none",
      position: "absolute",
    },
  },
});

export const imageForeground = style({
  borderRadius: "inherit",
  filter: "saturate(1.06) contrast(1.03)",
  height: "auto",
  maxHeight: "100cqh",
  maxWidth: "100cqw",
  pointerEvents: "none",
  userSelect: "none",
  width: "auto",
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
});

export const imageTint = style({
  background: `linear-gradient(180deg, color-mix(in srgb, white 74%, transparent), transparent 30%), color-mix(in srgb, ${cardFillVar} 66%, ${cardBorderVar})`,
  borderRadius: "inherit",
  inset: 0,
  mixBlendMode: "color",
  opacity: 0.35,
  pointerEvents: "none",
  position: "absolute",
});

export const datePillAnchor = style({
  backfaceVisibility: "hidden",
  bottom: "-2.625rem",
  display: "flex",
  justifyContent: "center",
  left: "50%",
  position: "absolute",
  transform: "translateX(-50%) translateZ(0.125rem)",
  transformStyle: "preserve-3d",
  WebkitBackfaceVisibility: "hidden",
  zIndex: 4,
});

export const datePill = style({
  alignItems: "center",
  background: datePillTintVar,
  border: `${vars.size.borderWidth} solid ${datePillBorderVar}`,
  borderRadius: vars.radius.sm,
  color: vars.color.pillText,
  display: "flex",
  fontFamily: vars.font.body,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.black,
  justifyContent: "center",
  letterSpacing: "0.06em",
  minHeight: vars.size.datePillHeight,
  minWidth: vars.size.datePillWidth,
  opacity: 0,
  overflow: "hidden",
  padding: `0 ${vars.space.lg}`,
  textWrap: "nowrap",
});

export const correct = style({
  vars: {
    [datePillBorderVar]: vars.color.statusCorrectBorder,
    [datePillTintVar]: vars.color.statusCorrectFill,
  },
});

export const incorrect = style({
  vars: {
    [datePillBorderVar]: vars.color.statusIncorrectBorder,
    [datePillTintVar]: vars.color.statusIncorrectFill,
  },
});

export const fact = style({
  color: cardForegroundVar,
  flexGrow: 1,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
  overflow: "auto",
});

export const links = style({
  alignItems: "center",
  color: cardMutedVar,
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.xxs,
  justifyContent: "center",
  lineHeight: vars.lineHeight.tight,
  marginTop: vars.space.xs,
  textAlign: "center",
});

export const linkSeparator = style({
  color: "inherit",
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.regular,
  letterSpacing: "0.03em",
});

export const deckBack = style({
  alignItems: "center",
  background: cardFillVar,
  justifyContent: "center",
  padding: 0,
});

export const deckBackContent = style({
  alignItems: "center",
  display: "flex",
  height: "100%",
  justifyContent: "center",
  position: "relative",
  width: "100%",
});

export const deckBackMark = style({
  color: cardMutedVar,
  fontFamily: vars.font.display,
  fontSize: vars.size.deckMarkSize,
  fontWeight: vars.fontWeight.black,
  lineHeight: "1",
  position: "relative",
  transform: "translateY(-0.125rem)",
  zIndex: 1,
});

export const label = style({
  color: cardForegroundVar,
  fontFamily: vars.font.body,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: vars.lineHeight.snug,
  wordWrap: "break-word",
});

export const description = style({
  color: cardMutedVar,
  fontSize: vars.fontSize.sm,
  lineHeight: "1.3",
  marginTop: vars.space.xxs,
});

globalStyle(`${played} ${front}, ${played} ${back}`, {
  cursor: "pointer",
});

globalStyle(`${links} a`, {
  color: "inherit",
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.regular,
  letterSpacing: "0.03em",
  textDecoration: "none",
  textTransform: "none",
  transition: `color ${vars.duration.fast} ${vars.easing.standard}`,
});

globalStyle(`${links} a:hover`, {
  color: cardForegroundVar,
});
