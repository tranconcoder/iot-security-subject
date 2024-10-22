import styles from "./styles.module.scss";
import classnames from "classnames/bind";
import ReactPlayer, { Config } from "react-player";

const cx = classnames.bind(styles);

export interface CameraPreviewProps {
    url: string;
}

export default function CameraPreview({ url }: CameraPreviewProps) {
    const config: Config = {
        file: { forceFLV: true },
    };

    return (
            <ReactPlayer
                className={cx("preview")}
                url={url}
                config={config}
                controls
            />
    );
}
