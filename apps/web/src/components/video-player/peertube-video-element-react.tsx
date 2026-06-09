"use client";

// keep as last import, ce-la-react is bundled.
import { createComponent, defaultToAttributeName } from "ce-la-react";
import * as React from "react";
import PeerTubeVideoElement from "./peertube-video-element";

const PeerTubeVideo = createComponent({
  react: React as any,
  tagName: "peertube-video",
  elementClass: PeerTubeVideoElement,
  toAttributeName(propName: string) {
    // The HTMLMediaElement.muted property doesn't have a corresponding attribute.
    // The muted attribute corresponds to the HTMLMediaElement.defaultMuted property.
    if (propName === "muted") return "";
    if (propName === "defaultMuted") return "muted";
    return defaultToAttributeName(propName);
  },
});

export default PeerTubeVideo;
