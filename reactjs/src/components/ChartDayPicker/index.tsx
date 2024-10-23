import { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import {
    DateValidationError,
    PickerChangeHandlerContext,
} from "@mui/x-date-pickers";

export interface ChartDayPickerProps {
    handlePick(
        newDay: Dayjs | null,
        context: PickerChangeHandlerContext<DateValidationError>
    ): void;
}

export default function ChartDayPicker({ handlePick }: ChartDayPickerProps) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDatePicker orientation="landscape" onChange={handlePick} />
        </LocalizationProvider>
    );
}
