import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const navLinkClass = ({ isActive }) =>
  `text-sm uppercase tracking-[0.18em] transition ${isActive ? "text-black" : "text-zinc-500 hover:text-black"}`;

export default function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="text-lg font-semibold uppercase tracking-[0.28em] text-black">
          Catalog Demo
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/catalog" className={navLinkClass}>
            Catalog
          </NavLink>
          <NavLink to="/cart" className={navLinkClass}>
            Cart ({itemCount})
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hidden text-sm text-zinc-600 hover:text-black sm:inline">
                {user?.full_name || user?.email || "Profile"}
              </Link>
              <button className="btn-secondary" onClick={logout} type="button">
                Logout
              </button>
            </>
          ) : (
            <Link className="btn-primary" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
      <nav className="flex justify-center gap-6 border-t border-zinc-100 px-5 py-3 md:hidden">
        <NavLink to="/catalog" className={navLinkClass}>
          Catalog
        </NavLink>
        <NavLink to="/cart" className={navLinkClass}>
          Cart ({itemCount})
        </NavLink>
        <NavLink to="/profile" className={navLinkClass}>
          Profile
        </NavLink>
      </nav>
    </header>
  );
}
