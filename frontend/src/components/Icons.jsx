import logo from '../assets/logo.png'

export function ShieldLogo({ className = 'h-10 w-10' }) {
  return (
    <img
      src={logo}
      alt="Logo LaporKeun!"
      className={`${className} -mx-1.5 object-contain`}
    />
  )
}