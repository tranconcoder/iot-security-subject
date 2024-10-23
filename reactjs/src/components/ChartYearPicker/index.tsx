import { LocalizationProvider, YearCalendar } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function ChartYearPicker() {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <YearCalendar value={dayjs()} />
        </LocalizationProvider>
    );
}
