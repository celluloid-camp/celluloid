import * as express from "express";
import { logger } from "backends/Logger";
import * as queryString from "query-string";
import fetch from "node-fetch";

const log = logger("api/videoApi");

const router = express.Router();

router.get("/", async (req, res) => {
  const videoId = req.query.id;

  const API_KEY = process.env.CELLULOID_YOUTUBE_API;

  if(!API_KEY){
    log.error(
        `Youtube API not provided`
      );
    return res.status(500);
  }

  const query = {
    part: "snippet",
    id: videoId,
    key: API_KEY,
  };

  const url = `https://www.googleapis.com/youtube/v3/videos?${queryString.stringify(
    query
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accepts: "application/json",
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return res.status(200).json(data);
    }
    log.error(
      `Could not perform YouTube API request (error ${response.status})`
    );
    return res.status(500);
  } catch (e) {
    log.error(`Could not perform YouTube API request (error ${e.message})`);
    return res.status(500);
  }
});

export default router;
