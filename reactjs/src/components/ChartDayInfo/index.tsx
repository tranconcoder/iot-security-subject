import styles from "./styles.module.scss";
import classNames from "classnames/bind";
import { LineChart } from "@mui/x-charts";
import { useState } from "react";

const cx = classNames.bind(styles);

export interface ChartDayInfoProps {
    tempData: Array<number>;
    humidityData: Array<number>;
}

export default function ChartDayInfo({
    tempData,
    humidityData,
}: ChartDayInfoProps) {
    const [xLabels] = useState(() => {
        const xLabels = [];

        for (let i = 0; i <= 24; i++) xLabels.push(i.toString());

        return xLabels;
    });

    return (
        <div className={cx("chart-day")}>
            <LineChart
                width={1200}
                height={500}
                series={[
                    {
                        data: tempData,
                        label: "Nhiệt độ",
                        yAxisId: "leftAxisId",
                    },
                    {
                        data: humidityData,
                        label: "Độ ẩm",
                        yAxisId: "rightAxisId",
                    },
                ]}
                xAxis={[{ scaleType: "point", data: xLabels }]}
                yAxis={[{ id: "leftAxisId" }, { id: "rightAxisId" }]}
                rightAxis="rightAxisId"
            />
        </div>
    );
}
