import { LocalizationProvider, MonthCalendar } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

export interface ChartMonthPicker {
    handlePick: (month: number) => void;
}

export default function ChartMonthPicker({ handlePick }: ChartMonthPicker) {
    const [month, setMonth] = useState<Dayjs>(dayjs());

    const handleChange = (data: Dayjs) => {
        setMonth(data);
        handlePick(data.month())
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MonthCalendar value={month} onChange={handleChange} />
        </LocalizationProvider>
    );
}
