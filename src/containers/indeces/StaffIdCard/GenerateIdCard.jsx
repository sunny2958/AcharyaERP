import StaffIdCard from "../../../assets/staff_new_id_card.jpg";
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
    padding:0
  },
  image: {
    position: "absolute",
    display: "block",
    height: "100%",
    width: "100%",
  },
  userImage: {
    top: "65px",
    position: "absolute",
    width: "50px",
    height: "55px",
    right: "55px",
  },
  name: {
    width: "145px",
    position: "absolute",
    left:'1.5px',
    top: "122px",
    marginHorizontal: "auto",
    textTransform: "uppercase",
    fontSize: "9px",
    fontFamily:"Roboto",
    fontWeight: "bold",
    color: "#000",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  empValue: {
    color: "#4d4d33",
    width: "150px",
    position: "absolute",
    marginHorizontal: "auto",
    top: "156px",
    fontSize: "8px",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontFamily: "Roboto",
  },
  
  designationNameFull: {
    color: "#4d4d33",
    width: "72%",
    position: "absolute",
    marginHorizontal: "auto",
    top: "133px",
    left: "19px",
    fontSize: "8px",
    textTransform: "uppercase",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontFamily: "Roboto",
  },
  departmentName: {
    color: "#4d4d33",
    width: "150px",
    position: "absolute",
    marginHorizontal: "auto",
    top: "144px",
    fontSize: "8px",
    textTransform: "uppercase",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontFamily: "Roboto",
  },
  schoolDisplayName: {
    width: "130px",
    position: "absolute",
    left:'10px',
    marginHorizontal: "auto",
    fontSize: "9px",
    color: "#ffff",
    fontFamily: "Roboto",
    textTransform: "uppercase",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
});

Font.registerHyphenationCallback((word) => [word]);

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
});

const generateBarcodeDataUrl = (value) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 2,
    height: 60,
    displayValue: false,
  });
  return canvas.toDataURL("image/png");
};

const UpdateData = ({ data }) => {
  const isPhdHolder =
    data.phd_status !== null && data.phd_status === "holder" ? true : false;
  return (
    <Page size="ID1" style={styles.body}>
      <Image src={StaffIdCard} style={styles.image} />
      <View style={{ position: "relative" }}>
        <Image src={data?.staffImagePath} style={styles.userImage} />
        <Text style={{...styles.name}}>
          {`${isPhdHolder ? "Dr. " : ""}${data?.employee_name}`}
        </Text>
        <View style={{ marginTop: "185px", width: "80px" }}>
          <Image src={generateBarcodeDataUrl(data.empcode)} />
        </View>
        <Text
          style={(data.employee_name?.length > 26 && !isPhdHolder)
              ? { marginTop: "13px", ...styles.designationNameFull }
              :(data.employee_name?.length > 23 && isPhdHolder)
              ? { marginTop: "14px", ...styles.designationNameFull }: styles.designationNameFull
          }
        >
          {`${data?.designation_name}`}
        </Text>
        <Text
          style={(data.employee_name?.length > 26 && !isPhdHolder) && data?.designation_name.length >= 25
              ? { marginTop: "21px", ...styles.departmentName } 
              :(data.employee_name?.length > 26 && !isPhdHolder) && data?.designation_name.length < 25
              ? { marginTop: "15px", ...styles.departmentName } 
              : (data.employee_name?.length < 26 && !isPhdHolder) && data?.designation_name.length >= 25
              ? { marginTop: "12px", ...styles.departmentName } 
              : (data.employee_name?.length < 26 && isPhdHolder) && data?.designation_name.length >= 25
              ? { marginTop: "15px", ...styles.departmentName } 
              : (data.employee_name?.length > 23 && isPhdHolder) && data?.designation_name.length >= 25
              ? { marginTop: "15px", ...styles.departmentName }
              :(data.employee_name?.length > 23 && isPhdHolder) && data?.designation_name.length < 25
              ? { marginTop: "13px", ...styles.departmentName }: styles.departmentName
          }
        >
          {`${data?.dept_name}`}
        </Text>
        <Text
          style={(data.employee_name?.length > 26 && data?.dept_name.length < 28 && !isPhdHolder) &&
              data?.designation_name.length >= 25
              ? { marginTop: "17px", ...styles.empValue }
              : (data.employee_name?.length < 26 && data?.dept_name.length < 28 && !isPhdHolder) &&
                data?.designation_name.length >= 25
                ? { marginTop: "12px", ...styles.empValue }
                :(data.employee_name?.length > 26 && data?.dept_name.length < 28 && !isPhdHolder) &&
                data?.designation_name.length < 25
                ? { marginTop: "14px", ...styles.empValue }
                    : (data.employee_name?.length > 23 &&  data?.designation_name.length < 25 && isPhdHolder) ? { marginTop: "12px", ...styles.empValue } 
                    : (data.employee_name?.length < 23 &&  data?.designation_name.length > 25 && isPhdHolder) ? { marginTop: "17px", ...styles.empValue } 
                    : styles.empValue
          }
        >
          {`${data?.empcode}`}
        </Text>
        <Text
          style={
            data.display_name?.length > 25
              ? { top: "216px", ...styles.schoolDisplayName }
              : { top: "220px", ...styles.schoolDisplayName }
          }
        >
          {`${data.display_name}`}
        </Text>
      </View>
    </Page>
  );
};

export const GenerateIdCard = (selectedStaff) => {
  return new Promise(async (resolve, reject) => {
    try {
      const HallTicketCopy = (
        <Document title="ID Card">
          {selectedStaff.map((obj, key) => {
            return <UpdateData data={obj} key={key} />;
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
