const API_BASE =
  import.meta.env.VITE_API_URL || "https://kelompok30-laporkeun-backend.vercel.app";

// URL Cloudinary dipakai apa adanya, data lama (uploads/...) tetap lewat backend
export const buktiUrl = (filePath) => {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return `${API_BASE}/${filePath.replace(/^\//, "")}`;
};