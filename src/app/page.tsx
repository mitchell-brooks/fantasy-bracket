import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from './page.module.css';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Login from '@/components/auth';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return <main className={styles.main}></main>;
}
