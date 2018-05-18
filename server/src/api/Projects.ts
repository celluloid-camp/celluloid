import * as express from 'express';

import pool from '../common/Postgres';

import { loginRequired } from '../auth/Utils';

const router = express.Router();

const orMatchesUserId = user => {
  if (user) {
    return `OR p."authorId" = '${user.id}'`
  }
  return '';
}

router.get('/', (req, res) => {
  pool.query(`
      SELECT
        p.*,
        to_json(array_agg(t)) as tags,
        json_build_object(
          'firstName',  a."firstName",
          'lastName',   a."lastName",
          'email',      a."email"
        ) as author
      FROM "Project" p
      INNER JOIN "Teacher" a
      ON a.id = p."authorId"
      LEFT JOIN "TagToProject" t2p
      ON p.id = t2p."projectId"
      LEFT JOIN "Tag" t
      ON t2p."tagId" = t.id
      WHERE p.public = true ${orMatchesUserId(req.user)}
      GROUP BY p.id, a.id
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
      res.status(500).json({ error: error.message });
    });
});

function getProject(projectId, user) {
  return pool.query(`
      SELECT
        p.*,
        to_json(array_agg(t)) as tags,
        row_to_json(a) as author
      FROM "Project" p
      INNER JOIN "Teacher" a
      ON a.id = p."authorId"
      LEFT JOIN "TagToProject" t2p
      ON p.id = t2p."projectId"
      LEFT JOIN "Tag" t
      ON t.id = t2p."tagId"
      WHERE p.id = $1
      AND (p.public = true ${orMatchesUserId(user)})
      GROUP BY p.id, a.id
    `, [projectId])
  .then(result => {
      return new Promise((resolve, reject) => {
        if (result.rows.length === 1) {
          const projects = result.rows.map(row => {
            row.tags = row.tags.filter(tag => tag)
            return row;
          });
          resolve(projects[0]);
        } else {
          reject('ProjectNotFound');
        }
      });
    }
  );
}

function projectOwnershipRequired(req, res, next) {
  return pool.query(`
    SELECT
      "id"
    FROM "Project"
    WHERE "id" = $1
    AND "authorId" = $2
    `, [
      req.params.projectId,
      req.user.id
    ]
  ).then(result => {
    if (result.rows.length === 1) {
      return next();
    } else {
      return res.status(403).json({ error: 'ProjectOwnershipRequired' })
    }
  }).catch(error => {
    return res.status(500).json({ error: 'ProjectFetchFailed' })
  });
}

router.get('/:projectId', (req, res) => {
  getProject(req.params.projectId, req.user)
    .then(project => {
      res.json(project);
    })
    .catch(error => {
      console.error('Failed to fetch projects', error);
      if (error.message === "ProjectNotFound") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    });
});

router.post('/:projectId/annotations', loginRequired, (req, res) => {
  const projectId = req.params.projectId;
  const annotation = req.body;
  const user = req.user;
  getProject(req.params.projectId, req.user)
    .then(project => {
      if (project.authorId !== user.id && !project.collaborative) {
        res.status(403).json({error: 'ProjectNotCollaborative'});
      } else {
        pool.query(`
          INSERT INTO "Annotation"
          VALUES (
            uuid_generate_v4(),
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
          RETURNING *
        `, [
          req.body.text,
          req.body.startTime,
          req.body.stopTime,
          req.body.pause,
          req.user.id,
          projectId
        ]).then(result => {
          if (result.rows.length === 1) {
            res.status(201).json(result.rows[0]);
          } else {
            console.error('Failed to create annotation', result);
            res.status(500).json({ error: 'AnnotationInsertionError' })
          }

        }).catch(error => {
          console.error('Failed to create annotation', error);
          res.status(500).json({ error: 'AnnotationInsertionError' });
        })
      }
    })
    .catch(error => {
      console.error('Failed to create annotation', error);
      if (error.message === "ProjectNotFound") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    });
});

router.put('/:projectId', loginRequired, projectOwnershipRequired, (req, res) => {
  pool.query(`
    UPDATE "Project"
    SET
      "views"           = $1,
      "shares"          = $2,
      "title"           = $3,
      "description"     = $4,
      "assignments"     = $5,
      "objective"       = $7,
      "levelStart"      = $8,
      "levelEnd"        = $9,
      "public"          = $10,
      "collaborative"   = $11
    RETURNING *
  `, [
      req.body.views  || 0,
      req.body.shares || 0,
      req.body.title,
      req.body.description,
      req.body.assignments,
      req.body.objective,
      req.body.levelStart,
      req.body.levelEnd,
      req.body.public,
      req.body.collaborative
    ])
    .then(result => {
      if (result.rows.length === 1) {
        return res.status(201).json(result.rows[0]);
      } else {
        console.error('Failed to create project', result);
        return res.status(500).json({ error: 'ProjectUpdateFailed' });
      }
    })
    .catch(error => {
      console.error('Failed to create project', error);
      return res.status(500).json({ error: 'ProjectUpdateFailed' });
    })
});

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
      "authorId",
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
        console.error('Failed to create project', result);
        res.status(500).json({ error: 'ProjectInsertionFailed' });
      }
    })
    .catch(error => {
      console.error('Failed to create project', error);
      res.status(500).json({ error: 'ProjectInsertionFailed' });
    })
});

export = router;