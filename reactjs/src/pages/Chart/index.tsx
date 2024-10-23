import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ChartTimeRange from "../../components/ChartTimeRange";
import { OutletPassType } from "../../components/layouts/BoxLayout";

export default function ChartPage() {
    const [setTitle, setButtonProps] = useOutletContext<OutletPassType>();

    useEffect(() => {
        setTitle("Biểu đồ");
        setButtonProps(undefined);
    });

    return (
        <div>
            <ChartTimeRange />
        </div>
    );
}
