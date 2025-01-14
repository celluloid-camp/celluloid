import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu, { type MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { ProjectById } from "~/utils/trpc";
import { parseString, Builder } from "xml2js";
import { useTranslation } from "react-i18next";
import saveAs from "file-saver";
import { useSnackbar } from "notistack";
import type { DublinMetadata } from "../project/dubin-panel";

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
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
    ...theme.applyStyles("dark", {
      color: theme.palette.grey[300],
    }),
  },
}));

export default function DuplinExportButton({
  project,
  onImport,
}: {
  project: ProjectById;
  onImport: (metadata: DublinMetadata) => void;
}) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const { enqueueSnackbar } = useSnackbar();

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Save metadata to XML
  const handleExport = () => {
    handleClose();

    const builder = new Builder({
      xmldec: { version: "1.0", encoding: "UTF-8" },
    });

    const dublin = project.dublin;

    const xmlObject = {
      "rdf:RDF": {
        $: {
          "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          "xmlns:dcterms": "http://purl.org/dc/terms/",
        },

        "dcterms:title": [dublin?.title ?? ""],
        "dcterms:creator": [dublin?.creator ?? ""],
        "dcterms:subject": [dublin?.subject ?? ""],
        "dcterms:description": [dublin?.description ?? ""],
        "dcterms:publisher": [dublin?.publisher ?? ""],
        "dcterms:contributor": [dublin?.contributor ?? ""],
        "dcterms:date": [dublin?.date ?? ""],
        "dcterms:type": [dublin?.type ?? ""],
        "dcterms:format": [dublin?.format ?? ""],
        "dcterms:identifier": [dublin?.identifier ?? ""],
        "dcterms:source": [dublin?.source ?? ""],
        "dcterms:language": [dublin?.language ?? ""],
        "dcterms:relation": [dublin?.relation ?? ""],
        "dcterms:coverage": [dublin?.coverage ?? ""],
        "dcterms:rights": [dublin?.rights ?? ""],
      },
    };

    const data = builder.buildObject(xmlObject);
    // Simulate file save (in a real app, you'd use file system API)

    const blob = new Blob([data], {
      type: "text/xml;charset=utf-8",
    });
    saveAs(blob, "dublin.xml");

    enqueueSnackbar("Exported successfully", {
      variant: "success",
      key: "metadata.dublin.export.success",
    });
  };

  // Load XML file on component mount
  const handleImport = async () => {
    handleClose();
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "XML Files",
          accept: {
            "text/xml": [".xml"],
          },
        },
      ],
      multiple: false,
    });

    // Get the file
    const file = await fileHandle.getFile();
    const text = await file.text();

    // Parse XML to set initial metadata
    parseString(text, (err, result) => {
      if (err) {
        console.error("Error parsing XML", err);
        return;
      }

      const rdfData = result?.["rdf:RDF"] || {};
      const newMetadata = {
        title: rdfData["dcterms:title"]?.[0] ?? undefined,
        creator: rdfData["dcterms:creator"]?.[0] ?? undefined,
        subject: rdfData["dcterms:subject"]?.[0] ?? undefined,
        description: rdfData["dcterms:description"]?.[0] ?? undefined,
        publisher: rdfData["dcterms:publisher"]?.[0] ?? undefined,
        contributor: rdfData["dcterms:contributor"]?.[0] ?? undefined,
        date: rdfData["dcterms:date"]?.[0] ?? undefined,
        type: rdfData["dcterms:type"]?.[0] ?? undefined,
        format: rdfData["dcterms:format"]?.[0] ?? undefined,
        identifier: rdfData["dcterms:identifier"]?.[0] ?? undefined,
        source: rdfData["dcterms:source"]?.[0] ?? undefined,
        language: rdfData["dcterms:language"]?.[0] ?? undefined,
        relation: rdfData["dcterms:relation"]?.[0] ?? undefined,
        coverage: rdfData["dcterms:coverage"]?.[0] ?? undefined,
        rights: rdfData["dcterms:rights"]?.[0] ?? undefined,
      };

      const cleanMetadata = Object.fromEntries(
        Object.entries(newMetadata).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
      );

      onImport(cleanMetadata as DublinMetadata);
    });
  };

  return (
    <div>
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {t("metadata.dublin.option")}
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
        <MenuItem onClick={handleExport} disableRipple>
          {t("metadata.dublin.menu.export")}
        </MenuItem>
        {project.editable && (
          <MenuItem onClick={handleImport} disableRipple>
            {t("metadata.dublin.menu.import")}
          </MenuItem>
        )}
      </StyledMenu>
    </div>
  );
}
