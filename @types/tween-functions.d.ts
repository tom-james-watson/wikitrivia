declare module "tween-functions" {
  export const easeOutCirc: (
    currentTime: number,
    beginValue: number,
    endValue: number,
    totalDuration: number
  ) => number;
}
