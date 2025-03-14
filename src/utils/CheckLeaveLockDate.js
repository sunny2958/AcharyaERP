import axios from "../services/Api";

export const CheckLeaveLockDate = async (fromDate) => {
  const stripTime = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const isCurrentDateGreater = (givenDate) => {
    const currentDate = stripTime(new Date());
    const targetDate = stripTime(new Date(givenDate));
    return currentDate > targetDate;
  };

  const [year, month] = fromDate.split("-");

  const response = await axios.get(
    `/api/lockScreen/getLockDateDetailsData/${month}/${year}`
  );
  if (response.data.data.length > 0) {
    const leaveLockDate = response.data.data[0]?.leave_lock_date;
    const getLockDate = leaveLockDate?.substr(0, 10);
    return isCurrentDateGreater(getLockDate);
  }
  const nextMonth = Number(month) + 1;
  const lockDate = `${year}-${nextMonth}-05`;
  return isCurrentDateGreater(lockDate);
};
