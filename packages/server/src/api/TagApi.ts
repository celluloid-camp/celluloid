import { isTeacher } from 'auth/Utils';
import * as express from 'express';
import * as TagStore from 'store/TagStore';

const router = express.Router();

router.get('/', (_, res) => {
  TagStore.selectAll()
    .then(result => res.status(200).json(result))
    .catch(error => {
      console.error('Failed to fetch tags:', error);
      return res.status(500).send();
    });
});

router.post('/', isTeacher, (req, res) => {
  const { name } = req.body;
  return TagStore.insert(name)
    .then(result =>
      res.status(201).json(result)
    )
    .catch(error => {
      console.error('Failed to add new tag:', error);
      return res.status(500).send();
    });
});

export default router;