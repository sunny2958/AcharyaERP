import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Grid,
  Typography,
  Tooltip,
  tooltipClasses,
  Paper,
  styled,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
} from "@mui/material";
import GridIndex from "../../../components/GridIndex";
import { Check, HighlightOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import AddIcon from "@mui/icons-material/Add";
import SwapHorizontalCircleIcon from "@mui/icons-material/SwapHorizontalCircle";
import CustomModal from "../../../components/CustomModal";
import axios from "../../../services/Api";
import FormWrapper from "../../../components/FormWrapper";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import ModalWrapper from "../../../components/ModalWrapper";
import useAlert from "../../../hooks/useAlert";
import moment from "moment";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import CustomDatePicker from "../../../components/Inputs/CustomDatePicker";

const userID = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userId;
const schoolID = JSON.parse(sessionStorage.getItem("userData"))?.school_id;

const initialValues = {
  acYearId: null,
  courseId: null,
  employeeId: null,
  roomId: null,
  schoolId: schoolID || null,
  classDate: null,
  programId: null,
  yearSem: null,
};

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "white",
    color: "rgba(0, 0, 0, 0.6)",
    maxWidth: 300,
    fontSize: 12,
    // border: "1px solid rgba(224, 224, 224, 1)",
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px;",
    padding: "10px",
  },
}));

const useStyles = makeStyles((theme) => ({
  table: {
    "& .MuiTableCell-root": {},
  },
  bg: {
    backgroundColor: theme.palette.primary.main,
    textAlign: "center",
  },
  red: {
    background: "#ff9999 !important",
  },
}));

