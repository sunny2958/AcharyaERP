import { useState, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Button,
  IconButton,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import GridIndex from "../../../components/GridIndex";
import { Check, HighlightOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CustomModal from "../../../components/CustomModal";
import axios from "../../../services/Api";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PrintIcon from "@mui/icons-material/Print";
import ModalWrapper from "../../../components/ModalWrapper";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import CustomDatePicker from "../../../components/Inputs/CustomDatePicker";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import { makeStyles } from "@mui/styles";
import useAlert from "../../../hooks/useAlert";

const initialValues = {
  courseId: null,
  dateOfExam: null,
  timeSlotId: null,
  minMarks: "",
  maxMarks: "",
};

const useStyles = makeStyles((theme) => ({
  bg: {
    background: theme.palette.primary.main,
    color: theme.palette.headerWhite.main,
  },
}));

const requiredFields = ["courseId", "timeSlotId"];

function SessionAssignmentIndex() {
  const [rows, setRows] = useState([]);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAssignOpen, setModalAssignOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [timeSlotsOptions, setTimeSlotOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [internalData, setInternalData] = useState([]);
  const [validation, setValidation] = useState(null);
  const [validationFields, setValidationFields] = useState(false);
  const [internalId, setInternalId] = useState(null);

  const navigate = useNavigate();
  const classes = useStyles();
  const { setAlertMessage, setAlertOpen } = useAlert();

  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const d = new Date(values.dateOfExam);

  const days = weekday[d.getDay()];

  const checks = {
    minMarks: [values.minMarks !== "", /^[0-9]{1,10}$/.test(values.minMarks)],
    maxMarks: [values.maxMarks !== "", /^[0-9]{1,10}$/.test(values.maxMarks)],
  };

  const errorMessages = {
    minMarks: ["This field is required", "Enter Only Numbers"],
    maxMarks: ["This field is required", "Enter Only Numbers"],
  };

  const columns = [
    { field: "internal_name", headerName: "Session", flex: 1 },
    {
      field: "from_date",
      headerName: "From Date",
      flex: 1,
      type: "date",
      valueGetter: (params) => new Date(params.row.from_date),
    },
    {
      field: "to_date",
      headerName: "To Date",
      flex: 1,
      type: "date",
      valueGetter: (params) => new Date(params.row.to_date),
    },
    { field: "ac_year", headerName: "AC Year", flex: 1 },
    { field: "school_name_short", headerName: " School Name", flex: 1 },
    { field: "program_short_name", headerName: "Program", flex: 1 },
    {
      field: "program_specialization_short_name",
      headerName: "Specialization",
      flex: 1,
    },
    { field: "year_sem", headerName: "Year/Sem", flex: 1 },
    {
      field: "countOfStudent",
      headerName: "Count",
      flex: 1,
      renderCell: (params) => {
        <Box sx={{ width: "100%" }}>
          <Typography
            variant="subtitle2"
            component="span"
            color="primary.main"
            sx={{ cursor: "pointer" }}
          >
            {params.row.countOfStudent}
          </Typography>
        </Box>;
      },
    },
    {
      field: "created_username",
      headerName: "Created By",
      flex: 1,
      hide: true,
    },

    {
      field: "created_date",
      headerName: "Created Date",
      flex: 1,
      type: "date",
      valueGetter: (params) => new Date(params.row.created_date),
      hide: true,
    },
    {
      field: "add",
      headerName: "Assign",
      type: "actions",
      flex: 1,
      getActions: (params) => [
        <IconButton color="primary" onClick={() => handleDetails(params)}>
          <AssignmentIcon />
        </IconButton>,
      ],
    },
    {
      field: "assign",
      headerName: " Student Assign",
      type: "actions",
      flex: 1,
      getActions: (params) => [
        <IconButton
          color="primary"
          onClick={() =>
            navigate(
              `/SessionRoomInvigilatorAssignment/Assign/${params.row.id}`
            )
          }
        >
          <AssignmentIndIcon />
        </IconButton>,
      ],
    },
    {
      field: "id",
      type: "actions",
      flex: 1,
      headerName: "Update",
      getActions: (params) => [
        <IconButton
          onClick={() =>
            navigate(`/SessionAssignmentForm/Update/${params.row.id}`)
          }
        >
          <EditIcon />
        </IconButton>,
      ],
    },

    {
      field: "active",
      headerName: "Active",
      flex: 1,
      type: "actions",
      getActions: (params) => [
        params.row.active === true ? (
          <IconButton
            style={{ color: "green" }}
            onClick={() => handleActive(params)}
          >
            <Check />
          </IconButton>
        ) : (
          <IconButton
            style={{ color: "red" }}
            onClick={() => handleActive(params)}
          >
            <HighlightOff />
          </IconButton>
        ),
      ],
    },
  ];
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    await axios
      .get(
        `/api/academic/fetchAllInternalSessionAssignment?page=${0}&page_size=${100}&sort=created_by`
      )
      .then((res) => {
        setRows(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const handleActive = async (params) => {
    const id = params.row.id;

    const handleToggle = async () => {
      if (params.row.active === true) {
        await axios
          .delete(`/api/academic/internalSessionAssignment/${id}`)
          .then((res) => {
            if (res.status === 200) {
              getData();
            }
          })
          .catch((err) => console.error(err));
      } else {
        await axios
          .delete(`/api/academic/activateinternalSessionAssignment/${id}`)
          .then((res) => {
            if (res.status === 200) {
              getData();
            }
          })
          .catch((err) => console.error(err));
      }
    };
    params.row.active === true
      ? setModalContent({
          title: "",
          message: "Do you want to make it Inactive ?",
          buttons: [
            { name: "Yes", color: "primary", func: handleToggle },
            { name: "No", color: "primary", func: () => {} },
          ],
        })
      : setModalContent({
          title: "",
          message: "Do you want to make it Active ?",
          buttons: [
            { name: "Yes", color: "primary", func: handleToggle },
            { name: "No", color: "primary", func: () => {} },
          ],
        });
    setModalOpen(true);
  };

  const handleDetails = async (params) => {
    setInternalId(params.row.id);
    setFromDate(params.row.from_date);
    setValues((prev) => ({ ...prev, ["dateOfExam"]: params.row.from_date }));
    setToDate(params.row.to_date);
    setModalAssignOpen(true);

    await axios
      .get(`/api/academic/getTimeSlotsForTimeTable/${params.row.school_id}`)
      .then((res) => {
        setTimeSlotOptions(
          res.data.data.map((obj) => ({
            value: obj.time_slots_id,
            label: obj.timeSlots,
          }))
        );
      })
      .catch((error) => console.error(error));

    await axios
      .get(
        `/api/academic/internalTimeTableForAllData/${params.row.school_id}/${params.row.program_id}/${params.row.program_specialization_id}/${params.row.ac_year_id}/${params.row.year_sem}`
      )
      .then((res) => {
        setCourseOptions(
          res.data.data.map((obj) => ({
            value: obj.course_id,
            label: obj.course,
          }))
        );
      })
      .catch((error) => console.error(error));

    await axios
      .get(`/api/academic/internalTimeTableDataBasisOfDOE/${params.row.id}`)
      .then((res) => {
        setInternalData(res.data.data);
      })
      .catch((error) => console.error(error));
  };

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangeAdvance = async (name, newValue) => {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const requiredFieldsValid = () => {
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (Object.keys(checks).includes(field)) {
        const ch = checks[field];
        for (let j = 0; j < ch.length; j++) if (!ch[j]) return false;
      } else if (!values[field]) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!requiredFieldsValid()) {
      setValidationFields(true);
    } else {
      setValidationFields(false);
      const temp = {};
      temp.active = true;
      temp.course_id = values.courseId;
      temp.date_of_exam = values.dateOfExam;
      temp.time_slots_id = values.timeSlotId;
      temp.week_day = days;
      temp.internal_id = internalId;
      temp.min_marks = values.minMarks;
      temp.max_marks = values.maxMarks;

      await axios
        .post(`/api/academic/internalTimeTable`, temp)
        .then((res) => {
          if (res.status === 200 || res.status === 201) {
            setAlertMessage({ severity: "success", message: "Created" });
            setAlertOpen(true);
            setModalAssignOpen(false);
            window.location.reload();
          }
        })
        .catch((err) => {
          setValidation(err.response.data.message);
        });
    }
  };

  return (
    <>
      <CustomModal
        open={modalOpen}
        setOpen={setModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        buttons={modalContent.buttons}
      />
      <ModalWrapper open={modalAssignOpen} setOpen={setModalAssignOpen}>
        <Grid
          container
          justifycontents="flex-start"
          rowSpacing={1}
          columnSpacing={2}
          mt={2}
        >
          <Grid item xs={12} md={2.4}>
            <CustomAutocomplete
              name="courseId"
              label="Course"
              value={values.courseId}
              options={courseOptions}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <CustomDatePicker
              name="dateOfExam"
              label="Date of Exam"
              value={values.dateOfExam}
              handleChangeAdvance={handleChangeAdvance}
              required
              minDate={fromDate}
              maxDate={toDate}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <CustomAutocomplete
              name="timeSlotId"
              label="Time Slots"
              value={values.timeSlotId}
              options={timeSlotsOptions}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <CustomTextField
              name="minMarks"
              label="Min Marks"
              value={values.minMarks}
              handleChange={handleChange}
              checks={checks.minMarks}
              errors={errorMessages.minMarks}
              required
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <CustomTextField
              name="maxMarks"
              label="Max Marks"
              value={values.maxMarks}
              handleChange={handleChange}
              checks={checks.maxMarks}
              errors={errorMessages.maxMarks}
              required
            />
          </Grid>
          <Grid item xs={11} textAlign="right">
            <IconButton
              onClick={() => navigate(`/InternalTimetablePdf/${internalId}`)}
              color="primary"
            >
              <PrintIcon />
            </IconButton>
          </Grid>
          <Grid item xs={1} textAlign="right">
            <Button
              variant="contained"
              sx={{ borderRadius: 2 }}
              onClick={handleSubmit}
            >
              SUBMIT
            </Button>
          </Grid>
        </Grid>
        <Grid container justifyContent="center">
          {internalData.length > 0 ? (
            <Grid item xs={12} md={10} mt={4}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow className={classes.bg}>
                      <TableCell sx={{ color: "white", width: 100 }}>
                        Exam Time
                      </TableCell>
                      <TableCell sx={{ color: "white", width: 100 }}>
                        Exam Date
                      </TableCell>
                      <TableCell sx={{ color: "white", width: 100 }}>
                        Exam Day
                      </TableCell>
                      <TableCell sx={{ color: "white", width: 100 }}>
                        Course
                      </TableCell>
                      <TableCell sx={{ color: "white", width: 100 }}>
                        Min Marks
                      </TableCell>
                      <TableCell sx={{ color: "white", width: 100 }}>
                        Max Marks
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {internalData.map((obj, i) => {
                      return (
                        <TableRow key={i}>
                          <TableCell>{obj.timeSlots}</TableCell>
                          <TableCell>{obj.date_of_exam.slice(0, 10)}</TableCell>
                          <TableCell>{obj.week_day}</TableCell>
                          <TableCell>{obj.course_name}</TableCell>
                          <TableCell>{obj.min_marks}</TableCell>
                          <TableCell>{obj.max_marks}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          ) : (
            <></>
          )}
          <Grid item xs={12} md={12} mt={2} align="center">
            <Typography color="red">{validation ? validation : ""}</Typography>
          </Grid>
          {validationFields ? (
            <Grid item xs={12} md={12} mt={2} align="center">
              <Typography color="red">
                Please fill all the required fields
              </Typography>
            </Grid>
          ) : (
            <></>
          )}
        </Grid>
      </ModalWrapper>

      <Box sx={{ position: "relative", mt: 8 }}>
        <Button
          onClick={() => navigate("/SessionAssignmentForm")}
          variant="contained"
          disableElevation
          sx={{ position: "absolute", right: 0, top: -57, borderRadius: 2 }}
          startIcon={<AddIcon />}
        >
          Create
        </Button>
        <GridIndex rows={rows} columns={columns} />
      </Box>
    </>
  );
}
export default SessionAssignmentIndex;
