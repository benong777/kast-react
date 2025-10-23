import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ element }) => {
  const { token, loading } = useAuth();
  
  // While checking auth, don't render anything
  if (loading) return <p>Loading...</p>;

  // If logged in, redirect to home
  return token ? <Navigate to="/" replace /> : element;
};

export default PublicRoute;
