// AuthorityPanel.jsx — Authority/Admin issue management panel
// Receives alerts for new issues, can update status, add notes, and upload resolution images.
import React, { useState, useMemo, useRef } from "react";
import { updateStatus } from "../../services/issueService";
import { uploadImage }  from "../../services/uploadImage";
import ImageLightbox    from "../shared/ImageLightbox";
import "./authority.css";

const STATUS_FLOW = ["open", "in_progress", "resolved"];
const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};
const STATUS_COLORS = {
  open: "#e67e22",
  in_progress: "#2980b9",
  resolved: "#27ae60",
};
const CATEGORY_COLORS = {
  Roads:       "#e67e22",
  Water:       "#2980b9",
  Electricity: "#f1c40f",
  Sanitation:  "#27ae60",
  Parks:       "#16a085",
  Other:       "#8e44ad",
};

export default function AuthorityPanel({ issues = [] }) {
  const [filter, setFilter]         = useState("all");
  const [noteInputs, setNoteInputs] = useState({});
  const [comments, setComments]     = useState({});
  const [expanding, setExpanding]   = useState({});
  const [updating, setUpdating]     = useState({});

  // Lightbox state
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const openLightbox  = (src, alt) => { setLightboxSrc(src); setLightboxAlt(alt || ""); };
  const closeLightbox = () => setLightboxSrc(null);

  // Resolved image state per issue: { preview, file, uploading, url }
  const [resolvedImages, setResolvedImages] = useState({});
  const fileInputRefs = useRef({});

  // Counts
  const alertCount    = issues.filter((i) => i.status === "open").length;
  const inProgCount   = issues.filter((i) => i.status === "in_progress").length;
  const resolvedCount = issues.filter((i) => i.status === "resolved").length;

  const filtered = useMemo(() => {
    if (filter === "all") return issues;
    return issues.filter((i) => i.status === filter);
  }, [issues, filter]);

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const handleImagePick = (issueId, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setResolvedImages((prev) => ({
      ...prev,
      [issueId]: { file, preview, uploading: false, url: "" },
    }));
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    const note    = noteInputs[issueId] || "";
    const comment = comments[issueId]   || "";
    setUpdating((prev) => ({ ...prev, [issueId]: true }));
    try {
      let resolvedImageUrl = "";
      const imgState = resolvedImages[issueId];
      if (newStatus === "resolved" && imgState?.file) {
        setResolvedImages((prev) => ({
          ...prev,
          [issueId]: { ...prev[issueId], uploading: true },
        }));
        resolvedImageUrl = await uploadImage(imgState.file);
        setResolvedImages((prev) => ({
          ...prev,
          [issueId]: { ...prev[issueId], uploading: false, url: resolvedImageUrl },
        }));
      }

      await updateStatus(
        issueId,
        newStatus,
        note || `Status changed to ${newStatus}`,
        resolvedImageUrl,
        comment
      );

      setNoteInputs((prev)     => ({ ...prev, [issueId]: "" }));
      setComments((prev)       => ({ ...prev, [issueId]: "" }));
      setExpanding((prev)      => ({ ...prev, [issueId]: false }));
      setResolvedImages((prev) => {
        const next = { ...prev };
        delete next[issueId];
        return next;
      });
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setUpdating((prev) => ({ ...prev, [issueId]: false }));
    }
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="authority-panel">
      {/* ── Lightbox ── */}
      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={closeLightbox} />
      )}

      {/* Alert Banner */}
      <div className="authority-alert-banner">
        <div className="alert-icon">🔔</div>
        <div className="alert-text">
          <strong>{alertCount} new alert{alertCount !== 1 ? "s" : ""}</strong>
          <span> require your attention</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="authority-stats">
        <div className={`stat-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          📋 All <strong>{issues.length}</strong>
        </div>
        <div className={`stat-chip open ${filter === "open" ? "active" : ""}`} onClick={() => setFilter("open")}>
          🟠 Open <strong>{alertCount}</strong>
        </div>
        <div className={`stat-chip in-prog ${filter === "in_progress" ? "active" : ""}`} onClick={() => setFilter("in_progress")}>
          🔵 In Progress <strong>{inProgCount}</strong>
        </div>
        <div className={`stat-chip resolved ${filter === "resolved" ? "active" : ""}`} onClick={() => setFilter("resolved")}>
          🟢 Resolved <strong>{resolvedCount}</strong>
        </div>
      </div>

      {/* Issue List */}
      {filtered.length === 0 ? (
        <div className="authority-empty">
          <span className="empty-icon">✅</span>
          <p>No issues in this category</p>
        </div>
      ) : (
        <div className="authority-issue-list">
          {filtered.map((issue) => {
            const nextStatus = getNextStatus(issue.status);
            const isOpen     = expanding[issue.id];
            const imgState   = resolvedImages[issue.id];

            return (
              <article key={issue.id} className="authority-issue-card">
                {/* Top Row */}
                <div className="issue-top-row">
                  <div className="issue-meta">
                    <span
                      className="cat-dot"
                      style={{ background: CATEGORY_COLORS[issue.category] || "#8e44ad" }}
                    />
                    <span className="issue-category">{issue.category}</span>
                    <span
                      className="issue-status-badge"
                      style={{ background: STATUS_COLORS[issue.status] }}
                    >
                      {STATUS_LABELS[issue.status]}
                    </span>
                  </div>
                  <span className="issue-time">{timeAgo(issue.createdAt)}</span>
                </div>

                {/* Title & Description */}
                <h3 className="issue-title">{issue.title}</h3>
                {issue.description && (
                  <p className="issue-desc">{issue.description}</p>
                )}

                {/* Submitter username */}
                {issue.submittedBy && (
                  <div className="issue-submitter">
                    <span className="submitter-icon">👤</span>
                    <span className="submitter-name">
                      Submitted by <strong>{issue.submittedBy}</strong>
                    </span>
                  </div>
                )}

                {/* Report photo — click to enlarge */}
                {issue.imageUrl && (
                  <img
                    src={issue.imageUrl}
                    alt={`Photo of ${issue.title}`}
                    className="issue-thumb"
                    style={{ cursor: "zoom-in" }}
                    title="Click to enlarge"
                    onClick={() => openLightbox(issue.imageUrl, `Photo of ${issue.title}`)}
                  />
                )}

                {/* Upvotes & Location */}
                <div className="issue-info-row">
                  <span>👍 {issue.upvotes || 0} upvotes</span>
                  <span>📍 {issue.lat?.toFixed(4)}, {issue.lng?.toFixed(4)}</span>
                </div>

                {/* Action area */}
                {nextStatus ? (
                  <div className="issue-actions">
                    <button
                      className="action-toggle"
                      onClick={() =>
                        setExpanding((prev) => ({ ...prev, [issue.id]: !prev[issue.id] }))
                      }
                    >
                      {isOpen ? "Cancel" : `Move to ${STATUS_LABELS[nextStatus]}`}
                    </button>

                    {isOpen && (
                      <div className="action-expand">
                        {/* Note */}
                        <input
                          type="text"
                          placeholder="Add a short note (optional)..."
                          value={noteInputs[issue.id] || ""}
                          onChange={(e) =>
                            setNoteInputs((prev) => ({ ...prev, [issue.id]: e.target.value }))
                          }
                          className="action-note-input"
                        />

                        {/* Authority comment */}
                        <textarea
                          placeholder="Authority comment (shown to citizens)..."
                          value={comments[issue.id] || ""}
                          onChange={(e) =>
                            setComments((prev) => ({ ...prev, [issue.id]: e.target.value }))
                          }
                          className="action-comment-input"
                          rows={3}
                        />

                        {/* Resolution image upload */}
                        {nextStatus === "resolved" && (
                          <div className="action-image-upload">
                            <label className="upload-label" htmlFor={`resolved-img-${issue.id}`}>
                              📷 {imgState?.preview ? "Change resolution image" : "Upload resolution image (optional)"}
                            </label>
                            <input
                              id={`resolved-img-${issue.id}`}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              ref={(el) => { fileInputRefs.current[issue.id] = el; }}
                              onChange={(e) => handleImagePick(issue.id, e.target.files[0])}
                            />
                            {imgState?.preview && (
                              <div className="upload-preview-wrap">
                                {/* Preview — click to see full size */}
                                <img
                                  src={imgState.preview}
                                  alt="Resolution preview"
                                  className="upload-preview"
                                  style={{ cursor: "zoom-in" }}
                                  title="Click to enlarge"
                                  onClick={() =>
                                    openLightbox(imgState.preview, "Resolution image preview")
                                  }
                                />
                                <button
                                  className="remove-preview-btn"
                                  onClick={() =>
                                    setResolvedImages((prev) => {
                                      const next = { ...prev };
                                      delete next[issue.id];
                                      return next;
                                    })
                                  }
                                >
                                  ✕ Remove
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          className="action-confirm"
                          disabled={updating[issue.id] || imgState?.uploading}
                          onClick={() => handleStatusUpdate(issue.id, nextStatus)}
                        >
                          {imgState?.uploading
                            ? "Uploading image…"
                            : updating[issue.id]
                            ? "Updating…"
                            : `✓ Confirm ${STATUS_LABELS[nextStatus]}`}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Resolved card — show resolved image, click to enlarge */
                  <div className="issue-resolved-badge">
                    ✅ This issue has been resolved
                    {issue.resolvedImageUrl && (
                      <div className="resolved-image-wrap">
                        <img
                          src={issue.resolvedImageUrl}
                          alt="Resolution proof"
                          className="resolved-thumb"
                          style={{ cursor: "zoom-in" }}
                          title="Click to enlarge"
                          onClick={() =>
                            openLightbox(issue.resolvedImageUrl, "Resolution proof")
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
