import { useState, useEffect, lazy } from "react";
import {
  IconButton,
  Tooltip,
  styled,
  tooltipClasses,
  Grid,
} from "@mui/material";
import useBreadcrumbs from "../../hooks/useBreadcrumbs";
import { useNavigate } from "react-router-dom";
import useAlert from "../../hooks/useAlert";
import AddIcon from "@mui/icons-material/Add";
import { Button, Box } from "@mui/material";
import CustomModal from "../../components/CustomModal";
import axios from "../../services/Api";
import moment from "moment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ModalWrapper from "../../components/ModalWrapper";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Check, HighlightOff } from "@mui/icons-material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PrintIcon from "@mui/icons-material/Print";
import CustomAutocomplete from "../../components/Inputs/CustomAutocomplete";
import CustomDatePicker from "../../components/Inputs/CustomDatePicker";

const GridIndex = lazy(() => import("../../components/GridIndex"));

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
  directDemandList: [],
  modalOpen: false,
  modalContent: modalContents,
  attachmentModal: false,
  fileUrl: null,
};

const filterLists = [
  { label: "Today", value: "today" },
  { label: "1 Week", value: "week" },
  { label: "1 Month", value: "month" },
  { label: "Custom Date", value: "custom" },
];

const initialValues = {
  filterList: filterLists,
  filter: filterLists[0].value,
  startDate: "",
  endDate: "",
  schoolList: [],
  schoolId: "",
};

