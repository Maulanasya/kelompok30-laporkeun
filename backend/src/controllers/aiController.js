const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Model utama dari .env (GEMINI_MODEL), lalu model cadangan jika gagal
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
].filter((name, i, arr) => name && arr.indexOf(name) === i);

// Status yang layak dicoba ulang dengan model lain
const RETRYABLE_STATUS = [404, 429, 500, 503];

const MAX_MESSAGE_LENGTH = 1000;

const SYSTEM_INSTRUCTION =
  "Kamu adalah Asisten AI LaporKeun!, sebuah platform pelaporan perundungan (bullying) dan dukungan kesehatan mental siswa di sekolah. Tugasmu adalah memberikan edukasi umum seputar perundungan, cyberbullying, hak perlindungan siswa, kesehatan mental dasar, serta petunjuk penggunaan platform LaporKeun!. Jawablah dengan bahasa yang ramah, santun, empati, singkat, dan mudah dipahami siswa. Ingatkan pengguna secara halus bahwa kamu bukan pengganti konselor atau psikolog profesional jika mereka membutuhkan bantuan intensif.";

// Panggil Gemini dengan cadangan model
async function generateWithFallback(userText) {
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      const result = await model.generateContent(userText);
      const response = await result.response;
      return response.text();
    } catch (error) {
      lastError = error;
      console.warn(
        `[Gemini] Model ${modelName} gagal (status ${error?.status ?? "?"}), mencoba model berikutnya...`
      );
      if (!RETRYABLE_STATUS.includes(error?.status)) throw error;
    }
  }

  throw lastError;
}

exports.askAI = async (req, res) => {
  try {
    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong" });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Pesan terlalu panjang (maksimal ${MAX_MESSAGE_LENGTH} karakter)`,
      });
    }
    if (!genAI) {
      return res.status(500).json({ error: "API Key Gemini belum diset" });
    }

    const reply = await generateWithFallback(message);

    return res.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error?.status, error?.message);
    return res.status(500).json({ error: "Gagal terhubung ke AI" });
  }
};