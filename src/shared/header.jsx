import { NavLink } from "react-router";
import styles from './header.module.css';
import { useAuth } from "../context/AuthContext";


const Header = ({ title }) => {
  const { logout } = useAuth();

  return (
    <>
      <div className={styles.header}>
        <h1>{title}</h1>
      </div>
      <div className={styles.navContainer}>
        <nav className={styles.nav}>
          <NavLink 
            to="/" 
            className={({ isActive }) => (isActive ? styles['active'] : styles['inactive']) }
            >Home
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => (isActive ? styles['active'] : styles['inactive']) }
            >About
          </NavLink>
        </nav>
        <button className={styles.logoutButton} onClick={logout}>Logout</button>
      </div>
    </>
  );
};

export default Header;