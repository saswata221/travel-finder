import { Outlet, Link, NavLink } from "react-router-dom";
import { useState } from "react";
import AboutModal from "./components/AboutModal";

export default function App() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* full-width glass nav over hero */}
      <header className="fixed top-0 left-0 right-0 z-30">
        <div className="backdrop-blur-md bg-black/20  ">
          <div className="mx-auto w-full max-w-[var(--page-max)] px-4 py-3 flex items-center justify-between">
            <Link
              to="/"
              className="font-extrabold text-xl tracking-tight text-white drop-shadow"
            >
              <span className="bg-clip-text text-2xl text-transparent bg-blue-400">
                Travel
              </span>
              Finder
            </Link>

            <nav className="hidden sm:flex items-center gap-2 text-sm">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md transition text-white/90 hover:text-white
                   ${isActive ? "bg-white/20" : "hover:bg-white/10"}`
                }
              >
                Home
              </NavLink>

              <button
                type="button"
                onClick={() => setAboutOpen(true)}
                className="px-3 py-1.5 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition"
              >
                About
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative ">
        <Outlet />
      </main>

      <footer className="py-10 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} TravelFinder — built with React & Tailwind
      </footer>

      {/* About modal */}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
