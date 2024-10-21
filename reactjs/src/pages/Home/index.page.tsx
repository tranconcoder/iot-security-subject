import styles from './styles.module.scss';
import classnames from 'classnames/bind';

const cx = classnames.bind(styles);

export default function HomePage() {
	return (
		<div className={cx('container')}>
			<header className={cx('header')}></header>
		</div>
	);
}
