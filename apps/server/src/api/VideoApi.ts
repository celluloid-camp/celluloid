
import { PeerTubeVideo } from "@celluloid/types";
import * as express from "express";
import fetch from "node-fetch";
import { last } from "ramda";
import { URL } from "url";

import { logger } from "../backends/Logger";

const log = logger("api/videoApi");

const router = express.Router();

type PeerTubeVideoInfo ={
  id: string;
  title: string;
  thumbnailUrl: string;
  host:string;
}

async function getPeerVideoInfo(videoUrl: string): Promise<PeerTubeVideoInfo> {
  var parsed = new URL(videoUrl);

  const host = parsed.host;
  const videoId = last(parsed.pathname.split("/"));

  const url = `https://${host}/api/v1/videos/${videoId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accepts: "application/json",
      },
    });

    if (response.status === 200) {
      const data:PeerTubeVideo = await response.json();
      return {
        id: data.shortUUID,
        host,
        title: data.name,
        thumbnailUrl: `https://${host}/${data.thumbnailPath}`
      };
    }
    log.error(
      `Could not perform PeerTube API request (error ${response.status})`
    );
    throw new Error("Could not perform PeerTube API request ");
  } catch (e: any) {
    throw new Error("Could not perform PeerTube API request ");
  }
}

router.get("/", async (req, res) => {
  if (req.query.url) {
    try {
      const data = await getPeerVideoInfo(req.query.url as string);
      return res.status(200).json(data);
    } catch (e: any) {
      return res.status(500);
    }
  }
  return res.status(500);
});

export default router;
