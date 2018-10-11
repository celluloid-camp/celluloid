import { TagData } from '@celluloid/types';
import { createStyles, MenuItem, Paper, TextField, Theme, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import * as Autosuggest from 'react-autosuggest';
import {
  RenderSuggestionParams,
  RenderSuggestionsContainerParams,
  SuggestionSelectedEventData,
} from 'react-autosuggest';

const parse = require('autosuggest-highlight/parse');
const match = require('autosuggest-highlight/match');

const TagAutosuggest = Autosuggest as { new(): Autosuggest<TagData> };

function renderInputComponent(props: Autosuggest.InputProps<TagData>) {
  const {
    classes,
    ref,
    height,
    width,
    form,
    formAction,
    formEncType,
    formMethod,
    formNoValidate,
    formTarget,
    min,
    max,
    required,
    alt,
    src,
    accept,
    capture,
    checked,
    crossOrigin,
    list,
    maxLength,
    minLength,
    multiple,
    pattern,
    readOnly,
    size,
    step,
    defaultValue,
    ...others
  } = props;

  return (
    <TextField
      fullWidth={true}
      InputProps={{
        inputRef: ref,
        classes: {
          input: classes.input
        },
        ...others
      }}
    />
  );
}

function renderSuggestion(suggestion: TagData, params: RenderSuggestionParams): JSX.Element {
  const matches = match(suggestion.name, params.query);
  const parts = parse(suggestion.name, matches);

  return (
    <MenuItem selected={params.isHighlighted} component="div">
      <div>
        {parts.map((part: { text: string, highlight: boolean }, index: number) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </span>
          ) : (
              <strong key={String(index)} style={{ fontWeight: 500 }}>
                {part.text}
              </strong>
            );
        })}
      </div>
    </MenuItem>
  );
}

function getSuggestionValue(suggestion: TagData): string {
  return suggestion.name;
}

const styles = ({ spacing }: Theme) => createStyles({
  avatar: {
    border: '1px solid #757575',
    backgroundColor: '#fefefe'
  },
  container: {
    flexGrow: 1,
    position: 'relative' as 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute' as 'absolute',
    marginTop: spacing.unit,
    marginBottom: spacing.unit * 3,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
});

interface State {
  search: string;
  suggestions: TagData[];
}

interface Props extends WithStyles<typeof styles> {
  tags: TagData[];
  onTagSelected(tag: TagData): void;
}

export default withStyles(styles)(class extends React.Component<Props, State> {
  state = {
    suggestions: [],
    search: ''
  };

  render() {

    const { classes, tags } = this.props;

    const getSuggestions = (value: string) => {
      const inputValue = value.trim().toLowerCase();
      const inputLength = inputValue.length;

      return inputLength === 0 ? [] : tags.filter(tag =>
        tag.name.toLowerCase().slice(0, inputLength) === inputValue
      );
    };

    const onSuggestionSelected = (
      event: React.FormEvent<HTMLInputElement>,
      data: SuggestionSelectedEventData<TagData>
    ): void => {
      this.props.onTagSelected(data.suggestion);
    };

    const renderSuggestionsContainer = (params: RenderSuggestionsContainerParams) => {
      const { containerProps, children } = params;

      return (
        <Paper {...containerProps} square={true} style={{ zIndex: 999 }}>
          {children}
        </Paper>
      );
    };

    const onSuggestionFetchRequested = ({ value }: Autosuggest.SuggestionsFetchRequestedParams): void => {
      this.setState({
        suggestions: getSuggestions(value)
      });
    };

    const onSuggestChange = (
      event: React.ChangeEvent<HTMLTextAreaElement>,
      { newValue, method }: Autosuggest.ChangeEvent): void => {
      this.setState({ search: newValue });
    };

    const inputProps = {
      placeholder: 'Rechercher un domaine...',
      classes: classes,
      value: this.state.search,
      onChange: onSuggestChange,
    };

    return (
      <TagAutosuggest
        theme={{
          container: this.props.classes.container,
          suggestionsContainerOpen: this.props.classes.suggestionsContainerOpen,
          suggestionsList: this.props.classes.suggestionsList,
          suggestion: classes.suggestion,
        }}
        renderInputComponent={renderInputComponent}
        suggestions={this.state.suggestions}
        onSuggestionsFetchRequested={onSuggestionFetchRequested}
        alwaysRenderSuggestions={true}
        renderSuggestionsContainer={renderSuggestionsContainer}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={inputProps}
      />
    );
  }
});