import { isOwner } from 'utils/ProjectUtils';
import {
  AnnotationRecord,
  ProjectGraphRecord,
  UnfurlData,
  UserRecord
} from '@celluloid/types';
import {
  deleteAnnotationThunk,
  triggerEditAnnotation,
  triggerFocusAnnotation
} from 'actions/AnnotationsActions';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as UnfurlService from 'services/UnfurlService';
import { Action, AsyncAction } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';
import { canEditAnnotation } from 'utils/AnnotationUtils';
import { formatDuration } from 'utils/DurationUtils';

import AnnotationContentComponent from './AnnotationContentComponent';

const getUrls = require('get-urls');
const linkifyUrls = require('linkify-urls');

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
  onClickEdit(annotation: AnnotationRecord):
    Action<AnnotationRecord>;
  onClickDelete(projectId: string, annotation: AnnotationRecord):
    AsyncAction<AnnotationRecord, string>;
  onFocus(annotationRecord: AnnotationRecord):
    Action<AnnotationRecord>;
}

function parseText(text: string): State {
  const previews = Array
    .from(getUrls(text) as string[])
    .map((url: string) => {
      return {
        url,
      } as Link;
    });
  const richText = linkifyUrls(text);
  return {
    text,
    previews,
    richText,
    loading: true,
    hovering: false
  } as State;
}

const mapStateToProps = (state: AppState) => ({
  user: state.user,
  error: state.project.video.annotationError
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClickEdit: (record: AnnotationRecord) =>
    dispatch(triggerEditAnnotation(record)),
  onClickDelete: (projectId: string, record: AnnotationRecord) =>
    deleteAnnotationThunk(projectId, record)(dispatch),
  onFocus: (record: AnnotationRecord) =>
    dispatch(triggerFocusAnnotation(record))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  class extends React.PureComponent<Props, State> {

    state = parseText(this.props.annotation.text);

    static getDerivedStateFromProps({ annotation }: Props, state: State) {
      if (annotation.text !== state.text) {
        return parseText(annotation.text);
      }
      return null;
    }

    loadPreviews() {
      Promise.all(this.state.previews.map(preview =>
        UnfurlService
          .unfurl(preview.url)
          .then((data?: UnfurlData) => {
            return {
              url: preview.url,
              data
            };
          })))
        .then(previews => {
          this.setState({
            previews,
            loading: false,
          });
        });
    }

    componentDidUpdate({ annotation }: Props) {
      if (this.props.annotation.text !== annotation.text) {
        this.loadPreviews();
      }
    }

    componentDidMount() {
      this.loadPreviews();
    }

    render() {
      const {
        user,
        project,
        annotation,
        focused,
        onFocus,
        onClickDelete,
        onClickEdit,
      } = this.props;

      const {
        hovering, richText, loading, previews
      } = this.state;

      const formattedStart = formatDuration(annotation.startTime);
      const formattedStop = formatDuration(annotation.stopTime);

      const onHover = (value: boolean) => {
        this.setState({
          hovering: value
        });
      };

      const showActions = user
        && (focused || hovering)
        && (isOwner(project, user) || canEditAnnotation(annotation, user)) || false;

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
          hovering={hovering}
          showActions={showActions}
          onHover={onHover}
          onFocus={() => onFocus(annotation)}
          onClickDelete={() => onClickDelete(project.id, annotation)}
          onClickEdit={() => onClickEdit(annotation)}
        />
      );
    }
  });