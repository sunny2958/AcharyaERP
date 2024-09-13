import { useState, useEffect, lazy } from "react";
import {
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  styled,
  tooltipClasses,
  Grid,
} from "@mui/material";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import { useNavigate } from "react-router-dom";
import useAlert from "../../../hooks/useAlert";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Check, HighlightOff } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { Button, Box } from "@mui/material";
import CustomModal from "../../../components/CustomModal";
import axios from "../../../services/Api";
import moment from "moment";
import EditIcon from "@mui/icons-material/Edit";
const GridIndex = lazy(() => import("../../../components/GridIndex"));

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "white",
    color: "rgba(0, 0, 0, 0.6)",
    maxWidth: 300,
    fontSize: 12,
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px;",
    padding: "10px",
    textAlign: "justify",
  },
}));

const modalContents = {
  title: "",
  message: "",
  buttons: [],
};

const initialState = {
  budgetList: [],
  modalOpen: false,
  modalContent: modalContents,
};

const BudgetIndex = () => {
  const [{ budgetList, modalOpen, modalContent }, setState] =
    useState(initialState);
  const [tab, setTab] = useState("Student Bonafide");
  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();

  useEffect(() => {
    setCrumbs([{ name: "Financial year Budget" }]);
    getBudgetData();
  }, []);

  const columns = [
    { field: "financial_year", headerName: "Financial Year", flex: 1 },
    { field: "school_name_short", headerName: "School", flex: 1 },
    { field: "dept_name_short", headerName: "Department", flex: 1 },
    { field: "ledger_name", headerName: "Ledger", flex: 1 },
    { field: "voucher_head", headerName: "Voucher", flex: 1 },

    { field: "proposed_amount", headerName: "Proposed Amount", flex: 1 },
    { field: "recommended_amount", headerName: "Recommended Amount", flex: 1 },
    { field: "approved_amount", headerName: "Approved Amount", flex: 1 },
    { field: "remark", headerName: "Remark", flex: 1 },
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
      type: "date",
      valueGetter: (params) =>
        params.row.created_date
          ? moment(params.row.created_date).format("DD-MM-YYYY")
          : "",
    },
    {
      field: "modified_username",
      headerName: "Modified By",
      flex: 1,
      hide: true,
    },
    {
      field: "modified_date",
      headerName: "Modified Date",
      flex: 1,
      hide: true,
      type: "date",
      valueGetter: (params) =>
        params.row.modified_date !== params.row.created_date
          ? moment(params.row.modified_date).format("DD-MM-YYYY")
          : "",
    },
    {
      field: "id",
      headerName: "Edit",
      type: "actions",
      flex: 1,
      getActions: (params) => [
        <HtmlTooltip title="Edit">
          <IconButton
            onClick={() => navigate(`/FinancialYearBudgetForm`,{state:{formValue:params.row,page:"Index"}})}
            disabled={!params.row.active}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </HtmlTooltip>,
      ],
    },
    {
      field: "active",
      headerName: "Active",
      flex: 1,
      type: "actions",
      getActions: (params) => [
        params.row.active === true ? (
          <HtmlTooltip title="Make list inactive">
            <GridActionsCellItem
              icon={<Check />}
              label="Result"
              style={{ color: "green" }}
              onClick={() => handleActive(params)}
            >
              {params.active}
            </GridActionsCellItem>
          </HtmlTooltip>
        ) : (
          <HtmlTooltip title="Make list active">
            <GridActionsCellItem
              icon={<HighlightOff />}
              label="Result"
              style={{ color: "red" }}
              onClick={() => handleActive(params)}
            >
              {params.active}
            </GridActionsCellItem>
          </HtmlTooltip>
        ),
      ],
    },
  ];

  const getBudgetData = async () => {
    try {
      const res = await axios.get(
        `/api/finance/fetchAllBudget?page=0&page_size=10000&sort=created_date`
      );
      if (res.status == 200 || res.status == 201) {
        setState((prevState) => ({
          ...prevState,
          budgetList: res?.data?.data?.Paginated_data?.content,
        }));
      }
    } catch (error) {
      setAlertMessage({
        severity: "error",
        message: "An error occured",
      });
      setAlertOpen(true);
    }
  };

  const setModalOpen = (val) => {
    setState((prevState) => ({
      ...prevState,
      modalOpen: val,
    }));
  };

  const setLoadingAndGetData = () => {
    getBudgetData();
    setModalOpen(false);
  };

  const setModalContent = (title, message, buttons) => {
    setState((prevState) => ({
      ...prevState,
      modalContent: {
        ...prevState.modalContent,
        title: title,
        message: message,
        buttons: buttons,
      },
    }));
  };

  const handleActive = async (params) => {
    const id = params.row.id;
    setModalOpen(true);
    const handleToggle = async () => {
      if (params.row.active === true) {
        try {
          const res = await axios.delete(`/api/student/studentBonafide/${id}`);
          if (res.status === 200) {
            setLoadingAndGetData();
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        try {
          const res = await axios.delete(
            `/api/student/activateStudentBonafide/${id}`
          );
          if (res.status === 200) {
            setLoadingAndGetData();
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    params.row.active === true
      ? setModalContent("", "Do you want to make it Inactive?", [
          { name: "No", color: "primary", func: () => {} },
          { name: "Yes", color: "primary", func: handleToggle },
        ])
      : setModalContent("", "Do you want to make it Active?", [
          { name: "No", color: "primary", func: () => {} },
          { name: "Yes", color: "primary", func: handleToggle },
        ]);
  };

  return (
    <>
      {!!modalOpen && (
        <CustomModal
          open={modalOpen}
          setOpen={setModalOpen}
          title={modalContent.title}
          message={modalContent.message}
          buttons={modalContent.buttons}
        />
      )}
      <Box
        sx={{
          width: { md: "20%", lg: "15%", xs: "68%" },
          position: "absolute",
          right: 30,
          marginTop: { xs: -2, md: -5 },
        }}
      >
        <Grid container>
          <Grid xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate("/FinancialYearBudgetFilter")}
              variant="contained"
              disableElevation
              startIcon={<AddIcon />}
            >
              Create
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ marginTop: { xs: 10, md: 3 } }}>
        <GridIndex rows={budgetList} columns={columns} />
      </Box>
    </>
  );
};

export default BudgetIndex;