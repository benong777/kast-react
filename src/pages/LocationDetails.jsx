import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Map, useMapsLibrary, AdvancedMarker } from "@vis.gl/react-google-maps";
import axios from "axios";
import styles from "./LocationDetails.module.css";

// Simulate current user ID (normally you'd get this from Auth context or decoded JWT)
const CURRENT_USER_ID = "68f164636e0d95c4169446ba";

const LocationDetails = ({ isApiLoaded }) => {
  const places = useMapsLibrary("places");
  const { placeId } = useParams();
  const locationState = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [center, setCenter] = useState(null);
  const [placeName, setPlaceName] = useState("");
  const [comments, setComments] = useState([]);
  const [locationDoc, setLocationDoc] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  // 🗺️ Step 1: Load place info
  useEffect(() => {
    if (!isApiLoaded) return;

    if (locationState.state?.location) {
      setCenter(locationState.state.location);
      setPlaceName(locationState.state.name);
    } else if (window.google && window.google.maps) {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      service.getDetails(
        { placeId, fields: ["name", "geometry"] },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place
          ) {
            setPlaceName(place.name);
            setCenter({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
          }
        }
      );
    }
  }, [placeId, locationState.state, isApiLoaded]);

  // Helper: fetch comments
  const fetchComments = async (locationId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/locations/${locationId}/comments`, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_TOKEN}` },
      });
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Error loading comments:", err);
      setComments([]);
    }
  };

  // 🧩 Step 2: Check or create location
  useEffect(() => {
    if (!isApiLoaded || !placeId || !center || !placeName) return;

    const fetchOrCreateLocation = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE}/locations/${placeId}`, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_TOKEN}` },
        });

        if (res.data?.location) {
          setLocationDoc(res.data.location);
          fetchComments(res.data.location._id);
        } else {
          await createLocation();
        }
      } catch (err) {
        if (err.response?.status === 404) {
          await createLocation();
        } else {
          console.error("Error checking location:", err);
        }
      }
    };

    const createLocation = async () => {
      try {
        const body = {
          _id: placeId,
          name: placeName,
          address: "TEST",
        };
        const res = await axios.post(`${import.meta.env.VITE_API_BASE}/locations`, body, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_TOKEN}` },
        });

        setLocationDoc(res.data.location);
        fetchComments(res.data.location._id);
      } catch (err) {
        console.error("Error creating location:", err);
      }
    };

    fetchOrCreateLocation();
  }, [isApiLoaded, placeId, center, placeName]);

  // 🔍 Step 3: Handle searching another place
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["place_id", "geometry", "name"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.place_id || !place.geometry) return;

      const loc = place.geometry.location;
      navigate(`/location/${place.place_id}`, {
        state: { location: { lat: loc.lat(), lng: loc.lng() }, name: place.name },
      });
    });

    return () => {
      window.google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [places, navigate]);

  // 💬 Step 4: Handle new comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !locationDoc?._id) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE}/locations/${locationDoc._id}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_TOKEN}` } }
      );

      setNewComment("");
      await fetchComments(locationDoc._id);
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE}/locations/${locationDoc._id}/comments/${commentId}`,
        { comment: editText },
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_TOKEN}` } }
      );
      setEditingCommentId(null);
      setEditText("");
      await fetchComments(locationDoc._id);
    } catch (err) {
      console.error("Error editing comment:", err);
      alert("Failed to edit comment");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE}/locations/${locationDoc._id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_TOKEN}` },
      });
      await fetchComments(locationDoc._id);
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment");
    }
  };

  if (!center) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      {/* Left column: details and comments */}
      <div className={styles.leftColumn}>
        <h1 className={styles.placeName}>{placeName}</h1>

        {/* 💬 Add new comment form */}
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your comment..."
            rows={3}
            className={styles.commentInput}
          />
          <button
            type="submit"
            className={styles.commentButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </form>

        <h2 className={styles.commentsHeader}>Comments</h2>

        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          <ul className={styles.commentsList}>
            {comments.map((c) => (
              <li key={c._id} className={styles.commentItem}>
                <strong className={styles.commentAuthor}>
                  {c.createdBy?.name || "Anonymous"}:
                </strong>{" "}
                {editingCommentId === c._id ? (
                  <>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className={styles.commentInput}
                    />
                    <button
                      onClick={() => handleEditComment(c._id)}
                      className={styles.saveButton}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditText("");
                      }}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <span>{c.comment} comment_id: {c._id}</span>
                )}

                {/* Only show edit/delete for user's own comments */}
                {c.createdBy?._id === CURRENT_USER_ID && editingCommentId !== c._id && (
                  <div className={styles.commentActions}>
                    <button
                      onClick={() => {
                        setEditingCommentId(c._id);
                        setEditText(c.comment);
                      }}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right column: map */}
      <div className={styles.rightColumn}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search another place..."
          className={styles.searchInput}
        />
        <div className={styles.mapContainer}>
          <Map
            style={{ width: "100%", height: "100%" }}
            center={center}
            zoom={15}
            mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
          >
            <AdvancedMarker position={center} />
          </Map>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
