import { BrowserRouter, Routes, Route } from "react-router-dom";
import RiwayatLaporan from "./pages/RiwayatLaporan";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RiwayatLaporan />} />
        <Route path="/riwayat-laporan" element={<RiwayatLaporan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;