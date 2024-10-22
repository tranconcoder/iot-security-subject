import styles from "./styles.module.scss"
import classnames from "classnames/bind"

const cx = classnames.bind(styles);

export default function CameraPreview() {
    return <div className={cx("camera-preview")}></div>
}
