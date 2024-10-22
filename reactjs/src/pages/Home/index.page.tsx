import styles from "./styles.module.scss";
import classnames from "classnames/bind";
import BoxLayout from "../../components/layouts/BoxLayout";
import Home from "../../components/Home";

const cx = classnames.bind(styles);

export default function HomePage() {
    return (
        <BoxLayout title="Dashboard" button={{ label: "Click me!", href: "/" }}>
            <Home />
        </BoxLayout>
    );
}
