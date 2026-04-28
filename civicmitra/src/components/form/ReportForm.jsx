import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useVoiceInput from "../../hooks/useVoiceInput";

const categories = [
  "Roads",
  "Water",
  "Electricity",
  "Sanitation",
  "Parks",
  "Other",
];

export default function ReportForm({
  onSubmit,
  uploadImage,
  detectCategory,
  suggestDescription,
  findSimilarIssues,
}) {
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const [autoDetected, setAutoDetected] = useState(false);
  const [similarIssues, setSimilarIssues] = useState([]);

  const [location, setLocation] = useState(null);

  const langMap = {
    en: "en-IN",
    hi: "hi-IN",
    kn: "kn-IN",
  };

  const {
    transcript,
    startListening,
    stopListening,
  } = useVoiceInput(langMap[i18n.language]);

  // 🔹 Convert image → base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  // 🔹 Load pending count
  useEffect(() => {
    const pending = JSON.parse(localStorage.getItem("pending_issues")) || [];
    setPendingCount(pending.length);
  }, []);

  // 🔹 AUTO SYNC
  useEffect(() => {
    const syncPending = async () => {
      const pending = JSON.parse(localStorage.getItem("pending_issues")) || [];
      if (pending.length === 0) return;

      for (let issue of pending) {
        let imageUrl = "";

        if (issue.imageBase64) {
          const res = await fetch(issue.imageBase64);
          const blob = await res.blob();
          const file = new File([blob], "offline.jpg");

          imageUrl = await uploadImage(file);
        }

        await onSubmit({
          ...issue,
          imageUrl,
        });
      }

      localStorage.removeItem("pending_issues");
      setPendingCount(0);
      alert(`${pending.length} pending issue(s) uploaded successfully!`);
    };

    window.addEventListener("online", syncPending);
    return () => window.removeEventListener("online", syncPending);
  }, [onSubmit, uploadImage]);

  // 🔹 HANDLE INPUT CHANGE + AUTO CATEGORY
  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);

    const detected = detectCategory?.(updated.title, updated.description);
    if (detected) {
      setForm((prev) => ({ ...prev, category: detected }));
      setAutoDetected(true);
    } else {
      setAutoDetected(false);
    }
  };

  // 🔹 IMAGE
  const handleImage = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  // 🔹 GET LOCATION
  const getLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(loc);
          resolve(loc);
        },
        reject
      );
    });

  // 🔹 SIMILAR ISSUES CHECK
  useEffect(() => {
    if (location && form.category) {
      const results = findSimilarIssues?.(
        location.lat,
        location.lng,
        form.category
      );
      setSimilarIssues(results || []);
    }
  }, [location, form.category]);

  // 🔹 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const loc = await getLocation();

      if (!navigator.onLine) {
        let base64Image = file ? await fileToBase64(file) : "";

        const pending =
          JSON.parse(localStorage.getItem("pending_issues")) || [];

        pending.push({
          ...form,
          imageBase64: base64Image,
          audioText: transcript,
          lat: loc.lat,
          lng: loc.lng,
        });

        localStorage.setItem("pending_issues", JSON.stringify(pending));
        setPendingCount(pending.length);

        setMessage("Offline saved. Will sync later.");
        return;
      }

      let imageUrl = file ? await uploadImage(file) : "";

      await onSubmit({
        ...form,
        imageUrl,
        audioText: transcript,
        lat: loc.lat,
        lng: loc.lng,
      });

      setMessage(t("success"));
      setForm({ title: "", description: "", category: "" });
      setPreview(null);

    } catch {
      setMessage(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16 }}>
      
      {/* 🌐 Language Toggle */}
      <div>
        <button type="button" onClick={() => i18n.changeLanguage("en")}>EN</button>
        <button type="button" onClick={() => i18n.changeLanguage("hi")}>हिं</button>
        <button type="button" onClick={() => i18n.changeLanguage("kn")}>ಕನ್ನಡ</button>
      </div>

      <h2>{t("title")}</h2>

      {/* Title */}
      <label>Title</label>
      <input name="title" value={form.title} onChange={handleChange} required />

      {/* Description */}
      <label>{t("description")}</label>
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        required
      />

      {/* 💡 Suggestion */}
      {form.category && (
        <p style={{ color: "#777", fontStyle: "italic" }}>
          {suggestDescription?.(form.category)}
        </p>
      )}

      {/* Category */}
      <label>{t("category")}</label>
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
      >
        <option value="">{t("selectCategory")}</option>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      {autoDetected && (
        <p style={{ color: "green" }}>✨ Category auto-detected</p>
      )}

      {/* Image */}
      <input type="file" accept="image/*" onChange={handleImage} />
      {preview && <img src={preview} width="100%" />}

      {/* Voice */}
      <button type="button" onClick={startListening}>Start</button>
      <button type="button" onClick={stopListening}>Stop</button>
      <p>{transcript}</p>

      {/* ⚠️ Similar Issues */}
      {similarIssues.length > 0 && (
        <div style={{ background: "#fff3cd", padding: 10 }}>
          ⚠️ {similarIssues.length} similar issues nearby
          {similarIssues.map((issue, i) => (
            <div key={i}>
              <a href="#">{issue.title}</a>
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : t("submit")}
        {pendingCount > 0 && (
          <span style={{ marginLeft: 8, background: "red", color: "white" }}>
            {pendingCount} pending
          </span>
        )}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}