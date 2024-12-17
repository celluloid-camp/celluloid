import type React from "react";
import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Grid,
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
} from "@mui/material";
import { parseString, Builder } from "xml2js";

// Interface for RDF Metadata
interface RDFMetadata {
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

export const RDFDocumentEditor: React.FC = () => {
  // Initial state with null values from the XML
  const [metadata, setMetadata] = useState<RDFMetadata>({
    title: "",
    creator: "",
    subject: "",
    description: "",
    publisher: "",
    contributor: "",
    date: "",
    type: "",
    format: "",
    identifier: "",
    source: "",
    language: "",
    relation: "",
    coverage: "",
    rights: "",
  });

  // State for XML file content and save status
  const [xmlContent, setXmlContent] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newMetadata, setNewMetadata] = useState<{
    field: string;
    value: string;
  }>({
    field: "",
    value: "",
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

  // Load XML file on component mount
  useEffect(() => {
    const xmlDoc = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:dcterms="http://purl.org/dc/terms/"
>
<dcterms:title>test</dcterms:title>
</rdf:RDF>`;

    setXmlContent(xmlDoc);

    // Parse XML to set initial metadata
    parseString(xmlDoc, (err, result) => {
      if (err) {
        console.error("Error parsing XML", err);
        return;
      }

      const rdfData = result?.["rdf:RDF"] || {};
      const newMetadata: RDFMetadata = {
        title: rdfData["dcterms:title"]?.[0] ?? "",
        creator: rdfData["dcterms:creator"]?.[0] ?? "",
        subject: rdfData["dcterms:subject"]?.[0] ?? "",
        description: rdfData["dcterms:description"]?.[0] ?? "",
        publisher: rdfData["dcterms:publisher"]?.[0] ?? "",
        contributor: rdfData["dcterms:contributor"]?.[0] ?? "",
        date: rdfData["dcterms:date"]?.[0] ?? "",
        type: rdfData["dcterms:type"]?.[0] ?? "",
        format: rdfData["dcterms:format"]?.[0] ?? "",
        identifier: rdfData["dcterms:identifier"]?.[0] ?? "",
        source: rdfData["dcterms:source"]?.[0] ?? "",
        language: rdfData["dcterms:language"]?.[0] ?? "",
        relation: rdfData["dcterms:relation"]?.[0] ?? "",
        coverage: rdfData["dcterms:coverage"]?.[0] ?? "",
        rights: rdfData["dcterms:rights"]?.[0] ?? "",
      };

      setMetadata(newMetadata);
    });
  }, []);

  // Handle metadata field changes
  const handleMetadataChange = (field: keyof RDFMetadata, value: string) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save metadata to XML
  const saveMetadata = () => {
    const builder = new Builder({
      rootName: "rdf:RDF",
      xmldec: { version: "1.0", encoding: "UTF-8" },
      attrs: {
        "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "xmlns:dcterms": "http://purl.org/dc/terms/",
      },
    });

    const xmlObject = {
      "dcterms:title": [metadata.title],
      "dcterms:creator": [metadata.creator],
      "dcterms:subject": [metadata.subject],
      "dcterms:description": [metadata.description],
      "dcterms:publisher": [metadata.publisher],
      "dcterms:contributor": [metadata.contributor],
      "dcterms:date": [metadata.date],
      "dcterms:type": [metadata.type],
      "dcterms:format": [metadata.format],
      "dcterms:identifier": [metadata.identifier],
      "dcterms:source": [metadata.source],
      "dcterms:language": [metadata.language],
      "dcterms:relation": [metadata.relation],
      "dcterms:coverage": [metadata.coverage],
      "dcterms:rights": [metadata.rights],
    };

    const newXmlContent = builder.buildObject(xmlObject);
    setXmlContent(newXmlContent);

    // Simulate file save (in a real app, you'd use file system API)
    console.log("Saved XML:", newXmlContent);
    setSnackbarMessage("Metadata saved successfully!");
    setOpenSnackbar(true);
  };

  const handleAddMetadata = () => {
    if (newMetadata.field && newMetadata.value) {
      setMetadata((prev) => ({
        ...prev,
        [newMetadata.field.toLowerCase()]: newMetadata.value,
      }));
      setNewMetadata({ field: "", value: "" });
      setOpenDialog(false);
    }
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
                <strong>Term</strong>
              </TableCell>
              <TableCell>
                <strong>Value</strong>
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
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={value}
                      onChange={(e) =>
                        handleMetadataChange(
                          field as keyof RDFMetadata,
                          e.target.value
                        )
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button variant="contained" color="primary" onClick={saveMetadata}>
          Save Metadata
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setOpenDialog(true)}
        >
          Add New Metadata
        </Button>
      </Box>

      {/* Modified Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Metadata Field</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Term</InputLabel>
            <Select
              value={newMetadata.field}
              label="Term"
              onChange={(e) =>
                setNewMetadata((prev) => ({ ...prev, field: e.target.value }))
              }
            >
              {availableMetadataFields
                .filter((field) => !metadata[field as keyof RDFMetadata]) // Only show unused fields
                .map((field) => (
                  <MenuItem key={field} value={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Value"
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

      {/* Existing Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
