import React, { useEffect } from "react";
import { useState } from "react";
import {
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TableContainer,
  Table,
  TableHead,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  Button,
  IconButton,
  tableCellClasses,
  CircularProgress,
  Box,
} from "@mui/material";
import axios from "../services/Api";
import ModalWrapper from "./ModalWrapper";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import moment from "moment";
import CustomSelect from "./Inputs/CustomSelect";
import { styled } from "@mui/system";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import OverlayLoader from "./OverlayLoader";

const CustomTabs = styled(Tabs)({
  "& .MuiTabs-flexContainer": {
    flexDirection: "column",
  },
});

const CustomTab = styled(Tab)(({ theme }) => ({
  fontSize: "14px",
  transition: "background-color 0.3s",
  backgroundColor: "rgba(74, 87, 169, 0.1)",
  color: "#46464E",
  "&.Mui-selected": {
    backgroundColor: "rgba(74, 87, 169, 0.2)",
    color: "orange",
  },
  "&:hover": {
    backgroundColor: "rgba(74, 87, 169, 0.2)",
  },
  [theme.breakpoints.up("xs")]: {
    fontSize: "11px",
  },
  [theme.breakpoints.up("sm")]: {
    fontSize: "12px",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "14px",
  },
  [theme.breakpoints.up("lg")]: {
    fontSize: "14px",
  },
}));

const useStyles = makeStyles((theme) => ({
  table: {
    "& .MuiTableCell-root": {
      borderLeft: "1px solid rgba(224, 224, 224, 1)",
      textAlign: "center",
    },
  },
  bg: {
    backgroundColor: theme.palette.auzColor.main,
    color: theme.palette.headerWhite.main,
    textAlign: "center",
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.auzColor.main,
    color: theme.palette.headerWhite.main,
    border: "1px solid rgba(224, 224, 224, 1)",
    textAlign: "center",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: "1px solid rgba(224, 224, 224, 1)",
  },
}));
const ELIGIBLE_REPORTED_STATUS = {
  1: "No status",
  2: "Eligible",
  3: "Not Eligible",
  4: "Not Reported",
  5: "Pass Out",
};

