import styles from './grid-title.module.css';
export const GridTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  return (
    <div className={styles.gridTitle}>
      {title && <h1>{title}</h1>}
      {subtitle && <h2>{subtitle}</h2>}
    </div>
  );
};
