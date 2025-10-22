import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import LocationDetails from "./pages/LocationDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/notFound";
import { useState } from "react";

const ProtectedRoute = ({ element }) => {
  const { token } = useAuth();
  return token ? element : <Navigate to="/login" />;
};

const AppContent = () => {
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute element={<Home />} />} />
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
