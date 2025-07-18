import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Paper,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ModalWrapper from "./ModalWrapper";
import axios from "../services/Api";
import useAlert from "../hooks/useAlert";
import DOCView from "./DOCView";

const PdfUploadModal = ({ imageOpen, setImageUploadOpen, rowData }) => {
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [selectedSubCategories, setSelectedSubCategories] = useState({});
  const [mappedFiles, setMappedFiles] = useState({});
  const [isDragging, setIsDragging] = useState(null);
  const fileInputRef = useRef({});
  const { setAlertMessage, setAlertOpen } = useAlert();
  const [loading, setLoading] = useState(false);
  const [uploadedAttachments, setUploadedAttachments] = useState([]);
  const [templateWrapperOpen, setTemplateWrapperOpen] = useState(false);
  const [attachment, setAttachment] = useState("");

  useEffect(() => {
    setSelectedSubCategories({});
    setMappedFiles({});
    axios
      .get("/api/getAllAttachmentCategory")
      .then((res) => {
        const categories = res.data.data;
        setMainCategories(categories);
        if (categories.length > 0) {
          handleMainCategorySelect(categories[0]);
        }
      })
      .catch(() => {
        setAlertMessage({ severity: "error", message: "Failed to load categories" });
        setAlertOpen(true);
      });
    if (rowData?.id) {
      getStudentAttachmentDetails();
    }
  }, [rowData?.id]);

  const getStudentAttachmentDetails = () => {
    axios
      .get(`/api/student/getStudentAttachmentDetails?student_id=${rowData?.id}`)
      .then((res) => {
        setUploadedAttachments(res.data.data || []);
      })
      .catch(() => {
        setAlertMessage({ severity: "error", message: "Failed to load attachments" });
        setAlertOpen(true);
      });
  };

  const fetchSubCategories = async (mainId) => {
    try {
      const res = await axios.get(
        `/api/getAttachCategoryDetails?attachments_category_id=${mainId}`
      );
      let subcategories = res.data.data;
      const excludedIds = [14, 15, 16, 17, 18, 19, 22, 21, 20];
      if (mainId === 3) {
        subcategories = subcategories.filter((item) => !excludedIds.includes(item.id));
      }
      setSubCategoriesMap((prev) => ({ ...prev, [mainId]: subcategories }));
    } catch {
      setAlertMessage({ severity: "error", message: "Failed to load subcategories" });
      setAlertOpen(true);
    }
  };

  const handleMainCategorySelect = (cat) => {
    const id = cat.attachments_category_id;
    setSelectedMainCategory(cat);
    setSelectedSubCategories({});
    setMappedFiles({});
    fetchSubCategories(id);
  };

  const handleSubCategoryToggle = (name) => {
    setSelectedSubCategories((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

    if (selectedSubCategories[name]) {
      if (mappedFiles[name]?.preview) {
        URL.revokeObjectURL(mappedFiles[name].preview);
      }
      const updated = { ...mappedFiles };
      delete updated[name];
      setMappedFiles(updated);
    }
  };

  const handleFilesForSubcategory = (subcatName, files) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    const validFiles = Array.from(files).filter((f) => allowedTypes.includes(f.type));

    if (!validFiles.length) {
      setAlertMessage({
        severity: "error",
        message: "Only JPEG or PNG files are allowed",
      });
      setAlertOpen(true);
      return;
    }

    const file = validFiles[0];
    const preview = URL.createObjectURL(file);

    setMappedFiles((prev) => ({
      ...prev,
      [subcatName]: { file, preview },
    }));
  };

  const deleteFile = (e, sub) => {
    e.preventDefault();
    e.stopPropagation();
    if (mappedFiles[sub]?.preview) {
      URL.revokeObjectURL(mappedFiles[sub].preview);
    }
    const newMap = { ...mappedFiles };
    delete newMap[sub];
    setMappedFiles(newMap);

    const newSubs = { ...selectedSubCategories };
    delete newSubs[sub];
    setSelectedSubCategories(newSubs);
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!selectedMainCategory || Object.keys(mappedFiles).length === 0) {
      setAlertMessage({ severity: "error", message: "Category & files required" });
      setAlertOpen(true);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append(
      "attachments_category_id",
      selectedMainCategory.attachments_category_id
    );
    formData.append("student_id", rowData?.id);

    const subcats = subCategoriesMap[selectedMainCategory.attachments_category_id] || [];
    subcats.forEach((sub) => {
      const name = sub.attachments_subcategory_name;
      const short = sub.attachments_subcategory_name_short;
      if (mappedFiles[name]?.file) {
        formData.append(short, mappedFiles[name].file);
      }
    });

    try {
      await axios.post("/api/student/uploadStudentAttachmentForStaff", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAlertMessage({ severity: "success", message: "Upload successful" });
      setAlertOpen(true);
      getStudentAttachmentDetails();
      setImageUploadOpen(false);
      setSelectedSubCategories({});
      setMappedFiles({});
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: err.response?.data?.message || "Upload failed",
      });
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const getUploadedFileForSubcategory = (subcatName) =>
    uploadedAttachments.find(
      (att) => att.attachments_subcategory_name === subcatName
    );

  const NoteBox = ({ icon, color, text, label }) => (
    <Box display="flex" alignItems="flex-start" gap={1}>
      <Box
        sx={{
          backgroundColor: color,
          width: 24,
          height: 24,
          borderRadius: "50%",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2">
        <strong>{label}:</strong> {text}
      </Typography>
    </Box>
  );

  const handleView = async (e, params) => {
    e.preventDefault();
    e.stopPropagation();
    setTemplateWrapperOpen(true)
    setAttachment(params.attachments_file_path)
  };

  return (
    <>
      <ModalWrapper
        open={templateWrapperOpen}
        setOpen={setTemplateWrapperOpen}
        maxWidth={1200}
      >
        <>
          {attachment && <DOCView
            attachmentPath={`/api/student/viewStudentFiles?fileName=${attachment}`}
          />}
        </>
      </ModalWrapper>
      <ModalWrapper open={imageOpen} setOpen={setImageUploadOpen} title="Upload File">
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography fontWeight={600} mb={1}>
                Main Categories
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {mainCategories.map((cat) => (
                  <Chip
                    key={cat.attachments_category_id}
                    label={cat.attachments_category_name}
                    onClick={() => handleMainCategorySelect(cat)}
                    color={
                      selectedMainCategory?.attachments_category_id ===
                        cat.attachments_category_id
                        ? "primary"
                        : "default"
                    }
                    clickable
                  />
                ))}
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
              <Typography fontWeight={600} mb={1}>
                Subcategories
              </Typography>
              {selectedMainCategory ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {(subCategoriesMap[selectedMainCategory.attachments_category_id] || []).map(
                    (sub) => (
                      <Chip
                        key={sub.id}
                        label={sub.attachments_subcategory_name}
                        onClick={() => handleSubCategoryToggle(sub.attachments_subcategory_name)}
                        variant={
                          selectedSubCategories[sub.attachments_subcategory_name]
                            ? "filled"
                            : "outlined"
                        }
                        color="secondary"
                        clickable
                      />
                    )
                  )}
                </Box>
              ) : (
                <Typography variant="body2">Select a main category to begin.</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderLeft: "4px solid #f44336",
                backgroundColor: "#fdecea",
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#b71c1c"
                gutterBottom
              >
                📌 Important Notes
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={2}>
                <Box sx={{ flex: "1 1 calc(50% - 8px)" }}>
                  <NoteBox
                    icon="⚠️"
                    color="#f44336"
                    label="Upload Guideline"
                    text="All documents must be JPEG or PNG and less than 200 KB."
                  />
                </Box>

                {selectedSubCategories["STUDY CERTIFICATE"] && (
                  <Box sx={{ flex: "1 1 calc(50% - 8px)" }}>
                    <NoteBox
                      icon="📘"
                      color="#1976d2"
                      label="Study Certificate"
                      text="Minimum 7 years from 1st to 12th standard."
                    />
                  </Box>
                )}

                {selectedSubCategories["MIGRATION CERTIFICATE"] && (
                  <Box sx={{ flex: "1 1 calc(50% - 8px)" }}>
                    <NoteBox
                      icon="📄"
                      color="#00796b"
                      label="Migration Certificate"
                      text="Applicable only for students other than Karnataka PUC Board."
                    />
                  </Box>
                )}

                {selectedSubCategories["EXPERIENCE CERTIFICATE"] && (
                  <Box sx={{ flex: "1 1 calc(50% - 8px)" }}>
                    <NoteBox
                      icon="💼"
                      color="#5d4037"
                      label="Experience Certificate"
                      text="Applicable only for working professional admissions."
                    />
                  </Box>
                )}

                {selectedSubCategories["SIGNATURE"] && (
                  <Box sx={{ flex: "1 1 calc(50% - 8px)" }}>
                    <NoteBox
                      icon="✍️"
                      color="#6a1b9a"
                      label="Signature"
                      text="Only the student's signature needs to be uploaded."
                    />
                  </Box>
                )}
              </Box>
            </Paper>

            {Object.entries(selectedSubCategories).some(([_, checked]) => checked) && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {Object.entries(selectedSubCategories)
                    .filter(([_, checked]) => checked)
                    .map(([subcatName]) => {
                      const uploadedFile = getUploadedFileForSubcategory(subcatName);

                      return (
                        <Grid item xs={12} sm={6} md={4} key={subcatName}>
                          <Box
                            onClick={() =>
                              fileInputRef.current[subcatName]?.click()
                            }
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragging(subcatName);
                            }}
                            onDragLeave={() => setIsDragging(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(null);
                              handleFilesForSubcategory(
                                subcatName,
                                e.dataTransfer.files
                              );
                            }}
                            sx={{
                              border: "2px dashed #90caf9",
                              borderRadius: "12px",
                              p: 3,
                              height: "230px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              textAlign: "center",
                              cursor: "pointer",
                              backgroundColor:
                                isDragging === subcatName ? "#e3f2fd" : "#fff",
                              transition: "0.3s",
                            }}
                          >
                            <input
                              ref={(el) => {
                                fileInputRef.current[subcatName] = el;
                              }}
                              type="file"
                              accept="image/jpeg,image/png"
                              hidden
                              onChange={(e) => {
                                handleFilesForSubcategory(
                                  subcatName,
                                  e.target.files
                                );
                                e.target.value = null;
                              }}
                            />
                            <Typography
                              fontWeight="bold"
                              mb={1}
                              sx={{ textTransform: "uppercase" }}
                            >
                              {subcatName}
                            </Typography>
                            <CloudUploadIcon
                              fontSize="large"
                              sx={{ color: "#3f51b5" }}
                            />
                            <Typography variant="body2" mt={1}>
                              Click or Drag JPEG, PNG
                            </Typography>

                            {uploadedFile && (
                              <Box mt={1}>
                                <Tooltip title="Click to view the previously uploaded file">
                                  <Button
                                    variant="outlined"
                                    color="success"
                                    size="small"
                                    onClick={(e) => handleView(e, uploadedFile)}
                                    startIcon={<VisibilityIcon />}
                                  >
                                    View Uploaded File
                                  </Button>
                                </Tooltip>
                              </Box>


                            )}

                            {mappedFiles[subcatName] && (
                              <Box
                                mt={2}
                                display="flex"
                                alignItems="center"
                                gap={1}
                              >
                                <Box
                                  component="img"
                                  src={mappedFiles[subcatName].preview}
                                  alt="preview"
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "6px",
                                    objectFit: "cover",
                                    border: "1px solid #ccc",
                                    cursor: "pointer",
                                    transition: "transform 0.2s ease-in-out",
                                    "&:hover": {
                                      transform: "scale(2)",
                                      zIndex: 10,
                                      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                                    },
                                  }}
                                />
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={0.5}
                                  maxWidth={130}
                                >
                                  <Tooltip
                                    title={mappedFiles[subcatName].file.name}
                                  >
                                    <Typography
                                      variant="body2"
                                      noWrap
                                      sx={{ maxWidth: "100%" }}
                                    >
                                      {mappedFiles[subcatName].file.name}
                                    </Typography>
                                  </Tooltip>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => deleteFile(e, subcatName)}
                                  >
                                    <HighlightOffIcon
                                      fontSize="small"
                                      color="error"
                                    />
                                  </IconButton>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                </Grid>
              </Paper>
            )}
          </Grid>
        </Grid>

        <Box mt={4} textAlign="right">
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              loading ||
              !selectedMainCategory ||
              Object.keys(mappedFiles).length === 0 ||
              Object.entries(selectedSubCategories).filter(([_, checked]) => checked)
                .length !== Object.keys(mappedFiles).length
            }
          >
            {loading ? <CircularProgress size={25} color="primary" /> : "Upload Files"}
          </Button>
        </Box>
      </ModalWrapper>
    </>
  );
};

export default PdfUploadModal;
