import BoxLayout from "../../components/layouts/BoxLayout";
import Dashboard from "../../components/Dashboard";

export default function DashboardPage() {
    return (
        <BoxLayout
            title="Dashboard"
            button={{ label: "Xem biểu đồ!", href: "/" }}
        >
            <Dashboard />
        </BoxLayout>
    );
}
