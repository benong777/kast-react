import React, { useState, useEffect, useRef } from "react";
import { Map } from "@vis.gl/react-google-maps";
import { useNavigate } from "react-router-dom";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useAuth } from "../context/AuthContext";

const Home = ({ isApiLoaded }) => {
  const { logout } = useAuth();

  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setCenter({ lat: coords.latitude, lng: coords.longitude }),
        (err) => console.warn("Geolocation error:", err)
      );
    }
  }, []);

  // Initialize Autocomplete only after the Places library and input are ready
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ["place_id", "geometry", "name"],
    });

    const onPlaceChanged = () => {
      const place = autocomplete.getPlace();
      if (!place.place_id || !place.geometry) return;

      const loc = place.geometry.location;
      navigate(`/location/${place.place_id}`, {
        state: { location: { lat: loc.lat(), lng: loc.lng() }, name: place.name },
      });
    };

    autocomplete.addListener("place_changed", onPlaceChanged);

    return () => {
      window.google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [places, navigate]);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      {/* Input bound to Google Places Autocomplete */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for places for latest updates..."
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          width: "300px",
          padding: "8px",
          borderRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      />
      <button
        onClick={logout}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "8px 12px",
          borderRadius: 6,
          background: "#f44336",
          color: "#fff",
          border: "none",
        }}
      >
        Logout
      </button>

      <Map style={{ width: "100%", height: "100%" }} center={center} zoom={14} />
    </div>
  );
};

export default Home;
