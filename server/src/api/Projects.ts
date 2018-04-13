import * as express from 'express';

import pool from '../common/Postgres';

import { loginRequired } from '../auth/Utils';

const router = express.Router();

const orMatchesUserId = user => {
  if (user) {
    return `OR p.author = '${user.id}'`
  }
  return '';
}

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
      WHERE p.public = true ${orMatchesUserId(req.user)}
      GROUP BY p.id
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
      AND (p.public = true ${orMatchesUserId(req.user)})
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
        res.json({ error: 'Project not found' });
      }
    })
    .catch(error => {
      console.error('Failed to fetch projects from database', error);
      res.status(500);
      res.json({ error: error.message });
    });
});

router.put('/:projectId', loginRequired, (req, res) => {
  res.status(500);
  res.json({ error: 'Not implemented' });
})

router.post('/', loginRequired, (req, res) => {
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
      "collaborative",
      "langId"
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
      $10,
      'fra'
    ) RETURNING *
  `, [
      req.body.videoId,
      req.body.title,
      req.body.description,
      req.body.assignments,
      req.user.id,
      req.body.objective,
      req.body.levelStart,
      req.body.levelEnd,
      req.body.public,
      req.body.collaborative
    ])
    .then(result => {
      if (result.rows.length === 1) {
        res.status(201);
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