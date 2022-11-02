import * as express from 'express';
import { unfurl } from 'unfurl.js'
import { URL } from 'url';

import { isLoggedIn } from '../auth/Utils';
import { logger } from '../backends/Logger';

const log = logger('api/UnfulApi');

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => {
  const url = req.query.url as string;
  return unfurl(url)
    .then((raw:any) => {
      const parsedUrl = new URL(url as string);
      const result = {
        faviconUrl: "",
        website: "",
        imageUrl: undefined,
        title: undefined,
        description: undefined,
      };
      if (raw.ogp) {
        const ogp = raw.ogp;
        result.website = ogp.ogSiteName;
        result.imageUrl =
          ogp.ogImage.length > 0 ?
            ogp.ogImage[0].url :
            null;
        result.title = ogp.ogTitle;
        result.description = ogp.ogDescription;
      }
      if (raw.other) {
        const other = raw.other;
        result.title = result.title || other.title;
        result.description = result.description || other.description;
        if (other.icon) {
          result.faviconUrl = parsedUrl.origin + other.icon || "";
        }
      }
      if (result.title && result.description) {
        if (!result.website) {
          result.website = parsedUrl.hostname;
        }
        return res.status(200).json(result);
      } else {
        return res.status(404);
      }
    })
    .catch((error: Error) => {
      log.error(`could not unfurl link: ${error.message}`);
      return res.status(500);
    });
});

export default router;