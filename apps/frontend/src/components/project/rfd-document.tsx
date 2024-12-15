import type React from "react";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Snackbar,
  Alert,
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

  // Load XML file on component mount
  useEffect(() => {
    // Using the provided XML content
    const xmlDoc = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:dcterms="http://purl.org/dc/terms/"
>
<dcterms:title></dcterms:title>
<dcterms:creator></dcterms:creator>
<dcterms:subject></dcterms:subject>
<dcterms:description></dcterms:description>
<dcterms:publisher></dcterms:publisher>
<dcterms:contributor></dcterms:contributor>
<dcterms:date></dcterms:date>
<dcterms:type></dcterms:type>
<dcterms:format></dcterms:format>
<dcterms:identifier></dcterms:identifier>
<dcterms:source></dcterms:source>
<dcterms:language></dcterms:language>
<dcterms:relation></dcterms:relation>
<dcterms:coverage></dcterms:coverage>
<dcterms:rights></dcterms:rights>
</rdf:RDF>`;

    setXmlContent(xmlDoc);

    // Parse XML to set initial metadata
    parseString(xmlDoc, (err, result) => {
      if (err) {
        console.error("Error parsing XML", err);
        return;
      }

      const rdfData = result["rdf:RDF"];
      const newMetadata: RDFMetadata = {
        title: rdfData["dcterms:title"][0] || "",
        creator: rdfData["dcterms:creator"][0] || "",
        subject: rdfData["dcterms:subject"][0] || "",
        description: rdfData["dcterms:description"][0] || "",
        publisher: rdfData["dcterms:publisher"][0] || "",
        contributor: rdfData["dcterms:contributor"][0] || "",
        date: rdfData["dcterms:date"][0] || "",
        type: rdfData["dcterms:type"][0] || "",
        format: rdfData["dcterms:format"][0] || "",
        identifier: rdfData["dcterms:identifier"][0] || "",
        source: rdfData["dcterms:source"][0] || "",
        language: rdfData["dcterms:language"][0] || "",
        relation: rdfData["dcterms:relation"][0] || "",
        coverage: rdfData["dcterms:coverage"][0] || "",
        rights: rdfData["dcterms:rights"][0] || "",
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

  // Render metadata fields in a grid
  const renderMetadataFields = () => {
    const fields: (keyof RDFMetadata)[] = [
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

    return fields.map((field) => (
      <Grid item xs={12} sm={6} key={field}>
        <TextField
          fullWidth
          label={field.charAt(0).toUpperCase() + field.slice(1)}
          variant="outlined"
          value={metadata[field]}
          onChange={(e) => handleMetadataChange(field, e.target.value)}
          margin="normal"
        />
      </Grid>
    ));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Metadata
      </Typography>

      <Grid container spacing={2}>
        {renderMetadataFields()}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button variant="contained" color="primary" onClick={saveMetadata}>
          Save Metadata
        </Button>
      </Box>

      {/* Snackbar for save confirmation */}
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
