import styles from "./styles.module.scss";
import classnames from "classnames/bind";
import { PropsWithChildren } from "react";
import ButtonSimple from "../../common/ButtonSimple";

const cx = classnames.bind(styles);

interface ButtonCompProps {
    label: string;
    href?: string;
}

export interface BoxLayoutProps extends PropsWithChildren {
    title: string;
    button?: ButtonCompProps;
}

export default function BoxLayout({ children, title, button }: BoxLayoutProps) {
    return (
        <div className={cx("container")}>
            <div className={cx("box")}>
                <header className={cx("header")}>{title}</header>

                <div className={cx("body")}>{children}</div>
            </div>

            {button && (
                <ButtonSimple className={cx("button")} href={button.href}>
                    {button.label}
                </ButtonSimple>
            )}
        </div>
    );
}
