import styles from "./styles.module.scss";
import classNames from "classnames/bind";
// Components
import ChartTimeRange from "../../components/ChartTimeRange";
import { OutletPassType } from "../../components/layouts/BoxLayout";
// Hooks
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ChartTimeRangeEnum } from "../../enum/chart.enum";
import ChartSelectDay from "../../components/ChartSelectDay";
import ChartDay from "../../components/ChartDay";
import ChartSelectMonth from "../../components/ChartSelectMonth";
import ChartWeekPicker from "../../components/ChartWeekPicker";
import ChartYearPicker from "../../components/ChartYearPicker";

const cx = classNames.bind(styles);

export default function ChartPage() {
    const [setTitle, setButtonProps] = useOutletContext<OutletPassType>();
    const [timeRange, setTimeRange] = useState<ChartTimeRangeEnum>();

    const handleChangeTimeRange = (newTimeRange: ChartTimeRangeEnum) => {
        setTimeRange(newTimeRange);
    };

    useEffect(() => {
        setTitle("Biểu đồ");
        setButtonProps(undefined);
    });

    return (
        <div className={cx("chart-container")}>
            <div className={cx("chart-option")}>
                <ChartTimeRange onChangeTimeRange={handleChangeTimeRange} />

                {timeRange === ChartTimeRangeEnum.Day && (
                    <ChartSelectDay onChangeDay={() => {}} />
                )}

                {timeRange === ChartTimeRangeEnum.Week && <ChartWeekPicker />}

                {timeRange === ChartTimeRangeEnum.Month && <ChartSelectMonth />}

                {timeRange === ChartTimeRangeEnum.Year&& <ChartYearPicker/>}
            </div>

            <ChartDay
                humidityData={[1, 2, 3, 4, 6, 6, 7]}
                tempData={[1, 2, 4, 1, 4, 5, 6]}
            />
        </div>
    );
}
