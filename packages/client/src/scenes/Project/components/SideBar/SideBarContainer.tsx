import { ProjectGraphRecord, UserRecord } from "@celluloid/types";
import {
  deleteProjectThunk,
  openShareProject,
  setProjectCollaborativeThunk,
  setProjectPublicThunk,
  unshareProjectThunk,
} from "actions/ProjectActions";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { AsyncAction, EmptyAction } from "types/ActionTypes";
import { AppState } from "types/StateTypes";

import SideBarComponent from "./SideBarComponent";

interface Props {
  user?: UserRecord;
  project: ProjectGraphRecord;
  setPublicLoading: boolean;
  setCollaborativeLoading: boolean;
  unshareLoading: boolean;
  deleteLoading: boolean;
  setPublicError?: string;
  setCollaborativeError?: string;
  unshareError?: string;
  deleteError?: string;
  onClickSetPublic(
    projectId: string,
    value: boolean
  ): AsyncAction<ProjectGraphRecord, string>;
  onClickSetCollaborative(
    projectId: string,
    value: boolean
  ): AsyncAction<ProjectGraphRecord, string>;
  openShareDialog(): EmptyAction;
  unshareProject(projectId: string): AsyncAction<ProjectGraphRecord, string>;
  onClickDelete(projectId: string): AsyncAction<null, string>;
}

const mapStateToProps = (state: AppState) => ({
  setPublicLoading: state.project.details.setPublicLoading,
  setCollaborativeLoading: state.project.details.setCollaborativeLoading,
  unshareLoading: state.project.details.unshareLoading,
  deleteLoading: state.project.details.deleteLoading,
  setPublicError: state.project.details.setPublicError,
  setCollaborativeError: state.project.details.setCollaborativeError,
  unshareError: state.project.details.unshareError,
  deleteError: state.project.details.deleteError,
  user: state.user,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  openShareDialog: () => dispatch(openShareProject()),
  unshareProject: (projectId: string) =>
    unshareProjectThunk(projectId)(dispatch),
  onClickDelete: (projectId: string) => deleteProjectThunk(projectId)(dispatch),
  onClickSetPublic: (projectId: string, value: boolean) =>
    setProjectPublicThunk(projectId, value)(dispatch),
  onClickSetCollaborative: (projectId: string, value: boolean) =>
    setProjectCollaborativeThunk(projectId, value)(dispatch),
});

const SideBarContainer: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const content = new Set([
    { subtitle: t("project.creatorRole"), ...props.project.user },
    ...props.project.members,
  ]);

  const onClickShare = () => {
    if (props.project.shared) {
      props.unshareProject(props.project.id);
    } else {
      props.openShareDialog();
    }
  };

  return (
    <SideBarComponent
      {...props}
      onClickShare={onClickShare}
      members={content}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SideBarContainer);
