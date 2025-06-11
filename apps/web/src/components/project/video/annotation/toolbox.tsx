import { Box, IconButton, Tooltip, SvgIcon } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import SquareOutlinedIcon from "@mui/icons-material/SquareOutlined";
import PolylineOutlinedIcon from "@mui/icons-material/PolylineOutlined";
import FiberManualRecordOutlinedIcon from "@mui/icons-material/FiberManualRecordOutlined";

export type ShapeType =
  | string
  | "rect"
  | "circle"
  | "polygon"
  | "ellipse"
  | "point";

interface ToolboxProps {
  shapeType: ShapeType;
  onShapeTypeChange: (type: ShapeType) => void;
  onDelete: () => void;
  hasSelectedShape: boolean;
}

const OvalIcon = () => (
  <SvgIcon>
    <path d="M12 5C7.58 5 4 7.25 4 10C4 12.75 7.58 15 12 15C16.42 15 20 12.75 20 10C20 7.25 16.42 5 12 5ZM12 13C8.69 13 6 11.65 6 10C6 8.35 8.69 7 12 7C15.31 7 18 8.35 18 10C18 11.65 15.31 13 12 13Z" />
  </SvgIcon>
);

export function Toolbox({
  shapeType,
  onShapeTypeChange,
  onDelete,
  hasSelectedShape,
}: ToolboxProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 1,
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <Tooltip
        title="Rectangle"
        placement="right"
        slotProps={{ tooltip: { sx: { userSelect: "none" } } }}
      >
        <IconButton
          onClick={() => onShapeTypeChange("rect")}
          color={shapeType === "rect" ? "primary" : "default"}
        >
          <SquareOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title="Circle"
        placement="right"
        slotProps={{ tooltip: { sx: { userSelect: "none" } } }}
      >
        <IconButton
          onClick={() => onShapeTypeChange("circle")}
          color={shapeType === "circle" ? "primary" : "default"}
        >
          <CircleOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title="Polygon"
        placement="right"
        slotProps={{ tooltip: { sx: { userSelect: "none" } } }}
      >
        <IconButton
          onClick={() => onShapeTypeChange("polygon")}
          color={shapeType === "polygon" ? "primary" : "default"}
        >
          <PolylineOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title="Ellipse"
        placement="right"
        slotProps={{ tooltip: { sx: { userSelect: "none" } } }}
      >
        <IconButton
          onClick={() => onShapeTypeChange("ellipse")}
          color={shapeType === "ellipse" ? "primary" : "default"}
        >
          <OvalIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title="Point"
        placement="right"
        slotProps={{ tooltip: { sx: { userSelect: "none" } } }}
      >
        <IconButton
          onClick={() => onShapeTypeChange("point")}
          color={shapeType === "point" ? "primary" : "default"}
        >
          <FiberManualRecordOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title="Delete"
        placement="right"
        slotProps={{ tooltip: { sx: { userSelect: "none" } } }}
      >
        <IconButton onClick={onDelete} color="error">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
