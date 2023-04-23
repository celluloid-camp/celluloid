import {
  AnnotationRecord,
  ProjectGraphRecord,
  UserRecord,
} from "@celluloid/types";
import { Box, Typography } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { AppState } from "types/StateTypes";
import { canAnnotate } from "utils/ProjectUtils";

import Comment from "./Comment";
import CommentEditor from "./CommentEditor";

// const styles = ({ spacing, palette }: Theme) =>
//   createStyles({
//     root: {
//       paddingLeft: spacing.unit * 8.5,
//       paddingRight: spacing.unit * 7,
//     },
//     commentCount: {
//       color: palette.text.disabled,
//       paddingLeft: spacing.unit * 2,
//     },
//   });

interface Props {
  annotation: AnnotationRecord;
  user?: UserRecord;
  project: ProjectGraphRecord;
}

const mapStateToProps = (state: AppState) => ({
  user: state.user,
});

const CommentList: React.FC<Props> = ({ annotation, user, project }: Props) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        paddingLeft: 8,
        paddingRight: 7,
      }}
    >
      {annotation.comments.length > 0 && (
        <Typography
          gutterBottom={true}
          color="disabled"
          sx={{
            paddingLeft: 2,
          }}
        >
          {t("annotation.commentLabel", { count: annotation.comments.length })}
        </Typography>
      )}
      {annotation.comments.map((comment) => (
        <Comment
          user={user}
          project={project}
          annotation={annotation}
          comment={comment}
          key={comment.id}
        />
      ))}
      {user && project && canAnnotate(project, user) && (
        <CommentEditor
          user={user}
          annotation={annotation}
          onClickCancel={() => null}
        />
      )}
    </Box>
  );
};

export default connect(mapStateToProps)(CommentList);
