// uploadImage.js — Member 4
// Contract: uploadImage(file: File): Promise<string>
// Returns Cloudinary secure_url. Called by Member 1 (ReportForm) via App.jsx prop.

// ☁️ Paste your Cloudinary CLOUD_NAME and UPLOAD_PRESET here
// Get from: Cloudinary Console → Settings → Upload → Upload Presets
// uploadImage.js
const CLOUD_NAME    = "";          // ✅ Visible on your dashboard
const UPLOAD_PRESET = ""; // ← Set this after Step 4 above

export async function uploadImage(file) {
  if (!file) throw new Error("uploadImage: No file provided.");

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  // FormData is required for binary file upload — do NOT use JSON.stringify
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  let response;
  try {
    response = await fetch(url, { method: "POST", body: formData });
  } catch (networkErr) {
    throw new Error(`uploadImage: Network error — ${networkErr.message}`);
  }

  if (!response.ok) {
    throw new Error(`uploadImage: Cloudinary rejected upload (HTTP ${response.status}). Check CLOUD_NAME and UPLOAD_PRESET.`);
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("uploadImage: Cloudinary response missing secure_url.");
  }

  return data.secure_url; // ← This is the contract return value
}