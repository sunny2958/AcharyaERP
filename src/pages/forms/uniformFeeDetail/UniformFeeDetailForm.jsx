import { useState, lazy, useEffect } from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  TableCell,
  TableBody,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import axios from "../../../services/Api";
import useAlert from "../../../hooks/useAlert";
import FormWrapper from "../../../components/FormWrapper";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
const CustomAutocomplete = lazy(() =>
  import("../../../components/Inputs/CustomAutocomplete")
);
const CustomMultipleAutocomplete = lazy(() =>
  import("../../../components/Inputs/CustomMultipleAutocomplete")
);
const CustomTextField = lazy(() =>
  import("../../../components/Inputs/CustomTextField")
);

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    borderRadius: 40,
    maxWidth: "100%",
    margin: "20px 0",
  },
  tableBody: {
    height: 10,
  },
  bg: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.headerWhite.main,
    padding: "6px",
    textAlign: "center",
  },
  table: {
    "& .MuiTableCell-root": {
      minWidth: 100,
      border: "1px solid rgba(192,192,192,1)",
      fontSize: "15px",
      marginRight: "auto",
      marginLeft: "auto",
      marginTop: "50px",
    },
  },
}));

const formFields = {
  acYearId: "",
  schoolId: "",
  programId: "",
  programSpecializationId: [],
  feetype: "",
};

const initialState = {
  formField: formFields,
  voucherHeadFormField: [],
  semesterHeaderList: [],
  academicYearList: [],
  schoolList: [],
  programList: [],
  programmeSpecializationList: [],
  loading: false,
  voucherHeadList: [],
  numberOfSem: 0,
};

const requiredFields = [
  "acYearId",
  "schoolId",
  "programId",
  "programSpecializationId",
  "feetype",
];

const feeTypeList = [
  { label: "ADD ON", value: "addOn" },
  { label: "UNIFORM", value: "uniform" },
];

let voucherHeadFormFields = {};

