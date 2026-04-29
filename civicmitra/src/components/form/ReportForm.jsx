// ReportForm.jsx — Member 1 | Accessible report form with voice input and smart assistant
import { useState, useEffect } from "react";
import useVoiceInput from "../../hooks/useVoiceInput";
import "./ReportForm.css";

// ── Free translation via MyMemory API (no API key needed) ────────────────────
const LANG_CODES = { hi: "hi", kn: "kn" };
async function translateText(text, targetLang) {
  if (!text.trim()) return text;
  const code = LANG_CODES[targetLang];
  if (!code) return text;
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${code}`
    );
    const data = await res.json();
    return data?.responseData?.translatedText || text;
  } catch {
    return text;
  }
}

const categories = ["Roads", "Water", "Electricity", "Sanitation", "Parks", "Other"];

// Default coordinates (Bengaluru city centre) used as fallback if geolocation is denied
const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };

export default function ReportForm({
  onSubmit,
  uploadImage,
  detectCategory,
  suggestDescription,
  findSimilarIssues,
  user,
}) {
  const [form, setForm] = useState({ title: "", description: "", category: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [pendingCount, setPendingCount] = useState(0);
  const [autoDetected, setAutoDetected] = useState(false);
  const [similarIssues, setSimilarIssues] = useState([]);
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState("idle"); // idle | getting | got | denied

  const { transcript, isListening, startListening, stopListening } =
    useVoiceInput("en-IN");

  // Convert image to base64 for offline storage
  const fileToBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  // Load pending count on mount
  useEffect(() => {
    const pending = JSON.parse(localStorage.getItem("pending_issues")) || [];
    setPendingCount(pending.length);
  }, []);

  // Auto-sync pending issues when back online
  useEffect(() => {
    const syncPending = async () => {
      const pending = JSON.parse(localStorage.getItem("pending_issues")) || [];
      if (!pending.length) return;
      for (const issue of pending) {
        let imageUrl = "";
        if (issue.imageBase64) {
          try {
            const res = await fetch(issue.imageBase64);
            const blob = await res.blob();
            imageUrl = await uploadImage(new File([blob], "offline.jpg"));
          } catch {
            // Image upload failed — submit without it
          }
        }
        await onSubmit({ ...issue, imageUrl });
      }
      localStorage.removeItem("pending_issues");
      setPendingCount(0);
      alert("✅ Pending issues synced successfully!");
    };
    window.addEventListener("online", syncPending);
    return () => window.removeEventListener("online", syncPending);
  }, [onSubmit, uploadImage]);

  // Handle category change — manual override always wins
  const handleCategoryChange = (e) => {
    setForm((prev) => ({ ...prev, category: e.target.value }));
    setAutoDetected(false);
  };

  // Handle title / description change + auto-detect category
  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (!autoDetected || e.target.name !== "category") {
      const detected = detectCategory?.(updated.title, updated.description);
      if (detected) {
        setForm((prev) => ({ ...prev, category: detected }));
        setAutoDetected(true);
      } else if (!form.category) {
        setAutoDetected(false);
      }
    }
  };

  // Image selection
  const handleImage = (e) => {
    const selected = e.target.files[0];
    setFile(selected || null);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };

  // ── Geolocation (safe — never throws; falls back to default) ─────────────
  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocStatus("denied");
        resolve(DEFAULT_LOCATION);
        return;
      }
      setLocStatus("getting");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          setLocStatus("got");
          resolve(loc);
        },
        () => {
          setLocStatus("denied");
          resolve(DEFAULT_LOCATION);
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    });

  // Check for similar issues when location + category known
  useEffect(() => {
    if (location && form.category) {
      const results = findSimilarIssues?.(location.lat, location.lng, form.category);
      setSimilarIssues(results || []);
    }
  }, [location, form.category]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // 1. Get location (never throws — uses fallback)
      const loc = await getLocation();

      // 2. Offline mode → save to localStorage
      if (!navigator.onLine) {
        const base64Image = file ? await fileToBase64(file) : "";
        const pending = JSON.parse(localStorage.getItem("pending_issues")) || [];
        pending.push({ ...form, imageBase64: base64Image, audioText: transcript, ...loc });
        localStorage.setItem("pending_issues", JSON.stringify(pending));
        setPendingCount(pending.length);
        setMessage({ text: "📴 Saved offline — will upload when you reconnect.", type: "info" });
        return;
      }

      // 3. Upload image (optional)
      let imageUrl = "";
      if (file && uploadImage) {
        try {
          imageUrl = await uploadImage(file);
        } catch (imgErr) {
          console.warn("Image upload failed — submitting without image:", imgErr.message);
        }
      }

      // 4. Submit issue to Firebase
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || "Other",
        imageUrl,
        audioText: transcript || "",
        lat: loc.lat,
        lng: loc.lng,
      });

      // 5. Success
      setMessage({ text: "✅ Issue reported successfully!", type: "success" });
      setForm({ title: "", description: "", category: "" });
      setFile(null);
      setPreview(null);
      setSimilarIssues([]);

    } catch (err) {
      console.error("ReportForm submit error:", err);
      setMessage({
        text: `❌ ${err.message || "Submission failed. Please try again."}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="report-form-wrapper">
      <form onSubmit={handleSubmit} className="report-form">
        <h2 className="form-heading">📝 Report an Issue</h2>

        {/* Reporting-as chip */}
        {user && (
          <div className="reporting-as-chip">
            <span className="reporting-as-avatar">
              {(user.displayName || user.email || "A")[0].toUpperCase()}
            </span>
            <span>
              Reporting as&nbsp;
              <strong>{user.displayName || user.email || "Anonymous"}</strong>
            </span>
          </div>
        )}

        {/* Title */}
        <div className="field-group">
          <label htmlFor="rf-title">Title *</label>
          <input
            id="rf-title"
            name="title"
            type="text"
            placeholder="e.g. Pothole on MG Road"
            value={form.title}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        {/* Description */}
        <div className="field-group">
          <label htmlFor="rf-desc">Description</label>
          <textarea
            id="rf-desc"
            name="description"
            placeholder="Describe the issue in detail (optional)…"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
          {form.category && suggestDescription && (
            <p className="field-hint">💡 {suggestDescription(form.category)}</p>
          )}
        </div>

        {/* Category */}
        <div className="field-group">
          <label htmlFor="rf-cat">Category *</label>
          <select
            id="rf-cat"
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            required
            aria-required="true"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {autoDetected && (
            <div className="auto-detected-row">
              <span className="auto-badge">✨ Auto-detected</span>
              <span className="auto-hint">Not right? Use the dropdown above to change it.</span>
            </div>
          )}
        </div>

        {/* Photo Upload */}
        <div className="field-group">
          <label htmlFor="rf-photo">Upload Photo (optional)</label>
          <div className="file-upload-area">
            <input
              id="rf-photo"
              type="file"
              accept="image/*"
              onChange={handleImage}
            />
          </div>
          {preview && (
            <div className="preview-wrap">
              <img src={preview} alt="Preview of selected issue photo" className="image-preview" />
              <button type="button" className="remove-img-btn" onClick={handleRemoveImage}>
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        {/* Voice Input */}
        <div className="field-group">
          <label>Voice Input (optional)</label>
          <div className="voice-controls">
            <button
              type="button"
              className={`voice-btn ${isListening ? "listening" : ""}`}
              onClick={isListening ? stopListening : startListening}
            >
              {isListening ? "🔴 Stop Recording" : "🎙️ Start Voice Input"}
            </button>
            {isListening && <span className="pulse-dot" />}
          </div>
          {transcript && (
            <div className="transcript-box">
              <strong>Transcript:</strong> {transcript}
            </div>
          )}
        </div>

        {/* Location status */}
        {locStatus === "denied" && (
          <div className="location-note">
            📍 Location access denied — using Bengaluru city centre as default
          </div>
        )}
        {locStatus === "got" && (
          <div className="location-note success">
            📍 Location captured
          </div>
        )}

        {/* Similar Issues Warning */}
        {similarIssues.length > 0 && (
          <div className="similar-warning">
            <strong>⚠️ {similarIssues.length} similar issue{similarIssues.length > 1 ? "s" : ""} already reported nearby</strong>
            {similarIssues.map((issue, i) => (
              <div key={i} className="similar-item">📌 {issue.title} — <em>{issue.status}</em></div>
            ))}
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <span className="submit-loading">
              <span className="btn-spinner" /> Submitting…
            </span>
          ) : (
            <>
              Submit Report
              {pendingCount > 0 && (
                <span className="pending-badge">{pendingCount} pending</span>
              )}
            </>
          )}
        </button>

        {/* Feedback message */}
        {message.text && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}