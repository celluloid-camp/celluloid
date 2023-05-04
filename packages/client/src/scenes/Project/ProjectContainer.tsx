import { ProjectGraphRecord, UserRecord } from "@celluloid/types";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import { Dispatch } from "redux";
import { useDidUpdate } from "rooks";

import { clearProject, loadProjectThunk } from "~actions/ProjectActions";
import { SharedLayout } from "~components/SharedLayout";
import { AsyncAction, EmptyAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";

import ProjectComponent from "./ProjectComponent";

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

const ProjectContainer: React.FC<Props> = ({ user, loadProject, project }) => {
  const { projectId } = useParams();

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

  if (!project) return null;

  return (
    <SharedLayout>
      <ProjectComponent project={project} onVideoChange={load} />
    </SharedLayout>
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(ProjectContainer);
