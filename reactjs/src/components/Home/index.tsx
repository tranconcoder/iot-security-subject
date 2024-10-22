import styles from "./styles.module.scss";
import classnames from "classnames/bind";
// Components
import PartialWithTitle from "../PartialWithTitle";
import CameraPreview from "../CameraPreview";
// Configs
import { LIVE_STREAM_PATH_FLV } from "../../configs/stream.config";

const cx = classnames.bind(styles);

export default function Home() {
    return (
        <div className={cx("container")}>
            <PartialWithTitle
                title="Camera giám sát"
                className={cx("camera-partial")}
            >
                <CameraPreview url={LIVE_STREAM_PATH_FLV} />

                <CameraPreview url={LIVE_STREAM_PATH_FLV} />
            </PartialWithTitle>
        </div>
    );
}
