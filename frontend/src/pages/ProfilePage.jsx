import { useState } from 'react'
import ProfileHeader from '../components/ProfileHeader'
import DataDiriTab from '../components/DataDiriTab'
import KeamananTab from '../components/KeamananTab'

const tabs = [
  { id: 'data', label: 'Data diri' },
  { id: 'keamanan', label: 'Keamanan & Privasi' },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('data')
  const [profile, setProfile] = useState({
    nisn: '0051234567',
    nama: 'Aulia Rahma',
    email: 'auliarahma09@gmail.com',
    kelas: '11 SMA/K',
    bergabung: 'Agustus 2026',
  })

  const handleSave = (values) => {
    setProfile((prev) => ({ ...prev, ...values }))
    // TODO: sambungkan ke API
  }

  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Dekorasi latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 hidden h-[470px] w-[370px] rounded-bl-[260px] bg-tertiary md:block"
        style={{ clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 hidden h-[380px] w-[445px] rounded-tr-[90px] rounded-br-[300px] bg-tertiary md:block"
      />

      <div className="relative mx-auto max-w-[1280px] space-y-[50px] px-5 pb-12 pt-[72px] md:px-0">
        <ProfileHeader profile={profile} />

        <section className="overflow-hidden rounded-lg border border-primary-light bg-white shadow-[0_1px_4px_rgba(5,58,78,0.1)]">
          <div role="tablist" className="flex gap-4 border-b border-primary-light px-5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`-mb-px border-b-2 px-4 py-[18px] text-[17px] transition-colors ${
                    isActive
                      ? 'border-primary font-normal text-primary'
                      : 'border-transparent text-neutral-dark hover:text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'data' ? (
            <DataDiriTab key={profile.nama + profile.email + profile.kelas} profile={profile} onSave={handleSave} />
          ) : (
            <KeamananTab
              onChangePassword={() => alert('Fitur ganti kata sandi')}
              onLogoutAll={() => alert('Keluar dari semua perangkat')}
            />
          )}
        </section>
      </div>
    </main>
  )
}
