import styles from "./styles.module.scss";
import classnames from "classnames";
import {
    FormControl,
    FormControlOwnProps,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";
import { ChartTimeRangeEnum } from "../../enum/chart.enum";

const cx = classnames.bind(styles);

export interface ChartTimeRangeProps extends FormControlOwnProps {}

export default function ChartTimeRange(props: ChartTimeRangeProps) {
    const [timeRange, setTimeRange] = useState<ChartTimeRangeEnum>(
        ChartTimeRangeEnum.Day
    );

    const handleChangeTimeRange = (
        e: SelectChangeEvent<ChartTimeRangeEnum>
    ) => {
        setTimeRange(e.target.value as ChartTimeRangeEnum);
    };
    const menuItemStyles = {
        fontSize: "1.2rem",
    };
    const labelStyles = {
        fontSize: "1.4rem",
    };

    return (
        <FormControl {...props} sx={{ m: 2, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-filled-label" sx={labelStyles}>
                Thời gian
            </InputLabel>

            <Select
                labelId="demo-simple-select-filled-label"
                id="demo-simple-filled-select"
                onChange={handleChangeTimeRange}
                value={timeRange}
                label="Thời gian"
                sx={labelStyles}
            >
                <MenuItem sx={menuItemStyles} value={ChartTimeRangeEnum.Day}>
                    Ngày
                </MenuItem>
                <MenuItem sx={menuItemStyles} value={ChartTimeRangeEnum.Week}>
                    Tuần
                </MenuItem>
                <MenuItem sx={menuItemStyles} value={ChartTimeRangeEnum.Month}>
                    Tháng
                </MenuItem>
                <MenuItem sx={menuItemStyles} value={ChartTimeRangeEnum.Year}>
                    Năm
                </MenuItem>
            </Select>
        </FormControl>
    );
}
