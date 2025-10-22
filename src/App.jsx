import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import Home from "./pages/Home";
import LocationDetails from "./pages/LocationDetails";
import NotFound from "./pages/notFound";

const App = () => {
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
      onLoad={() => setIsApiLoaded(true)}
      onError={(e) => {
        console.error('Google Maps API load error:', e);
        setLoadError(e);
      }}
    >
      {!isApiLoaded && !loadError && <p>Loading Google Maps API...</p>}
      {loadError && <p>Error loading Google Maps API. Please try again later.</p>}
      {isApiLoaded && (
        <Router>
          <Routes>
            <Route path="/" element={<Home isApiLoaded={isApiLoaded} />} />
            <Route path="/location/:placeId" element={<LocationDetails isApiLoaded={isApiLoaded} />} />
            <Route path="*" element={<NotFound/>} />
          </Routes>
        </Router>
      )}
    </APIProvider>
  );
};

export default App;
