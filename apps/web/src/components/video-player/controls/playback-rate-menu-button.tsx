import CheckIcon from "@mui/icons-material/Check";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaSelector,
} from "media-chrome/react/media-store";
import type React from "react";
import { useState } from "react";

export const DEFAULT_RATES = [1, 1.2, 1.5, 1.7, 2];
export const DEFAULT_RATE = 1;

export const PlaybackRateMenuButton = ({
  rates = DEFAULT_RATES,
}: {
  rates?: number[];
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const dispatch = useMediaDispatch();
  const mediaPlaybackRate = useMediaSelector(
    (state) => state.mediaPlaybackRate,
  );

  return (
    <>
      <Button
        aria-controls={open ? "playback-rate-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        color="primary"
      >
        {`${mediaPlaybackRate ?? 1}×`}
      </Button>
      <Menu
        id="playback-rate-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "playback-rate-button" }}
      >
        {rates.map((rate) => {
          const selected = rate === mediaPlaybackRate;
          return (
            <MenuItem
              key={rate}
              selected={selected}
              onClick={() => {
                dispatch({
                  type: MediaActionTypes.MEDIA_PLAYBACK_RATE_REQUEST,
                  detail: rate,
                });
                handleClose();
              }}
            >
              {selected && <CheckIcon sx={{ mr: 1 }} />}
              {`${rate}×`}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
