import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export const LanguageMenu = () => {
  const { i18n, t } = useTranslation();

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
        <MenuItem onClick={() => handleLangChange("en_US")}>
          {t("language-menu.english")}
        </MenuItem>
        <MenuItem onClick={() => handleLangChange("fr_FR")}>
          {t("language-menu.french")}
        </MenuItem>
        <MenuItem onClick={() => handleLangChange("es_ES")}>
          {t("language-menu.spanish")}
        </MenuItem>
        <MenuItem onClick={() => handleLangChange("hr_HR")}>
          {t("language.croatian")}
        </MenuItem>
        <MenuItem onClick={() => handleLangChange("ro_RO")}>
          {t("language.romanian")}
        </MenuItem>
        <MenuItem onClick={() => handleLangChange("id_ID")}>
          {t("language.indonesian")}
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};
