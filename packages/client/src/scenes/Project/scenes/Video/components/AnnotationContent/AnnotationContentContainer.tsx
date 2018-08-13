import * as React from 'react';
import { UnfurlData } from '@celluloid/commons';
import * as UnfurlService from 'services/UnfurlService';
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
  previews: Link[];
}

interface Props {
  focused: boolean;
  content: string;
}

function parseContent(content: string): State {
  const previews = Array.from(getUrls(content)).map((url: string) => {
    return {
      url,
    } as Link;
  });
  const text = linkifyUrls(content);
  return { text, previews, content, loading: true } as State;
}

export default class extends React.PureComponent<Props, State> {

  state = parseContent(this.props.content);

  static getDerivedStateFromProps({ content }: Props, state: State) {
    if (content !== state.content) {
      return parseContent(content);
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
        this.setState({ previews,
          loading: false,
        });
      });
  }

  componentDidUpdate({ content }: Props) {
    if (this.props.content !== content) {
      this.loadPreviews();
    }
  }

  componentDidMount() {
    this.loadPreviews();
  }

  render() {
    return (
      <AnnotationContentComponent
        focused={this.props.focused}
        text={this.state.text}
        loading={this.state.loading}
        previews={this.state.previews}
      />
    );
  }
}