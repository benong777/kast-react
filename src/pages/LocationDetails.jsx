import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Map, useMapsLibrary, AdvancedMarker } from "@vis.gl/react-google-maps";
import axios from "axios";
import styles from "./LocationDetails.module.css";
import { useAuth } from "../context/AuthContext";

const CURRENT_USER_ID = "68f164636e0d95c4169446ba";

const LocationDetails = () => {
  const { user, token, logout } = useAuth();
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

  //-- Fetch comments
  const fetchComments = useCallback(async (locationId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/locations/${locationId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Error loading comments:", err);
      setComments([]);
    }
  }, [token]);

  //-- Handle new comment submission
  const handleCommentSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !locationDoc?._id) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE}/locations/${locationDoc._id}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewComment("");
      await fetchComments(locationDoc._id);
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, locationDoc, token, fetchComments]);

  //-- Edit comment
  const handleEditComment = useCallback(async (commentId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE}/locations/${locationDoc._id}/comments/${commentId}`,
        { comment: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      setEditText("");
      await fetchComments(locationDoc._id);
    } catch (err) {
      console.error("Error editing comment:", err);
      alert("Failed to edit comment");
    }
  }, [locationDoc, token, editText, fetchComments]);

  //-- Delete comment
  const handleDeleteComment = useCallback(async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE}/locations/${locationDoc._id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchComments(locationDoc._id);
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment");
    }
  }, [locationDoc, token, fetchComments]);

  //-- Load place info
  useEffect(() => {
    if (!places) return;

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
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            setPlaceName(place.name);
            setCenter({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
          }
        }
      );
    }
  }, [placeId, locationState.state, places]);

  //-- Check or create location
  useEffect(() => {
    if (!places || !placeId || !center || !placeName) return;

    const fetchOrCreateLocation = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE}/locations/${placeId}`, {
          headers: { Authorization: `Bearer ${token}` },
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
        const body = { _id: placeId, name: placeName, address: "TEST" };
        const res = await axios.post(`${import.meta.env.VITE_API_BASE}/locations`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLocationDoc(res.data.location);
        fetchComments(res.data.location._id);
      } catch (err) {
        console.error("Error creating location:", err);
      }
    };

    fetchOrCreateLocation();
  }, [places, placeId, center, placeName, token, fetchComments]);

  //-- Setup search autocomplete
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
    return () => window.google.maps.event.clearInstanceListeners(autocomplete);
  }, [places, navigate]);

  if (!center) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={logout}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "gray",
              color: "#fff",
              border: "none",
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <h1 className={styles.placeName}>{placeName}</h1>
        </div>

        {/* Comment form */}
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your comment..."
            rows={3}
            className={styles.commentInput}
          />
          <button type="submit" className={styles.commentButton} disabled={isSubmitting}>
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
                    <button onClick={() => handleEditComment(c._id)} className={styles.saveButton}>
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
                  <>
                    <span>{c.comment}</span>
                    <div className={styles.commentMeta}>
                      <small>{new Date(c.createdAt).toLocaleString()}</small>
                    </div>
                  </>
                )}

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
                    <button onClick={() => handleDeleteComment(c._id)} className={styles.deleteButton}>
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LocationDetails;
