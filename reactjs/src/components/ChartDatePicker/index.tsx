import { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";

export interface ChartDatePickerProps {
    handlePick(newDay?: number): void;
}

export default function ChartDatePicker({ handlePick }: ChartDatePickerProps) {
    const handleChange = (newDay: Dayjs | null) => {
        handlePick(newDay?.date());
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDatePicker orientation="landscape" onChange={handleChange} />
        </LocalizationProvider>
    );
}
