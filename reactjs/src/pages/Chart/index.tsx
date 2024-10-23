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
import { generateXLabelsDay } from "../../utils/chart.util";

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
    const handlePickDate = (newDate?: number) => {
        setDate(newDate || date);
    };
    const handlePickMonth = (newMonth?: number) => {
        setMonth(newMonth || month);
    };
    const handlePickYear = (newYear?: number) => {
        setYear(newYear || year);
    };
    const handlePickWeek = (newWeek?: number) => {
        setWeek(newWeek || week);
    };

    useEffect(() => {
        setTitle("Biểu đồ");
        setButtonProps(undefined);
    });

    // Init time XAxes
    useEffect(() => {}, [timeRange]);

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
