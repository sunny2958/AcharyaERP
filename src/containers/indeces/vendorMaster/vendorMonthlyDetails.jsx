import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TableFooter,
  Box,
  Button,
  Breadcrumbs,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../../services/Api';
import useBreadcrumbs from '../../../hooks/useBreadcrumbs';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { makeStyles } from "@mui/styles";
import moment from 'moment';
import { BlobProvider } from '@react-pdf/renderer';
import LedgerMonthlyTransactionPdf from './LedgerMonthlyTransactionPdf';
import useAlert from '../../../hooks/useAlert';

const useStyles = makeStyles((theme) => ({
  breadcrumbsContainer: {
    position: "relative",
    marginBottom: 10,
    width: "fit-content",
    zIndex: theme.zIndex.drawer - 1,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    cursor: "pointer",
    "&:hover": { textDecoration: "underline" },
  },
}));



const VendorMonthlyDetails = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [breadCrumbs, setBreadCrumbs] = useState([])
  const location = useLocation()
  const queryValues = location.state;
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const [currFcYear, setCurrFcYear] = useState({
    fcYearId: queryValues?.fcYearId,
    fcYear: queryValues?.fcYear
  })
   const { setAlertMessage, setAlertOpen } = useAlert();

  useEffect(() => {
    if (queryValues?.isBRSTrue) {
      setBreadCrumbs([
        { name: "Bank Balance", link: "/bank-balance" },
        { name: "BRS", link: "/institute-bank-balance", state: { bankGroupId: queryValues?.bankGroupId } },
        { name: "Monthly Transaction" },
      ]);
    } else {
      setBreadCrumbs([
        { name: "Ledger", link: "/Accounts-ledger", state: queryValues },
        { name: "Monthly Transaction" }
      ])
    }
    setCrumbs([])
  }, [])

  useEffect(() => {
    getData()
  }, [currFcYear?.fcYearId])

  const getData = async () => {
    const { voucherHeadId, fcYearId, schoolId, ledgerType, isTotalRow } = queryValues
    const baseUrl = isTotalRow && ledgerType === "EARNINGS" ? "api/finance/getMonthWiseSummary" : "/api/finance/getLedgerSummaryMonthlyWise"
    let params = {}
    if(isTotalRow){
      params={
      ...(voucherHeadId && { voucherHeadNewId: voucherHeadId }),
      ...(fcYearId && { fcYearId: currFcYear?.fcYearId }),
      }
     }else{
       params={
      ...(voucherHeadId && { voucherHeadNewId: voucherHeadId }),
      ...(fcYearId && { fcYearId: currFcYear?.fcYearId }),
      ...(schoolId && { schoolId })
      }
     }
    setLoading(true)
    await axios
      .get(baseUrl, { params })
      .then((res) => {
        const { data } = res?.data
        const rowData = []
        data?.vendorDetails?.length > 0 && data?.vendorDetails?.forEach(el => {
          rowData.push({
            credit: el?.credit,
            debit: el?.debit,
            month_name: el?.month_name,
            school_id: el?.school_id,
            month: el?.month,
            year: queryValues?.ledgerType ? el?.year : "",
            openingBalance: formatDrCr(el?.openingBalance, queryValues?.ledgerType),
            closingBalance: formatDrCr(el?.closingBalance, queryValues?.ledgerType),
          })
        });
        const financialYearOrder = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
        rowData.sort((a, b) => {
          return financialYearOrder.indexOf(a.month) - financialYearOrder.indexOf(b.month);
        });

        setRows({
          vendorDetails: rowData,
          totalCredit: data?.totalCredit,
          totalDebit: data?.totalDebit,
          // openingBalance: data?.openingBalance,
          schoolName: data?.schoolName,
          closingBalance: formatCurrency(data?.closingBalance)
        });
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        setAlertMessage({
          severity: "error",
          message: "Something went wrong.",
        });
        setAlertOpen(true);
        console.error(err)
      });
  };

  const handleRowClick = (row) => {
    const { month, month_name, year } = row
    const query = { ...queryValues, fcYear: currFcYear?.fcYear, fcYearId: currFcYear?.fcYearId, month, month_name, year: year || ""  }
    if (queryValues?.isTotalRow) {
      navigate('/Accounts-ledger-monthly-institute-transaction', { state: query })
    }else{
      if (queryValues?.ledgerType !== "EARNINGS") {
      navigate('/Accounts-ledger-day-transaction', { state: query })
    }
  }
  };

  const handlePreviousOpeningBalance = () => {
    const { fcYearOpt: fcYearOptions } = queryValues
    const currentIndex = fcYearOptions?.findIndex(
      (item) => item?.value === currFcYear?.fcYearId
    );
    if (currentIndex < fcYearOptions?.length - 1) {
      const prevYear = fcYearOptions[currentIndex + 1];
      setCurrFcYear((prev) => ({
        ...prev,
        ['fcYearId']: prevYear?.value,
        ['fcYear']: prevYear?.label
      }));
    }
  }

  const handleNextOpeningBalance = () => {
    const { fcYearOpt: fcYearOptions } = queryValues
    const currentIndex = fcYearOptions?.findIndex(
      (item) => item?.value === currFcYear?.fcYearId
    );
    if (currentIndex > 0) {
      const nextFCYear = fcYearOptions[currentIndex - 1];
      setCurrFcYear((prev) => ({
        ...prev,
        ['fcYearId']: nextFCYear?.value,
        ['fcYear']: nextFCYear?.label
      }));
    }
  };


  const getFormattedMonthYear = (monthNumber, fcYear) => {
    const monthMap = {
      1: 'Jan',
      2: 'Feb',
      3: 'Mar',
      4: 'Apr',
      5: 'May',
      6: 'Jun',
      7: 'Jul',
      8: 'Aug',
      9: 'Sep',
      10: 'Oct',
      11: 'Nov',
      12: 'Dec',
    };

    const [startYear, endYear] = fcYear.split("-");
    const yearSuffix = monthNumber >= 4 ? startYear.slice(-2) : endYear.slice(-2);

    return `${monthMap[monthNumber]} ${yearSuffix}`;
  };


  const formatCurrency = (value, decimals = 2) => {
    if (value === null || value === undefined || value === '') return `0.00`;
    if (typeof value === 'string' && (value.includes('Cr') || value.includes('Dr'))) {
      const parts = value.split(' ');
      const numValue = parseFloat(parts[0]);
      const suffix = parts[1] || '';

      if (isNaN(numValue)) return `0.00`;

      return `${numValue.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })} ${suffix}`;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return `0.00`;

    return numValue.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatDrCr = (value, ledgerType) => {
    const absVal = Math.abs(value);

    if (value === 0) return "0";

    if (ledgerType === "VENDOR" || ledgerType === "INFLOW") {
      return value < 0 ? `${absVal} Dr` : `${absVal} Cr`;
    } else if (ledgerType === "CASHORBANK" || ledgerType === 'EARNINGS' || ledgerType === "ASSETS/ADVANCE" || ledgerType === "EXPENDITURE") {
      return value > 0 ? `${absVal} Dr` : `${absVal} Cr`;
    } else {
      return value;
    }
  };


  return (

    <Box sx={{
      width: '100%',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        width: '100%'
      }}>
        <CustomBreadCrumbs crumbs={breadCrumbs} />
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          justifyContent: 'end'
        }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handlePreviousOpeningBalance}
            disabled={currFcYear?.fcYearId === queryValues?.fcYearOpt[queryValues?.fcYearOpt?.length - 1]?.value}
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' },
              fontWeight: 500,
              color: '#424242',
              fontSize: '0.8125rem',
              minWidth: '90px',
              py: '6px'
            }}
          >
            Prev
          </Button>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNextOpeningBalance}
            disabled={currFcYear?.fcYearId === queryValues?.fcYearOpt[0]?.value}
            sx={{
              backgroundColor: '#e3f2fd',
              '&:hover': { backgroundColor: '#bbdefb' },
              fontWeight: 500,
              color: '#1976d2',
              fontSize: '0.8125rem',
              minWidth: '90px',
              py: '6px'
            }}
          >
            Next
          </Button>
          <BlobProvider
            document={
              <LedgerMonthlyTransactionPdf
                rows={rows}
                currFcYear={currFcYear}
                queryValues={queryValues}
              />
            }
          >
            {({ url, loading }) => (
              <Button
                variant="contained"
                color="primary"
                disabled={rows?.length === 0}
                onClick={() => {
                  if (url) {
                    window.open(url, '_blank');
                  }
                }}
              >
                Print PDF
              </Button>
            )}
          </BlobProvider>
        </Box>
      </Box>
      <Box sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
        minHeight: 300,
        width: '70%',
        margin: "auto"
      }}>
        {loading ? (
          <Box sx={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}>
            <CircularProgress size={24} thickness={4} sx={{ color: '#2c3e50' }} />
          </Box>
        ) : (
          <>
            <Box sx={{
              p: 2,
              backgroundColor: '#376a7d',
              color: 'white',
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center' }}>
                {queryValues?.isTotalRow ? queryValues?.voucherHeadName : rows?.schoolName}
              </Typography>
              <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
                {queryValues?.isTotalRow ? `FY ${currFcYear?.fcYear}`  :`${queryValues?.voucherHeadName} Ledger for FY ${currFcYear?.fcYear}`}
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center', opacity: 0.9 }}>
                {`As on ${moment().format('DD-MM-YYYY')}`}
              </Typography>
            </Box>

            <TableContainer>
              <Table size="small" sx={{
                '& .MuiTableCell-root': {
                  // fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '0.8125rem',
                  lineHeight: '1.43',
                  padding: '10px 16px',
                  // borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                  '&:last-child': { borderRight: 'none' }
                }
              }}>
                <TableHead>
                  <TableRow sx={{
                    backgroundColor: '#f5f5f5',
                    '& th': {
                      color: 'rgba(0, 0, 0, 0.87)',
                      fontWeight: 'bold',
                      fontSize: '0.8125rem',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                      borderTop: '1px solid rgba(224, 224, 224, 1)',
                    }
                  }}>
                    <TableCell sx={{ width: '20%' }} align="left">Month</TableCell>
                    <TableCell sx={{ width: '20%' }} align="right">Opening Balance</TableCell>
                    <TableCell sx={{ width: '20%' }} align="right">Debit</TableCell>
                    <TableCell sx={{ width: '20%' }} align="right">Credit</TableCell>
                    <TableCell sx={{ width: '20%' }} align="right">Closing Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows?.vendorDetails?.length > 0 ? (<>
                    {rows?.vendorDetails?.map((row, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          cursor: 'pointer',
                          '&:nth-of-type(even)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                        onClick={() => handleRowClick(row)}
                      >
                        <TableCell align="left" sx={{
                          fontWeight: 400,
                          color: 'rgba(0, 0, 0, 0.87)'
                        }}>
                          {getFormattedMonthYear(row.month, currFcYear.fcYear)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.openingBalance)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.debit)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.credit)}
                        </TableCell>
                        <TableCell align="right" sx={{
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.87)'
                        }}>
                          {formatCurrency(row.closingBalance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      '& td': {
                        fontWeight: 600,
                        borderTop: '1px solid rgba(0, 0, 0, 0.12)'
                      }
                    }}>
                      <TableCell align="left">Total</TableCell>
                      <TableCell align="right"></TableCell>
                      <TableCell align="right">
                        {formatCurrency(rows?.totalDebit)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(rows?.totalCredit)}
                      </TableCell>
                      <TableCell align="right">
                      </TableCell>
                    </TableRow>
                  </>) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, border: 'none' }}>
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          color: 'text.secondary',
                          height: '200px',
                          border: 'none'
                        }}>

                          <Typography variant="body1" sx={{ fontWeight: 500, margin: "auto" }}>
                            No data available
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>)}
      </Box>
    </Box>
  );
};

export default VendorMonthlyDetails;

const CustomBreadCrumbs = ({ crumbs = [] }) => {
  const navigate = useNavigate()
  const classes = useStyles()
  if (crumbs.length <= 0) return null

  return (
    <Box className={classes.breadcrumbsContainer}>
      <Breadcrumbs
        style={{ fontSize: "1.15rem" }}
        separator={<NavigateNextIcon fontSize="small" />}
      >
        {crumbs?.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={index}>
              {!isLast ? (
                <Typography
                  onClick={() => navigate(crumb.link, { state: crumb.state })}
                  className={classes.link}
                  fontSize="inherit"
                >
                  {crumb.name}
                </Typography>
              ) : (
                <Typography color="text.primary" fontSize="inherit">
                  {crumb.name}
                </Typography>
              )}
            </span>
          );
        })}
      </Breadcrumbs>
    </Box>
  )
}
