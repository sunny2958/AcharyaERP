import { useState, lazy, useEffect } from "react";
import { Grid, Box, Button, CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import axios from "../../../services/Api";
import useAlert from "../../../hooks/useAlert";
import FormWrapper from "../../../components/FormWrapper";
const CustomAutocomplete = lazy(() =>
  import("../../../components/Inputs/CustomAutocomplete")
);
const CustomTextField = lazy(() =>
  import("../../../components/Inputs/CustomTextField")
);
const CustomFileInput = lazy(() =>
  import("../../../components/Inputs/CustomFileInput")
);
const CustomRadioButtons = lazy(() =>
  import("../../../components/Inputs/CustomRadioButtons")
);
const StudentDetails = lazy(() => import("../../../components/StudentDetails"));

const formFields = {
  acYearId: "",
  totalAmount: "",
  paidType: "Fee Paid",
  remarks: "",
  hwAttachment: "",
};

const initialState = {
  auid: "",
  auidValue: "",
  formField: formFields,
  academicYearList: [],
  loading: false,
  hwLoading: false,
  studentDetail: null,
};

const requiredFields = ["acYearId", "totalAmount", "remarks", "paidType"];
const requiredAttachmentFields = ["hwAttachment"];

const HostelWaiverForm = () => {
  const [
    {
      auid,
      auidValue,
      formField,
      loading,
      studentDetail,
      academicYearList,
      hwLoading,
    },
    setState,
  ] = useState(initialState);
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const location = useLocation();
  const { setAlertMessage, setAlertOpen } = useAlert();

  useEffect(() => {
    if (!!location.state) setAuidAndFormField();
    setCrumbs([
      { name: "Hostel Waiver", link: "/HostelWaiverIndex" },
      { name: !!location.state ? "Update" : "Create" },
    ]);
    getAcademicYearData();
  }, []);

  const setAuidAndFormField = () => {
    getStudentDetailByAuid(location.state?.auid);
    setState((prevState) => ({
      ...prevState,
      formField: {
        ...prevState.formField,
        acYearId: location.state?.ac_year_id,
        totalAmount: location.state?.total_amount,
        remarks: location.state?.remarks,
        paidType: location.state?.type,
      },
    }));
  };

  const checks = {
    acYearId: [formField.acYearId !== ""],
    totalAmount: [formField.totalAmount !== ""],
    hwAttachment: [formField.hwAttachment !== ""],
    remarks: [formField.remarks !== ""],
    paidType: [formField.paidType !== ""],
  };

  const checksAttachment = {
    hwAttachment: [
      formField.hwAttachment !== "",
      formField.hwAttachment?.name?.endsWith(".pdf"),
      formField.hwAttachment?.size < 2000000,
    ],
  };

  const errorMessages = {
    acYearId: ["This field required"],
    totalAmount: ["This field is required"],
    hwAttachment: ["This field is required"],
    remarks: ["This field is required"],
    paidType: ["This field is required"],
  };

  const errorAttachmentMessages = {
    hwAttachment: [
      "This field is required",
      "Please upload a PDF",
      "Maximum size 2 MB",
    ],
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangeFormField = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formField: {
        ...prev.formField,
        [name]: name === "totalAmount" ? Number(value) : value,
      },
    }));
  };

  const handleChangeAdvance = (name, newValue) => {
    setState((prev) => ({
      ...prev,
      formField: {
        ...prev.formField,
        [name]: newValue,
      },
    }));
  };

  const handleFileDrop = (name, newFile) => {
    setState((prev) => ({
      ...prev,
      formField: {
        ...prev.formField,
        [name]: newFile,
      },
    }));
  };

  const handleFileRemove = (name) => {
    setState((prev) => ({
      ...prev,
      formField: {
        ...prev.formField,
        [name]: null,
      },
    }));
  };

  const setLoading = (val) => {
    setState((prevState) => ({
      ...prevState,
      loading: val,
    }));
  };

  const getStudentDetailByAuid = async (studentAuid) => {
    setState((prevState) => ({
      ...prevState,
      auidValue: studentAuid,
    }));
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/student/studentDetailsByAuid/${studentAuid}`
      );
      if (res.status === 200 || res.status === 201) {
        setState((prevState) => ({
          ...prevState,
          studentDetail: res?.data?.data[0],
        }));
        setLoading(false);
      }
    } catch (error) {
      setAlertMessage({
        severity: "error",
        message: "Unable to find student detail !!",
      });
      setAlertOpen(true);
      setLoading(false);
    }
  };

  const getAcademicYearData = async () => {
    try {
      const res = await axios.get(`api/academic/academic_year`);
      if (res.data.status === 200 || res.data.status === 201) {
        setState((prevState) => ({
          ...prevState,
          academicYearList: res?.data?.data.map((el) => ({
            label: el.ac_year,
            value: el.ac_year_id,
          })),
        }));
      }
    } catch (error) {
      setAlertMessage({
        severity: "error",
        message: "Something went wrong in academic year !!",
      });
      setAlertOpen(true);
    }
  };

  const requiredFieldsValid = () => {
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (Object.keys(checks).includes(field)) {
        const ch = checks[field];
        for (let j = 0; j < ch.length; j++) if (!ch[j]) return false;
      } else if (![field]) return false;
    }
    return true;
  };

  const isAttachmentValid = () => {
    for (let i = 0; i < requiredAttachmentFields.length; i++) {
      const field = requiredAttachmentFields[i];
      if (Object.keys(checksAttachment).includes(field)) {
        const ch = checksAttachment[field];
        for (let j = 0; j < ch.length; j++) if (!ch[j]) return false;
      } else if (![field]) return false;
    }
    return true;
  };

  const setHwLoading = (val) => {
    setState((prevState) => ({
      ...prevState,
      hwLoading: val,
    }));
  };

  const handleCreate = async () => {
    try {
      let payload = {
        student_id: studentDetail?.student_id,
        ac_year_id: formField.acYearId,
        total_amount: formField.totalAmount,
        type: formField.paidType,
        remarks: formField.remarks,
        active: true,
      };
      setHwLoading(true);
      if (!!location.state) {
        payload["hostel_waiver_id"] = location.state?.id;
        const res = await axios.put(
          `/api/finance/updatehostelwaiver/${location.state?.id}`,
          payload
        );
        if (formField.paidType === "Waiver" && !!formField.hwAttachment) {
          handleFileUpload(
            formField.hwAttachment,
            res.data.data.hostel_waiver_id,
            "update"
          );
        } else {
          actionAfterResponse(res, "update");
        }
      } else {
        const res = await axios.post("api/finance/hostelwaiver", payload);
        if (formField.paidType === "Waiver" && !!formField.hwAttachment) {
          handleFileUpload(
            formField.hwAttachment,
            res.data.data.hostel_waiver_id,
            "create"
          );
        } else {
          actionAfterResponse(res, "create");
        }
      }
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: err.response ? err.response.data.message : "An error occured",
      });
      setAlertOpen(true);
      setHwLoading(false);
    }
  };

  const handleFileUpload = async (
    hwAttachment,
    hostel_waiver_id,
    methodType
  ) => {
    try {
      if (!!hostel_waiver_id) {
        const hostelWaiverFile = new FormData();
        hostelWaiverFile.append("hostel_waiver_id", hostel_waiver_id);
        hostelWaiverFile.append("file", hwAttachment);
        const res = await axios.post(
          "/api/finance/hostelWaiverUploadFile",
          hostelWaiverFile
        );
        actionAfterResponse(res, methodType);
      }
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: err.response ? err.response.data.message : "An error occured",
      });
      setAlertOpen(true);
      setHwLoading(false);
    }
  };

  const actionAfterResponse = (res, methodType) => {
    if (res.status === 200 || res.status === 201) {
      navigate("/HostelWaiverIndex", { replace: true });
      setAlertMessage({
        severity: "success",
        message: `Hostel waiver ${
          methodType == "update" ? "updated" : "created"
        } successfully !!`,
      });
    } else {
      setAlertMessage({ severity: "error", message: "Error Occured !!" });
    }
    setAlertOpen(true);
    setHwLoading(false);
  };

  return (
    <Box component="form" overflow="hidden" p={1} mt={2}>
      {!location.state && (
        <FormWrapper>
          <Grid container rowSpacing={4} columnSpacing={{ xs: 2, md: 4 }}>
            <Grid item xs={12} md={4}>
              <CustomTextField
                name="auid"
                label="Auid"
                value={auid}
                handleChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                style={{ borderRadius: 7 }}
                variant="contained"
                color="primary"
                disabled={loading || !auid}
                onClick={() => getStudentDetailByAuid(auid)}
              >
                {loading ? (
                  <CircularProgress
                    size={25}
                    color="blue"
                    style={{ margin: "2px 13px" }}
                  />
                ) : (
                  <strong>Submit</strong>
                )}
              </Button>
            </Grid>
          </Grid>
        </FormWrapper>
      )}

      {!!auidValue && (
        <div style={{ marginTop: "20px" }}>
          <StudentDetails id={auidValue} />
        </div>
      )}

      {!!auidValue && (
        <div style={{ marginTop: "20px" }}>
          <FormWrapper>
            <Grid container rowSpacing={4} columnSpacing={{ xs: 2, md: 4 }}>
              <Grid item xs={12} md={4}>
                <CustomAutocomplete
                  name="acYearId"
                  label="Academic Year"
                  value={formField.acYearId}
                  options={academicYearList}
                  handleChangeAdvance={handleChangeAdvance}
                  checks={checks.acYearId}
                  errors={errorMessages.acYearId}
                  disabled={!!location.state}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <CustomTextField
                  name="totalAmount"
                  label="Total Amount"
                  value={formField.totalAmount}
                  handleChange={handleChangeFormField}
                  checks={checks.totalAmount}
                  errors={errorMessages.totalAmount}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <CustomTextField
                  name="remarks"
                  label="Remarks"
                  value={formField.remarks}
                  handleChange={handleChangeFormField}
                  checks={checks.remarks}
                  errors={errorMessages.remarks}
                  multiline
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <Grid
                  container
                  rowSpacing={4}
                  columnSpacing={{ xs: 2, md: 4 }}
                  mt={1}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Grid item xs={12} md={3}>
                    <CustomRadioButtons
                      name="paidType"
                      label="Pay Type"
                      value={formField.paidType}
                      items={[
                        { value: "Waiver", label: "Waiver" },
                        { value: "Fee Paid", label: "Fee Paid" },
                      ]}
                      handleChange={handleChangeFormField}
                      disabled={!!location.state}
                      required
                    />
                  </Grid>
                  {formField.paidType == "Waiver" && (
                    <Grid item xs={12} md={4} ml={4}>
                      <CustomFileInput
                        name="hwAttachment"
                        label="Pdf File Attachment"
                        helperText="PDF - smaller than 2 MB"
                        file={formField.hwAttachment}
                        handleFileDrop={handleFileDrop}
                        handleFileRemove={handleFileRemove}
                        checks={checksAttachment.hwAttachment}
                        errors={errorAttachmentMessages.hwAttachment}
                        required
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12} align="right">
                <Button
                  style={{ borderRadius: 7 }}
                  variant="contained"
                  color="primary"
                  disabled={
                    hwLoading ||
                    (formField.paidType == "Fee Paid" &&
                      !requiredFieldsValid()) ||
                    (formField.paidType == "Waiver" &&
                      !location.state?.hw_attachment_path &&
                      !isAttachmentValid()) ||
                    !requiredFieldsValid() ||
                    (formField.paidType == "Waiver" &&
                      !!location.state?.hw_attachment_path &&
                      !requiredFieldsValid())
                  }
                  onClick={handleCreate}
                >
                  {hwLoading ? (
                    <CircularProgress
                      size={25}
                      color="blue"
                      style={{ margin: "2px 13px" }}
                    />
                  ) : (
                    <strong>{!!location.state ? "Update" : "Submit"}</strong>
                  )}
                </Button>
              </Grid>
            </Grid>
          </FormWrapper>
        </div>
      )}
    </Box>
  );
};

export default HostelWaiverForm;