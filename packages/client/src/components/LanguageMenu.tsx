import { Button, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export const LanguageMenu = () => {
  const { i18n } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLangChange = (lang: string) => {
    i18n.changeLanguage(lang, () => handleClose());
  };

  return (
    <React.Fragment>
      <Button
        onClick={(event) => handleClick(event)}
        sx={{ color: "text.primary" }}
      >
        {i18n.language.split("_")[0].toUpperCase()}
      </Button>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => handleLangChange("en_US")}>
          {`English`}
        </MenuItem>
        <MenuItem onClick={() => handleLangChange("fr_FR")}>
          {`Français`}
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};
