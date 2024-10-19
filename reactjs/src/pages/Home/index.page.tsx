import styles from './styles.module.scss';
import classnames from 'classnames/bind';

const cx = classnames.bind(styles);

export default function HomePage() {
	return (
		<div className="container">
			<header>
				<h1>Dashboard</h1>
			</header>
			<div className="dashboard">
				<div className="section">
					<h2>Cameras</h2>
					<div className="cameras">
						<div className="camera">Camera 1</div>
						<div className="camera">Camera 2</div>
					</div>
				</div>

				<div className="section">
					<h2>Thông số</h2>
					<div className="metrics">
						<div className="metric">
							<div className="metric-value">25°C</div>
							<div className="metric-label">Nhiệt độ</div>
						</div>
						<div className="metric">
							<div className="metric-value">60%</div>
							<div className="metric-label">Độ ẩm</div>
						</div>
					</div>
				</div>
			</div>
			<nav>
				<a href="chart.html">Xem biểu đồ</a>
			</nav>
		</div>
	);
}
