import CheckIcon from "@mui/icons-material/Check";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import ClosedCaptionDisabledIcon from "@mui/icons-material/ClosedCaptionDisabled";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import type React from "react";
import { useState } from "react";

export const CaptionsMenuButton = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const dispatch = useMediaDispatch();
  const mediaSubtitlesList = useMediaSelector(
    (state) => state.mediaSubtitlesList ?? [],
  );
  const mediaSubtitlesShowing = useMediaSelector(
    (state) => state.mediaSubtitlesShowing ?? [],
  );
  const subtitlesOff = !mediaSubtitlesShowing?.length;

  const IconComponent = subtitlesOff
    ? ClosedCaptionDisabledIcon
    : ClosedCaptionIcon;
  const label = open ? "close subtitles menu" : "select subtitles";

  return (
    <>
      <Tooltip title={label} placement="top">
        <IconButton
          aria-label={label}
          aria-controls={open ? "captions-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          color="primary"
        >
          <IconComponent />
        </IconButton>
      </Tooltip>
      <Menu
        id="captions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "captions-button" }}
      >
        <MenuItem
          onClick={() => {
            dispatch({
              type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
              detail: false,
            });
            handleClose();
          }}
        >
          {subtitlesOff && <CheckIcon sx={{ mr: 1 }} />}
          None
        </MenuItem>
        {mediaSubtitlesList.map((subtitleTrack) => {
          const selected = mediaSubtitlesShowing.some(
            (showingSubtitle) => showingSubtitle.label === subtitleTrack.label,
          );
          return (
            <MenuItem
              key={subtitleTrack.id ?? subtitleTrack.label}
              selected={selected}
              onClick={() => {
                dispatch({
                  type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
                  detail: false,
                });
                dispatch({
                  type: MediaActionTypes.MEDIA_SHOW_SUBTITLES_REQUEST,
                  detail: subtitleTrack,
                });
                handleClose();
              }}
            >
              {selected && <CheckIcon sx={{ mr: 1 }} />}
              {subtitleTrack.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
