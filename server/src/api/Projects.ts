import * as express from 'express';

import pool from '../common/Postgres';

const router = express.Router();

router.get('/', (req, res) => {
  pool.query(`
      SELECT 
        p.*, 
        to_json(array_agg(t)) as tags 
      FROM "Project" p 
      LEFT JOIN "TagToProject" t2p
      ON p.id = t2p."projectId"
      LEFT JOIN "Tag" t
      ON t2p."tagId" = t.id
      GROUP BY p.id;
    `)
    .then(result => {
      const projects = result.rows.map(row => {
        row.tags = row.tags.filter(tag => tag)
        return row;
      });
      res.json(projects);
    })
    .catch(error => {
      console.error('Failed to fetch projects from database', error);
      res.status(500);
      res.json({ error: error.message });
    });
});

router.get('/:projectId', (req, res) => {
  console.log(req.params.projectId);
  pool.query(`
      SELECT 
        p.*,
        to_json(array_agg(t)) as tags
      FROM "Project" p
      LEFT JOIN "TagToProject" t2p
      ON p.id = t2p."projectId"
      LEFT JOIN "Tag" t
      ON t.id = t2p."tagId"
      WHERE p.id = $1
      GROUP BY p.id
    `, [req.params.projectId])
    .then(result => {
      if (result.rows.length === 1) {
        const projects = result.rows.map(row => {
          row.tags = row.tags.filter(tag => tag)
          return row;
        });
        res.json(projects[0])
      } else {
        res.status(404);
        res.json({ error: 'project does not exist or was deleted' });
      }
    })
    .catch(error => {
      console.error('Failed to fetch projects from database', error);
      res.status(500);
      res.json({ error: error.message });
    });
});

router.put('/:projectId', (req, res) => {
  res.status(500);
  res.json({ error: 'Not implemented' });
})

router.post('/', (req, res) => {
  pool.query(`
    INSERT INTO "Project" (
      "id",
      "publishedAt",
      "views",
      "shares",
      "videoId",
      "title",
      "description",
      "assignments",
      "author",
      "objective",
      "levelStart",
      "levelEnd",
      "public",
      "collaborative"
    ) VALUES (
      uuid_generate_v4(),
      NOW(),
      0,
      0,
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10
    ) RETURNING *
  `, [
      req.body.videoId,
      req.body.title,
      req.body.description,
      req.body.assignments,
      "Laurent Bourgatte",
      req.body.objective,
      req.body.levelStart,
      req.body.levelEnd,
      req.body.public,
      req.body.collaborative
    ])
    .then(result => {
      if (result.rows.length === 1) {
        res.status(201);
        console.log(result.rows[0]);
        console.log(result.rows[0]);
        res.send(result.rows[0]);
      } else {
        console.error('More than one project row inserted (this should NEVER happen)', result);
        res.status(500);
        res.send();
      }
    })
    .catch(error => {
      console.error('Could not insert new project into database', error);
      res.status(500);
      res.send();
    })
});

export = router;