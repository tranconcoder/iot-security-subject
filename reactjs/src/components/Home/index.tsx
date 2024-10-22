import styles from "./styles.module.scss";
import classnames from "classnames/bind";
// Components
import PartialWithTitle from "../PartialWithTitle";
import CameraPreview from "../CameraPreview";
import SensorValue from "../SensorValue";
// Hooks
import { useEffect, useState } from "react";
// Configs
import { LIVE_STREAM_PATH_FLV } from "../../configs/stream.config";
import { DHT_DATA_UPDATE_TIME } from "../../configs/sensor.config";

const cx = classnames.bind(styles);

export default function Home() {
    const [temp, setTemp] = useState(0);
    const [humidity, setHumidity] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            setTemp(30);
            setHumidity(90);
        }, DHT_DATA_UPDATE_TIME);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={cx("container")}>
            <PartialWithTitle
                title="Camera giám sát"
                className={cx("camera-partial")}
            >
                <CameraPreview url={LIVE_STREAM_PATH_FLV} />

                <CameraPreview url={LIVE_STREAM_PATH_FLV} />
            </PartialWithTitle>

            <PartialWithTitle className={cx("sensor-partial")} title="Thông số">
                <SensorValue title="Nhiệt độ" value={`${temp}°C`} />

                <SensorValue title="Độ ẩm" value={`${humidity}%`} />
            </PartialWithTitle>
        </div>
    );
}
