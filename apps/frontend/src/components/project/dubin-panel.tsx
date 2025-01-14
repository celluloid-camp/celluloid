import type React from "react";
import { useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import DuplinExportButton from "../commun/button-duplin-export";
import { trpc, type ProjectById, type UserMe } from "~/utils/trpc";
import { useSnackbar } from "notistack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslation } from "react-i18next";

// Interface for RDF Metadata
export interface DublinMetadata {
  title: string;
  creator: string;
  subject: string;
  description: string;
  publisher: string;
  contributor: string;
  date: string;
  type: string;
  format: string;
  identifier: string;
  source: string;
  language: string;
  relation: string;
  coverage: string;
  rights: string;
}

interface DubinPanelProps {
  project: ProjectById;
}

export const DubinPanel: React.FC<DubinPanelProps> = ({ project, user }) => {
  // Initial state with null values from the XML
  const [metadata, setMetadata] = useState<DublinMetadata>(project.dublin);
  const { enqueueSnackbar } = useSnackbar();
  const utils = trpc.useUtils();

  const { t } = useTranslation();
  const [isChanged, setIsChanged] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [newMetadata, setNewMetadata] = useState<{
    field: string;
    value: string;
  }>({
    field: "",
    value: "",
  });

  const mutation = trpc.project.updateDublin.useMutation({
    onSuccess: () => {
      utils.project.byId.invalidate({ id: project.id });
      enqueueSnackbar("Metadata updated", {
        variant: "success",
      });
    },
  });

  // Add this constant for available metadata fields
  const availableMetadataFields = [
    "title",
    "creator",
    "subject",
    "description",
    "publisher",
    "contributor",
    "date",
    "type",
    "format",
    "identifier",
    "source",
    "language",
    "relation",
    "coverage",
    "rights",
  ];

  // Handle metadata field changes
  const handleMetadataChange = (field: keyof DublinMetadata, value: string) => {
    setIsChanged(true);
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddMetadata = async () => {
    if (newMetadata.field && newMetadata.value) {
      setMetadata((prev) => ({
        ...prev,
        [newMetadata.field.toLowerCase()]: newMetadata.value,
      }));

      setNewMetadata({ field: "", value: "" });
      setOpenDialog(false);
    }
  };

  const handleSave = async () => {
    await mutation.mutateAsync({
      projectId: project.id,
      dublin: metadata,
    });
    setIsChanged(false);
  };

  const handleImport = (metadata: DublinMetadata) => {
    setMetadata(metadata);
    setIsChanged(true);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Metadata Dublin
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>{t("metadata.dublin.term")}</strong>
              </TableCell>
              <TableCell>
                <strong>{t("metadata.dublin.value")}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(metadata)
              .filter(([_, value]) => value !== "") // Only show non-empty fields
              .map(([field, value]) => (
                <TableRow key={field}>
                  <TableCell>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={value}
                        disabled={!project.editable}
                        onChange={(e) =>
                          handleMetadataChange(
                            field as keyof DublinMetadata,
                            e.target.value
                          )
                        }
                        size="small"
                      />
                      {project.editable && value && (
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleMetadataChange(
                              field as keyof DublinMetadata,
                              ""
                            )
                          }
                          aria-label="clear field"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            <TableRow>
              <Button
                variant="text"
                onClick={() => {
                  setOpenDialog(true);
                }}
                disableRipple
              >
                {t("metadata.dublin.menu.add-term")}
              </Button>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        {project.editable && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!isChanged}
          >
            {t("commun.button.save")}
          </Button>
        )}
        <DuplinExportButton
          project={project}
          onImport={(metadata) => {
            handleImport(metadata);
          }}
        />
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Metadata Field</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t("metadata.dublin.term")}</InputLabel>
            <Select
              value={newMetadata.field}
              label={t("metadata.dublin.term")}
              onChange={(e) =>
                setNewMetadata((prev) => ({ ...prev, field: e.target.value }))
              }
            >
              {availableMetadataFields
                .filter((field) => !metadata[field as keyof DublinMetadata]) // Only show unused fields
                .map((field) => (
                  <MenuItem key={field} value={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label={t("metadata.dublin.value")}
            value={newMetadata.value}
            onChange={(e) =>
              setNewMetadata((prev) => ({ ...prev, value: e.target.value }))
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddMetadata}
            variant="contained"
            color="primary"
            disabled={!newMetadata.field || !newMetadata.value}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
