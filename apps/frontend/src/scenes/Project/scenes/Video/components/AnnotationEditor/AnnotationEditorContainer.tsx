import { AnnotationData, AnnotationRecord, UserRecord } from "@celluloid/types";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  createAnnotationThunk,
  triggerCancelAnnotation,
  updateAnnotationThunk,
} from "~actions/AnnotationsActions";
import { Action, AsyncAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";
import { maxAnnotationDuration } from "~utils/AnnotationUtils";

import AnnotationEditorComponent from "./AnnotationEditorComponent";

interface Props {
  user: UserRecord;
  error?: string;
  projectId: string;
  annotation?: AnnotationRecord;
  video: {
    position: number;
    duration: number;
  };
  onSeek(position: number, pause: boolean, seekAhead: boolean): void;
  onCreate(
    projectId: string,
    data: AnnotationData
  ): AsyncAction<AnnotationRecord, string>;
  onUpdate(
    projectId: string,
    record: AnnotationRecord
  ): AsyncAction<AnnotationRecord, string>;
  onCancel(annotation?: AnnotationRecord): Action<AnnotationRecord | undefined>;
}

interface State {
  annotation: AnnotationData;
}

function init({ annotation, video }: Props): State {
  if (annotation) {
    return {
      annotation,
    };
  } else {
    return {
      annotation: {
        text: "",
        startTime: video.position,
        stopTime: maxAnnotationDuration(video.position, video.duration),
        pause: true,
      },
    } as State;
  }
}

const mapStateToProps = (state: AppState) => ({
  error: state.project.video.annotationError,
  annotation: state.project.video.focusedAnnotation,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCreate: (projectId: string, data: AnnotationData) =>
    createAnnotationThunk(projectId, data)(dispatch),
  onUpdate: (projectId: string, record: AnnotationRecord) =>
    updateAnnotationThunk(projectId, record)(dispatch),
  onCancel: (annotation?: AnnotationRecord) =>
    dispatch(triggerCancelAnnotation(annotation)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  class extends React.Component<Props, State> {
    state = init(this.props);

    render() {
      const { projectId, video, onCreate, onUpdate, onCancel, onSeek } =
        this.props;

      const { annotation } = this.state;

      const onCheckPauseChange = (pause: boolean) => {
        this.setState((state) => ({
          ...state,
          annotation: {
            ...state.annotation,
            pause,
          },
        }));
      };

      const onTimingChange = (
        position: number,
        isStart: boolean,
        _seekAhead: boolean
      ) => {
        const state = this.state as State;
        if (isStart) {
          state.annotation.startTime = position;
        } else {
          state.annotation.stopTime = position;
        }
        this.setState(state);
        onSeek(position, true, true);
      };

      const onClickSave = () => {
        if (this.props.annotation) {
          onUpdate(projectId, {
            ...this.props.annotation,
            ...annotation,
          });
        } else {
          onCreate(projectId, annotation);
        }
      };

      const onClickCancel = () => {
        onCancel(this.props.annotation);
      };

      const onTextChange = (text: string) => {
        this.setState((state) => ({
          ...state,
          annotation: {
            ...state.annotation,
            text,
          },
        }));
      };

      return (
        <AnnotationEditorComponent
          {...annotation}
          onCheckPauseChange={onCheckPauseChange}
          onTimingChange={onTimingChange}
          onClickSave={onClickSave}
          onClickCancel={onClickCancel}
          onTextChange={onTextChange}
          duration={video.duration}
        />
      );
    }
  }
);
