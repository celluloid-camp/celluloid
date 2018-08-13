import * as express from 'express';

import builder, { getExactlyOne } from 'utils/Postgres';

const router = express.Router();

router.get('/', (_, res) => {
  return builder.select()
    .from('Tag')
    .then(result => res.status(200).json(result))
    .catch(error => {
      console.error('Failed to fetch tags', error);
      return res
        .status(500).send();
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
    .then(result => res.status(201).json(result))
    .catch(error => {
      console.error('Failed to add new tag', error);
      return res
        .status(500).send();
    });
});

export default router;