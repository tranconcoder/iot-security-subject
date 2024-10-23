import styles from "./styles.module.scss";
import classNames from "classnames/bind";
// Components
import ChartTimeRange from "../../components/ChartTimeRange";
import { OutletPassType } from "../../components/layouts/BoxLayout";
// Hooks
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ChartTimeRangeEnum } from "../../enum/chart.enum";
import ChartDay from "../../components/ChartDay";

const cx = classNames.bind(styles);

export default function ChartPage() {
    const [setTitle, setButtonProps] = useOutletContext<OutletPassType>();

    const handleChangeTimeRange = (timeRange: ChartTimeRangeEnum) => {
        console.log(timeRange);
    };

    useEffect(() => {
        setTitle("Biểu đồ");
        setButtonProps(undefined);
    });

    return (
        <div className={cx("chart-container")}>
            <ChartTimeRange onChangeTimeRange={handleChangeTimeRange} />

            <ChartDay tempData={[1,2,3]} humidityData={[12,3,12]} />
        </div>
    );
}
