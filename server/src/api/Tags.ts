import * as express from 'express';

import pool from '../common/Postgres';

const router = express.Router();

router.get('/', (req, res) => {
  pool.query('SELECT * FROM "Tag"')
    .then(result => {
      res.json(result.rows);
    })
    .catch(error => {
      res.status(500);
      res.json({ error: error.message });
    })
});

router.post('/', (req, res) => {
  pool.query(`
    INSERT INTO "Tag" (
      id,
      name
    ) VALUES (
      uuid_generate_v4(),
      $1,
      $2
    ) RETURNING *
  `, [
      req.body.name,
      req.body.featured
    ]
  ).then(result => {
    res.status(201);
    res.json(result.rows[0]);
  }).catch(error => {
    res.status(500);
    res.json({ error: error.message });
  });
})

export = router;