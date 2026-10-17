import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Navbar active="" />
      <ProfilePage />
      <Footer />
    </div>
  )
}
