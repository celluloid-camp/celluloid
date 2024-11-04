// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import { useState } from "react";
import {
  TextField,
  Typography,
  Box,
  IconButton,
  styled,
  type TypographyProps,
  type TextFieldProps,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useClickAway } from "@uidotdev/usehooks";

interface EditableTextProps {
  value: string;
  onSave: (e: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  textProps?: TypographyProps;
  textFieldProps?: TextFieldProps;
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
    onSave(tempValue);
    setIsEditing(false);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      ref={ref}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
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
            style={{ cursor: disabled ? "default" : "pointer", minHeight: 35 }}
            {...textProps}
          >
            {value}
          </Typography>
          {!disabled && hovering && (
            <IconButton
              onClick={handleEdit}
              color="default"
              sx={{ height: 35 }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </>
      )}
    </Box>
  );
};
