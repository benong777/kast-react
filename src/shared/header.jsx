import { NavLink } from "react-router";
import styles from './header.module.css';


const Header = ({ title }) => {
  return (
    <>
      <h1 className={styles.header}>{title}</h1>
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
    </>
  );
};

export default Header;