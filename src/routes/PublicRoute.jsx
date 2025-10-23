import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ element }) => {
  const { token } = useAuth();

  // If logged in, redirect to home
  return token ? <Navigate to="/" replace /> : element;
};

export default PublicRoute;
