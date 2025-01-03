import { useEffect, useState } from "react";
import axios from "../services/Api";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.tableBg.main,
    color: theme.palette.tableBg.textColor,
    border: "1px solid rgba(224, 224, 224, 1)",
  },
}));

const StyledTableCellBody = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.body}`]: {
    border: "1px solid rgba(224, 224, 224, 1)",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const categories = [
  { name: "SSLC", prefix: "sslc" },
  { name: "PUC", prefix: "puc" },
  { name: "UG", prefix: "ug" },
  { name: "PG", prefix: "pg" },
];

function ApplicantDetails({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getData();
  }, [id]);

  const getData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: response } = await axios.get(
        `/api/student/findAllDetailsPreAdmission1/${id}`
      );
      const responseData = response.data[0];
      setData(responseData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch applicant details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Typography
        variant="subtitle2"
        color="error"
        sx={{ textAlign: "center" }}
      >
        Please wait ....
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography
        variant="subtitle2"
        color="error"
        sx={{ textAlign: "center" }}
      >
        {error}
      </Typography>
    );
  }

  if (!data) {
    return (
      <Typography
        variant="subtitle2"
        color="error"
        sx={{ textAlign: "center" }}
      >
        Applicant Details Not Found.
      </Typography>
    );
  }

  const DisplayContent = ({ label, value }) => {
    return (
      <>
        <Grid item xs={12} md={2}>
          <Typography variant="subtitle2">{label}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            {value}
          </Typography>
        </Grid>
      </>
    );
  };

  const DisplayAddressContent = ({ label, value }) => {
    return (
      <>
        <Grid item xs={12} md={2}>
          <Typography variant="subtitle2">{label}</Typography>
        </Grid>
        <Grid item xs={12} md={10}>
          <Typography variant="subtitle2" color="textSecondary">
            {value}
          </Typography>
        </Grid>
      </>
    );
  };

  const DisplayOptionalContent = ({ label, value }) => {
    return (
      <>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle2">{label}</Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle2" color="textSecondary">
            {value}
          </Typography>
        </Grid>
      </>
    );
  };

  const presentFullAddress = [
    [
      data.present_address1,
      data.presentAddress,
      data.presentCityName,
      data.presentStateName,
      data.presentCountryName,
      data.presentPincode,
    ],
  ];

  const permanentFullAddress = [
    [
      data.permanant_adress1,
      data.permanentAddress,
      data.permanentCityName,
      data.permanentStateName,
      data.permanentCountryName,
      data.permanentPincode,
    ],
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container rowSpacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Personal Details"
              titleTypographyProps={{ variant: "subtitle2" }}
              sx={{
                backgroundColor: "primary.main",
                color: "headerWhite.main",
                padding: 1,
              }}
            />
            <CardContent>
              <Grid container columnSpacing={2} rowSpacing={1}>
                <DisplayContent
                  label="Applicant Name"
                  value={data.candidateName}
                />
                <DisplayContent label="DOB" value={data.dateOfBirth} />
                <DisplayContent label="Gender" value={data.candidateSex} />
                <DisplayContent label="Mobile" value={data.mobileNumber} />
                <DisplayContent
                  label="Alternate Mobile "
                  value={data.alternate_number}
                />
                <DisplayContent
                  label="WhatsApp No."
                  value={data.whatsapp_number}
                />
                <DisplayContent
                  label="Personal Email"
                  value={data.candidateEmail}
                />
                <DisplayContent label="Religion" value={data.religion} />
                <DisplayContent label="Caste Category" value={data.caste} />
                <DisplayContent label="Blood Group" value={data.bloodGroup} />
                <DisplayContent
                  label="Marital Status"
                  value={data.marital_status}
                />
                <DisplayContent label="Aadhar No." value={data.aadhar} />
                <DisplayContent
                  label="Nationality"
                  value={data.nationalityName}
                />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Additional Information"
              titleTypographyProps={{ variant: "subtitle2" }}
              sx={{
                backgroundColor: "primary.main",
                color: "headerWhite.main",
                padding: 1,
              }}
            />
            <CardContent>
              <Grid container columnSpacing={2} rowSpacing={1}>
                <DisplayContent label="Father Name" value={data.fatherName} />
                <DisplayContent
                  label="Father Mobile"
                  value={data.fatherMobile}
                />
                <DisplayContent label="Father Email" value={data.fatherEmail} />
                <DisplayContent
                  label="Father Occupation"
                  value={data.fatherOccupation}
                />
                <DisplayContent
                  label="Father Qualification"
                  value={data.father_qualification}
                />
                <DisplayContent
                  label="Father Income"
                  value={data.father_annual_income}
                />

                <DisplayContent label="Mother Name" value={data.motherName} />
                <DisplayContent
                  label="Mother Mobile"
                  value={data.motherMobile}
                />
                <DisplayContent
                  label="Mother Email"
                  value={data.mother_email}
                />
                <DisplayContent
                  label="Mother Occupation"
                  value={data.mother_occupation}
                />
                <DisplayContent
                  label="Mother Qualification"
                  value={data.mother_qualification}
                />
                <DisplayContent
                  label="Mother Income"
                  value={data.mother_annual_income}
                />

                <DisplayContent
                  label="Guardian Name"
                  value={data.guardianName}
                />
                <DisplayContent
                  label="Guardian Mobile"
                  value={data.guardianMobile}
                />
                <DisplayContent
                  label="Guardian Email"
                  value={data.guardian_email}
                />
                <DisplayContent
                  label="Guardian Occupation"
                  value={data.guardian_occupation}
                />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Address Details"
              titleTypographyProps={{ variant: "subtitle2" }}
              sx={{
                backgroundColor: "primary.main",
                color: "headerWhite.main",
                padding: 1,
              }}
            />
            <CardContent>
              <Grid container columnSpacing={2} rowSpacing={1}>
                <DisplayAddressContent
                  label="Present Address"
                  value={presentFullAddress.filter(Boolean).join(", ")}
                />
                <DisplayAddressContent
                  label="Permanent Address"
                  value={permanentFullAddress.filter(Boolean).join(", ")}
                />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Academic Background"
              titleTypographyProps={{ variant: "subtitle2" }}
              sx={{
                backgroundColor: "primary.main",
                color: "headerWhite.main",
                padding: 1,
              }}
            />
            <CardContent>
              <Grid container columnSpacing={2} rowSpacing={1}>
                <Grid item xs={12}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Qualification</StyledTableCell>
                          <StyledTableCell>Board / University</StyledTableCell>
                          <StyledTableCell>
                            School / College Studied
                          </StyledTableCell>
                          <StyledTableCell>Passing Year</StyledTableCell>
                          <StyledTableCell>Max Marks</StyledTableCell>
                          <StyledTableCell>Marks Scored</StyledTableCell>
                          <StyledTableCell>Percentage(%)</StyledTableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {categories.map((obj) => (
                          <StyledTableRow>
                            <StyledTableCellBody>
                              {obj.name}
                            </StyledTableCellBody>
                            <StyledTableCellBody>
                              {data[`${obj.prefix}_board`]}
                            </StyledTableCellBody>
                            <StyledTableCellBody>
                              {data[`${obj.prefix}_school_name`]}
                            </StyledTableCellBody>
                            <StyledTableCellBody>
                              {data[`${obj.prefix}_year_of_passing`]}
                            </StyledTableCellBody>
                            <StyledTableCellBody>
                              {data[`${obj.prefix}_subject_max_marks`]}
                            </StyledTableCellBody>
                            <StyledTableCellBody>
                              {data[`${obj.prefix}_subject_marks_obtain`]}
                            </StyledTableCellBody>
                            <StyledTableCellBody>
                              {data[`${obj.prefix}_percentage_grade`] ||
                                data[`${obj.prefix}_percentage_obtain`]}
                            </StyledTableCellBody>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <DisplayOptionalContent
                  label="Optional Subjects Studied"
                  value={data.optional_subject}
                />
                <DisplayOptionalContent
                  label="Max.Marks or CGPA Prescribed"
                  value={data.optional_max_mark}
                />
                <DisplayOptionalContent
                  label="Marks or CGPA Obtained"
                  value={data.optional_min_mark}
                />
                <DisplayOptionalContent
                  label="% of Marks"
                  value={data.optional_percentage}
                />
                <DisplayOptionalContent
                  label="Entrance Exam Name"
                  value={data.entrance_exam_name}
                />
                <DisplayOptionalContent
                  label="Rank Obtained"
                  value={data.rank_obtainedAd}
                />
                <DisplayOptionalContent
                  label="Studied In"
                  value={data.rural_urban}
                />
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ApplicantDetails;
