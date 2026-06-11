import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAppData } from "../context/AppContext";

const navLinks = [
  { name: "Analyse", path: "/analyse" },
  { name: "Job Matcher", path: "/jobmatcher" },
  { name: "Resume Lab", path: "/resumebuilder" },
  { name: "Interview AI", path: "/interviewprep" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuth, user } = useAppData();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050816]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/hiremind-logo.png"
              alt="HIREMind Logo"
              className="w-9 object-contain hidden sm:block"
            />

            <img
              src="/hiremind-ai.png"
              alt="HIREMind AI"
              className="h-5 object-contain"
            />
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-md transition-colors ${
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          {isAuth ? (
            <Link
              to="/account"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:bg-white/10"
            >
              <img
                src="/user.png"
                alt=""
                className="h-5 w-5 rounded-md object-cover"
              />

              <span className="text-sm text-white/80">
                {user?.name?.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                Log In
              </Link>

              <Link
                to="/login"
                className="rounded-xl btn-primary px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <div className="flex items-center gap-3 lg:hidden">
          {!isAuth && (
            <Link
              to="/login"
              className="rounded-lg btn-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90"
            >
              Get Started
            </Link>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center rounded-lg border border-white/10 p-2 text-white cursor-pointer"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-white/5 bg-[#050816]/95 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1 px-5 py-5">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-md text-white/70 transition hover:text-white"
              >
                {item.name}
              </NavLink>
            ))}

            <div className="mt-4 flex flex-col gap-3">
              {isAuth ? (
                <Link
                  to="/account"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <img
                    src="/user.png"
                    alt=""
                    className="h-5 w-5 rounded-md object-cover"
                  />

                  <span className="text-sm text-white/80">
                    {user?.name?.split(" ")[0]}
                  </span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-center rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                  >
                    Log In
                  </Link>

                  <Link
                    to="/login"
                    className="rounded-xl btn-primary px-4 py-3 text-center text-sm font-medium text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
