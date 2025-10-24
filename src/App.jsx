import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import About from "./pages/about";
import LocationDetails from "./pages/LocationDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/notFound";
import PublicRoute from "./routes/PublicRoute";

const ProtectedRoute = ({ element }) => {
  const { token } = useAuth();
  return token ? element : <Navigate to="/login" />;
};

const AppContent = () => {
  const location = useLocation();

  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (location.pathname === '/') {
      setTitle('Todo List');
    } else if (location.pathname === '/about') {
      setTitle('About');
    } else {
      setTitle('Not found.')
    }
  }, [location]);

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
      onLoad={() => setIsApiLoaded(true)}
      onError={(e) => {
        console.error("Google Maps API load error:", e);
        setLoadError(e);
      }}
    >
      {!isApiLoaded && !loadError && <p>Loading Google Maps API...</p>}
      {loadError && <p>Error loading Google Maps API. Please try again later.</p>}
      {isApiLoaded && (
        <Routes>
          {/* Public routes — redirect if logged in */}
          <Route path="/login"element={<PublicRoute element={<Login />} />} />
          <Route path="/register" element={<PublicRoute element={<Register />} />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute element={<Home title={title}/>} />} />
          <Route path="/about" element={<ProtectedRoute element={<About title={title}/>} />} />
          <Route path="/location/:placeId" element={<ProtectedRoute element={<LocationDetails />} />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </APIProvider>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;