const DirectDemandIndex = () => {
  const [{ modalOpen, modalContent, fileUrl, attachmentModal }, setState] =
    useState(initialState);
  const [values, setValues] = useState(initialValues);
  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    created_date: false,
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCrumbs([{ name: "Direct Demand" }]);
    getDirectDemandList(values.filterList[0].value);
  }, []);

  const setNullField = () => {
    setValues((prevState) => ({
      ...prevState,
      startDate: "",
      endDate: "",
    }));
  };

  const handleChangeAdvance = (name, newValue) => {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    if (name == "endDate") {
      getDirectDemandList("custom", newValue);
    } else if (name == "startDate" || newValue == "custom") {
    } else if (name == "schoolId") {
      getDirectDemandList("schoolId", newValue);
    } else {
      getDirectDemandList(newValue, "");
      setNullField();
    }
  };

  const columns = [
    { field: "category_detail", headerName: "Category", flex: 1 },
    {
      field: "requested_amount",
      headerName: "Requested Amount",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "date",
      headerName: "Pay by Date",
      flex: 1,
      renderCell: (params) => moment(params.row?.date).format("DD-MM-YYYY"),
    },
    { field: "remarks", headerName: "Remarks", flex: 1 },
    {
      field: "attachment_path",
      headerName: "Attachment",
      flex: 1,
      type: "actions",
      getActions: (params) => [
        <HtmlTooltip title="View DD Attachment">
          <IconButton
            onClick={() => getUploadData(params.row?.attachment_path)}
            disabled={!params.row.attachment_path || !params.row.active}
          >
            {!params.row.active || !params.row.attachment_path ? (
              <VisibilityIcon color="primary" sx={{ fontSize: 22 }} />
            ) : (
              <VisibilityIcon color="primary" sx={{ fontSize: 22 }} />
            )}
          </IconButton>
        </HtmlTooltip>,
      ],
    },
    {
      field: "created_date",
      headerName: "Created Date",
      flex: 1,
      hide: true,
      valueGetter: (value, row) =>
        row.created_date ? moment(row.created_date).format("DD-MM-YYYY") : "",
    },
    { field: "created_username", headerName: "Created By", flex: 1 },
    {
      field: "id",
      headerName: "Journal Voucher",
      flex: 1,
      renderCell: (params) =>
        params.row.journal_voucher_id ? (
          <IconButton
            onClick={() =>
              handleGeneratePdf(
                params.row.journalVoucherNumber,
                params.row.institute_id,
                params.row.financialYearId
              )
            }
          >
            <PrintIcon color="primary" />
          </IconButton>
        ) : (
          <IconButton
            onClick={() =>
              navigate(
                `/journal-voucher/demand/${params.row.requested_amount}`,
                {
                  state: { directStatus: true, directDemandId: params.row.id },
                }
              )
            }
          >
            <AddBoxIcon color="primary" sx={{ fontSize: 22 }} />
          </IconButton>
        ),
    },
    {
      field: "payment-voucher",
      headerName: "Payment Voucher",
      flex: 1,
      renderCell: (params) =>
        params.row.journal_voucher_id && !params.row.payment_voucher_id ? (
          <IconButton
            onClick={() =>
              navigate(`/draft-payment-voucher`, {
                state: {
                  index_status: true,
                  amount: params.row.requested_amount,
                  directStatus: true,
                  directDemandId: params.row.id,
                },
              })
            }
          >
            <AddBoxIcon color="primary" sx={{ fontSize: 22 }} />
          </IconButton>
        ) : params.row.journal_voucher_id && params.row.payment_voucher_id ? (
          <IconButton
            onClick={() =>
              navigate(
                `/payment-voucher-pdf/${params.row.payment_voucher_id}`,
                {
                  state: { directPdfStatus: true },
                }
              )
            }
          >
            <PrintIcon color="primary" />
          </IconButton>
        ) : (
          ""
        ),
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
        ,
      ],
    },
  ];

  const handleGeneratePdf = async (
    journalVoucherNumber,
    schoolId,
    fcYearId
  ) => {
    navigate(`/generate-journalvoucher-pdf/${journalVoucherNumber}`, {
      state: { grnIndexStatus: true, schoolId, fcYearId },
    });
  };

  const handleActive = async (params) => {
    const id = params.row.id;
    setModalOpen(true);
    const handleToggle = async () => {
      if (params.row.active === true) {
        try {
          const res = await axios.delete(
            `api/finance/deActivateEnvBillDetails/${id}`
          );
          if (res.status === 200) {
            closeModalAndGetData();
          }
        } catch (err) {
          setAlertMessage({
            severity: "error",
            message: "An error occured",
          });
          setAlertOpen(true);
        }
      } else {
        try {
          const res = await axios.delete(
            `api/finance/activateEnvBillDetails/${id}`
          );
          if (res.status === 200) {
            closeModalAndGetData();
          }
        } catch (err) {
          setAlertMessage({
            severity: "error",
            message: "An error occured",
          });
          setAlertOpen(true);
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

  const setModalOpen = (val) => {
    setState((prevState) => ({
      ...prevState,
      modalOpen: val,
    }));
  };

  const closeModalAndGetData = () => {
    getDirectDemandList();
    setModalOpen(false);
  };

  const getDirectDemandList = async (filterKey, value) => {
    setLoading(true);
    let params = null;
    if (
      filterKey == "custom" &&
      !!value &&
      !!values.startDate &&
      !values.schoolId
    ) {
      params = `page=${0}&page_size=${1000000}&sort=created_date&date_range=custom&start_date=${moment(
        values.startDate
      ).format("YYYY-MM-DD")}&end_date=${moment(value).format("YYYY-MM-DD")}`;
    } else if (
      filterKey == "custom" &&
      !!value &&
      !!values.startDate &&
      !!values.schoolId
    ) {
      params = `page=${0}&page_size=${1000000}&sort=created_date&school_id=${
        values.schoolId
      }&date_range=custom&start_date=${moment(values.startDate).format(
        "YYYY-MM-DD"
      )}&end_date=${moment(value).format("YYYY-MM-DD")}`;
    } else if (
      filterKey == "schoolId" &&
      !!values.endDate &&
      !!values.startDate
    ) {
      params = `page=${0}&page_size=${1000000}&sort=created_date&school_id=${value}&date_range=custom&start_date=${moment(
        values.startDate
      ).format("YYYY-MM-DD")}&end_date=${moment(values.endDate).format(
        "YYYY-MM-DD"
      )}`;
    } else if (
      filterKey == "schoolId" &&
      !!values.filter &&
      !values.endDate &&
      !values.startDate
    ) {
      if (value === null) {
        params = `page=${0}&page_size=${1000000}&sort=created_date&date_range=${
          values.filter
        }`;
      } else {
        params = `page=${0}&page_size=${1000000}&sort=created_date&school_id=${value}&date_range=${
          values.filter
        }`;
      }
    } else if (filterKey !== "custom" && !!values.schoolId) {
      params = `page=${0}&page_size=${1000000}&sort=created_date&date_range=${filterKey}&school_id=${
        values.schoolId
      }`;
    } else {
      params = `page=${0}&page_size=${1000000}&sort=created_date&date_range=${filterKey}`;
    }

    if (params) {
      await axios
        .get(`/api/finance/fetchAllEnvBillDetails?${params}`)
        .then((response) => {
          setLoading(false);
          setRows(response.data.data.Paginated_data.content);
        })
        .catch((err) => {
          setLoading(false);
          console.error(err);
        });
    }
  };

  const getUploadData = async (ddAttachment) => {
    await axios(
      `/api/finance/EnvBillDetailsFileviews?fileName=${ddAttachment}`,
      {
        method: "GET",
        responseType: "blob",
      }
    )
      .then((res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(file);
        setState((prevState) => ({
          ...prevState,
          attachmentModal: !attachmentModal,
          fileUrl: url,
        }));
      })
      .catch((error) => {
        setAlertMessage({
          severity: "error",
          message: "An error occured",
        });
        setAlertOpen(true);
      });
  };

  const handleViewAttachmentModal = () => {
    setState((prevState) => ({
      ...prevState,
      attachmentModal: !attachmentModal,
    }));
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

      <Grid
        container
        sx={{
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        <Grid xs={12} md={2}>
          <CustomAutocomplete
            name="filter"
            label="filter"
            value={values.filter}
            options={values.filterList || []}
            handleChangeAdvance={handleChangeAdvance}
          />
        </Grid>
        {values.filter == "custom" && (
          <Grid item xs={12} md={2}>
            <CustomDatePicker
              name="startDate"
              label="From Date"
              value={values.startDate}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>
        )}
        {values.filter == "custom" && (
          <Grid item xs={12} md={2}>
            <CustomDatePicker
              name="endDate"
              label="To Date"
              value={values.endDate}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!values.startDate}
              required
            />
          </Grid>
        )}
        <Grid xs={12} md={2} sx={{ justifyContent: "flex-end" }}>
          <Button
            onClick={() =>
              navigate("/directpay-demand-form", {
                state: { path: "direct-demand-index", value: null },
              })
            }
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
          >
            Create
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ position: "relative", marginTop: { xs: 8, md: 1 } }}>
        <Box sx={{ position: "absolute", width: "100%" }}>
          <GridIndex
            rows={rows || []}
            columns={columns}
            columnVisibilityModel={columnVisibilityModel}
            setColumnVisibilityModel={setColumnVisibilityModel}
          />
        </Box>
      </Box>
      {!!attachmentModal && (
        <ModalWrapper
          title="Direct Demand Attachment"
          maxWidth={600}
          open={attachmentModal}
          setOpen={() => handleViewAttachmentModal()}
        >
          <Grid container>
            <Grid item xs={12} md={12}>
              {!!fileUrl ? (
                <iframe
                  width="100%"
                  style={{ height: "100vh" }}
                  src={fileUrl}
                ></iframe>
              ) : (
                <></>
              )}
            </Grid>
          </Grid>
        </ModalWrapper>
      )}
    </>
  );
};

export default DirectDemandIndex;
