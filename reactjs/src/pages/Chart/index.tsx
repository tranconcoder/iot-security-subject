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
import { DateTimeField } from "@mui/x-date-pickers";

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

            </div>

            <ChartDay
                humidityData={[1, 2, 3, 4, 6, 6, 7]}
                tempData={[1, 2, 4, 1, 4, 5, 6]}
            />
        </div>
    );
}
