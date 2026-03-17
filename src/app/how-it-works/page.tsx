// ABOUTME: How It Works page explaining Bracketude rules, scoring, and draft mechanics
// ABOUTME: Doubles as landing page for unauthenticated users with login CTA
import styles from './how-it-works.module.css';
import Link from 'next/link';
import { createClient } from '@utils/supabase-server';

export const metadata = {
  title: 'How It Works — Bracketude',
};

export default async function HowItWorksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  return (
    <div className={styles.page}>
      <h1>How It Works</h1>

      <section className={styles.section}>
        <h2>Overview</h2>
        <p>
          Draft individual players from the NCAA tournament. Score their actual
          game points. The more your players score, the more you win.
        </p>
        <p>
          An admin creates a pool, sets the stakes, and shares a join link.
          Everyone ranks players before the deadline. The system runs a snake
          draft, builds rosters, and tracks scores through the tournament.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Drafting</h2>

        <h3>How do I draft?</h3>
        <p>
          Rank every available player before the deadline. Your #1 pick is the
          player you want most. Use the drag-and-drop grid or upload a CSV
          spreadsheet.
        </p>

        <h3>What is a snake draft?</h3>
        <p>
          Pick order reverses each round to keep things fair.
        </p>

        <h3>What if I miss the deadline?</h3>
        <p>
          The system auto-drafts for you — randomly or by tournament seeding.
          Submit your own rankings to avoid this.
        </p>

        <h3>Can a pool have multiple drafts?</h3>
        <p>
          Yes. A pool can draft at different stages of the tournament. Draft 1
          might pick 10 players before the Round of 64; Draft 2 picks 4 more
          before the Sweet 16. Each draft adds to your roster.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Scoring</h2>

        <h3>How do players score?</h3>
        <p>
          Every point a player scores in a tournament game counts. If your
          player puts up 22 in a game, you get 22 fantasy points.
        </p>

        <h3>When do points start counting?</h3>
        <p>
          Only from games <strong>after</strong> the draft that selected them.
          A player drafted in Draft 2 (starting at the Sweet 16) earns nothing
          from the first two rounds.
        </p>

        <h3>What about eliminated players?</h3>
        <p>
          They stop scoring. No penalty — just lost opportunity.
        </p>

        <h3>Can I trade or drop players?</h3>
        <p>
          No. Rosters lock after each draft runs.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Payouts</h2>

        <h3>How does the money work?</h3>
        <p>
          No buy-in. Each pool sets a <strong>point value</strong> in cents.
          Everyone pays the point value times however many points 1st place
          beat them by. Those payments pool together and split among the top
          finishers.
        </p>

        <h3>Example</h3>
        <p>Point value: 10&cent;. First place scores 500 points.</p>
        <ul className={styles.exampleList}>
          <li>2nd place (450 pts): owes 50 &times; 10&cent; = <strong>$5.00</strong></li>
          <li>3rd place (400 pts): owes 100 &times; 10&cent; = <strong>$10.00</strong></li>
          <li>4th place (380 pts): owes 120 &times; 10&cent; = <strong>$12.00</strong></li>
        </ul>
        <p>
          Total pot: $27.00, split by the pool&apos;s prize rules (e.g. 60/30/10).
        </p>
      </section>

      <div className={styles.actions}>
        {isLoggedIn ? (
          <Link href="/" className={styles.secondaryLink}>Back to home</Link>
        ) : (
          <Link href="/login" className={styles.primaryLink}>Log in or Register</Link>
        )}
      </div>
    </div>
  );
}
