import styles from './grid-title.module.css';
export const GridTitle = ({
  title,
  subtitle,
  fixed = true,
}: {
  title: string;
  subtitle?: string;
  fixed?: boolean;
}) => {
  const content = (
    <>
      {title && <h1 className={styles.titleH1}>{title}</h1>}
      {subtitle && <h2>{subtitle}</h2>}
    </>
  );
  if (!fixed) {
    return content;
  }
  return <div className={styles.gridTitle}>{content}</div>;
};
