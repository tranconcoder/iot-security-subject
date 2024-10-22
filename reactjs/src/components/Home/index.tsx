import styles from "./styles.module.scss";
import classnames from "classnames/bind";
import PartialWithTitle from "../PartialWithTitle";

const cx = classnames.bind(styles);

export default function Home() {
    return (
        <div className={cx("container")}>
            <PartialWithTitle title="Camera giám sát">
                <h1>Test</h1>
            </PartialWithTitle>
        </div>
    );
}
