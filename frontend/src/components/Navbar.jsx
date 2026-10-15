import { Link, NavLink } from "react-router-dom";

const menu = [
  { to: "/", label: "Beranda" },
  { to: "/form-laporan", label: "Form Laporan" },
  { to: "/riwayat-laporan", label: "Riwayat Laporan" },
  { to: "/chat-psikolog", label: "Chat Psikolog" },
];

export default function Navbar() {
  return (
    <header className="border-b border-neutral-dark/30 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
       <Link to="/" className="flex items-center">
        <img
            src="/assets/images/logo.svg"
            alt="LaporKeun Logo"
            className="h-8 w-auto"
        />
        </Link>

        <nav>
          <ul className="hidden items-center gap-6 text-xs md:flex">
            {menu.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? "font-semibold text-primary"
                      : "text-neutral-dark hover:text-primary"
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="flex h-8 w-8 items-center justify-center rounded border border-primary text-xs text-primary"
            aria-label="Profil"
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="0.5" width="37" height="37" rx="4.5" stroke="#023346"/>
<circle cx="19" cy="14.6667" r="3.83333" stroke="#023346" stroke-linecap="round"/>
<path d="M11.3419 24.0524C12.0476 21.7268 14.4564 20.625 16.8867 20.625H21.1133C23.5436 20.625 25.9524 21.7268 26.6581 24.0524C26.8485 24.6798 27.0008 25.3761 27.0753 26.1263C27.1298 26.6759 26.6773 27.125 26.125 27.125H11.875C11.3227 27.125 10.8702 26.6759 10.9247 26.1263C10.9992 25.3761 11.1515 24.6798 11.3419 24.0524Z" stroke="#023346" stroke-linecap="round"/>
</svg>

          </Link>
          <Link
            to="/login"
            className="flex h-8 w-8 items-center justify-center rounded bg-tertiary text-xs text-white"
            aria-label="Keluar"
          >
           <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.16666 13L1.77622 12.6877L1.52634 13L1.77622 13.3124L2.16666 13ZM11.9167 13.5C12.1928 13.5 12.4167 13.2762 12.4167 13C12.4167 12.7239 12.1928 12.5 11.9167 12.5V13V13.5ZM6.49999 7.58337L6.10956 7.27103L1.77622 12.6877L2.16666 13L2.55709 13.3124L6.89042 7.89572L6.49999 7.58337ZM2.16666 13L1.77622 13.3124L6.10956 18.7291L6.49999 18.4167L6.89042 18.1044L2.55709 12.6877L2.16666 13ZM2.16666 13V13.5H11.9167V13V12.5H2.16666V13Z" fill="white"/>
<path d="M10.8333 8.80955V7.7218C10.8333 6.10346 10.8333 5.29429 11.3073 4.7348C11.7813 4.17531 12.5794 4.04228 14.1757 3.77623L16.847 3.33102C20.09 2.79051 21.7116 2.52025 22.7725 3.41895C23.8333 4.31764 23.8333 5.96156 23.8333 9.24939V16.7505C23.8333 20.0384 23.8333 21.6823 22.7725 22.581C21.7116 23.4797 20.09 23.2094 16.847 22.6689L14.1757 22.2237C12.5794 21.9576 11.7813 21.8246 11.3073 21.2651C10.8333 20.7056 10.8333 19.8965 10.8333 18.2781V17.4048" stroke="white"/>
</svg>

          </Link>
        </div>
      </div>
    </header>
  );
}