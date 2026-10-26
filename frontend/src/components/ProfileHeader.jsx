import { UserIcon, LockIcon } from './Icons'

export default function ProfileHeader({ profile }) {
  return (
    <section className="rounded-lg border border-primary-light bg-white p-5 shadow-[0_1px_4px_rgba(5,58,78,0.1)] md:px-[30px] md:py-[36px]">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-full border-[3px] border-tertiary-dark text-primary">
          <UserIcon className="h-16 w-16" />
        </div>

        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-primary">
            {profile.nama}
          </h1>
          <div className="mt-2 flex flex-wrap justify-center gap-x-7 gap-y-1 text-[15px] sm:justify-start">
            <span>
              NISN <b className="font-semibold">{profile.nisn}</b>
            </span>
            <span>
              Kelas <b className="font-semibold">{profile.kelas}</b>
            </span>
            <span>
              Bergabung <b className="font-semibold">{profile.bergabung}</b>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-6 rounded-md bg-tertiary-light px-6 py-4 shadow-[0_1px_3px_rgba(5,58,78,0.15)]">
        <LockIcon className="h-8 w-8 shrink-0 text-primary" />
        <p className="text-base leading-[27px] text-primary">
          Laporanmu dikirim secara anonim. Nama dan kelasmu tidak muncul di
          laporan. Hanya guru BK yang bisa membuka identitasmu, dan hanya jika
          kamu mengizinkannya.
        </p>
      </div>
    </section>
  )
}
