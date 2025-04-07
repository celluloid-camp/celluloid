import { useState, forwardRef } from "react";
import {
	TextField,
	IconButton,
	InputAdornment,
	type TextFieldProps,
	Tooltip,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslations } from "next-intl";

export interface PasswordInputProps extends Omit<TextFieldProps, "type"> {}

export const PasswordInput = forwardRef<HTMLDivElement, PasswordInputProps>(
	({ ...props }, ref) => {
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
				ref={ref}
				{...props}
				type={showPassword ? "text" : "password"}
				// Add the slotProps for future compatibility
				slotProps={{
					...props.slotProps,
					input: {
						...props.slotProps?.input,
						endAdornment,
					},
				}}
			/>
		);
	},
);

PasswordInput.displayName = "PasswordInput";
