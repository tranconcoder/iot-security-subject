import { ChartTimeRangeEnum } from "../../enum/chart.enum";
import dayjs from "dayjs";

import styles from "./styles.module.scss";
import classNames from "classnames/bind";
// Components
import ChartTimeRange from "../../components/ChartTimeRange";
import { OutletPassType } from "../../components/layouts/BoxLayout";
import ChartWeekPicker from "../../components/ChartWeekPicker";
import ChartYearPicker from "../../components/ChartYearPicker";
import ChartMonthPicker from "../../components/ChartMonthPicker";
import ChartDatePicker from "../../components/ChartDatePicker";
// Hooks
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LineChart } from "@mui/x-charts";
import {
    generateXLabelsDay,
    generateXLabelsMonth,
    generateXLabelsWeek,
    generateXLabelsYear,
} from "../../utils/chart.util";

const cx = classNames.bind(styles);

export default function ChartPage() {
    const now = dayjs();
    const [setTitle, setButtonProps] = useOutletContext<OutletPassType>();
    const [timeRange, setTimeRange] = useState<ChartTimeRangeEnum>(
        ChartTimeRangeEnum.Day
    );
    const [date, setDate] = useState<number>(now.date());
    const [week, setWeek] = useState<number>(now.week());
    const [month, setMonth] = useState<number>(now.month());
    const [year, setYear] = useState<number>(now.year());
    const [tempData, setTempData] = useState<Array<number>>([]);
    const [humidityData, setHumidityData] = useState<Array<number>>([]);
    const [xLabels, setXLabels] = useState<Array<string>>(generateXLabelsDay());

    const handleChangeTimeRange = (newTimeRange: ChartTimeRangeEnum) => {
        setTimeRange(newTimeRange);
    };
    const handlePickDate = (newDate: number) => {
        setDate(newDate);
    };
    const handlePickMonth = (newMonth: number, newYear: number) => {
        setMonth(newMonth);
        setYear(newYear);
    };
    const handlePickYear = (newYear: number) => {
        setYear(newYear);
    };
    const handlePickWeek = (newWeek: number, newYear: number) => {
        setWeek(newWeek);
        setYear(newYear);
    };

    useEffect(() => {
        setTitle("Biểu đồ");
        setButtonProps(undefined);
    });

    // Update xLabels axes
    useEffect(() => {
        switch (timeRange) {
            case ChartTimeRangeEnum.Day:
                setXLabels(generateXLabelsDay());
                break;
            case ChartTimeRangeEnum.Week:
                setXLabels(generateXLabelsWeek(week, year));
                break;
            case ChartTimeRangeEnum.Month:
                setXLabels(generateXLabelsMonth(month + 1, year));
                break;
            case ChartTimeRangeEnum.Year:
                setXLabels(generateXLabelsYear());
        }
    }, [timeRange, week, month, year]); // eslint-disable-line

    // Update axes data
    useEffect(() => {
        console.log();
    }, [timeRange, date, week, month, year]);

    return (
        <div className={cx("chart-container")}>
            <div className={cx("chart-option")}>
                <ChartTimeRange onChangeTimeRange={handleChangeTimeRange} />

                {timeRange === ChartTimeRangeEnum.Day && (
                    <ChartDatePicker handlePick={handlePickDate} />
                )}

                {timeRange === ChartTimeRangeEnum.Week && (
                    <ChartWeekPicker handlePick={handlePickWeek} />
                )}

                {timeRange === ChartTimeRangeEnum.Month && (
                    <ChartMonthPicker handlePick={handlePickMonth} />
                )}

                {timeRange === ChartTimeRangeEnum.Year && (
                    <ChartYearPicker handlePick={handlePickYear} />
                )}
            </div>

            <LineChart
                width={1200}
                height={500}
                series={[
                    {
                        data: tempData,
                        label: "Nhiệt độ",
                        yAxisId: "leftAxisId",
                        color: "#ff6666",
                    },
                    {
                        data: humidityData,
                        label: "Độ ẩm",
                        yAxisId: "rightAxisId",
                        color: "#0066ff",
                    },
                ]}
                xAxis={[{ scaleType: "point", data: xLabels }]}
                yAxis={[{ id: "leftAxisId" }, { id: "rightAxisId" }]}
                rightAxis="rightAxisId"
            />
        </div>
    );
}
