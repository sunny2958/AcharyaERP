import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
  body: {
    margin: 0,
  },
  boldText: {
    fontWeight: "heavy",
    fontFamily: "Roboto",
  },
  headerSection: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "0 40px",
    marginTop: "50px",
  },
  headerText: {
    fontWeight: "heavy",
    fontSize: 10,
    fontFamily: "Roboto",
  },
  concernSection: {
    marginTop: "20px",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  concernText: {
    fontWeight: "heavy",
    fontSize: 11,
    fontFamily: "Roboto",
    marginLeft: "20px",
    borderBottomWidth: 1,
    borderBottomColor: "black",
    borderBottomStyle: "solid",
  },
  studentDetailSection: {
    marginTop: "20px",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    lineHeight: 1.5,
  },
  studentDetailText: {
    width: "65%",
    fontSize: 10,
    textAlign: "justify",
    margin: "0 auto",
  },
  studentTableSection: {
    marginTop: "20px",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  studentTableHeader: {
    display: "block",
    backgroundColor: "lightgray",
    padding: "5px",
    margin: "0px",
    borderRadius: "2px",
  },
  amtText: {
    marginTop: "20px",
    fontSize: 9,
    textAlign: "right",
    paddingRight: "40px",
    position: "relative",
    right: 20,
  },
  table: {
    display: "table",
    width: "80%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  particularTableCol: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  particularTableHeaderCol: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  tableCellHeader: {
    padding: 5,
    fontWeight: "heavy",
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Roboto",
    textTransform: "capitalize",
  },
  particularTableCellHeader: {
    padding: 5,
    fontWeight: "heavy",
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Roboto",
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
    wordWrap: "break-word",
    maxWidth: "100%",
    textAlign: "left",
  },
  tableAmountCell: {
    margin: 5,
    fontSize: 10,
    textAlign: "right",
  },
});

Font.registerHyphenationCallback((word) => [word]);

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
});

export const GenerateMediumOfInstruction = (
  studentBonafideDetail,
  studentDetail
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const HallTicketCopy = (
        <Document title="Student Bonafide">
          return (
          <Page size="a4" style={styles.body}>
            <View style={styles.concernSection}>
              <Text style={styles.concernText}>
                MEDIUM OF INSTRUCTION CERTIFICATE
              </Text>
            </View>
            <View style={styles.studentDetailSection}>
              <Text style={styles.studentDetailText}>
                This is to certify that{" "}
                <Text style={styles.boldText}>
                  {studentDetail?.candidate_sex == "Female" ? "MS." : "MR."}
                </Text>{" "}
                <Text style={styles.boldText}>
                  {studentDetail?.student_name || "-"},
                </Text>{" "}
                <Text style={styles.boldText}>
                  {studentDetail?.candidate_sex == "Female" ? "D/o." : "S/o."}
                </Text>{" "}
                <Text style={styles.boldText}>
                  {studentDetail?.father_name || "-"},
                </Text>{" "}
                mentioned below was enrolled at{" "}
                <Text style={styles.boldText}>
                  {studentDetail?.school_name}
                </Text>
                , Bangalore, affiliated with{" "}
                <Text>{studentBonafideDetail[0]?.bonafide_number}</Text>.
                <Text style={styles.boldText}>
                  {studentDetail?.candidate_sex == "Female" ? "She" : "He"}
                </Text>{" "}
                completed the Programme{" "}
                <Text style={styles.boldText}>
                  {studentDetail?.program_short_name || "-"}
                </Text>{" "}
                with a specialization in{" "}
                <Text style={styles.boldText}>
                  {studentDetail?.program_specialization_name || "-"}
                </Text>{" "}
                during the{" "}
                <Text style={styles.boldText}>
                  {studentDetail?.academic_batch}
                </Text>
                . The medium of instruction throughout the Programme was in
                English.
              </Text>
            </View>
            <View style={styles.studentTableSection}>
              <View
                style={{
                  width: "80%",
                  border: "1px solid lightgray",
                  borderRadius: "2px",
                }}
              >
                <View style={styles.studentTableHeader}>
                  <Text style={{ textAlign: "center", fontSize: "11px" }}>
                    Student Details
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginLeft: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "11px" }}>Auid</Text>
                    <Text
                      style={{
                        fontSize: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                        marginLeft: "10px",
                      }}
                    >
                      {studentDetail?.auid || "-"}
                    </Text>
                  </View>

                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginRight: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "10px" }}>Student Name</Text>
                    <Text
                      style={{
                        fontSize: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                        marginLeft: "10px",
                      }}
                    >
                      {studentDetail?.student_name || "-"}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginLeft: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "10px" }}>USN</Text>
                    <Text
                      style={{
                        fontSize: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                        marginLeft: "10px",
                      }}
                    >
                      {studentDetail?.usn || "-"}
                    </Text>
                  </View>

                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "10px", textAlign: "left" }}>
                      DOA
                    </Text>
                    <Text
                      style={{
                        fontSize: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                        marginLeft: "10px",
                      }}
                    >
                      {studentDetail?.date_of_admission || "-"}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginLeft: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "10px" }}>School</Text>
                    <Text
                      style={{
                        marginLeft: "10px",
                        fontSize: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      {studentDetail?.school_name || "-"}
                    </Text>
                  </View>

                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginRight: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "10px" }}>Program</Text>
                    <Text
                      style={{
                        fontSize: "10px",
                        marginLeft: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                      }}
                    >{`${studentDetail?.program_short_name} - ${studentDetail?.program_specialization_short_name}`}</Text>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginLeft: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "10px" }}>Academic Batch</Text>
                    <Text
                      style={{
                        marginLeft: "10px",
                        fontSize: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      {studentDetail?.academic_batch || "-"}
                    </Text>
                  </View>

                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginRight: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "10px" }}>Current Year/Sem</Text>
                    <Text
                      style={{
                        fontSize: "10px",
                        marginLeft: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                      }}
                    >{`${studentDetail?.current_year}/${studentDetail?.current_sem}`}</Text>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginLeft: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "10px" }}>Father Name</Text>
                    <Text
                      style={{
                        marginLeft: "10px",
                        fontSize: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      {studentDetail?.father_name || "-"}
                    </Text>
                  </View>

                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginRight: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "10px" }}>Admission Category</Text>
                    <Text
                      style={{
                        fontSize: "10px",
                        marginLeft: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                      }}
                    >{`${studentDetail?.fee_admission_category_short_name} - ${studentDetail?.fee_admission_sub_category_short_name}`}</Text>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginLeft: "10px",
                    }}
                  >
                    <Text style={{ fontSize: "10px" }}>Acharya Email</Text>
                    <Text
                      style={{
                        marginLeft: "10px",
                        fontSize: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      {studentDetail?.acharya_email || "-"}
                    </Text>
                  </View>

                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginRight: "10px",
                      marginBottom: "20px",
                    }}
                  >
                    <Text style={{ fontSize: "10px" }}>Mobile No</Text>
                    <Text
                      style={{
                        fontSize: "10px",
                        marginLeft: "10px",
                        color: "rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      {studentDetail?.mobile || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Page>
          )
        </Document>
      );
      const blob = await pdf(HallTicketCopy).toBlob();
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
};
