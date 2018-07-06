import * as express from 'express';

import builder from 'common/Postgres';

const router = express.Router();

router.get('/', (_, res) => {
  return builder.select()
      .from('Tag')
      .then(result => {
        res.json(result);
      })
      .catch(error => {
        res.status(500);
        res.json({error: error.message});
      });
});

router.post('/', (req, res) => {
  return builder('Tag')
      .insert({
        'id': builder.raw('uuid_generate_v4()'),
        'name': req.body.name,
        'featured': req.body.featured
      })
      .returning(builder.raw('*'))
      .then(rows => {
        res.status(201);
        res.json(rows[0]);
      })
      .catch(error => {
        res.status(500);
        res.json({error: error.message});
      });
});

export default router;