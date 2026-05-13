import styles from './Layout.module.css';

export function AppShell({ children, wide = false }) {
  return (
    <div className={styles.shell}>
      <div className={wide ? styles.wideContainer : styles.container}>{children}</div>
    </div>
  );
}

export function Panel({ children, className = '', ...props }) {
  return <section className={`${styles.panel} ${className}`} {...props}>{children}</section>;
}

export function PageHeader({ eyebrow, title, description, meta }) {
  return (
    <header className={styles.header}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h1 className={styles.title}>{title}</h1>
      {description ? <p className={styles.description}>{description}</p> : null}
      {meta ? <div className={styles.meta}>{meta}</div> : null}
    </header>
  );
}