const UniformFeeDetailForm = () => {
  const [
    {
      formField,
      academicYearList,
      schoolList,
      programList,
      programmeSpecializationList,
      loading,
      voucherHeadList,
      voucherHeadFormField,
      semesterHeaderList,
    },
    setState,
  ] = useState(initialState);
  const classes = useStyles();
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const { setAlertMessage, setAlertOpen } = useAlert();

  useEffect(() => {
    setCrumbs([
      { name: "Third Party Fee", link: "/ThirdPartyFeeIndex" },
      { name: "Create" },
    ]);
    getAcademicYearData();
    getSchoolData();
    getVoucherHeadList();
  }, []);

  const checks = {
    acYearId: [formField.acYearId !== ""],
    schoolId: [formField.schoolId !== ""],
    programId: [formField.programId !== ""],
    programSpecializationId: [formField.programSpecializationId?.length > 0],
    feetype: [formField.feeType !== ""],
  };

  const errorMessages = {
    schoolId: ["This field required"],
    acYearId: ["This field is required"],
    programSpecializationId: ["This field is required"],
    feetype: ["This field is required"],
  };

  const getAcademicYearData = async () => {
    await axios
      .get(`api/academic/academic_year`)
      .then((res) => {
        setState((prevState) => ({
          ...prevState,
          academicYearList: res?.data?.data.map((el) => ({
            label: el.ac_year,
            value: el.ac_year_id,
          })),
        }));
      })
      .catch((err) => console.error(err));
  };

  const getSchoolData = async () => {
    try {
      const res = await axios.get(`api/institute/school`);
      if (res?.data?.data?.length) {
        setState((prevState) => ({
          ...prevState,
          schoolList: res?.data?.data.map((el) => ({
            label: el.school_name,
            value: el.school_id,
          })),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getProgramData = async (schoolId) => {
    try {
      if (!!(schoolId && formField.acYearId)) {
        const res = await axios.get(
          `/api/otherFeeDetails/getProgramsDetails?schooldId=${schoolId}`
        );
        if (res?.data?.data?.length) {
          setState((prevState) => ({
            ...prevState,
            programList: res?.data?.data.map((el) => ({
              label: el.programName,
              value: el.programId,
              numberOfSem: el.numberOfSem,
            })),
          }));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getProgramSpecializationData = async (programId) => {
    try {
      if (!!(formField.schoolId && programId)) {
        const response = await axios.get(
          `/api/academic/FetchProgramSpecialization/${formField.schoolId}/${programId}`
        );
        if (response?.data?.data?.length) {
          setState((prevState) => ({
            ...prevState,
            programmeSpecializationList: response.data.data.map((el) => ({
              label: el.program_specialization_short_name,
              value: el.program_specialization_id,
            })),
          }));
        }
        handleVoucherHeadForm(programId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVoucherHeadForm = (programId) => {
    const numberOfSem = programList.find(
      (el) => el.value == programId
    ).numberOfSem;
    const semesterHeaderList = Array.from(
      { length: numberOfSem },
      (_, i) => `sem${i + 1}`
    );

    for (let i = 1; i <= numberOfSem; i++) {
      voucherHeadFormFields[`sem${i}`] = 0;
      voucherHeadFormFields["voucherHeadId"] = "";
      voucherHeadFormFields["total"] = 0;
    }
    setState((prevState) => ({
      ...prevState,
      semesterHeaderList: semesterHeaderList,
      voucherHeadFormField: [{ ...voucherHeadFormFields }],
    }));
  };

  const handleProgram = () => {
    setState((prevState) => ({
      ...prevState,
      programList: [],
      formField: {
        ...prevState.formField,
        programId: null,
      },
    }));
  };

  const handleProgramSpecialization = () => {
    setState((prevState) => ({
      ...prevState,
      programmeSpecializationList: [],
      formField: {
        ...prevState.formField,
        programSpecializationId: [],
      },
    }));
  };

  const handleChangeAdvance = (name, newValue) => {
    if (name == "schoolId") {
      handleProgram();
      getProgramData(newValue);
    } else if (name == "programId") {
      handleProgramSpecialization();
      getProgramSpecializationData(newValue);
    }
    setState((prev) => ({
      ...prev,
      formField: {
        ...prev.formField,
        [name]: newValue,
      },
    }));
  };

  const getVoucherHeadList = async () => {
    try {
      const response = await axios.get(`/api/otherFeeDetails/getVoucherHeads`);
      if (response?.data?.data?.length) {
        setState((prevState) => ({
          ...prevState,
          voucherHeadList: response.data.data.map((el) => ({
            label: el.voucher_head_short_name,
            value: el.voucher_head_id,
          })),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeFormField = (e, i) => {
    if (voucherHeadFormField.length > 0) {
      let { name, value } = e.target;
      const onChangeReqVal = JSON.parse(JSON.stringify(voucherHeadFormField));
      if (name !== "voucherHeadId") {
        onChangeReqVal[i][name] = Number(value);
      } else {
        onChangeReqVal[i][name] = value;
      }
      onChangeReqVal[i].total = semesterHeaderList.reduce((sum, current) => {
        return sum + Number(onChangeReqVal[i][current]);
      }, 0);

      setState((prev) => ({
        ...prev,
        voucherHeadFormField: onChangeReqVal,
      }));
    }
  };

  const isOptionDisabled = (option, index) => {
    for (let i = 0; i < index; i++) {
      if (voucherHeadFormField[i].voucherHeadId === option.value) {
        return true;
      }
    }
    return false;
  };

  const addRow = () => {
    setState((prevState) => ({
      ...prevState,
      voucherHeadFormField: [...voucherHeadFormField, voucherHeadFormFields],
    }));
  };

  const removeRow = (event) => {
    event.preventDefault();
    const filterVoucherHeadFormField = [...voucherHeadFormField];
    filterVoucherHeadFormField.pop();
    setState((prevState) => ({
      ...prevState,
      voucherHeadFormField: filterVoucherHeadFormField,
    }));
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

  const isVoucherHeadFormValid = () => {
    for (let i = 0; i < voucherHeadFormField.length; i++) {
      const field = voucherHeadFormField[i]?.voucherHeadId;
      if (!field) return false;
    }
    return true;
  };

  const setLoading = (val) => {
    setState((prevState) => ({
      ...prevState,
      loading: val,
    }));
  };

  const actionAfterResponse = (res) => {
    if (res.status === 200 || res.status === 201) {
      navigate("/ThirdPartyFeeIndex", { replace: true });
      setAlertMessage({
        severity: "success",
        message: "Third party fee created successfully !!",
      });
      setLoading(false);
    } else {
      setAlertMessage({ severity: "error", message: "Error Occured" });
      setLoading(false);
    }
    setAlertOpen(true);
  };

  const onSubmit = async () => {
    if (!isVoucherHeadFormValid()) {
      setAlertMessage({
        severity: "error",
        message: "please select voucher head list !!",
      });
      setAlertOpen(true);
    } else {
      try {
        setLoading(true);
        let payload = {
          ...formField,
          otherFeeDetailsDTOs: voucherHeadFormField,
        };
        const res = await axios.post("/api/otherFeeDetails/createOtherFees", {
          ...payload,
        });
        actionAfterResponse(res);
      } catch (err) {
        setLoading(false);
        setAlertMessage({
          severity: "error",
          message: err.response
            ? err.response.data.message
            : "An error occured",
        });
        setAlertOpen(true);
      }
    }
  };

  return (
    <Box component="form" overflow="hidden" p={1} mt={2}>
      <FormWrapper>
        <Grid container rowSpacing={4} columnSpacing={{ xs: 2, md: 4 }}>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="acYearId"
              label="Academic Year"
              value={academicYearList.length > 0 ? formField.acYearId : ""}
              options={academicYearList}
              handleChangeAdvance={handleChangeAdvance}
              checks={checks.acYearId}
              errors={errorMessages.acYearId}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="schoolId"
              label="School"
              value={schoolList.length > 0 ? formField.schoolId : ""}
              options={schoolList}
              handleChangeAdvance={handleChangeAdvance}
              checks={checks.schoolId}
              errors={errorMessages.schoolId}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="programId"
              label="Program"
              value={programList.length > 0 ? formField.programId : ""}
              options={programList}
              handleChangeAdvance={handleChangeAdvance}
              checks={checks.programId}
              errors={errorMessages.programId}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomMultipleAutocomplete
              name="programSpecializationId"
              label="Program Specialization"
              value={formField.programSpecializationId}
              options={programmeSpecializationList}
              handleChangeAdvance={handleChangeAdvance}
              checks={checks.programSpecializationId}
              errors={errorMessages.programSpecializationId}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="feetype"
              label="Fee Type"
              value={feeTypeList.length > 0 ? formField.feetype : ""}
              options={feeTypeList}
              handleChangeAdvance={handleChangeAdvance}
              checks={checks.feetype}
              errors={errorMessages.feetype}
              required
            />
          </Grid>
        </Grid>

        {/* ACERP amount,added and deducted ui */}

        {voucherHeadFormField.length > 0 && (
          <Grid container mt={3}>
            <Grid item xs={12} md={12}>
              <TableContainer
                component={Paper}
                className={classes.tableContainer}
              >
                <Table
                  size="small"
                  aria-label="simple table"
                  style={{ width: "100%" }}
                >
                  <TableHead>
                    <TableRow className={classes.bg}>
                      <TableCell sx={{ color: "white" }}>
                        Voucher Head
                      </TableCell>
                      {!!semesterHeaderList.length &&
                        semesterHeaderList.map((obj, index) => (
                          <TableCell sx={{ color: "white" }}>{`Sem ${
                            index + 1
                          }`}</TableCell>
                        ))}
                      <TableCell sx={{ color: "white" }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className={classes.tableBody}>
                    {!!voucherHeadFormField.length &&
                      voucherHeadFormField.map((el, pId) => (
                        <TableRow>
                          <TableCell sx={{ width: "200px" }}>
                            <FormControl size="small" fullWidth>
                              <Select
                                label=""
                                value={
                                  !!voucherHeadList.length > 0
                                    ? el.voucherHeadId
                                    : ""
                                }
                                name="voucherHeadId"
                                onChange={(e) => handleChangeFormField(e, pId)}
                              >
                                <MenuItem value="">None</MenuItem>
                                {voucherHeadList.map((option, idx) => (
                                  <MenuItem
                                    key={idx}
                                    value={option.value}
                                    disabled={isOptionDisabled(option, pId)}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          {semesterHeaderList.length &&
                            semesterHeaderList.map((ele, id) => (
                              <TableCell>
                                <Typography variant="subtitle2">
                                  <CustomTextField
                                    name={[`sem${id + 1}`]}
                                    label=""
                                    value={el[`sem${id + 1}`]}
                                    handleChange={(e) =>
                                      handleChangeFormField(e, pId)
                                    }
                                    type="number"
                                  />
                                </Typography>
                              </TableCell>
                            ))}
                          <TableCell>{el.total}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant="contained"
                color="success"
                sx={{
                  borderRadius: 2,
                }}
                onClick={addRow}
              >
                <AddIcon />
              </Button>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant="contained"
                color="error"
                sx={{
                  borderRadius: 2,
                }}
                onClick={(e) => removeRow(e)}
              >
                <RemoveIcon />
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginX: "20px",
              }}
            >
              <Button
                style={{ borderRadius: 7 }}
                variant="contained"
                color="primary"
                disabled={!requiredFieldsValid() || loading}
                onClick={onSubmit}
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
        )}
      </FormWrapper>
    </Box>
  );
};

export default UniformFeeDetailForm;
