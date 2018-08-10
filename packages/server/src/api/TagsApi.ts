import * as express from 'express';

import builder, { getExactlyOne } from 'common/Postgres';

const router = express.Router();

router.get('/', (_, res) => {
  return builder.select()
    .from('Tag')
    .then(res.json)
    .catch(error => {
      return res
        .status(500)
        .json({ error: error.message });
    });
});

router.post('/', (req, res) => {
  return builder('Tag')
    .insert({
      'id': builder.raw('uuid_generate_v4()'),
      'name': req.body.name,
      'featured': req.body.featured
    })
    .returning('*')
    .then(getExactlyOne)
    .then(res.status(201).json)
    .catch(error => {
      return res
        .status(500)
        .json({ error: error.message });
    });
});

export default router;