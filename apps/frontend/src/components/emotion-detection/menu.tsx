import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu, { type MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import {
  CircularProgress,
  ListItemText,
  MenuList,
  Typography,
} from "@mui/material";
import Check from "@mui/icons-material/Check";
import { useAutoDetectionStore } from "../emotion-detection/store";
import { AutoDetectionDialog } from "./dialog";
import { grey } from "@mui/material/colors";
import type { ProjectById, UserMe } from "~/utils/trpc";

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    borderColor: theme.palette.grey[800],
    color: theme.palette.grey[300],
    "& .MuiMenu-list": {
      padding: "4px 0",
      backgroundColor: theme.palette.background.dark,
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 16,
        color: theme.palette.grey[300],
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

export default function AutoDetectionMenu({
  project,
  user,
}: {
  project: ProjectById;
  user?: UserMe;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { autoDetection, setAutoDetection } = useAutoDetectionStore();

  const handleToggleAutoDetection = () => {
    setAutoDetection(!autoDetection);
    handleClose();
  };

  return (
    <div>
      {autoDetection ? (
        <AutoDetectionDialog
          project={project}
          user={user}
        />
      ) : null}
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="outlined"
        disableElevation
        size="small"
        onClick={handleClick}
        startIcon={
          autoDetection ? (
            <CircularProgress color="inherit" size={16} />
          ) : (
            <CameraAltIcon />
          )
        }
        endIcon={<KeyboardArrowDownIcon />}
      >
        Auto Detection
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuList dense>
          <MenuItem onClick={handleToggleAutoDetection}>
            {autoDetection ? <StopCircleIcon /> : <PlayCircleFilledWhiteIcon />}
            <Typography sx={{ fontSize: 14 }}>
              {autoDetection ? "Stop" : "Start"}
            </Typography>
          </MenuItem>
          <Divider sx={{ fontSize: 12, color: grey[500], borderColor: "red" }}>
            Emoji Recommendation
          </Divider>
          <MenuItem>
            <ListItemText>From All</ListItemText>
            <Check />
          </MenuItem>
          <MenuItem>
            <ListItemText>Only Me</ListItemText>
          </MenuItem>
        </MenuList>
      </StyledMenu>
    </div>
  );
}
