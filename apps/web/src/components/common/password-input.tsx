import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
  Tooltip,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { forwardRef, useState } from "react";

export interface PasswordInputProps extends Omit<TextFieldProps, "type"> {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ slotProps, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const t = useTranslations();

    const endAdornment = (
      <InputAdornment position="end">
        <Tooltip
          title={
            showPassword
              ? t("profile.security.show-password")
              : t("profile.security.hide-password")
          }
        >
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleTogglePasswordVisibility}
            onMouseDown={(e) => e.preventDefault()}
            edge="end"
            size="small"
            tabIndex={-1}
            data-testid="password-visibility-toggle"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </Tooltip>
      </InputAdornment>
    );

    return (
      <TextField
        {...props}
        type={showPassword ? "text" : "password"}
        inputRef={ref}
        slotProps={{
          ...slotProps,
          input: {
            ...slotProps?.input,
            endAdornment,
          },
        }}
      />
    );
  },
);

PasswordInput.displayName = "PasswordInput";
