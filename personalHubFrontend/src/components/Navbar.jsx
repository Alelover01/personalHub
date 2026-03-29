import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : '?';
  };

  return (
    <nav className={styles.navbar}>
      <NavLink to="/" className={styles.logo}>
        <div className={styles.logoIcon}>⊞</div>
        <span className={styles.logoText}>Personal Hub</span>
      </NavLink>

      <div className={styles.nav}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/books"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          Books
        </NavLink>
        <NavLink
          to="/series"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          Series
        </NavLink>
        <NavLink
          to="/travel"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          Travel
        </NavLink>
      </div>

      <div className={styles.right}>
        <div className={styles.avatar} ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
          {getInitial()}
          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                {user?.name}
              </div>
              <div className={styles.dropdownDivider} />
              <button
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;