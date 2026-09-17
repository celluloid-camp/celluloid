import randomColor from "randomcolor";

/** Stable per-object color shared by timeline segments and video overlay. */
export function trackColor(objectId: string) {
  return randomColor({ seed: objectId, luminosity: "bright" });
}
