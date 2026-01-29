import React from 'react';
import styles from './Header.module.css';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerBackground}></div>
      <div className={styles.headerContainer}>
        <nav className={styles.nav}>
          <div className={styles.logo}>Умный бюджет</div>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <NavLink  to="/"  className={styles.navLink}>Главная</NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink  to="/categories" className={styles.navLink}>Категории</NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink  to="/transactions" className={styles.navLink}>Транзакции</NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink to="/create/budget" className={styles.navLink}>Создать бюджет</NavLink>
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