const StudentDetailsViewDocuments = ({ reportingData, id, applicantData }) => {
  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
  };
  const [subTab, setSubTab] = useState("Reporting");
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [Data, setData] = useState([]);
  const classes = useStyles();
  const [assessmentId, setAssessmentId] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [syllabusData, setSyllabusData] = useState([]);
  const [courseObjectiveData, setCourseObjectiveData] = useState([]);
  const [courseOutcomesData, setCourseOutcomesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ModalData, setModalData] = useState([]);
  const [defaultAssessmentId, setDefaultAssessmentId] = useState("");
  const [values, setValues] = useState({
    assesmentId: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openName, setOpenName] = useState("");
  const [SelectedCourse, setSelectedCourse] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const Id = id || localStorage.getItem("empId");
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setModalOpen(true);
    getModalData(course);
  };

  const handlePresentButtonClick = (data) => {
    navigate(`/StudentDetailsViewAttendance/${Id}`, {
      state: { data, Id, applicantData },
    });
  };
  useEffect(() => {
    const getHistory = () => {
      axios(`/api/student/reportingStudentsHistoryByStudentId/${Id}`)
        .then((res) => {
          setHistoryData(res.data.data);
        })
        .catch((err) => console.error(err));
    };
    getAssesmentId();
    getHistory();
    getCourseData();
    getdata();
  }, []);

  const openSyllabusModal = async ({ name, courseId }) => {
    setIsModalOpen(true);
    setOpenName({ name, courseId });
    if (courseId && name == "Syllabus") {
      await getCourseSyllabusData(courseId);
    } else if (courseId && name == "Objective") {
      await getCourseObjectiveData(courseId);
    }
  };

  useEffect(() => {
    if (assessmentId.length > 0) {
      setDefaultAssessmentId(assessmentId[0]?.value || "");
    }
    if (defaultAssessmentId) {
      getStudMarks();
    }
  }, [assessmentId, defaultAssessmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const getModalData = async (course) => {
    const { ac_year_id, course_assignment_id, course_id, year_or_sem } = course;
    await axios
      .get(
        `/api/student/getDetailedStudentAttendanceOfStudentByCourse/${Id}/${ac_year_id}/${course_assignment_id}/${course_id}/${year_or_sem}`
      )
      .then((res) => {
        setModalData(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const getCourseData = async () => {
    await axios
      .get(`/api/student/getCourseDetailData/${Id}`)
      .then((res) => {
        setCourseData(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const getStudMarks = async () => {
    await axios
      .get(
        `/api/student/getStudentMarkDetails/${Id}/${
          values.assesmentId || defaultAssessmentId
        }`
      )
      .then((res) => {
        setMarksData(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const getCourseSyllabusData = async (courseId) => {
    setLoading(true);
    await axios
      .get(`/api/academic/getSyllabusByCourseAssignmentId/${courseId}`)
      .then((res) => {
        setSyllabusData(res.data.data);
      });
    setLoading(false).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  const getCourseObjectiveData = async (courseId) => {
    setLoading(true);
    await axios
      .get(`/api/academic/getCourseObjectiveAndOutcome/${courseId}`)
      .then((res) => {
        setCourseObjectiveData(res.data.data);
      });
    setLoading(false).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  const getCourseOutcomesData = async (courseId) => {
    setLoading(true);
    await axios
      .get(`/api/academic/getCourseObjectiveAndOutcome/${courseId}`)
      .then((res) => {
        setCourseOutcomesData(res.data.data);
      });
    setLoading(false).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  const getAssesmentId = async (params) => {
    await axios
      .get(`/api/student/getAllActiveInternal/${Id}`)
      .then((res) => {
        setAssessmentId(
          res.data.data.map((obj) => ({
            value: obj.internal_id,
            label: obj.internal_name,
          }))
        );
      })
      .catch((error) => console.error(error));
  };

  const getdata = async (params) => {
    await axios
      .get(`/api/student/getAttendanceReportForStudentProfileByStudentId/${Id}`)
      .then((res) => {
        setData(res.data.data);
      })
      .catch((error) => console.error(error));
  };

  const modalData = () => {
    switch (openName?.name) {
      case "Syllabus":
        return (
          <>
            {loading ? (
              <Grid item xs={12} align="center">
                <OverlayLoader />
              </Grid>
            ) : (
              <TableContainer elevation={3} sx={{ maxWidth: 1300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Topic</StyledTableCell>
                      <StyledTableCell>Module</StyledTableCell>
                      <StyledTableCell>learning Process</StyledTableCell>
                      <StyledTableCell>Duration</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {syllabusData.length > 0 ? (
                      syllabusData.map((obj, i) => {
                        return (
                          <TableRow key={i}>
                            <StyledTableCell>
                              <Typography
                                variant="subtitle2"
                                color="textSecondary"
                              >
                                {obj?.topic_name ? obj?.topic_name : "--"}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography
                                variant="subtitle2"
                                color="textSecondary"
                              >
                                {obj?.syllabus_objective
                                  ? obj?.syllabus_objective
                                  : "--"}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography
                                variant="subtitle2"
                                color="textSecondary"
                              >
                                {obj?.learning ? obj?.learning : "--"}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography
                                style={{ textAlign: "center" }}
                                variant="subtitle2"
                                color="textSecondary"
                              >
                                {obj?.duration ? obj?.duration : "--"}
                              </Typography>
                            </StyledTableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                          <Typography variant="subtitle2">
                            No Records
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}{" "}
          </>
        );
      case "Objective":
        return (
          <>
            {loading ? (
              <Grid item xs={12} align="center">
                <OverlayLoader />
              </Grid>
            ) : (
              <TableContainer elevation={3} sx={{ maxWidth: 1300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Course Objective </StyledTableCell>
                      <StyledTableCell>Course OutComes </StyledTableCell>
                      <StyledTableCell>Prerequisites</StyledTableCell>
                      <StyledTableCell>Credits L+T+P+S</StyledTableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {courseObjectiveData.length > 0 ? (
                      courseObjectiveData.map((obj, i) => {
                        return (
                          <TableRow key={i}>
                            <StyledTableCell>
                              <Typography
                                variant="subtitle2"
                                color="textSecondary"
                                // sx={{ color: "success.main" }}
                              >
                                {obj?.course_objective
                                  ? obj?.course_objective
                                  : "--"}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography
                                variant="subtitle2"
                                color="textSecondary"
                              >
                                {obj?.course_outcome_objective
                                  ? obj?.course_outcome_objective
                                  : "--"}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography
                                variant="subtitle2"
                                color="textSecondary"
                              >
                                {obj?.pre_requisite ? obj?.pre_requisite : "--"}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography
                                variant="subtitle2"
                                color="textSecondary"
                              >
                                {(obj?.duration || 0) +
                                  (obj?.lecture || 0) +
                                  (obj?.tutorial || 0) +
                                  (obj?.practical || 0)}
                              </Typography>
                            </StyledTableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                          <Typography variant="subtitle2">
                            No Records
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}{" "}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Grid container spacing={2} columnSpacing={4} sx={{ marginTop: "1px" }}>
        <Grid item xs={4} md={2}>
          <CustomTabs
            value={subTab}
            onChange={handleSubTabChange}
            orientation="vertical"
            variant="scrollable"
            className="customTabs"
          >
            <CustomTab value="Reporting" label="Reporting" />
            <CustomTab value="Course" label="Course" />
            <CustomTab value="Attendance" label="Attendance" />
            <CustomTab value="Marks" label="Marks" />
          </CustomTabs>
        </Grid>

        <Grid item xs={8} md={10}>
          {subTab === "Course" && (
            <>
              <Card>
                <ModalWrapper
                  open={isModalOpen}
                  setOpen={setIsModalOpen}
                  maxWidth={980}
                  title={`${openName.name} Details`}
                >
                  {modalData()}
                </ModalWrapper>

                <CardHeader
                  title="Course Details"
                  titleTypographyProps={{ variant: "subtitle2" }}
                  sx={{
                    backgroundColor: "rgba(74, 87, 169, 0.1)",
                    color: "#46464E",
                    padding: 1,
                  }}
                />
                <CardContent>
                  <Grid container columnSpacing={1} rowSpacing={1}>
                    <Grid item xd={12} md={12} mt={2}>
                      <TableContainer component={Paper}>
                        <Table className={classes.table} size="small">
                          <TableHead className={classes.bg}>
                            <TableRow>
                              <StyledTableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Course Name
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Course Code
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Sem
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Category
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Credits
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Syllabus
                              </StyledTableCell>
                              {/* <StyledTableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Objective
                              </StyledTableCell> */}
                              <StyledTableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Outcomes
                              </StyledTableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody className={classes.table}>
                            {courseData.map((obj, i) => {
                              return (
                                <TableRow key={i}>
                                  <StyledTableCell>
                                    {obj?.course_name ? obj?.course_name : "--"}
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    {obj?.course_assignment_coursecode
                                      ? obj?.course_assignment_coursecode
                                      : "--"}
                                  </StyledTableCell>

                                  <StyledTableCell>
                                    {obj?.year_sem ? obj?.year_sem : "--"}
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    {obj?.courseCategoryName
                                      ? obj?.courseCategoryName
                                      : "--"}
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    {obj?.courseCredits
                                      ? obj?.courseCredits
                                      : "--"}
                                  </StyledTableCell>
                                  <StyledTableCell
                                    sx={{ width: 100, textAlign: "center" }}
                                  >
                                    <IconButton
                                      color="primary"
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        openSyllabusModal({
                                          name: "Syllabus",
                                          courseId: obj?.course_id,
                                        })
                                      }
                                    >
                                      <RemoveRedEyeIcon fontSize="small" />
                                    </IconButton>
                                  </StyledTableCell>
                                  {/* <StyledTableCell
                                    sx={{ width: 100, textAlign: "center" }}
                                  >
                                    <IconButton
                                      color="primary"
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        openSyllabusModal({
                                          name: "Objective",
                                          courseId: obj?.course_id,
                                        })
                                      }
                                    >
                                      <RemoveRedEyeIcon fontSize="small" />
                                    </IconButton>
                                  </StyledTableCell> */}
                                  <StyledTableCell
                                    sx={{ width: 100, textAlign: "center" }}
                                  >
                                    <IconButton
                                      color="primary"
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        openSyllabusModal({
                                          name: "Objective",
                                          courseId: obj?.course_id,
                                        })
                                      }
                                    >
                                      <RemoveRedEyeIcon fontSize="small" />
                                    </IconButton>
                                  </StyledTableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </>
          )}
          {subTab === "Reporting" && (
            <>
              <Card>
                <CardHeader
                  title="Reporting Details"
                  titleTypographyProps={{ variant: "subtitle2" }}
                  sx={{
                    backgroundColor: "rgba(74, 87, 169, 0.1)",
                    color: "#46464E",
                    padding: 1,
                  }}
                />
                <CardContent>
                  <Grid container columnSpacing={1} rowSpacing={1}>
                    {/* <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2">auid</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Typography variant="body2" color="textSecondary">
                        {reportingData.auid}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2">Current Sem</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Typography variant="body2" color="textSecondary">
                        {reportingData.current_sem}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2">Remarks</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Typography variant="body2" color="textSecondary">
                        {reportingData.remarks}
                      </Typography>
                    </Grid> */}

                    <Grid item xd={12} md={12} mt={2}>
                      <TableContainer component={Paper}>
                        <Table className={classes.table} size="small">
                          <TableHead className={classes.bg}>
                            <TableRow>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Student Name
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                AUID
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Year/Sem
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Reporting Date
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Created by
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Created date
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Status
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody className={classes.table}>
                            {historyData.map((obj, i) => {
                              return (
                                <TableRow key={obj.auid}>
                                  <TableCell>{obj.student_name}</TableCell>
                                  <TableCell>{obj.auid}</TableCell>

                                  <TableCell>{obj.current_sem}</TableCell>
                                  <TableCell>
                                    {obj.reporting_date
                                      ? obj.reporting_date
                                          .slice(0, 10)
                                          .split("-")
                                          .reverse()
                                          .join("-")
                                      : ""}
                                  </TableCell>
                                  <TableCell>{obj.created_username}</TableCell>
                                  <TableCell>
                                    {obj.created_date
                                      ? moment(obj.created_date).format(
                                          "DD-MM-YYYY"
                                        )
                                      : ""}
                                  </TableCell>
                                  <TableCell>
                                    {obj.reporting_date
                                      ? "Reported"
                                      : ELIGIBLE_REPORTED_STATUS[
                                          obj.eligible_reported_status
                                        ]}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </>
          )}
          {subTab === "Attendance" && (
            <>
              <Card>
                <CardHeader
                  title="Attendance Details"
                  titleTypographyProps={{ variant: "subtitle2" }}
                  sx={{
                    backgroundColor: "rgba(74, 87, 169, 0.1)",
                    color: "#46464E",
                    padding: 1,
                  }}
                />
                <CardContent>
                  <Grid container columnSpacing={1} rowSpacing={1}>
                    <Grid item xd={12} md={12} mt={2}>
                      <TableContainer component={Paper}>
                        <Table className={classes.table} size="small">
                          <TableHead className={classes.bg}>
                            <TableRow>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Course Name
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Sem
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Present
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", textAlign: "center" }}
                              >
                                Absent
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody className={classes.table}>
                            {Data.map((obj, i) => {
                              return (
                                <TableRow key={i}>
                                  <TableCell>
                                    <Button
                                      onClick={() => handleCourseClick(obj)}
                                    >
                                      {obj.course_name}-
                                      {obj.course_assignment_coursecode}
                                    </Button>
                                  </TableCell>
                                  <TableCell>{obj.year_or_sem}</TableCell>
                                  <TableCell>
                                    <Button
                                      onClick={() =>
                                        handlePresentButtonClick(obj)
                                      }
                                      style={{
                                        color: "green",
                                      }}
                                    >
                                      {obj.present}
                                    </Button>
                                  </TableCell>

                                  <TableCell
                                    style={{
                                      color: "red",
                                    }}
                                  >
                                    {obj.total - obj.present}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </>
          )}
          {subTab === "Marks" && (
            <>
              <Card>
                <CardHeader
                  title="Marks Details"
                  titleTypographyProps={{ variant: "subtitle2" }}
                  sx={{
                    backgroundColor: "rgba(74, 87, 169, 0.1)",
                    color: "#46464E",
                    padding: 1,
                  }}
                />
                <Grid container rowSpacing={2} padding={2} columnSpacing={4}>
                  <Grid item xs={12} md={6}>
                    <CustomSelect
                      name="assesmentId"
                      label="Exam*"
                      value={values.assesmentId || defaultAssessmentId}
                      items={assessmentId}
                      handleChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} align="right">
                    <Button
                      variant="contained"
                      sx={{ borderRadius: 2 }}
                      onClick={getStudMarks}
                      disabled={values?.assesmentId?.length == 0 || loading}
                    >
                      {loading ? (
                        <CircularProgress
                          size={20}
                          color="blue"
                          style={{ margin: "0px 16px" }}
                        />
                      ) : (
                        <Typography variant="subtitle2">Submit</Typography>
                      )}
                    </Button>
                  </Grid>
                </Grid>

                <Grid item xd={12} md={12} mt={1}>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} size="small">
                      <TableHead className={classes.bg}>
                        <TableRow>
                          <TableCell
                            sx={{ color: "white", textAlign: "center" }}
                          >
                            Course Name
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", textAlign: "center" }}
                          >
                            Marks Scored
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", textAlign: "center" }}
                          >
                            Max Marks
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", textAlign: "center" }}
                          >
                            Percentage %
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody className={classes.table}>
                        {marksData.map((obj, i) => {
                          return (
                            <TableRow key={obj.student_id}>
                              <TableCell>{obj.courseName}</TableCell>
                              <TableCell>
                                {obj.marks_obtained_internal}
                              </TableCell>

                              <TableCell>{obj.max_marks}</TableCell>
                              <TableCell>{obj.percentage}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Card>
            </>
          )}
        </Grid>
      </Grid>

      <ModalWrapper
        open={modalOpen}
        setOpen={setModalOpen}
        maxWidth={900}
        title={
          "Detailed Student Attendance-" +
          SelectedCourse.course_name +
          "-" +
          SelectedCourse.course_assignment_coursecode
        }
      >
        <Box mt={2} p={3}>
          <TableContainer component={Paper}>
            <Table className={classes.table} size="small">
              <TableHead className={classes.bg}>
                <TableRow>
                  <TableCell sx={{ color: "white", textAlign: "center" }}>
                    Sl. No.
                  </TableCell>
                  <TableCell sx={{ color: "white", textAlign: "center" }}>
                    Employee Name
                  </TableCell>
                  <TableCell sx={{ color: "white", textAlign: "center" }}>
                    Topic Taught
                  </TableCell>
                  <TableCell sx={{ color: "white", textAlign: "center" }}>
                    Teaching Aid
                  </TableCell>
                  <TableCell sx={{ color: "white", textAlign: "center" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "white", textAlign: "center" }}>
                    Present/Absent
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody className={classes.table}>
                {ModalData.sort(
                  (a, b) => moment(a.selected_date) - moment(b.selected_date)
                ).map((dataItem, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{dataItem.employee_name_code}</TableCell>
                    <TableCell>{dataItem.contents}</TableCell>
                    <TableCell>{dataItem.teaching_aid}</TableCell>
                    <TableCell>
                      {dataItem.selected_date
                        ? moment(dataItem.selected_date).format("DD-MM-YYYY")
                        : ""}
                    </TableCell>
                    <TableCell>
                      <Typography
                        style={{
                          color: dataItem.present_status ? "green" : "red",
                        }}
                      >
                        {dataItem.present_status ? "P" : "A"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </ModalWrapper>
    </>
  );
};

export default StudentDetailsViewDocuments;
// Check attendace details id is showing undefined
// Increase the width of student attendace
