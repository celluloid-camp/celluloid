import {
  AnnotationRecord,
  ProjectGraphRecord,
  UnfurlData,
  UserRecord,
} from "@celluloid/types";
import getUrls from "get-urls";
import linkifyUrls from "linkify-urls";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  deleteAnnotationThunk,
  triggerEditAnnotation,
  triggerFocusAnnotation,
} from "~actions/AnnotationsActions";
import * as UnfurlService from "~services/UnfurlService";
import { Action, AsyncAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";
import { canEditAnnotation } from "~utils/AnnotationUtils";
import { formatDuration } from "~utils/DurationUtils";
import { isOwner } from "~utils/ProjectUtils";

import AnnotationContentComponent from "./AnnotationContentComponent";

interface Link {
  url: string;
  data?: UnfurlData;
}

interface State {
  loading: boolean;
  content: string;
  text: string;
  richText: string;
  previews: Link[];
  hovering: boolean;
}

interface Props {
  user?: UserRecord;
  error?: string;
  project: ProjectGraphRecord;
  annotation: AnnotationRecord;
  focused: boolean;
  onClickEdit(annotation: AnnotationRecord): Action<AnnotationRecord>;
  onClickDelete(
    projectId: string,
    annotation: AnnotationRecord
  ): AsyncAction<AnnotationRecord, string>;
  onFocus(annotationRecord: AnnotationRecord): Action<AnnotationRecord>;
}

function parseText(text: string): State {
  const previews = Array.from(getUrls(text)).map((url: string) => {
    return {
      url,
    } as Link;
  });
  const richText = linkifyUrls(text);
  return {
    text,
    previews,
    richText,
    loading: false,
    hovering: false,
  } as State;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClickEdit: (record: AnnotationRecord) =>
    dispatch(triggerEditAnnotation(record)),
  onClickDelete: (projectId: string, record: AnnotationRecord) =>
    deleteAnnotationThunk(projectId, record)(dispatch),
  onFocus: (record: AnnotationRecord) =>
    dispatch(triggerFocusAnnotation(record)),
});

const AnnotationContentWrapper: React.FC<Props> = ({
  user,
  error,
  project,
  annotation,
  focused,
  onClickEdit,
  onClickDelete,
  onFocus,
}) => {
  const [state, setState] = useState<State>(parseText(annotation.text));

  const { hovering, richText, loading, previews } = state;

  const formattedStart = formatDuration(annotation.startTime);
  const formattedStop = formatDuration(annotation.stopTime);

  const loadPreviews = useCallback(() => {
    Promise.all(
      previews.map((preview) =>
        UnfurlService.unfurl(preview.url).then((data?: UnfurlData) => {
          return {
            url: preview.url,
            data,
          };
        })
      )
    ).then((previews) => {
      setState({
        ...state,
        previews,
        loading: false,
      });
    });
  }, [previews, state]);

  // useEffect(() => {
  //   if (annotation.text != state.text) {
  //     setState(parseText(annotation.text));
  //     loadPreviews();
  //   }
  // }, [annotation, loadPreviews, state.text]);

  // useEffect(() => {
  //   const load = async () => await loadPreviews();
  //   load();
  // }, []);

  const canEdit = useMemo(
    () =>
      user != null &&
      (isOwner(project, user) || canEditAnnotation(annotation, user)),
    [user, project, annotation]
  );

  return (
    <AnnotationContentComponent
      annotation={annotation}
      project={project}
      formattedStartTime={formattedStart}
      formattedStopTime={formattedStop}
      richText={richText}
      previews={previews}
      loading={loading}
      focused={focused}
      canEdit={canEdit}
      onFocus={() => onFocus(annotation)}
      onClickDelete={() => onClickDelete(project.id, annotation)}
      onClickEdit={() => onClickEdit(annotation)}
    />
  );
};

export const AnnotationContent = connect(
  null,
  mapDispatchToProps
)(AnnotationContentWrapper);
