import styles from "./styles.module.scss";
import classnames from "classnames/bind";
import { PropsWithChildren } from "react";

const cx = classnames.bind(styles);

export interface PartialWithTitleProps extends PropsWithChildren {
    title: string;
}

export default function PartialWithTitle({
    children,
    title,
}: PartialWithTitleProps) {
    return (
        <section className={cx("partial-container")}>
            <h3 className={cx("title")}>{title}</h3>

            <div className={cx("line-break")}></div>

            <div className={cx("content")}>{children}</div>
        </section>
    );
}
