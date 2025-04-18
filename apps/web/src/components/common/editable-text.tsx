import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  IconButton,
  Stack,
  TextField,
  type TextFieldProps,
  Typography,
  type TypographyProps,
  styled,
} from "@mui/material";
import { useClickAway } from "@uidotdev/usehooks";
import React from "react";
import { useState } from "react";

interface EditableTextProps {
  value?: string | null;
  onSave: (e: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  textProps?: TypographyProps;
  textFieldProps?: TextFieldProps;
  placeholder?: string;
}

const StyledTextField = styled(TextField)({
  "& .MuiInput-root": {
    fontSize: "inherit",
    fontFamily: "inherit",
    color: "inherit",
    padding: 0,
    margin: 0,
    border: "none",
    "&:before, &:after": {
      display: "none",
    },
  },
});

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  onBlur,
  textProps,
  placeholder,
  textFieldProps,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [hovering, setHovering] = useState(false);

  const ref = useClickAway(() => {
    setIsEditing(false);
  });

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };
  const handleSave = () => {
    if (tempValue) {
      onSave(tempValue);
      setIsEditing(false);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      ref={ref}
      onMouseEnter={() => !disabled && setHovering(true)}
      onMouseLeave={() => !disabled && setHovering(false)}
    >
      {isEditing ? (
        <>
          <StyledTextField
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={onBlur}
            variant="standard"
            autoFocus
            disabled={disabled}
            placeholder={placeholder}
            {...textFieldProps}
          />
          <IconButton onClick={handleSave} color="success">
            <CheckIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton onClick={handleCancel} color="secondary">
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </>
      ) : (
        <>
          <Typography
            onClick={handleEdit}
            style={{ cursor: disabled ? "default" : "pointer" }}
            {...textProps}
          >
            {value || placeholder}
          </Typography>
          {!disabled && hovering && (
            <IconButton
              onClick={handleEdit}
              color="default"
              sx={{ height: 20, width: 20, marginLeft: 1 }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </>
      )}
    </Box>
  );
};
