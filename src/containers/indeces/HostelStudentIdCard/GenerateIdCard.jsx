import templateList from "./SchoolImages";
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
import JsBarcode from "jsbarcode";

const styles = StyleSheet.create({
  body: {
    margin: 0,
  },
  idcardContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: "22px",
    marginRight: "22px",
  },
  idcard: {
    margin: "5px",
    height: "258px",
    width: "167px",
    position: "relative",
  },
  image: {
    position: "absolute",
    minWidth: "100%",
    minHeight: "100%",
    display: "block",
    height: "100%",
    width: "100%",
  },
  userImage: {
    top: "78px",
    position: "absolute",
    width: "60px",
    height: "70px",
    left: "55px",
    border: "none !important",
  },
  userDisplayName: {
    top: "28px",
    width: "110px",
    left: "48px",
    color: "#000",
    fontSize: "9px",
    fontWeight: "bold",
  },
  userName: {
    width: "110px",
    top: "150px",
    left: "32px",
    color: "#000",
    fontSize: "8px",
    fontWeight: "400",
  },
  blockName:{
    width: "170px",
    left: "1px",
    color: "#000",
    fontSize: "10px",
    fontWeight: "500",
  },
  longUserName: {
    width: "140px",
    top: "150px",
    left: "13px",
    color: "#000",
    fontSize: "8px",
    fontWeight: "400",
  },
  userCurrentYear: {
    width: "100px",
    top: "160px",
    left: "35px",
    fontSize: "8px",
    fontWeight: "thin",
  },
  userProgrammeSpecialization: {
    width: "118px",
    top: "151px",
    left: "25px",
    fontSize: "8px",
    fontWeight: "thin",
  },
  userAuid: {
    width: "100px",
    top: "170px",
    left: "35px",
    fontSize: "8px",
    fontWeight: "thin",
  },
  userUsn: {
    width: "100px",
    top: "180px",
    left: "35px",
    color: "#000",
    fontSize: "8px",
    fontWeight: "400",
  },
  studentIdCard: {
    position: "absolute",
    marginHorizontal: "auto",
    fontFamily: "Roboto",
    textTransform: "uppercase",
    color: "#2e2d2d",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  studentIdCardYear: {
    position: "absolute",
    marginHorizontal: "auto",
    fontFamily: "Roboto",
    color: "#2e2d2d",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  barCode: {
    position: "absolute",
    top: "193px",
    width: "125px",
    left: "22px",
  },
  validTillDateMain: {
    width: "100px",
    position: "absolute",
    left: "0px",
    top: "216px",
    marginHorizontal: "auto",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  validTillDate: {
    fontSize: "7px",
    fontWeight: "500",
    color: "#000",
    fontFamily: "Roboto",
    textTransform: "uppercase",
  },
});

Font.registerHyphenationCallback((word) => [word]);

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
});

const getTemplate = (school_name_short) => {
  return templateList.find((obj) => obj.school_name_short === school_name_short)
    ?.src;
};

const generateBarcodeDataUrl = (value) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 2,
    height: 50,
    displayValue: false,
  });
  return canvas.toDataURL("image/png");
};

const UpdateData = ({ data }) => {
  return (
    <View style={styles.idcard}>
      <Image src={getTemplate("AIT")} style={styles.image} />
      <View style={{ position: "relative" }}>
        <Image src={data.studentBlobImagePath} style={styles.userImage} />
        <Text
          style={data.studentName.length < 24 ? { ...styles.studentIdCard, ...styles.userName } : { ...styles.studentIdCard, ...styles.longUserName }}
        >{`${data.studentName}`}</Text>
        <Text
          style={
            data.studentName.length > 24
              ? {
                  ...styles.studentIdCardYear,
                  ...styles.userCurrentYear,
                  marginTop: "10px",
                }
              : {
                  ...styles.studentIdCardYear,
                  ...styles.userCurrentYear,
                  marginTop: "0px",
                }
          }
        >
          {`${data.currentYear}` == 1
            ? `1ST YEAR`
            : `${data.currentYear}` == 2
            ? `2ND YEAR`
            : `${data.currentYear}` == 3
            ? `3RD YEAR`
            : `${data.currentYear}` == 4
            ? `4TH YEAR`
            : `${data.currentYear}` == 5
            ? `5TH YEAR`
            : `${data.currentYear}` == 6
            ? `6TH YEAR`
            : `${data.currentYear}` == 7
            ? `7TH YEAR`
            : `${data.currentYear}` == 8
            ? `8TH YEAR`
            : `${data.currentYear}` == 9
            ? `9TH YEAR`
            : `${data.currentYear}` == 10
            ? `10TH YEAR`
            : ""}
        </Text>
        <Text
          style={
            data.studentName.length > 24
              ? {
                  ...styles.studentIdCard,
                  ...styles.userAuid,
                  marginTop: "10px",
                }
              : {
                  ...styles.studentIdCard,
                  ...styles.userAuid,
                  marginTop: "0px",
                }
          }
        >{`${data.auid}`}</Text>
        <View style={
            data.studentName.length > 24
              ? {
                  ...styles.studentIdCard,
                  ...styles.userUsn,
                  marginTop: "11px",
                  display:"flex",flexDirection:"row",
                  gap:"5px"
                }
              : {
                  ...styles.studentIdCard,
                  ...styles.userUsn,
                  marginTop: "0px",
                  display:"flex",flexDirection:"row",
                  gap:"5px"
                }}>
         <Text>{`${!!data.bedName ? data.bedName : ""}`}
        </Text>
        &nbsp;<Text style={data.foodStatus?.toLowerCase() == "veg" ? {width:"10px",height:"10px",borderRadius:"50%",backgroundColor:"green"}:{width:"10px",height:"10px",borderRadius:"50%",backgroundColor:"red"}}></Text>
        </View>
        <View
          style={
            data.studentName.length > 24
              ? {
                  ...styles.barCode,
                  marginTop: "10px",
                }
              : {
                  ...styles.barCode,
                  marginTop: "0px",
                }
          }
        >
          <Image src={generateBarcodeDataUrl(data.auid)} />
        </View>
        <View
          style={
            data.studentName.length > 24
              ? {
                  ...styles.studentIdCard,
                  ...styles.validTillDateMain,
                  marginTop: "10px",
                }
              : {
                  ...styles.studentIdCard,
                  ...styles.validTillDateMain,
                  marginTop: "0px",
                }
          }
        >
          <Text style={{ ...styles.validTillDate, left: "35px" }}>
            VACATE DATE :
          </Text>
          <Text
            style={{ ...styles.validTillDate, left: "38px" }}>
              {data?.vacateDate}
          </Text>
        </View>
        <Text
          style={data.studentName.length < 24 ? { ...styles.studentIdCard, ...styles.blockName, top: "230px" } : { ...styles.studentIdCard, ...styles.blockName, top: "235x", }}
        >{`${data.blockName}`}</Text>
      </View>
    </View>
  );
};

export const GenerateIdCard = (studentList) => {
  return new Promise(async (resolve, reject) => {
    try {
      const HallTicketCopy = (
        <Document title="ID Card">
          {studentList.map((chunk, key1) => {
            return (
              <Page size="a4" style={styles.body} key={key1}>
                <View style={styles.idcardContainer}>
                  {chunk.map((obj, key) => {
                    return <UpdateData data={obj} key={key} />;
                  })}
                </View>
              </Page>
            );
          })}
        </Document>
      );
      const blob = await pdf(HallTicketCopy).toBlob();
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
};
