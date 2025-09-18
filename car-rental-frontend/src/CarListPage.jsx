// src/CarListPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaCarSide, FaEuroSign, FaCalendarAlt,
  FaCogs, FaUserFriends, FaSuitcase, FaGasPump
} from "react-icons/fa";

function CarListPage() {
  const [cars, setCars] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const BRANDS = [
  { name: "BMW",        logo: "/brands/bmw.png" },
  { name: "Dacia",      logo: "/brands/Dacia.png" },
  { name: "Mercedes",   logo: "/brands/mercedes.png" },
  { name: "Renault",    logo: "/brands/Renault.png" },
  { name: "Volkswagen", logo: "/brands/Volkswagen.png" },
  ]

  // Modals
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Recherche (4 champs)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [brand, setBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      if (user.role === "admin") navigate("/admin/cars");
    }
    fetchCars();
  }, [navigate]);

  const fetchCars = (filters = {}) => {
    axios
      .get("http://127.0.0.1:8000/api/cars", { params: filters })
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setCars(list);
        setCurrentPage(1); // reset page après recherche
      })
      .catch(console.error);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCars({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      brand: brand || undefined,
      max_price: maxPrice || undefined,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    setShowUserMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  // Découpage pagination (client-side)
  const totalPages = Math.max(1, Math.ceil(cars.length / PAGE_SIZE));
  const pagedCars = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return cars.slice(start, start + PAGE_SIZE);
  }, [cars, currentPage]);

  const gotoPage = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Barre de recherche */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-7 mb-8 max-w-6xl mx-auto">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Date début */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="mr-2 text-yellow-500" />
              Date début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="mr-2 text-yellow-500" />
              Date fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          {/* Marque / modèle */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FaCarSide className="mr-2 text-yellow-500" />
              Marque / Modèle
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ex: Toyota, BMW..."
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          {/* Prix max */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FaEuroSign className="mr-2 text-yellow-500" />
              Prix max (DH/jour)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Ex: 500"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          {/* Bouton recherche */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-yellow-400 text-indigo-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition flex items-center justify-center"
            >
              <FaSearch className="mr-2" /> Rechercher
            </button>
          </div>
        </form>
      </div>

      {/* Liste des voitures */}
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6">Voitures disponibles à la location</h1>

        {pagedCars.length === 0 ? (
          <p>Aucune voiture disponible pour le moment.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onReserve={() => navigate(`/cars/${car.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => gotoPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded border ${
                  currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
              >
                Précédent
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => gotoPage(p)}
                  className={`px-3 py-2 rounded border ${
                    p === currentPage ? "bg-indigo-900 text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => gotoPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded border ${
                  currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
      {/* Comment ça marche */}
<section className="bg-white text-black py-5 px-6 text-center">
</section>

      {/* Modals */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogged={(u)=>setCurrentUser(u)} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onRegistered={(u)=>setCurrentUser(u)} />}
    </div>
  );
}

function CarCard({ car, onReserve }) {
  const price = Number(car?.price_per_day ?? 0);

  const showSeats = car?.seats != null;
  const showLuggage = car?.luggage != null; // adapte si cette prop n'existe pas
  const showTransmission = !!car?.transmission;
  const fuel = car?.fuel_type;

  return (
    <div className="flex flex-col bg-white rounded-2xl border hover:shadow-lg transition overflow-hidden"
    onClick={onReserve}>
      {/* Image */}
      <div className="bg-gray-50">
        {car?.image_url ? (
          <div className="w-full aspect-[16/10]">
            <img
              src={`http://127.0.0.1:8000${car.image_url}`}
              alt={`${car?.brand} ${car?.model}`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full aspect-[16/10] bg-gray-100 flex items-center justify-center text-gray-400">
            Pas d'image
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center flex-wrap gap-x-5 gap-y-2 text-gray-500 text-sm">
          {showTransmission && (
            <span className="inline-flex items-center gap-1.5">
              <FaCogs style={{ color: "#0D47A1" }} />
              {car.transmission}
            </span>
          )}
          {showSeats && (
            <span className="inline-flex items-center gap-1.5">
              <FaUserFriends style={{ color: "#0D47A1" }} />
              {car.seats}
            </span>
          )}
          {showLuggage && (
            <span className="inline-flex items-center gap-1.5">
              <FaSuitcase style={{ color: "#0D47A1" }} />
              {car.luggage}
            </span>
          )}
          {fuel && (
            <span className="inline-flex items-center gap-1.5">
              <FaGasPump style={{ color: "#0D47A1" }} />
              {fuel}
            </span>
          )}
        </div>

        <h3 className="mt-2 text-lg font-semibold text-gray-900 line-clamp-2">
          {car?.brand} {car?.model}
        </h3>

        <div className="mt-3">
          <span className="inline-block bg-yellow-400 text-indigo-900 px-3 py-1.5 rounded-md text-sm font-bold">
            {price.toLocaleString("fr-FR")} DH / jour
          </span>
        </div>

        <button
          className="mt-4 w-full bg-indigo-800 hover:bg-indigo-700 text-white py-2.5 rounded-md font-medium"
          onClick={onReserve}
        >
          Réserver
        </button>
      </div>
    </div>
  );
}

/* -------- Modals simples (exemple) -------- */
function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function LoginModal({ onClose, onLogged }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      // TODO: remplace par ton endpoint d’auth
      // const { data } = await axios.post("http://127.0.0.1:8000/api/login", { email, password });
      const mock = { name: "Utilisateur", role: "user", email };
      localStorage.setItem("user", JSON.stringify(mock));
      onLogged?.(mock);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <ModalShell title="Se connecter" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-700">Email</label>
          <input className="mt-1 w-full border rounded px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm text-gray-700">Mot de passe</label>
          <input className="mt-1 w-full border rounded px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <button className="w-full bg-indigo-900 text-white py-2 rounded hover:bg-indigo-800">Login</button>
      </form>
    </ModalShell>
  );
}

function RegisterModal({ onClose, onRegistered }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      // TODO: remplace par ton endpoint d’inscription
      // const { data } = await axios.post("http://127.0.0.1:8000/api/register", { name, email, password });
      const mock = { name, role: "user", email };
      localStorage.setItem("user", JSON.stringify(mock));
      onRegistered?.(mock);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <ModalShell title="Créer un compte" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-700">Nom complet</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm text-gray-700">Email</label>
          <input className="mt-1 w-full border rounded px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm text-gray-700">Mot de passe</label>
          <input className="mt-1 w-full border rounded px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <button className="w-full bg-yellow-400 text-indigo-900 font-bold py-2 rounded hover:bg-yellow-500">Créer mon compte</button>
      </form>
    </ModalShell>
  );
}

export default CarListPage;
