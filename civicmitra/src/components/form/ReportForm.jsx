import { useState } from "react";
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = async (e) => {
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
      let imageUrl = "";

      if (file) {
        // ← Member 4 integration
        imageUrl = await uploadImage(file);
      }

      const location = await getLocation();

      // ← Member 4 integration
      await onSubmit({
        ...form,
        imageUrl,
        audioText: transcript,
        lat: location.lat,
        lng: location.lng,
      });

      setMessage(t("success"));
      setForm({ title: "", description: "", category: "" });
    } catch (err) {
      setMessage(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16 }}>
      
      {/* Language Toggle */}
      <div>
        <button onClick={() => i18n.changeLanguage("en")}>EN</button>
        <button onClick={() => i18n.changeLanguage("hi")}>हिं</button>
        <button onClick={() => i18n.changeLanguage("kn")}>ಕನ್ನಡ</button>
      </div>

      <h2>{t("title")}</h2>

      <label htmlFor="title">Title</label>
      <input
        id="title"
        name="title"
        required
        value={form.title}
        onChange={handleChange}
        style={{ minHeight: 44 }}
      />

      <label htmlFor="description">{t("description")}</label>
      <textarea
        id="description"
        name="description"
        required
        value={form.description}
        onChange={handleChange}
        style={{ minHeight: 80 }}
      />

      <label htmlFor="category">{t("category")}</label>
      <select
        id="category"
        name="category"
        required
        value={form.category}
        onChange={handleChange}
      >
        <option value="">{t("selectCategory")}</option>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <label>{t("upload")}</label>
      <input type="file" accept="image/*" capture="environment" onChange={handleImage} />

      {preview && <img src={preview} alt="preview" width="100%" />}

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

      <button type="submit" disabled={loading} style={{ minHeight: 44 }}>
        {loading ? "Submitting..." : t("submit")}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}