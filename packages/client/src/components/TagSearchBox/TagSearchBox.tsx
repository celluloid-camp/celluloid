import { TagData } from '@celluloid/types';
import {
  createStyles,
  MenuItem,
  Paper,
  TextField,
  Theme,
  WithStyles,
  withStyles,
  InputAdornment
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import {
  RenderSuggestionParams,
  RenderSuggestionsContainerParams,
  SuggestionSelectedEventData,
} from 'react-autosuggest';
import { AppState } from 'types/StateTypes';
import { connect } from 'react-redux';
import { WithI18n, withI18n } from 'react-i18next';

const parse = require('autosuggest-highlight/parse');
const match = require('autosuggest-highlight/match');

interface NewTag {
  name: string;
  kind: 'NewTag';
}

interface ExistingTag {
  kind: 'ExistingTag';
  name: string;
  data: TagData;
}

type Suggestion = ExistingTag | NewTag;

function existingTag(data: TagData): ExistingTag {
  return { kind: 'ExistingTag', data, name: data.name };
}

function newTag(name: string): NewTag {
  return { kind: 'NewTag', name };
}

function isExistingTag(suggestion: Suggestion): suggestion is ExistingTag {
  return suggestion.kind === 'ExistingTag';
}

const TagAutosuggest = Autosuggest as { new(): Autosuggest<Suggestion> };

function renderInputComponent(props: Autosuggest.InputProps<Suggestion>) {
  // const {
  //   // classes,
  //   // ref,
  //   height,
  //   width,
  //   form,
  //   formAction,
  //   formEncType,
  //   formMethod,
  //   formNoValidate,
  //   formTarget,
  //   min,
  //   max,
  //   required,
  //   alt,
  //   src,
  //   accept,
  //   capture,
  //   checked,
  //   crossOrigin,
  //   list,
  //   maxLength,
  //   minLength,
  //   multiple,
  //   pattern,
  //   readOnly,
  //   size,
  //   step,
  //   defaultValue,
  // } = props;

  // ...others

  return (
    <TextField
      variant="outlined"
      fullWidth={true}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="disabled" />
          </InputAdornment>
        ),
        // inputRef: ref,
        classes: {
          // input: classes.input
        },
        // ...others
      }}
    />
  );
}

const renderSuggestion = (createLabel: string) => (
  suggestion: Suggestion,
  params: RenderSuggestionParams
): JSX.Element => {
  const matches = match(suggestion.name, params.query);
  const parts = parse(suggestion.name, matches);

  return (
    <MenuItem selected={params.isHighlighted} component="div">
      <div>
        {(isExistingTag(suggestion)) ?
          parts.map((part: { text: string, highlight: boolean }, index: number) =>
            part.highlight ? (
              <span key={String(index)} style={{ fontWeight: 300 }}>
                {part.text}
              </span>
            ) : (
                <b key={String(index)} style={{ fontWeight: 500 }}>
                  {part.text}
                </b>
              )
          ) : (
            <>
              <span style={{ fontWeight: 300 }}>
                {`Créer le domaine `}
              </span>
              <b style={{ fontWeight: 500 }}>
                {suggestion.name}
              </b>
            </>
          )}
      </div>
    </MenuItem>
  );
};

function renderSuggestionsContainer(params: RenderSuggestionsContainerParams) {
  const { containerProps, children } = params;

  return (
    <Paper {...containerProps} square={true} style={{ zIndex: 999 }}>
      {children}
    </Paper>
  );
}

function getSuggestionValue(suggestion: Suggestion): string {
  return suggestion.name;
}

const styles = ({ spacing }: Theme) => createStyles({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
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
  suggestions: Suggestion[];
}

interface Props extends WithStyles<typeof styles> {
  tags: TagData[];
  label: string;
  prefix?: string;
  onTagCreationRequested?(tagName: string): void;
  onTagSelected(tag: TagData): void;
}

const mapStateToProps = (state: AppState) => ({
  tags: state.tags
});

export default (withStyles(styles)(
  connect(mapStateToProps)(
    withI18n()(class extends React.Component<Props & WithI18n, State> {
      state = {
        suggestions: [],
        search: ''
      };

      render() {
        const {
          classes,
          tags,
          label,
          onTagCreationRequested,
          onTagSelected,
          t
        } = this.props;
        const { suggestions, search } = this.state;

        const onSuggestionFetchRequested = ({ value }: Autosuggest.SuggestionsFetchRequestedParams): void => {
          const inputValue = value.trim();
          const inputLength = inputValue.length;
          const hasInput = inputValue.length > 0;

          const existingTags = hasInput ? tags.filter(tag =>
            tag.name.toLowerCase().slice(0, inputLength) === inputValue.toLowerCase()
          ).map(existingTag) : [];

          const fullMatch = existingTags.length === 1 && existingTags[0].name.toLowerCase() === value.toLowerCase();
          this.setState({
            suggestions: onTagCreationRequested && !fullMatch && hasInput
              ? [...existingTags, newTag(inputValue)]
              : existingTags
          });
        };

        const onSuggestionSelected = (
          _: React.FormEvent<HTMLInputElement>,
          { suggestion }: SuggestionSelectedEventData<Suggestion>
        ): void => {
          if (isExistingTag(suggestion)) {
            onTagSelected(suggestion.data);
          } else if (onTagCreationRequested) {
            onTagCreationRequested(suggestion.name);
          }
          this.setState({ search: '', suggestions: [] });
        };

        const onInputChange = (
          _: React.ChangeEvent<HTMLTextAreaElement>,
          { newValue }: Autosuggest.ChangeEvent): void => {
          this.setState({ search: newValue });
        };

        const onSuggestionClearRequested = () => this.setState({ suggestions: [] });

        const inputProps = {
          placeholder: label,
          classes: classes,
          value: search,
          onChange: onInputChange,
        };

        return (
          <TagAutosuggest
            theme={{
              container: classes.container,
              suggestionsContainerOpen: classes.suggestionsContainerOpen,
              suggestionsList: classes.suggestionsList,
              suggestion: classes.suggestion,
            }}
            onSuggestionsClearRequested={onSuggestionClearRequested}
            renderInputComponent={renderInputComponent}
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionFetchRequested}
            renderSuggestionsContainer={renderSuggestionsContainer}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion(t('tagSearch.createLabel'))}
            onSuggestionSelected={onSuggestionSelected}
            inputProps={inputProps}
          />
        );
      }
    })
  )));