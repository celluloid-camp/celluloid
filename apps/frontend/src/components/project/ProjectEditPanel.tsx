import EditIcon from "@mui/icons-material/Edit";
import { Button, Paper } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";

import type { ProjectById, UserMe } from "~utils/trpc";

import { EditProjectDialog } from "./EditProjectDialog";
interface ProjectEditPanelProps {
  project: ProjectById;
}

export const ProjectEditPanel: React.FC<ProjectEditPanelProps> = ({
  project,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return (
    <Paper
      sx={{
        paddingX: 3,
        marginY: 2,
        paddingY: 3,
      }}
    >
      <EditProjectDialog
        open={open}
        project={project}
        onClose={() => setOpen(false)}
      />
      <Button
        fullWidth
        onClick={() => setOpen(true)}
        startIcon={<EditIcon />}
        variant="outlined"
      >
        {t("project.edit.button", "Edit Project")}
      </Button>
      {/* <ShareDialog project={project} /> */}

      {/*{((user && !isOwner(project, user)) && (user && !isMember(project, user))
      && (user && !isAdmin(user)) && project.shared) &&
        <div className={classes.button}>
          <ButtonProgress
            variant="contained"
            color="primary"
            size="small"
            fullWidth={true}
            loading={unshareLoading}
            onClick={onClickShare}
          >
            {`rejoindre`}
          </ButtonProgress>
        </div>
*/}
    </Paper>
  );
};
