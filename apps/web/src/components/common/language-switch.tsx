import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import { useLocale } from "next-intl";
import React, { startTransition } from "react";
import type { Locale } from "../../i18n/config";
import { setUserLocale } from "../../services/locale";

export const LanguageSwitch = () => {
	const locale = useLocale();

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	function onChange(value: string) {
		const locale = value as Locale;
		startTransition(() => {
			setUserLocale(locale);
		});
		handleClose();
	}

	return (
		<React.Fragment>
			<IconButton
				onClick={(event) => handleClick(event)}
				sx={{ color: "text.primary", mx: 1 }}
			>
				{/* {i18n.language.split("_")[0].toUpperCase()} */}
				<TranslateOutlinedIcon sx={{ width: 20, height: 20 }} />
			</IconButton>

			<Menu
				id="language-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}
			>
				<MenuItem onClick={() => onChange("en")} selected={locale === "en"}>
					{"English"}
				</MenuItem>
				<MenuItem onClick={() => onChange("fr")} selected={locale === "fr"}>
					{"Français"}
				</MenuItem>
			</Menu>
		</React.Fragment>
	);
};
