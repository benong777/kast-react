import { Link } from "react-router";
import classes from './notFound.module.css';

const NotFound = () => {
  return (
    <div className={classes.container}>
     <h1>Page not found.</h1>
      <Link to="/" className="linkButton" >Go Back</Link>
    </div>
  )
}

export default NotFound;