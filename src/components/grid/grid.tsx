// ABOUTME: Main layout container for page content
// ABOUTME: Provides centered, max-width content area with consistent padding
import styles from './grid.module.css';

export default function Grid({
  leftContent,
}: {
  leftContent: React.ReactNode;
}) {
  return (
    <main className={styles.container}>
      <div className={styles.content} id="content-block">
        {leftContent}
      </div>
    </main>
  );
}
