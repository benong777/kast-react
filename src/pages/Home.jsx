import React, { useEffect, useState, useRef } from "react";
import { Map } from "@vis.gl/react-google-maps";
import { useNavigate } from "react-router-dom";

const Home = ({ isApiLoaded }) => {
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setCenter({ lat: coords.latitude, lng: coords.longitude }),
        (err) => console.warn("Geolocation error:", err)
      );
    }
  }, []);

  useEffect(() => {
    if (!isApiLoaded || !window.google || !window.google.maps || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["place_id", "geometry", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.place_id || !place.geometry) return;

      const loc = place.geometry.location;
      navigate(`/location/${place.place_id}`, {
        state: { location: { lat: loc.lat(), lng: loc.lng() }, name: place.name },
      });
    });
  }, [isApiLoaded, navigate]);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
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
      <Map style={{ width: "100%", height: "100%" }} center={center} defaultZoom={14} />
    </div>
  );
};

export default Home;