function FacultytimetableSchoolIndex() {
  const [rows, setRows] = useState([]);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [modalSelectContent, setModalSelectContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSelectOpen, setModalSelectOpen] = useState(false);
  const [ids, setIds] = useState([]);
  const [values, setValues] = useState(initialValues);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [programData, setProgramData] = useState();
  const [employeeDetailsOpen, setEmployeeDetailsOpen] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [previousEmployeeId, setPreviousEmployeeId] = useState(null);
  const [timeTableId, setTimeTableId] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [studentListOpen, setStudentListOpen] = useState(false);
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roomSwapOpen, setRoomSwapOpen] = useState(false);
  const [roomOptions, setRoomOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yearSemOptions, setYearSemOptions] = useState([]);
  const [isActive, setIsActive] = useState(true);

  const navigate = useNavigate();
  const { setAlertMessage, setAlertOpen } = useAlert();
  const classes = useStyles();
  const setCrumbs = useBreadcrumbs();

  const columns = [
    {
      field: "ac_year",
      headerName: "AC Year",
      flex: 1,
      hide: true,
    },
    {
      field: "school_name_short",
      headerName: "School",
      flex: 1,
      hide: true,
    },
    {
      field: "program_specialization_short_name",
      headerName: "Specialization",
      flex: 1,
      valueGetter: (value, row) =>
        row.program_specialization_short_name
          ? row.program_specialization_short_name +
          "-" +
          row.program_short_name
          : "NA",
    },
    {
      field: "",
      headerName: "Year/Sem",
      flex: 1,
      valueGetter: (value, row) =>
        row.current_year
          ? row.current_year
          : row.current_sem,
    },
    { field: "from_date", headerName: "From Date", flex: 1, hide: true },
    { field: "to_date", headerName: "To Date", flex: 1, hide: true },

    { field: "timeSlots", headerName: "Time Slots", flex: 1 },
    {
      field: "interval_type_short",
      headerName: "Interval Type",
      flex: 1,
      hide: true,
    },
    {
      field: "week_day",
      headerName: "Week Day",
      flex: 1,
      valueGetter: (value, row) =>
        row.week_day ? row.week_day.substr(0, 3) : "",
      hide: true,
    },
    {
      field: "selected_date",
      headerName: "Class date",
      flex: 1,
      valueGetter: (value, row) =>
        moment(row.selected_date).format("DD-MM-YYYY"),
    },

    {
      field: "course_code",
      headerName: "Course",
      renderCell: (params) => {
        return (
          <HtmlTooltip title={params.row.course_name}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ cursor: "pointer" }}
            >
              {params.row.course_code}
            </Typography>
          </HtmlTooltip>
        );
      },
    },
    {
      field: "empcode",
      headerName: "Emp Code",
      flex: 1,
      renderCell: (params) => {
        return (
          <HtmlTooltip
            title={`Employee : ${params.row.employee_name} & Dept : ${params.row.dept_name}`}
          >
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ cursor: "pointer" }}
            >
              {params.row.empcode}
            </Typography>
          </HtmlTooltip>
        );
      },
    },
    {
      field: "employee_name",
      headerName: "Faculty",
      flex: 1,
      hide: true,
    },
    { field: "roomcode", headerName: "Room Code", flex: 1 },
    {
      field: "section_name",
      headerName: "Section",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography
            variant="subtitle2"
            sx={{ cursor: "pointer", fontSize: 14, marginLeft: 2 }}
            onClick={() => handleStudentList(params)}
            color="primary"
          >
            {params.row.section_name ? params.row.section_name : "NA"}
          </Typography>
        );
      },
    },

    {
      field: "batch_name",
      headerName: "Batch",
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography
            variant="subtitle2"
            sx={{ cursor: "pointer", fontSize: 14, marginLeft: 2 }}
            onClick={() => handleStudentListForBatch(params)}
            color="primary"
          >
            {params.row.batch_name ? params.row.batch_name : "NA"}
          </Typography>
        );
      },
    },
    {
      field: "swap",
      headerName: "Swap",
      flex: 1,
      type: "actions",
      getActions: (params) => [
        <IconButton
          onClick={() => handleDetails(params)}
          color="primary"
          disabled={!params.row.active} // Disable if active is false
        >
          <SwapHorizontalCircleIcon />
        </IconButton>,
      ],
    },
    {
      field: "room_swap",
      headerName: "Room Swap",
      flex: 1,
      type: "actions",
      getActions: (params) => [
        <IconButton
          onClick={() => handleRoomSwap(params)}
          color="primary"
          disabled={!params.row.active} // Disable if active is false
        >
          <SwapHorizontalCircleIcon />
        </IconButton>,
      ],
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
      hide: true,
      valueGetter: (value, row) =>
        row.created_date
          ? moment(row.created_date).format("DD-MM-YYYY")
          : "",
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
    getSchoolData();
    setCrumbs([{}]);
  }, [values.acYearId, values.schoolId]);

  useEffect(() => {
    getAcYearData();
    getEmployeeData();
    getProgram();
  }, []);

  useEffect(() => {
    getData();
  }, [values.programId, values.classDate, isActive]);

  useEffect(() => {
    getCourseData();
  }, [values.employeeId]);

  const getProgram = async () => {
    const { schoolId } = values;
    if (!schoolId) return null;

    try {
      const { data: response } = await axios.get(
        `/api/academic/fetchAllProgramsWithSpecialization/${schoolId}`
      );
      const optionData = [];
      const responseData = response.data;
      response.data.forEach((obj) => {
        optionData.push({
          value: obj.program_specialization_id,
          label: `${obj.program_short_name} - ${obj.program_specialization_name}`,
          program_id: obj.program_id,
        });
      });
      const programObject = responseData.reduce((acc, next) => {
        acc[next.program_specialization_id] = next;
        return acc;
      }, {});
      setProgramOptions(optionData);
      setProgramData(programObject);
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message:
          err.response?.data?.message || "Failed to load the programs data",
      });
      setAlertOpen(true);
    }
  };

  const getAcYearData = async () => {
    try {
      const response = await axios.get("/api/academic/academic_year");
      const optionData = [];
      const ids = [];
      response.data.data.forEach((obj) => {
        optionData.push({ value: obj.ac_year_id, label: obj.ac_year });
        ids.push(obj.current_year);
      });
      const latestYear = Math.max(...ids);
      const latestYearId = response.data.data.filter(
        (obj) => obj.current_year === latestYear
      );
      setAcademicYearOptions(optionData);
      setValues((prev) => ({
        ...prev,
        acYearId: latestYearId[0].ac_year_id,
      }));
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: "Failed to fetch the academic years !!",
      });
      setAlertOpen(true);
    }
  };

  const getSchoolData = async () => {
    await axios
      .get(`/api/institute/school`)
      .then((res) => {
        setSchoolOptions(
          res.data.data.map((obj) => ({
            value: obj.school_id,
            label: obj.school_name_short,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getEmployeeData = async () => {
    try {
      const response = await axios.get(
        `/api/employee/getEmployeeDetailsBasedOnUserID/${userID}`
      );

      if (response.data.data) {
        setValues((prev) => ({
          ...prev,
          schoolId: response.data.data.school_id,
        }));
      } else {
        setAlertMessage({
          severity: "error",
          message: "School not found for this employee",
        });
        setAlertOpen(true);
      }
    } catch {
      setAlertMessage({
        severity: "error",
        message: "Error Occured",
      });
      setAlertOpen(true);
    }
  };

  const getData = async () => {
    setLoading(true);
    if (values.acYearId && values.schoolId) {
      const programInfo = programOptions?.find(
        (obj) => obj?.value == values.programId
      );
      try {
        const temp = {
          ac_year_id: values.acYearId,
          school_id: values.schoolId,
          program_id: programInfo?.program_id,
          program_specialization_id: values.programId,
          // userId: userID,
          page: 0,
          page_size: 100000,
          sort: "created_date",
          active: isActive,
          ...(values.classDate && {
            selected_date: moment(values.classDate).format("YYYY-MM-DD"),
          }),
          ...(values.yearSem && { current_sem: values.yearSem }),
        };

        const queryParams = Object.keys(temp)
          .filter((key) => temp[key] !== undefined && temp[key] !== null)
          .map((key) => `${key}=${encodeURIComponent(temp[key])}`)
          .join("&");

        const url = `/api/academic/fetchTimeTableDetailsForIndex?${queryParams}`;
        const response = await axios.get(url);
        const dataArray = response?.data?.data?.Paginated_data?.content || [];
        const mainData = dataArray?.map((obj) =>
          obj.id === null ? { ...obj, id: obj.time_table_id } : obj
        );
        const uniqueData = Array.from(new Map(mainData?.map(item => [item.id, item])).values());
        setRows(uniqueData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    }
  };

  const handleStudentList = async (params) => {
    setStudentList([]);
    setStudentListOpen(true);
    const data = params.row;
    await axios
      .get(
        `/api/academic/assignedStudentBySectionAssignmentId/${data.section_assignment_id}`
      )
      .then((res) => {
        setStudentList(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const handleStudentListForBatch = async (params) => {
    setStudentList([]);
    setStudentListOpen(true);
    await axios
      .get(
        `/api/academic/studentDetailsWithBatchName/${params.row.batch_assignment_id}`
      )
      .then((res) => {
        setStudentList(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const onSelectionModelChange = (ids) => {
    const selectedRowsData = ids.map((id) => rows.find((row) => row.id === id));
    setIds(selectedRowsData.map((val) => val.time_table_employee_id));
  };

  const handleChangeAdvance = async (name, newValue) => {
    if (name === "employeeId") {
      await axios
        .get(
          `/api/employee/getEmployeesUnderDepartment/${data.row.emp_id}/${data.row.selected_date}/${data.row.time_slots_id}`
        )
        .then((res) => {
          res.data.data.filter((obj) => {
            if (obj.emp_id === newValue) {
              setUserId(obj.userDetail_id);
            }
          });
        })
        .catch((err) => console.error(err));
    }
    //  else if (name === "programId") {
    //   axios
    //     .get(`/api/academic/fetchAllProgramsWithSpecialization/${values.schoolId}`)
    //     .then((res) => {
    //       const yearsem = [];

    //       res.data.data.filter((val) => {
    //         if (val.program_specialization_id === newValue) {
    //           yearsem.push(val);
    //         }
    //       });
    //       const newyearsem = [];
    //       yearsem.forEach((obj) => {
    //         for (let i = 1; i <= obj.number_of_semester; i++) {
    //           newyearsem.push({ label: `Sem-${i}`, value: i });
    //         }
    //       });
    //       console.log(newyearsem, "newyearsem");

    //       setYearSemOptions(
    //         newyearsem.map((obj) => ({
    //           value: obj.value,
    //           label: obj.label,
    //         }))
    //       );
    //     })
    //     .catch((err) => console.error(err));
    //   setValues((prev) => ({
    //     ...prev,
    //     [name]: newValue,
    //     ...(name === "programId" && { yearSem: "" }),
    //   }));
    // } 
    // else {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "school_Id" && { yearSem: "", programId: "" }),
      ...(name === "programId" && { categoryId: "" }),
    }));
    // }
  };

  const handleActive = async (params) => {
    const id = params.row.id;

    const handleToggle = async () => {
      if (params.row.active === true) {
        await axios
          .delete(`/api/academic/deactivateTimeTableEmployee/${ids.toString()}`)
          .then((res) => {
            if (res.status === 200) {
              getData();
            }
          })
          .catch((err) => console.error(err));
      } else {
        await axios
          .delete(`/api/academic/activateTimeTableEmployee/${ids.toString()}`)
          .then((res) => {
            if (res.status === 200) {
              getData();
            }
          })
          .catch((err) => console.error(err));
      }
    };
    params.row.active === true && ids.length > 0
      ? setModalContent({
        title: "",
        message: "Do you want to make it Inactive ?",
        buttons: [
          { name: "Yes", color: "primary", func: handleToggle },
          { name: "No", color: "primary", func: () => { } },
        ],
      })
      : params.row.active === false && ids.length > 0
        ? setModalContent({
          title: "",
          message: "Do you want to make it Active ?",
          buttons: [
            { name: "Yes", color: "primary", func: handleToggle },
            { name: "No", color: "primary", func: () => { } },
          ],
        })
        : setModalContent({
          title: "",
          message: "Please select the checkbox !!!",
        });
    setModalOpen(true);
  };

  const handleSelectOpen = () => {
    const handleSectionCreation = () => {
      navigate("/Facultytimetable-section-school");
    };
    const handleBatchCreation = () => {
      navigate("/Facultytimetable-batch-school");
    };
    setModalSelectOpen(true);
    setModalSelectContent({
      title: "Create Timetable For",
      message: "",
      buttons: [
        { name: "Section", color: "primary", func: handleSectionCreation },
        { name: "Batch", color: "primary", func: handleBatchCreation },
      ],
    });
  };

  const handleDetails = async (params) => {
    setPreviousEmployeeId(params.row.emp_id);
    setTimeTableId(params.row.time_table_id);
    setData(params);
    setValues((prev) => ({
      ...prev,
      ["courseId"]: null,
      ["employeeId"]: null,
      ["roomId"]: null,
    }));
    await axios
      .get(
        `/api/employee/getEmployeesUnderDepartment/${params.row.emp_id}/${params.row.selected_date}/${params.row.time_slots_id}`
      )
      .then((res) => {
        setEmployeeOptions(
          res.data.data.map((obj) => ({
            value: obj.emp_id,
            label: obj.employeeName,
          }))
        );
      })
      .catch((err) => console.error(err));
    setEmployeeDetailsOpen(true);
  };

  const handleRoomSwap = async (params) => {
    setPreviousEmployeeId(params.row.emp_id);
    setTimeTableId(params.row.time_table_id);
    setData(params);
    setValues((prev) => ({
      ...prev,
      ["courseId"]: null,
      ["employeeId"]: null,
      ["roomId"]: null,
    }));
    await axios
      .get(
        `/api/roomsForTimeTableRoomSwapping/${params.row.time_slots_id}/${params.row.selected_date}`
      )
      .then((res) => {
        console.log(res.data);

        setRoomOptions(
          res.data.data.map((obj) => ({
            value: obj.room_id,
            label: obj.concate_room_name,
          }))
        );
      })
      .catch((err) => console.error(err));
    setRoomSwapOpen(true);
  };

  const getCourseData = async () => {
    if (userId)
      await axios
        .get(`/api/academic/getAssignedCourses/${userId}`)
        .then((res) => {
          setCourseOptions(
            res.data.data.map((obj) => ({
              value: obj.subjet_assign_id,
              label: obj.course_name_with_code,
            }))
          );
        })
        .catch((error) => console.error(error));
  };

  const handleSubmit = async () => {
    await axios
      .put(
        `/api/academic/updateEmployeeIdForSwapping/${timeTableId}/${previousEmployeeId}/${values.employeeId}/${values.courseId}`
      )
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          setAlertMessage({ severity: "success", message: "Swapped" });
          setAlertOpen(true);
          setRoomSwapOpen(false);
          getData();
        } else {
          setAlertMessage({ severity: "error", message: "Error" });
          setAlertOpen(true);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleAssignRoom = async () => {
    await axios
      .put(
        `/api/academic/updateRoomForSwapping/${timeTableId}/${values.roomId}`
      )
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          setAlertMessage({ severity: "success", message: "Swapped" });
          setAlertOpen(true);
          setRoomSwapOpen(false);
          getData();
        } else {
          setAlertMessage({ severity: "error", message: "Error" });
          setAlertOpen(true);
        }
      })
      .catch((err) => console.error(err));
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
      <CustomModal
        open={modalSelectOpen}
        setOpen={setModalSelectOpen}
        title={modalSelectContent.title}
        message={modalSelectContent.message}
        buttons={modalSelectContent.buttons}
      />
      <ModalWrapper
        title="Student List"
        maxWidth={850}
        open={studentListOpen}
        setOpen={setStudentListOpen}
      >
        <Grid container>
          <Grid item xs={12} md={12} mt={2}>
            <TableContainer component={Paper}>
              <Table size="small" className={classes.table}>
                <TableHead>
                  <TableRow className={classes.bg}>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "left",
                      }}
                    >
                      Student Name
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      AUID
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      USN
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Reporting Date
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Year/Sem
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Section
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentList.length > 0 ? (
                    studentList.map((val, i) => (
                      <TableRow key={i} style={{ height: 10 }}>
                        <TableCell sx={{ textAlign: "left" }}>
                          {val.student_name}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.auid}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.usn}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.reporting_date
                            ? moment(val.reporting_date).format("DD-MM-YYYY")
                            : ""}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {`${val.current_year}/${val.current_sem}` ?? ""}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.section_name}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <></>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </ModalWrapper>

      <ModalWrapper
        title="Student List"
        maxWidth={850}
        open={studentListOpen}
        setOpen={setStudentListOpen}
      >
        <Grid container>
          <Grid item xs={12} md={12} mt={2}>
            <TableContainer component={Paper}>
              <Table size="small" className={classes.table}>
                <TableHead>
                  <TableRow className={classes.bg}>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "left",
                      }}
                    >
                      Student Name
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      AUID
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      USN
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Reporting Date
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Year/Sem
                    </TableCell>
                    <TableCell sx={{ color: "white", textAlign: "center" }}>
                      Batch
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentList.length > 0 ? (
                    studentList.map((val, i) => (
                      <TableRow key={i} style={{ height: 10 }}>
                        <TableCell sx={{ textAlign: "left" }}>
                          {val.student_name}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.auid}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.usn}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.reporting_date
                            ? moment(val.reporting_date).format("DD-MM-YYYY")
                            : ""}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {`${val.current_year}/${val.current_sem}` ?? ""}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {val.concat_batch_name}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <></>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </ModalWrapper>

      <Box>
        <FormWrapper>
          <Grid
            container
            justifyContent="flex-start"
            rowSpacing={2}
            columnSpacing={4}
          >
            <Grid item xs={12} md={2}>
              <CustomAutocomplete
                name="acYearId"
                value={values.acYearId}
                label="Academic Year"
                options={academicYearOptions}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <CustomAutocomplete
                label="School"
                name="schoolId"
                value={values.schoolId}
                options={schoolOptions}
                handleChangeAdvance={handleChangeAdvance}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <CustomAutocomplete
                name="programId"
                label="Program"
                options={programOptions}
                handleChangeAdvance={handleChangeAdvance}
                value={values.programId}
                disabled={!values.schoolId}
              />
            </Grid>
            {/* <Grid item xs={12} md={2}>
              <CustomAutocomplete
                name="yearSem"
                label="Year/Sem"
                value={values.yearSem}
                options={yearSemOptions}
                handleChangeAdvance={handleChangeAdvance}
                disabled={!values.programId}
              />
            </Grid> */}
            <Grid item xs={12} md={2} display="flex" alignItems="center">
              <CustomDatePicker
                name="classDate"
                label="Class Date"
                value={values.classDate}
                handleChangeAdvance={handleChangeAdvance}
                clearIcon={true}
              />
            </Grid>
            <Grid item xs={12} md={2} display="flex" justifyContent="center">
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  padding: "4px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  background: isActive ? "#d1e7dd" : "#f8d7da",
                  color: isActive ? "#0f5132" : "#842029",
                  minWidth: "100px",
                  height: "40px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ marginRight: "8px", fontWeight: 500 }}
                >
                  {isActive ? "Active" : "Inactive"}
                </Typography>
                <Switch
                  checked={isActive}
                  onChange={() => setIsActive((prev) => !prev)}
                  inputProps={{ "aria-label": "Active/Inactive Toggle" }}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#198754",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#198754",
                    },
                    transform: "scale(0.9)",
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2} textAlign="right">
              <Button
                onClick={handleSelectOpen}
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: 2,
                }}
                startIcon={<AddIcon />}
              >
                Create
              </Button>
            </Grid>
            <Grid item xs={12} md={12}>
                <GridIndex
                  rows={rows}
                  columns={columns}
                  checkboxSelection
                  onSelectionModelChange={(ids) => onSelectionModelChange(ids)}
                  loading={loading}
                />
            </Grid>
          </Grid>
        </FormWrapper>
        <ModalWrapper
          maxWidth={800}
          open={employeeDetailsOpen}
          setOpen={setEmployeeDetailsOpen}
        >
          <Grid container rowSpacing={2} columnSpacing={2}>
            <Grid item xs={12} md={4}>
              <CustomAutocomplete
                name="employeeId"
                label="Employee"
                value={values.employeeId}
                options={employeeOptions}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomAutocomplete
                name="courseId"
                label="Course"
                value={values.courseId}
                options={courseOptions}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                sx={{ borderRadius: 2 }}
                onClick={handleSubmit}
              >
                SWAP
              </Button>
            </Grid>
          </Grid>
        </ModalWrapper>

        <ModalWrapper
          open={roomSwapOpen}
          setOpen={setRoomSwapOpen}
          maxWidth={800}
          title="Swap Room"
        >
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            rowSpacing={4}
            columnSpacing={2}
          >
            <Grid item xs={12} md={6}>
              <CustomAutocomplete
                name="roomId"
                label="Rooms"
                handleChangeAdvance={handleChangeAdvance}
                options={roomOptions}
                value={values.roomId}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                sx={{ borderRadius: 2 }}
                onClick={handleAssignRoom}
              >
                Assign
              </Button>
            </Grid>
          </Grid>
        </ModalWrapper>
      </Box>
    </>
  );
}
export default FacultytimetableSchoolIndex;
