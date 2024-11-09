import { useEffect, useState } from "react";
import axios from "../services/Api";
import { Box, Button, Grid, IconButton } from "@mui/material";
import GridIndex from "./GridIndex";
import DownloadIcon from "@mui/icons-material/Download";
import moment from "moment";
import CustomDatePicker from "./Inputs/CustomDatePicker";
import CustomAutocomplete from "./Inputs/CustomAutocomplete";
import { convertUTCtoTimeZone } from "../utils/DateTimeUtils";
import { GeneratePaySlip } from "../pages/forms/employeeMaster/GeneratePaySlip";
import numberToWords from "number-to-words";
import useAlert from "../hooks/useAlert";
import ExportButtonPayReport from "./ExportButtonPayReport";
import useBreadcrumbs from "../hooks/useBreadcrumbs";

const today = new Date();

const initialValues = {
  month: convertUTCtoTimeZone(
    new Date(today.getFullYear(), today.getMonth() - 1)
  ),
  deptId: null,
  schoolId: null,
};

function Payslip() {
  const [values, setValues] = useState(initialValues);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [salaryHeads, setSalaryHeads] = useState([]);
  const setCrumbs = useBreadcrumbs();

  const { setAlertMessage, setAlertOpen } = useAlert();

  const columns = [
    {
      field: "slNo",
      headerName: "Sl No",
      flex: 1,
      hideable: false,
      renderCell: (params) => params.api.getRowIndex(params.id) + 1,
    },
    { field: "empcode", headerName: "Emp Code", flex: 1, hideable: false },
    {
      field: "employee_name",
      headerName: "Employee Name",
      flex: 1,
      hideable: false,
    },
    {
      field: "schoolShortName",
      headerName: "School",
      flex: 1,
      hideable: true,
      hide: true,
    },
    {
      field: "dept_name",
      headerName: "Department",
      flex: 1,
      hideable: true,
      hide: true,
    },
    {
      field: "designation_name",
      headerName: "Designation",
      flex: 1,
      hideable: true,
      hide: true,
    },
    {
      field: "job_type",
      headerName: "Job Type",
      flex: 1,
      hideable: true,
      hide: true,
    },
    {
      field: "employee_type",
      headerName: "Employee Type",
      flex: 1,
      hideable: true,
      hide: true,
    },
    {
      field: "salary_structure",
      headerName: "Salary Structure",
      flex: 1,
      hideable: true,
      hide: true,
    },
    {
      field: "date_of_joining",
      headerName: "DOJ",
      flex: 1,
      hideable: true,
      hide: true,
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 1,
      hideable: true,
      hide: true,
    },
    {
      field: "pay_days",
      headerName: "Pay Days",
      flex: 1,
      hideable: false,
    },
    {
      field: "master_salary",
      headerName: "Master Pay",
      flex: 1,
      hideable: true,
    },
  ];

  const getEmpMasterSalary = async(id) => {
    try {
      const res =  await axios.get(`api/employee/getEmployeeMasterSalaryById?id=${id}`);
      if(res.status == 200 || res.status == 201){
        return res
      }
    } catch (error) {
      console.error(error)
    }
  };

  const handleSaveClick = async (rowdata) => {
    const paySlipData = await axios
      .get(`/api/employee/getPaySlipDetails?emp_pay_history_id=${rowdata.id}`)
      .then(async(res) => {
        const temp = { ...res.data.data };
        const netPay = temp.total_earning - temp.total_deduction;
        temp.netPayDisplay = netPay;
        temp.netPayInWords = numberToWords.toWords(netPay);
        return temp;
      })
      .catch((err) => console.error(err))

    const blobFile = await GeneratePaySlip(paySlipData);

    if (!blobFile) {
      setAlertMessage({
        severity: "error",
        message: "Something went wrong !!",
      });
      setAlertOpen(true);
    }
    window.open(URL.createObjectURL(blobFile));
  };

  useEffect(() => {
    setCrumbs([{ name: "Pay Report" }]);
    getSchoolDetails();
    handleSubmit();
    getSalaryHeads();
  }, []);

  useEffect(() => {
    getDepartmentOptions();
  }, [values.schoolId]);

  const getSchoolDetails = async () => {
    await axios
      .get(`/api/institute/school`)
      .then((res) => {
        const optionData = [];
        res.data.data.forEach((obj) => {
          optionData.push({
            value: obj.school_id,
            label: obj.school_name_short,
          });
        });
        setSchoolOptions(optionData);
      })
      .catch((err) => console.error(err));
  };

  const handleChangeAdvance = (name, newValue) => {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "schoolId" && { deptId: "" }),
    }));
  };

  const getDepartmentOptions = async () => {
    if (values?.schoolId) {
      await axios
        .get(`/api/fetchdept1/${values.schoolId}`)
        .then((res) => {
          const data = [];
          res.data.data.forEach((obj) => {
            data.push({
              value: obj.dept_id,
              label: obj.dept_name_short,
            });
          });
          setDepartmentOptions(data);
        })
        .catch((err) => console.error(err));
    }
  };

  const handleSubmit = async () => {
    let params = "";
    if (!!values.month && !values.schoolId && !values.dept) {
      params = `month=${moment(values.month).format("MM")}&year=${moment(
        values.month
      ).format("YYYY")}`;
    } else if (!!values.month && !!values.schoolId && !values.deptId) {
      params = `month=${moment(values.month).format("MM")}&year=${moment(
        values.month
      ).format("YYYY")}&school_id=${values.schoolId}`;
    } else if (!values.month && !!values.schoolId && !values.deptId) {
      params = `school_id=${values.schoolId}`;
    } else if (!values.month && !!values.schoolId && !!values.deptId) {
      params = `school_id=${values.schoolId}&dept_id=${values.deptId}`;
    } else if (!!(values.month && values.schoolId && values.deptId)) {
      params = `month=${moment(values.month).format("MM")}&year=${moment(
        values.month
      ).format("YYYY")}&school_id=${values.schoolId}&dept_id=${values.deptId}`;
    }
    if (!!params) {
      await axios
        .get(
          `/api/employee/getEmployeePayHistory?page=0&page_size=100000&${params}`
        )
        .then((res) => {
          setEmployeeList(res.data.data.content);
        })
        .catch((err) => console.error(err));
    } else {
      await axios
        .get(`/api/employee/getEmployeePayHistory?page=0&page_size=100000`)

        .then((res) => {
          setEmployeeList(res.data.data.content);
        })
        .catch((err) => console.error(err));
    }
  };

  const getSalaryHeads = async () => {
    await axios
      .get(`/api/finance/SalaryStructureHead1`)
      .then((res) => {
        const earning = res.data.data.filter(
          (obj) => obj.category_name_type === "Earning"
        );

        const temp = [];

        earning
          .sort((a, b) => a.priority - b.priority)
          .forEach((obj) => {
            temp.push({
              field: obj.print_name,
              headerName: obj.voucher_head_short_name,
              flex: 1,
              hideable: false,
              valueGetter: (params) => params.row[obj.print_name] || 0,
            });
          });

        temp.push({
          field: "er",
          headerName: "ER",
          flex: 1,
          hideable: false,
        });

        temp.push({
          field: "total_earning",
          headerName: "Gross",
          flex: 1,
          hideable: false,
        });

        const deduction = res.data.data.filter(
          (obj) => obj.category_name_type === "Deduction"
        );

        deduction
          .sort((a, b) => {
            return a.priority - b.priority;
          })
          .forEach((obj) => {
            temp.push({
              field: obj.print_name,
              headerName: obj.voucher_head_short_name,
              flex: 1,
              hideable: false,
            });
          });

        temp.push({
          field: "advance",
          headerName: "Advance",
          flex: 1,
          hideable: false,
        });

        temp.push({
          field: "tds",
          headerName: "TDS",
          flex: 1,
          hideable: false,
          renderCell: (params) => <>{params.row.tds ?? 0}</>,
        });

        temp.push({
          field: "total_deduction",
          headerName: "Total Deduction",
          flex: 1,
          hideable: false,
        });

        temp.push({
          field: "netpay",
          headerName: "Net Pay",
          flex: 1,
          hideable: false,
        });

        temp.push({
          field: "id",
          headerName: "Print",
          flex: 1,
          // hide: true,
          renderCell: (params) => (
            <IconButton
              onClick={() => handleSaveClick(params.row)}
              color="primary"
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          ),
        });

        setSalaryHeads(temp);
      })
      .catch((err) => console.error(err));
  };

  if (salaryHeads.length > 0) {
    salaryHeads.forEach((obj) => {
      columns.push(obj);
    });
  }
  return (
    <Box>
      <Grid container rowSpacing={4}>
        <Grid item xs={12} mt={2} mb={2}>
          <Grid container columnSpacing={4}>
            <Grid item xs={12} md={3}>
              <CustomDatePicker
                name="month"
                label="Month"
                value={values.month}
                handleChangeAdvance={handleChangeAdvance}
                views={["month", "year"]}
                openTo="month"
                inputFormat="MM/YYYY"
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomAutocomplete
                name="schoolId"
                label="School"
                value={values.schoolId}
                options={schoolOptions}
                handleChangeAdvance={handleChangeAdvance}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomAutocomplete
                name="deptId"
                label="Department"
                value={values.deptId}
                options={!!values.schoolId ? departmentOptions : []}
                handleChangeAdvance={handleChangeAdvance}
                disabled={!values.schoolId}
              />
            </Grid>

            <Grid item xs={12} md={1}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={
                  values.month === null || values.month === "Invalid Date"
                }
              >
                Filter
              </Button>
            </Grid>
            <Grid item xs={12} md={2} align="right">
              <ExportButtonPayReport
                rows={employeeList}
                name={`Pay Report for the Month of ${moment(
                  values.month
                ).format("MMMM YYYY")}`}
                sclName={
                  values.schoolId
                    ? `${
                        schoolOptions?.find(
                          (scl) => scl?.value === values.schoolId
                        )?.label
                      }`
                    : "ACHARYA INSTITUTES"
                }
              />
            </Grid>
          </Grid>
        </Grid>
        <GridIndex rows={employeeList} columns={columns} />
      </Grid>
    </Box>
  );
}

export default Payslip;
