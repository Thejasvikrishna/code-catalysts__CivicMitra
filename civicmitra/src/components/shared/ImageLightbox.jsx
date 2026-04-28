// ImageLightbox.jsx — Fullscreen image overlay on click
import React, { useEffect, useCallback } from "react";
import "./lightbox.css";

export default function ImageLightbox({ src, alt, onClose }) {
  // Close on Escape key
  const handleKey = useCallback(
    (e) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden"; // prevent background scroll
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="lb-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <button className="lb-close" onClick={onClose} aria-label="Close">✕</button>
      <div
        className="lb-content"
        onClick={(e) => e.stopPropagation()} // prevent overlay-click-close on img
      >
        <img src={src} alt={alt || "Enlarged view"} className="lb-img" />
        {alt && <p className="lb-caption">{alt}</p>}
      </div>
    </div>
  );
}
