import type { AutocompleteGetTagProps } from "@mui/base/useAutocomplete";
import CloseIcon from "@mui/icons-material/Close";
import {
  Autocomplete,
  type AutocompleteProps,
  styled,
  TextField,
  type TextFieldProps,
} from "@mui/material";

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string;
}

function Tag(props: TagProps) {
  const { label, onDelete, ...other } = props;
  return (
    <div {...other}>
      <span>{label}</span>
      <CloseIcon onClick={onDelete} />
    </div>
  );
}

const StyledTag = styled(Tag)<TagProps>(
  ({ theme }) => `
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#fafafa"
  };
  border: 1px solid ${theme.palette.mode === "dark" ? "#303030" : "#e8e8e8"};
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: ${theme.palette.mode === "dark" ? "#177ddc" : "#40a9ff"};
    background-color: ${theme.palette.mode === "dark" ? "#003b57" : "#e6f7ff"};
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
  }
`
);

type AutoCompleteTagsProps<T> = Omit<
  AutocompleteProps<T, true, false, true, typeof StyledTag>,
  "renderTags" | "renderInput"
> & {
  textFieldProps?: TextFieldProps;
};

export function AutoCompleteTags(props: AutoCompleteTagsProps<string>) {
  return (
    <Autocomplete
      {...props}
      multiple
      freeSolo
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <StyledTag  label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <TextField {...props.textFieldProps} {...params} />
      )}
    />
  );
}
