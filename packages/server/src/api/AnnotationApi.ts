import { AnnotationData, AnnotationRecord, UserRecord } from "@celluloid/types";
import * as express from "express";
import Papa from 'papaparse';

import { isProjectOwnerOrCollaborativeMember } from "../auth/Utils";
import { logger } from "../backends/Logger";
import * as AnnotationStore from "../store/AnnotationStore";
import * as CommentStore from "../store/CommentStore";
import * as ProjectStore from "../store/ProjectStore";
import { convertToSrt } from "../utils/srt";
import CommentApi from "./CommentApi";


const log = logger("api/AnnotationApi");
const js2xmlparser = require("js2xmlparser");

const router = express.Router({ mergeParams: true });

router.use("/:annotationId/comments", CommentApi);

function fetchComments(annotation: AnnotationRecord, user: UserRecord) {
  return CommentStore.selectByAnnotation(annotation.id, user).then((comments) =>
    Promise.resolve({ ...annotation, comments } as AnnotationRecord)
  );
}

router.get('/', (req: express.Request<{ projectId: string }>, res: express.Response) => {
  const projectId = req.params.projectId;
  const user = req.user as UserRecord;

  return ProjectStore.selectOne(projectId, user)
    .then(() => AnnotationStore.selectByProject(projectId, user))
    .then((annotations: AnnotationRecord[]) =>
      Promise.all(
        annotations.map((annotation) => fetchComments(annotation, user))
      )
    )
    .then((annotations) => {
      return res.status(200).json(annotations);
    })
    .catch((error: Error) => {
      log.error("Failed to list annotations:", error);
      if (error.message === "ProjectNotFound") {
        return res.status(404).json({ error: error.message });
      } else {
        return res.status(500).send();
      }
    });
});

router.get('/export/:format', async (req: express.Request<{ projectId: string, format: string }>, res: express.Response) => {
  const projectId = req.params.projectId;
  const format = req.params.format;
  const user = req.user as UserRecord;

  const annotations = await AnnotationStore.selectByProject(projectId, user);
  const data = await Promise.all(
    annotations.map((annotation) => fetchComments(annotation, user))
  );

  const formated = data.map((annotation) => ({
    startTime: annotation.startTime,
    endTime: annotation.stopTime,
    text: annotation.text,
    comments: annotation.comments.map((comment) => comment.text)
  }))

  let content = "";
  if (format === 'xml') {
    content = js2xmlparser.parse("annotations", formated);
  } else if (format == "csv") {

    content = Papa.unparse(formated);
  } else if (format == "srt") {

    content = convertToSrt(formated);

  }

  res.setHeader('Content-Disposition', `attachment; filename="data.${format}"`);
  res.setHeader('Content-Type', `text/${format}`);
  res.send(content);

});



router.post("/", isProjectOwnerOrCollaborativeMember, (req, res) => {
  const projectId = req.params.projectId;
  const annotation = req.body as AnnotationData;
  const user = req.user as UserRecord;

  AnnotationStore.insert(annotation, user, projectId)
    .then((result) => fetchComments(result, user))
    .then((result) => {
      return res.status(201).json(result);
    })
    .catch((error: Error) => {
      log.error(error, "Failed to create annotation");
      return res.status(500).send();
    });
});

router.put(
  "/:annotationId",
  isProjectOwnerOrCollaborativeMember,
  (req, res) => {
    const annotationId = req.params.annotationId;
    const updated = req.body;
    const user = req.user as UserRecord;

    AnnotationStore.selectOne(annotationId, user)
      .then((old: AnnotationRecord) =>
        old.userId !== user.id
          ? Promise.reject(new Error("UserNotAnnotationOwner"))
          : Promise.resolve()
      )
      .then(() => AnnotationStore.update(annotationId, updated, user))
      .then((result) => fetchComments(result, user))
      .then((result) => res.status(200).json(result))
      .catch((error: Error) => {
        log.error("Failed to update annotation:", error);
        if (error.message === "AnnotationNotFound") {
          return res.status(404).json({ error: error.message });
        } else if (error.message === "UserNotAnnotationOwner") {
          return res.status(403).json({ error: error.message });
        } else {
          return res.status(500).send();
        }
      });
  }
);

router.delete(
  "/:annotationId",
  isProjectOwnerOrCollaborativeMember,
  (req, res) => {
    const annotationId = req.params.annotationId;
    const user = req.user as UserRecord;

    AnnotationStore.selectOne(annotationId, user)
      .then((old: AnnotationRecord) =>
        old.userId !== user.id
          ? Promise.reject(new Error("UserNotAnnotationOwner"))
          : Promise.resolve()
      )
      .then(() => AnnotationStore.del(annotationId))
      .then(() => res.status(204).send())
      .catch((error: Error) => {
        log.error("Failed to delete annotation:", error);
        if (error.message === "AnnotationNotFound") {
          return res.status(404).json({ error: error.message });
        } else if (error.message === "UserNotAnnotationOwner") {
          return res.status(403).json({ error: error.message });
        } else {
          return res.status(500).send();
        }
      });
  }
);

export default router;
