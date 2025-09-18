// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaHome, FaCar, FaInfoCircle, FaBell, FaMoon, FaGlobe,
  FaUser, FaLock, FaClipboardList, FaSignOutAlt, FaSignInAlt, FaUserPlus,
  FaBars, FaTimes
} from "react-icons/fa";

/* ===== Helpers ===== */
const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8000") + "/api";
const formatTime = (d) =>
  d.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

/* ===== Modales ===== */
function LoginModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur de connexion");
        return;
      }
      if (!data.token) {
        setError("Token manquant dans la réponse API.");
        return;
      }

      // ✅ on stocke token + user pour les routes protégées
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLoginSuccess?.(data.user);
      onClose();

      if (data.user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch {
      setError("Erreur réseau ou serveur");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Connexion</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2 mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border rounded px-3 py-2 mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <div className="mb-3 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-indigo-900 font-bold py-2 rounded hover:bg-yellow-500"
          >
            Se connecter
          </button>
        </form>
        <button onClick={onClose} className="mt-4 text-gray-500 hover:text-gray-700">Annuler</button>
      </div>
    </div>
  );
}

function RegisterModal({ onClose, onRequestLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur lors de l'inscription");
      } else {
        // ✅ pas de connexion auto : on affiche succès puis on ouvre Login
        setSuccess("Inscription réussie ! Vous pouvez vous connecter maintenant.");
        setTimeout(() => {
          onClose?.();
          onRequestLogin?.(); // 👉 ouvre la modale de connexion
        }, 1200);
      }
    } catch {
      setError("Erreur réseau ou serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Inscription</h2>

        {success && (
          <div className="mb-3 rounded-md border border-green-300 bg-green-50 text-green-800 px-3 py-2 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Nom complet"
            className="w-full border rounded px-3 py-2 mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2 mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border rounded px-3 py-2 mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className="w-full border rounded px-3 py-2 mb-3"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-indigo-900 font-bold py-2 rounded hover:bg-yellow-500 disabled:opacity-70"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <button onClick={onClose} className="mt-4 text-gray-500 hover:text-gray-700">Annuler</button>
      </div>
    </div>
  );
}

/* ===== Navbar ===== */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications] = useState([]); // plug tes notifs ici
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
  });

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setShowUserMenu(false);
    navigate("/");
  };

  useEffect(() => {
    // Fermer menus au changement de route
    setShowUserMenu(false);
    setShowNotifMenu(false);
    setShowMobile(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 w-[70%] md:w-[1100px] px-4 py-0 bg-white/95 backdrop-blur border border-black rounded-full shadow-lg z-20">
        <div className="mx-auto py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src="/logo-ent.jpg" alt="HF Car Rental Logo" className="h-10 w-auto mr-3 rounded-full" />
            <span className="font-bold text-xl text-indigo-900">HF Car Rental</span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex space-x-6 items-center relative">
            <button
              onClick={() => navigate("/")}
              className={`font-semibold px-3 py-2 rounded flex items-center gap-2 ${isActive("/") ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-700 hover:text-yellow-500"}`}
            >
              <FaHome /> Home
            </button>
            <button
              onClick={() => navigate("/cars")}
              className={`font-semibold px-3 py-2 rounded flex items-center gap-2 ${isActive("/cars") ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-700 hover:text-yellow-500"}`}
            >
              <FaCar /> Voitures
            </button>
            <button
              onClick={() => navigate("/about")}
              className={`font-semibold px-3 py-2 rounded flex items-center gap-2 ${isActive("/about") ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-700 hover:text-yellow-500"}`}
            >
              <FaInfoCircle /> About Us
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifMenu((v) => !v)} className="relative text-gray-700 hover:text-yellow-500">
                <FaBell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-md z-50">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="px-4 py-2 hover:bg-gray-100 text-sm">
                        <div className="font-medium">{n.text}</div>
                        <div className="text-gray-500 text-xs">{formatTime(new Date(n.time))}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">Aucune notification</div>
                  )}
                </div>
              )}
            </div>

            <button className="text-gray-700 hover:text-yellow-500"><FaMoon size={18} /></button>
            <button className="text-gray-700 hover:text-yellow-500"><FaGlobe size={18} /></button>

            {/* User */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2 text-indigo-900 font-semibold hover:text-yellow-500"
                >
                  <FaUser /> {currentUser.name}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-md text-sm z-50">
                    <button onClick={() => { navigate("/profile"); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"><FaUser /> Voir profil</button>
                    <button onClick={() => { navigate("/change-password"); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"><FaLock /> Modifier mot de passe</button>
                    <button onClick={() => { navigate("/my-reservations"); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"><FaClipboardList /> Mes réservations</button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"><FaSignOutAlt /> Déconnexion</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-indigo-900 text-white px-4 py-2 rounded hover:bg-indigo-800 ml-6 flex items-center gap-2"
                >
                  <FaSignInAlt /> Login
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="bg-yellow-400 text-indigo-900 font-bold px-4 py-2 rounded hover:bg-yellow-500 flex items-center gap-2"
                >
                  <FaUserPlus /> Register
                </button>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setShowMobile((v) => !v)} aria-label="Menu">
              {showMobile ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {showMobile && (
          <div className="md:hidden border-t border-gray-200 py-3 px-4">
            <div className="flex flex-col gap-2">
              <Link to="/" className={`px-3 py-2 rounded ${isActive("/") ? "bg-yellow-50 text-yellow-600" : "hover:bg-gray-50"}`} onClick={() => setShowMobile(false)}><FaHome className="inline mr-2" />Home</Link>
              <Link to="/cars" className={`px-3 py-2 rounded ${isActive("/cars") ? "bg-yellow-50 text-yellow-600" : "hover:bg-gray-50"}`} onClick={() => setShowMobile(false)}><FaCar className="inline mr-2" />Voitures</Link>
              <Link to="/about" className={`px-3 py-2 rounded ${isActive("/about") ? "bg-yellow-50 text-yellow-600" : "hover:bg-gray-50"}`} onClick={() => setShowMobile(false)}><FaInfoCircle className="inline mr-2" />About</Link>

              {currentUser ? (
                <>
                  <button onClick={() => { navigate("/profile"); setShowMobile(false); }} className="text-left px-3 py-2 rounded hover:bg-gray-50"><FaUser className="inline mr-2" />Voir profil</button>
                  <button onClick={() => { navigate("/my-reservations"); setShowMobile(false); }} className="text-left px-3 py-2 rounded hover:bg-gray-50"><FaClipboardList className="inline mr-2" />Mes réservations</button>
                  <button onClick={handleLogout} className="text-left px-3 py-2 rounded hover:bg-gray-50 text-red-600"><FaSignOutAlt className="inline mr-2" />Déconnexion</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setShowLogin(true); setShowMobile(false); }} className="text-left px-3 py-2 rounded bg-indigo-900 text-white"><FaSignInAlt className="inline mr-2" />Login</button>
                  <button onClick={() => { setShowRegister(true); setShowMobile(false); }} className="text-left px-3 py-2 rounded bg-yellow-400 text-indigo-900 font-bold"><FaUserPlus className="inline mr-2" />Register</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Modales globales */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={(u) => setCurrentUser(u)}
        />
      )}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onRequestLogin={() => {
            setShowRegister(false);
            setShowLogin(true); // 👉 ouvre Login après succès d'inscription
          }}
        />
      )}
    </>
  );
}
