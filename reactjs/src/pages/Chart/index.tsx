import { LineChart } from "@mui/x-charts/LineChart";
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { OutletPassType } from "../../components/layouts/BoxLayout";

export default function ChartPage() {
    const [setTitle, setButtonProps] = useOutletContext<OutletPassType>();

    useEffect(() => {
        setTitle("Biểu đồ");
        setButtonProps(undefined);
    });

    return (
        <LineChart
            xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
            series={[
                {
                    data: [2, 5.5, 2, 8.5, 1.5, 5],
                    area: true,
                },
            ]}
            width={500}
            height={300}
        />
    );
}
