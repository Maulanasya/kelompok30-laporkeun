# LaporKeun!

Platform pelaporan perundungan dan pendampingan siswa. Siswa dapat melapor
(dengan nama atau anonim), memantau status laporan, dan berkonsultasi dengan
guru BK. Guru BK dapat mengalihkan siswa ke psikolog untuk pendampingan lanjutan.

Proyek Kelompok 30.

## Peran Pengguna

- Korban/Siswa Pelapor
- Guru BK
- Psikolog

## Tech Stack

- Frontend: React, Vite, Tailwind CSS v4
- Font: Poppins
- Backend: belum ditentukan

## Struktur Repo

```
laporkeunkel30/
├── frontend/   # aplikasi React + Vite
├── backend/    # server/API (belum dibuat)
└── README.md
```

## Menjalankan Frontend

```bash
git clone https://github.com/USERNAME/kelompok30-laporkeun.git
cd kelompok30-laporkeun/frontend
copy .env.example .env
npm install
npm run dev
```

Buka `http://localhost:5173`. Isi nilai variabel di `.env` sesuai kebutuhan.

## Alur Kerja Git

- `main`: kode stabil, tidak boleh di-push langsung.
- `dev`: tempat semua fitur digabung dan diuji.
- Branch fitur dibuat dari `dev`, dengan format `feat/nama-fitur`
  atau `fix/nama-perbaikan`, lalu digabung lewat Pull Request.

## Tim

- Maulana Yusuf Syawaludin
- Muhammad Ihsanuddin
- Raka Zaki Ramadhan
- Nailah Mujadiah