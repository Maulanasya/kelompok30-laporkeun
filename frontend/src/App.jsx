import { BrowserRouter, Routes, Route } from "react-router-dom";
import RiwayatLaporan from "./pages/RiwayatLaporan";
import ChatPsikolog from "./pages/ChatPsikolog";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RiwayatLaporan />} />
        <Route path="/riwayat-laporan" element={<RiwayatLaporan />} />
        <Route path="/chat-psikolog" element={<ChatPsikolog />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;