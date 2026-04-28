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

export default function ReportForm({ onSubmit, uploadImage }) {
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

  const langMap = {
    en: "en-IN",
    hi: "hi-IN",
    kn: "kn-IN",
  };

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
  } = useVoiceInput(langMap[i18n.language]);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  useEffect(() => {
    const pending = JSON.parse(localStorage.getItem("pending_issues")) || [];
    setPendingCount(pending.length);
  }, []);

  useEffect(() => {
    const syncPending = async () => {
      const pending = JSON.parse(localStorage.getItem("pending_issues")) || [];
      if (pending.length === 0) return;

      try {
        for (let issue of pending) {
          let imageUrl = "";

          if (issue.imageBase64) {
            const res = await fetch(issue.imageBase64);
            const blob = await res.blob();
            const file = new File([blob], "offline.jpg", { type: blob.type });

            
            imageUrl = await uploadImage(file);
          }

          
          await onSubmit({
            title: issue.title,
            description: issue.description,
            category: issue.category,
            imageUrl,
            audioText: issue.audioText,
            lat: issue.lat,
            lng: issue.lng,
          });
        }

        localStorage.removeItem("pending_issues");
        setPendingCount(0);

        alert(`${pending.length} pending issue(s) uploaded successfully!`);
      } catch (err) {
        console.error("Sync failed", err);
      }
    };

    window.addEventListener("online", syncPending);
    return () => window.removeEventListener("online", syncPending);
  }, [onSubmit, uploadImage]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        reject
      );
    });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const location = await getLocation();

      if (!navigator.onLine) {
        let base64Image = "";

        if (file) {
          base64Image = await fileToBase64(file);
        }

        const pending = JSON.parse(localStorage.getItem("pending_issues")) || [];

        pending.push({
          ...form,
          imageBase64: base64Image,
          audioText: transcript,
          lat: location.lat,
          lng: location.lng,
        });

        localStorage.setItem("pending_issues", JSON.stringify(pending));
        setPendingCount(pending.length);

        setMessage(
          "You are offline. Your report is saved and will upload automatically when you reconnect."
        );

        setLoading(false);
        return;
      }

      let imageUrl = "";

      if (file) {
        
        imageUrl = await uploadImage(file);
      }

      await onSubmit({
        ...form,
        imageUrl,
        audioText: transcript,
        lat: location.lat,
        lng: location.lng,
      });

      setMessage(t("success"));
      setForm({ title: "", description: "", category: "" });
      setFile(null);
      setPreview(null);

    } catch (err) {
      setMessage(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16 }}>
      
      {/* 🌐 Language Toggle */}
      <div style={{ marginBottom: 10 }}>
        <button type="button" onClick={() => i18n.changeLanguage("en")}>EN</button>
        <button type="button" onClick={() => i18n.changeLanguage("hi")}>हिं</button>
        <button type="button" onClick={() => i18n.changeLanguage("kn")}>ಕನ್ನಡ</button>
      </div>

      <h2>{t("title")}</h2>

      {/* Title */}
      <label htmlFor="title">Title</label>
      <input
        id="title"
        name="title"
        required
        aria-required="true"
        value={form.title}
        onChange={handleChange}
        style={{ minHeight: 44, width: "100%" }}
      />

      {/* Description */}
      <label htmlFor="description">{t("description")}</label>
      <textarea
        id="description"
        name="description"
        required
        aria-required="true"
        value={form.description}
        onChange={handleChange}
        style={{ minHeight: 80, width: "100%" }}
      />

      {/* Category */}
      <label htmlFor="category">{t("category")}</label>
      <select
        id="category"
        name="category"
        required
        aria-required="true"
        value={form.category}
        onChange={handleChange}
        style={{ minHeight: 44 }}
      >
        <option value="">{t("selectCategory")}</option>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      {/* Image Upload */}
      <label>{t("upload")}</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImage}
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          width="100%"
          style={{ marginTop: 10 }}
        />
      )}

      {/* Voice Input */}
      <div>
        <p>{t("voice")}</p>
        <button type="button" onClick={startListening}>
          {t("start")}
        </button>
        <button type="button" onClick={stopListening}>
          {t("stop")}
        </button>
        <p>{transcript}</p>
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={loading} style={{ minHeight: 44 }}>
        {loading ? "Submitting..." : t("submit")}

        {pendingCount > 0 && (
          <span
            style={{
              marginLeft: 8,
              background: "red",
              color: "white",
              padding: "2px 6px",
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            {pendingCount} pending
          </span>
        )}
      </button>

      {/* Message */}
      {message && <p>{message}</p>}
    </form>
  );
}