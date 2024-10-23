import { LocalizationProvider, MonthCalendar } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function ChartSelectMonth() {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MonthCalendar value={dayjs()} />
        </LocalizationProvider>
    );
}
