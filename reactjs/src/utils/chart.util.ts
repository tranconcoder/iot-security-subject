import dayjs from "dayjs";

export const generateXLabelsDay = () => {
    const hoursArray = [];

    for (let i = 0; i < 24; i++) {
        let hour = i % 12 || 12;
        if (hour === 12 && i < 12) {
            hour = 0;
        }
        const amPm = i < 12 ? "AM" : "PM";
        hoursArray.push(`${hour.toString().padStart(2, "0")}:00 ${amPm}`);
    }

    return hoursArray;
};

export const generateXLabelsWeek = (week: number, year: number) => {
    // Lấy ngày đầu tiên của năm
    const firstDayOfYear = dayjs(`${year}-01-01`);

    // Tính ngày bắt đầu của tuần thứ weekNumber
    const startOfWeek = firstDayOfYear.add((week - 1) * 7, "day");

    // Đảm bảo ngày bắt đầu là thứ Hai
    const monday = startOfWeek.startOf("week");

    // Tạo mảng các ngày trong tuần
    const days = [];
    for (let i = 0; i < 7; i++) {
        days.push(monday.add(i, "day").format("DD/MM"));
    }

    return days;
};

export const generateXLabelsMonth = (month: number, year: number) => {
    // Tạo ngày đầu tiên của tháng
    const firstDayOfMonth = dayjs(`${year}-${month}-01`);

    // Tìm ngày cuối cùng của tháng
    const lastDayOfMonth = firstDayOfMonth.endOf("month");

    // Tính số ngày trong tháng
    const daysInMonth = lastDayOfMonth.diff(firstDayOfMonth, "day") + 1;

    // Tạo mảng các ngày
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day.toString());
    }

    return days;
};

export const generateXLabelsYear = () =>
    Array.from({ length: 12 }, (_, k) => k + 1 + "");
