import React from 'react';
import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerBackground}></div>
      <div className={styles.headerContainer}>
        <nav className={styles.nav}>
          <div className={styles.logo}>Умный бюджет</div>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <span onClick={() => handleNavigation('/budget')} className={styles.navLink}>Главная</span>
            </li>
            <li className={styles.navItem}>
              <span onClick={() => handleNavigation('/budget')} className={styles.navLink}>Бюджет</span>
            </li>
            <li className={styles.navItem}>
              <span onClick={() => handleNavigation('/categories')} className={styles.navLink}>Категории</span>
            </li>
            <li className={styles.navItem}>
              <span onClick={() => handleNavigation('/transactions')} className={styles.navLink}>Транзакции</span>
            </li>
            <li className={styles.navItem}>
              <span onClick={() => handleNavigation('/dashboard')} className={styles.navLink}>Аналитика</span>
            </li>
            <li className={styles.navItem}>
              <span onClick={() => handleNavigation('/goals')} className={styles.navLink}>Цели</span>
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
