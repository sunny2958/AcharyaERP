import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  tableCellClasses,
  styled,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import useAlert from "../../../hooks/useAlert";
import CustomFileInput from "../../../components/Inputs/CustomFileInput";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import axios from "../../../services/Api";
import { useNavigate } from "react-router-dom";

const userId = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userId;

const empId = sessionStorage.getItem("empId");

const itemData = {
  itemId: null,
  quantity: null,
  approximateRate: null,
  totalValue: null,
  vendorName: "",
  vendorContactNo: "",
};

const initialValues = {
  fileName: "",
  remarks: "",
  itemsData: [itemData, itemData, itemData, itemData],
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.headerWhite.main,
    border: "1px solid rgba(224, 224, 224, 1)",
  },
}));

const StyledTableCellBody = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.body}`]: {
    border: "1px solid rgba(224, 224, 224, 1)",
  },
}));
function PurchaseIndent() {
  const [values, setValues] = useState(initialValues);
  const [itemOptions, setItemOptions] = useState([]);
  const [validRows, setValidRows] = useState();
  const [loading, setLoading] = useState(false);
  const [fileResponse, setFileResponse] = useState([]);
  const [approverId, setApproverId] = useState(null);

  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();

  const checks = {
    fileName: [
      values.fileName,
      values.fileName && values.fileName.name.toLowerCase().endsWith(".pdf"),
      values.fileName && values.fileName.size < 2000000,
    ],
  };

  const errorMessages = {
    fileName: [
      "This field is required",
      "Please upload a PDF",
      "Maximum size 2 MB",
    ],
  };

  useEffect(() => {
    getStoreIndentApproverId();
    getItemsData();
    setCrumbs([
      { name: "Purchase Indent", link: "/PurchaseIndentIndexUserwise" },
    ]);
  }, []);

  useEffect(() => {
    const isRowsValid = values?.itemsData?.some(
      (obj) => obj.itemId !== null && obj.quantity !== null
    );
    setValidRows(isRowsValid);
  }, [values]);

  const getItemsData = async () => {
    await axios
      .get(`/api/inventory/getItemNameConcatWithdescriptionAndMake`)
      .then((res) => {
        const data = [];
        res.data.data.forEach((obj) => {
          data.push({
            value: obj.env_item_id,
            label: obj.ITEM_NAME,
            uom: obj.measure_id,
            closingStock: obj.closingStock,
            storeItemId: obj.item_id,
            ledgerId: obj.ledger_id,
          });
        });
        setItemOptions(data);
      })
      .catch((err) => console.error(err));
  };

  const getStoreIndentApproverId = async () => {
    await axios
      .get(`/api/purchaseIndent/getApproverId?userId=${empId}`)
      .then((res) => {
        setApproverId(res.data.data.storeIndentApproverId);
      })
      .catch((err) => console.error(err));
  };

  values.itemsData.forEach((obj, i) => {
    checks[obj.quantity] = [/^[0-9]{1,100}$/.test(obj.quantity)];
    errorMessages[obj.quantity] = ["Enter only numbers"];
    checks[obj.approximateRate] = [/^[0-9]{1,100}$/.test(obj.approximateRate)];
    errorMessages[obj.approximateRate] = ["Enter only numbers"];
    checks[obj.vendorContactNo] = [/^[0-9]{10}$/.test(obj.vendorContactNo)];
    errorMessages[obj.vendorContactNo] = ["Invalid contact no"];
  });

  const handleChangeAdvance = (name, newValue) => {
    const splitName = name.split("-");
    const keyName = splitName[0];
    const index = splitName[1];

    const selectedItem = itemOptions.find((obj) => obj.value === newValue);

    const isItemSelected = values.itemsData.some(
      (row) => row.itemId === newValue
    );

    if (!isItemSelected) {
      setValues((prev) => ({
        ...prev,
        itemsData: prev.itemsData.map((obj, i) => {
          if (Number(index) === i)
            return {
              ...obj,
              [keyName]: newValue,
              ["itemNameDescription"]: selectedItem.label,
              ["ledgerId"]: selectedItem.ledgerId,
            };
          return obj;
        }),
      }));
    } else {
      setAlertMessage({
        severity: "error",
        message: "Item is already selected",
      });
      setAlertOpen(true);
    }
  };

  const handleChange = (e, index) => {
    const keyName = e.target.name;

    if (keyName === "approximateRate") {
      setValues((prev) => ({
        ...prev,
        itemsData: prev.itemsData.map((obj, i) => {
          if (Number(index) === i)
            return {
              ...obj,
              [keyName]: e.target.value,
              ["totalValue"]: obj.quantity * e.target.value,
            };
          return obj;
        }),
      }));
    } else {
      setValues((prev) => ({
        ...prev,
        itemsData: prev.itemsData.map((obj, i) => {
          if (Number(index) === i)
            return {
              ...obj,
              [keyName]: e.target.value,
            };
          return obj;
        }),
      }));
    }
  };

  const handleChangeRemarks = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileDrop = (name, newFile) => {
    if (newFile)
      setValues((prev) => ({
        ...prev,
        [name]: newFile,
      }));
  };
  const handleFileRemove = (name) => {
    setValues((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  const addRow = () => {
    setValues((prev) => ({
      ...prev,
      itemsData: [...values.itemsData, itemData],
    }));
  };

  const deleteRow = () => {
    const filterRow = [...values.itemsData];
    filterRow.pop();
    setValues((prev) => ({ ...prev, itemsData: filterRow }));
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const dataArray = new FormData();
      dataArray.append("file", values.fileName);

      const fileRes = await axios.post(
        `/api/purchaseIndent/uploadPurchaseIndentFile`,
        dataArray
      );

      setFileResponse(fileRes);

      if (fileRes) {
        const payload = [];
        values.itemsData.forEach((obj) => {
          if (obj.itemId !== null)
            payload.push({
              envItemId: obj.itemId,
              ledgerId: obj.ledgerId,
              quantity: obj.quantity,
              approxRate: obj.approximateRate,
              vendorName: obj.vendorName,
              vendorContactNo: obj.vendorContactNo,
              createdBy: userId,
              attachmantPathType: fileRes.data.data.attachmentPath,
              remark: values.remarks,
              itemDescription: obj.itemNameDescription,
              totalValue: obj.totalValue,
              status: "Pending",
              approverId: approverId,
            });
        });

        await axios.post(`/api/purchaseIndent/saveIndent`, payload);

        setAlertMessage({
          severity: "success",
          message: "Purchase Indent Created",
        });
        setLoading(false);
        setAlertOpen(true);
        navigate("/PurchaseIndentIndexUserwise");
      } else {
        setAlertMessage({
          severity: "success",
          message: "Error Occured",
        });
        setAlertOpen(true);
        setLoading(false);
      }
    } catch (error) {
      setAlertMessage({
        severity: "error",
        message: error.response ? error.response.data.message : "",
      });
      setAlertOpen(true);
      setLoading(false);
    }
  };

  return (
    <>
      <Box component="form" overflow="hidden" p={1}>
        <Grid
          container
          justifyContent="flex-start"
          rowSpacing={2}
          columnSpacing={2}
        >
          <Grid item xs={12}></Grid>
          <Grid item xs={12} md={5}></Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="red">
              Note : These are non-mandatory fields, please suggest vendors if
              any
            </Typography>
          </Grid>
          <Grid item xs={12} md={3} align="right">
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
            <Button
              variant="contained"
              color="error"
              sx={{
                borderRadius: 2,
                marginLeft: 2,
              }}
              onClick={deleteRow}
            >
              <RemoveIcon />
            </Button>
          </Grid>
          <Grid item xs={12} md={5}>
            <TableContainer sx={{ padding: "5px" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCell sx={{ width: "70%", textAlign: "center" }}>
                      Item *
                    </StyledTableCell>
                    <StyledTableCell sx={{ textAlign: "center" }}>
                      Qty *
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {values?.itemsData?.map((obj, i) => {
                    return (
                      <TableRow key={i}>
                        <StyledTableCellBody>
                          <CustomAutocomplete
                            name={`itemId` + "-" + i}
                            label="Item"
                            value={obj.itemId}
                            options={itemOptions}
                            handleChangeAdvance={handleChangeAdvance}
                            required
                          />
                        </StyledTableCellBody>
                        <StyledTableCellBody>
                          <CustomTextField
                            name="quantity"
                            value={obj.quantity}
                            handleChange={(e) => handleChange(e, i)}
                            checks={checks[obj.quantity]}
                            errors={errorMessages[obj.quantity]}
                          />
                        </StyledTableCellBody>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={7}>
            <TableContainer sx={{ padding: "5px" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCell sx={{ textAlign: "center" }}>
                      Approx rate
                    </StyledTableCell>
                    <StyledTableCell sx={{ textAlign: "center" }}>
                      Total Value
                    </StyledTableCell>
                    <StyledTableCell sx={{ textAlign: "center" }}>
                      Vendor Name
                    </StyledTableCell>
                    <StyledTableCell sx={{ textAlign: "center" }}>
                      Vendor No.
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {values?.itemsData?.map((obj, i) => {
                    return (
                      <TableRow key={i}>
                        <StyledTableCellBody>
                          <CustomTextField
                            name="approximateRate"
                            value={obj.approximateRate}
                            handleChange={(e) => handleChange(e, i)}
                            checks={checks[obj.approximateRate]}
                            errors={errorMessages[obj.approximateRate]}
                          />
                        </StyledTableCellBody>
                        <StyledTableCellBody>
                          <CustomTextField
                            name="totalValue"
                            value={obj.totalValue}
                            handleChange={(e) => handleChange(e, i)}
                            disabled
                          />
                        </StyledTableCellBody>
                        <StyledTableCellBody>
                          <CustomTextField
                            name="vendorName"
                            value={obj.vendorName}
                            handleChange={(e) => handleChange(e, i)}
                          />
                        </StyledTableCellBody>
                        <StyledTableCellBody>
                          <CustomTextField
                            name="vendorContactNo"
                            value={obj.vendorContactNo}
                            handleChange={(e) => handleChange(e, i)}
                            checks={checks[obj.vendorContactNo]}
                            errors={errorMessages[obj.vendorContactNo]}
                          />
                        </StyledTableCellBody>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={2} md={4}>
            <CustomFileInput
              name="fileName"
              label="PDF"
              helperText="PDF - smaller than 2 MB"
              file={values.fileName}
              handleFileDrop={handleFileDrop}
              handleFileRemove={handleFileRemove}
              checks={checks.fileName}
              errors={errorMessages.fileName}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomTextField
              multiline
              rows={2.5}
              name="remarks"
              label="Remarks"
              handleChange={handleChangeRemarks}
            />
          </Grid>

          <Grid item xs={12} md={4} align="right">
            <Button
              variant="contained"
              sx={{ borderRadius: 2 }}
              onClick={handleCreate}
              disabled={
                !validRows ||
                loading ||
                !values?.fileName?.name?.endsWith(".pdf")
              }
            >
              {loading ? (
                <CircularProgress
                  size={25}
                  color="blue"
                  style={{ margin: "2px 13px" }}
                />
              ) : (
                <strong>{"Create"}</strong>
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
export default PurchaseIndent;
