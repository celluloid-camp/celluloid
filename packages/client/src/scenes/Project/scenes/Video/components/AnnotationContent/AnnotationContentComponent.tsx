import {
  AnnotationRecord,
  ProjectGraphRecord,
  UnfurlData,
} from "@celluloid/types";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Collapse, Fade, Grow, IconButton } from "@mui/material";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useState } from "react";
import { TransitionGroup } from "react-transition-group";

import { UserAvatar } from "~components/UserAvatar";

import CommentsList from "../CommentsList";

interface Link {
  url: string;
  data?: UnfurlData;
}

interface Props {
  annotation: AnnotationRecord;
  project: ProjectGraphRecord;
  formattedStartTime: string;
  formattedStopTime: string;
  richText: string;
  loading: boolean;
  previews: Link[];
  focused: boolean;
  onFocus(): void;
  canEdit: boolean;
  onClickEdit(): void;
  onClickDelete(): void;
}

const AnnotationContentComponent = ({
  annotation,
  project,
  formattedStartTime,
  formattedStopTime,
  richText,
  previews,
  focused,
  canEdit,
  onFocus,
  onClickEdit,
  onClickDelete,
}: Props) => {
  const [showActions, setShowActions] = useState(false);

  const handleHover = (value: boolean) => {
    setShowActions(value && canEdit);
  };

  return (
    <Box
      sx={{
        paddingLeft: 1,
        paddingTop: 1,
        paddingBottom: 1,
      }}
    >
      <Box
        display={"flex"}
        flexDirection={"row"}
        alignItems={"flex-start"}
        flex={1}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        <UserAvatar
          username={annotation.user.username}
          userId={annotation.user.id}
          sx={{ marginX: 2 }}
        />
        <Box
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          onClick={() => onFocus()}
        >
          <Box display={"flex"}>
            <Typography>
              {`${annotation.user.username} | `}
              <Box
                component={"span"}
                sx={{
                  display: "inline",
                }}
              >
                {`${formattedStartTime} - ${formattedStopTime}`}
              </Box>
            </Typography>
          </Box>

          <Box>
            <Fade
              in={!focused}
              appear={true}
              {...(focused ? { timeout: 1000 } : {})}
            >
              <div>
                {!focused && (
                  <Typography
                    sx={{
                      "& a:any-link": {
                        color: "#42a6f5",
                      },
                    }}
                    color="neutral.400"
                    noWrap={true}
                    gutterBottom={true}
                  >
                    <span dangerouslySetInnerHTML={{ __html: richText }} />
                  </Typography>
                )}
              </div>
            </Fade>
            <Collapse in={focused} appear={true}>
              {focused && (
                <Typography
                  noWrap={true}
                  color="neutral.400"
                  sx={{
                    "& a:any-link": {
                      color: "#42a6f5",
                    },
                  }}
                  gutterBottom={true}
                >
                  <span dangerouslySetInnerHTML={{ __html: richText }} />
                </Typography>
              )}
            </Collapse>
            <TransitionGroup appear={true}>
              {focused &&
                previews.map(
                  (preview) =>
                    preview.data && (
                      <Collapse in={true} key={preview.url} appear={true}>
                        <Box
                          onClick={() => window.open(preview.url, "_blank")}
                          key={preview.url}
                          sx={{
                            maxWidth: 320,
                            cursor: "pointer",
                            margin: 1,
                            marginLeft: 0,
                            backgroundColor: "rgba(70, 70, 70, 0.4)",
                          }}
                        >
                          <Box
                            sx={{
                              padding: 1,
                            }}
                          >
                            <Typography variant="caption">
                              {preview.data.website}
                            </Typography>
                            <Typography variant="subtitle1">
                              {preview.data.title}
                            </Typography>
                          </Box>
                          {preview.data.imageUrl && (
                            <CardMedia
                              sx={{
                                height: 0,
                                paddingTop: "56.25%",
                              }}
                              image={preview.data.imageUrl}
                              title={preview.data.title}
                            />
                          )}
                          {preview.data.description && (
                            <Box
                              sx={{
                                padding: 2,
                              }}
                            >
                              <Typography
                                sx={{
                                  "& a:any-link": {
                                    color: "#42a6f5",
                                  },
                                }}
                              >
                                {preview.data.description}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    )
                )}
            </TransitionGroup>
          </Box>
        </Box>
        <Box>
          <Grow in={showActions} appear={true}>
            <div>
              <IconButton
                color="primary"
                onClick={(event) => {
                  event.preventDefault();
                  onClickEdit();
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="secondary"
                onClick={(event) => {
                  event.preventDefault();
                  onClickDelete();
                }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          </Grow>
        </Box>
      </Box>
      <Collapse in={focused} appear={true}>
        <CommentsList project={project} annotation={annotation} />
      </Collapse>
    </Box>
  );
};

export default AnnotationContentComponent;
