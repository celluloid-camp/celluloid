import CheckIcon from "@mui/icons-material/Check";
import TuneIcon from "@mui/icons-material/Tune";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import type React from "react";
import { useState } from "react";

export const AudioMenuButton = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const dispatch = useMediaDispatch();
  const mediaAudioTrackList = useMediaSelector(
    (state) => state.mediaAudioTrackList ?? [],
  );
  const mediaAudioTrackEnabled = useMediaSelector(
    (state) => state.mediaAudioTrackEnabled,
  );

  const label = open ? "close audio tracks menu" : "select audio track";

  return (
    <>
      <Tooltip title={label} placement="top">
        <IconButton
          aria-label={label}
          aria-controls={open ? "audio-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          color="primary"
        >
          <TuneIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="audio-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "audio-button" }}
      >
        {mediaAudioTrackList.map((audioTrack) => {
          const selected = audioTrack.id === mediaAudioTrackEnabled;
          return (
            <MenuItem
              key={audioTrack.id}
              selected={selected}
              onClick={() => {
                dispatch({
                  type: MediaActionTypes.MEDIA_AUDIO_TRACK_REQUEST,
                  detail: audioTrack.id,
                });
                handleClose();
              }}
            >
              {selected && <CheckIcon sx={{ mr: 1 }} />}
              {audioTrack.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
