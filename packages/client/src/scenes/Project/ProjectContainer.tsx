import { ProjectGraphRecord, UserRecord } from "@celluloid/types";
import { clearProject, loadProjectThunk } from "actions/ProjectActions";

import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { AsyncAction, EmptyAction } from "types/ActionTypes";
import { AppState } from "types/StateTypes";
import { useParams } from "react-router-dom";
import { useDidUpdate } from "rooks";
import ProjectComponent from "./ProjectComponent";
import { useEffect } from "react";
import { SharedLayout } from "scenes/Menu";

interface Props {
  user?: UserRecord;
  project?: ProjectGraphRecord;
  error?: string;
  loadProject(projectId: string): AsyncAction<ProjectGraphRecord, string>;
  clearProject(): EmptyAction;
}

const mapStateToProps = (state: AppState) => ({
  user: state.user,
  project: state.project.details.project,
  error: state.project.details.error,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadProject: (projectId: string) => loadProjectThunk(projectId)(dispatch),
  clearProject: () => dispatch(clearProject()),
});

const ProjectContainer: React.FC<Props> = ({
  user,
  clearProject,
  loadProject,
  project,
}) => {
  let { projectId } = useParams();

  const load = () => {
    if (projectId) {
      loadProject(projectId);
    }
  };

  useDidUpdate(() => {
    load();
  }, [user]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SharedLayout>
      <ProjectComponent project={project} onVideoChange={load} />
    </SharedLayout>
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(ProjectContainer);
