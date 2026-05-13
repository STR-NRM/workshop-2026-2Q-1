import styles from './ProgressBar.module.css';

export default function ProgressBar({ current, total }) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.min(100, Math.max(0, (current / safeTotal) * 100));

  return (
    <div className={styles.wrap} aria-label={`진행률 ${current}/${safeTotal}`}>
      <div className={styles.meta}>
        <span>진행률</span>
        <strong>
          {current} / {safeTotal}
        </strong>
      </div>
      <div className={styles.track}>
        <div className={styles.bar} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
