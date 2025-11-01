import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerBackground}></div>
      <div className={styles.headerContainer}>
        <nav className={styles.nav}>
          <div className={styles.logo}>Умный бюджет</div>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <span className={styles.navLink}>Главная</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navLink}>Бюджет</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navLink}>Транзакции</span>
            </li>
            <li className={styles.navItem}>
              <span className={styles.navLink}>Цели</span>
            </li>
          </ul>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}></div>
            <span className={styles.userName}>Александр</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;