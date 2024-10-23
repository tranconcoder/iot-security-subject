import styles from "./styles.module.scss";
import classNames from "classnames/bind";
import { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import {
    DateValidationError,
    PickerChangeHandlerContext,
} from "@mui/x-date-pickers";

const cx = classNames.bind(styles);

export interface ChartSelectDayProps {
    onChangeDay(
        newDay: Dayjs | null,
        context: PickerChangeHandlerContext<DateValidationError>
    ): void;
}

export default function ChartSelectDay({ onChangeDay }: ChartSelectDayProps) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDatePicker orientation="landscape" onChange={onChangeDay} />
        </LocalizationProvider>
    );
}
