import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Закрываем меню при клике вне
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { path: '/budget', label: 'Главная' },
    { path: '/categories', label: 'Категории' },
    { path: '/transactions', label: 'Транзакции' },
    { path: '/dashboard', label: 'Аналитика' },
    { path: '/goals', label: 'Цели' },
  ];

  const displayName = user?.name || user?.email || 'Профиль';

  return (
    <header className={styles.header}>
      <div className={styles.headerBackground}></div>
      <div className={styles.headerContainer}>
        <nav className={styles.nav}>
          <div className={styles.logo}>Умный бюджет</div>

          <ul className={styles.navList}>
            {navLinks.map(({ path, label }) => (
              <li key={path} className={styles.navItem}>
                <span
                  onClick={() => navigate(path)}
                  className={`${styles.navLink} ${location.pathname === path ? styles.navLinkActive : ''}`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <div className={styles.userProfile} ref={menuRef}>
            <div
              className={styles.userAvatar}
              onClick={() => setMenuOpen(prev => !prev)}
              title={displayName}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span
              className={styles.userName}
              onClick={() => setMenuOpen(prev => !prev)}
            >
              {displayName}
            </span>

            {menuOpen && (
              <div className={styles.userMenu}>
                <button className={styles.userMenuBtn} onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
