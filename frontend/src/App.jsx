import { BrowserRouter, Routes, Route } from "react-router-dom";
import RiwayatLaporan from "./pages/RiwayatLaporan";
import ChatPsikolog from "./pages/ChatPsikolog";
import FormLaporanPage from "./pages/FormLaporanPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RiwayatLaporan />} />
        <Route path="/riwayat-laporan" element={<RiwayatLaporan />} />
        <Route path="/chat-psikolog" element={<ChatPsikolog />} />
        <Route path="/form-laporan" element={<FormLaporanPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;