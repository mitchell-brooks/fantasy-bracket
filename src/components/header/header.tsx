import styles from './header.module.css';
import Link from 'next/link';
import { createClient } from '@utils/supabase-server';
import React from 'react';
import { LogoutLink } from '@components/logout-link/logout-link';
interface HeaderProps {
  user_id: string | undefined;
}

export const Header: React.FC<HeaderProps> = ({ user_id }) => {
  return (
    <>
      <nav className={styles.navcontainer}>
        <div className={styles.login}>
          <Link className={styles.headerlink} href={'/'}>
            Bracketude
          </Link>
        </div>
        <LogoutLink user_id={user_id} />
      </nav>
    </>
  );
};
