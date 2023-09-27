import * as express from 'express';
import { unfurl } from 'unfurl.js'
import { URL } from 'url';

import { isLoggedIn } from '../auth/Utils';
import { logger } from '../backends/Logger';

const log = logger('api/UnfulApi');

const router = express.Router();

type Result = {
  faviconUrl: string | undefined
  website: string | undefined
  imageUrl: string | undefined
  title: string | undefined
  description: string | undefined
};

router.get('/', isLoggedIn, async (req, res) => {
  const url = req.query.url as string;
  try {
    const raw = await unfurl(url);
    const parsedUrl = new URL(url as string);
    const result: Result = {
      faviconUrl: "",
      website: "",
      imageUrl: undefined,
      title: undefined,
      description: undefined,
    };

    const ogp = raw.open_graph;
    result.website = ogp.url;

    result.title = ogp.title || raw.description;
    result.description = ogp.description || raw.description;
    result.faviconUrl = raw.favicon

    result.imageUrl =
      ogp.images && ogp.images.length > 0 ?
        ogp.images[0].url :
        undefined;
    if (result.title && result.description) {
      if (!result.website) {
        result.website = parsedUrl.hostname;
      }
    }
    return res.status(200).json(result);

  } catch (e) {
    log.error(`could not unfurl link: ${e.message}`);
    return res.status(500);
  }


});

export default router;
