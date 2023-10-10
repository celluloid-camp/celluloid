import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

import { UserAvatar } from "~components/UserAvatar";
import {
  AnnotationByProjectIdItem,
  ProjectById,
  trpc,
  UserMe,
} from "~utils/trpc";

interface AnnotationPanelProps {
  project: ProjectById;
  user: UserMe;
}

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  project,
  user,
}: Props) => {
  const { t } = useTranslation();

  const { data } = trpc.annotation.byProjectId.useQuery({ id: project.id });

  if (!data) return;

  return (
    <Box
      sx={{
        backgroundColor: "background.dark",
        padding: 3,
        marginY: 2,
        borderRadius: 2,
        height: "90%",
      }}
    >
      <Box>
        <Typography variant="h6" color="white">
          {t("project.annotation.title", "Annotations")}
        </Typography>
        <List sx={{ width: "100%" }}>
          {data.map((annotation: AnnotationByProjectIdItem) => (
            <>
              <ListItem key={annotation.id} disableGutters>
                <ListItemAvatar>
                  <UserAvatar
                    username={annotation.user.username}
                    userId={annotation.user.id}
                  />
                </ListItemAvatar>
                <ListItemText
                  primaryTypographyProps={{
                    color: "white",
                    fontWeight: "medium",
                    variant: "body1",
                  }}
                  primary={annotation.user.username}
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: "inline" }}
                        component="span"
                        variant="body2"
                        color="gray"
                      >
                        {annotation.text}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Collapse in={true} timeout="auto" unmountOnExit>
                {annotation.comments.map(
                  (comment: AnnotationByProjectIdItem) => (
                    <List component="div" disablePadding>
                      <ListItemButton sx={{ pl: 4 }}>
                        <ListItemAvatar>
                          <UserAvatar
                            username={comment.user.username}
                            userId={comment.user.id}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primaryTypographyProps={{
                            color: "white",
                            fontWeight: "medium",
                            variant: "body1",
                          }}
                          primary={comment.user.username}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="gray"
                              >
                                {comment.text}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItemButton>
                    </List>
                  )
                )}
              </Collapse>
            </>
          ))}
        </List>
      </Box>
    </Box>
  );
};
