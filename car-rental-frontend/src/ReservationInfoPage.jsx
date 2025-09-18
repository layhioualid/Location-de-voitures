import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "./api";
import {
  FaHome, FaCar, FaInfoCircle, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaUser,
  FaLock, FaClipboardList, FaBell, FaMoon, FaSun, FaBars, FaTimes, FaGlobe,
  FaChair, FaCogs, FaGasPump, FaPalette, FaMapMarkerAlt, FaCalendarAlt
} from 'react-icons/fa';


function ReservationInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reservationData = location.state;
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [message, setMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [licenseFile, setLicenseFile] = useState(null);
  const [error, setError] = useState("");
  const {
  car_id,
  car,
  user_id,
  start_date,
  end_date,
  pickup_location,
  dropoff_location,
  price_per_day,
  total_price
} = location.state || {};

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      // Pré-remplir si déjà connu
      setFirstName(parsedUser.first_name || "");
      setLastName(parsedUser.last_name || "");
      setEmail(parsedUser.email || "");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!licenseFile) {
      setError("Veuillez ajouter une copie de votre permis.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", currentUser.id);
      formData.append("car_id", reservationData.car_id);
      formData.append("start_date", reservationData.start_date);
      formData.append("end_date", reservationData.end_date);
      formData.append("pickup_location", reservationData.pickup_location);
      formData.append("dropoff_location", reservationData.dropoff_location);
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("license_file", licenseFile);

      const response = await api.post("/reservations", formData);

      navigate("/payment", {
          state: {
            car: reservationData.car,
            id: response.data.reservation.id,
            total_price: reservationData.amount,
            start_date,
            end_date,
            pickup_location,
            dropoff_location,
            },
});

    } catch (err) {
      setError("Erreur lors de l'enregistrement : " + (err.response?.data?.message || "Serveur indisponible."));
    }
  };

  if (!reservationData) return <p>Aucune donnée de réservation.</p>;

  

return (
  <div className="min-h-screen bg-gray-50">
    {/* CONTENU: Gauche = détails voiture, Droite = formulaire remplissage */}
    <div className="max-w-7xl mx-auto p-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* COLONNE GAUCHE : visuel + specs + présentation */}
      <div className="lg:col-span-2 space-y-6">
        {/* Image + bandeau titre */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white">
          <img
            src={car?.image_url ? `http://127.0.0.1:8000${car.image_url}` : "/placeholder-car.jpg"}
            alt={`${car?.brand || ""} ${car?.model || ""}`}
            className="w-full h-[420px] object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
              {car?.brand} <span className="opacity-90">{car?.model}</span>
            </h1>
            {(car?.year || reservationData?.start_date) && (
              <p className="text-white/80 text-sm mt-1">
                {car?.year ? `${car.year}` : ""} {reservationData?.start_date ? `• du ${reservationData.start_date} au ${reservationData.end_date}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SpecItem icon={<FaChair className="text-indigo-600 text-3xl" />} label="Sièges" value={car?.seats ? `${car.seats} places` : "-"} />
          <SpecItem icon={<FaCogs className="text-indigo-600 text-3xl" />} label="Transmission" value={car?.transmission} />
          <SpecItem icon={<FaGasPump className="text-indigo-600 text-3xl" />} label="Carburant" value={car?.fuel_type} />
          <SpecItem icon={<FaPalette className="text-indigo-600 text-3xl" />} label="Couleur" value={car?.color} />
        </div>

        {/* Présentation */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-indigo-900">Présentation</h2>
          <p className="mt-3 text-gray-700 leading-relaxed">
            Découvrez la <strong>{car?.brand} {car?.model}</strong>, idéale pour vos trajets quotidiens comme pour vos voyages.
            Confortable, efficace et fiable, cette catégorie <strong>{car?.category || "non spécifiée"}</strong> s’adapte à tous les usages.
          </p>
          {/* Récap trajet */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600"><FaMapMarkerAlt /> <span>Départ :</span> <strong className="ml-1">{pickupLocation || "-"}</strong></div>
            <div className="flex items-center gap-2 text-gray-600"><FaMapMarkerAlt /> <span>Retour :</span> <strong className="ml-1">{dropoffLocation || "-"}</strong></div>
            <div className="flex items-center gap-2 text-gray-600"><FaCalendarAlt /> <span>Du :</span> <strong className="ml-1">{startDate || "-"}</strong></div>
            <div className="flex items-center gap-2 text-gray-600"><FaCalendarAlt /> <span>Au :</span> <strong className="ml-1">{endDate || "-"}</strong></div>
          </div>
        </div>
      </div>

      {/* COLONNE DROITE : formulaire de remplissage (infos perso + permis) */}
      <div className="lg:col-span-1">
        <div className="bg-white shadow-md p-6 rounded-2xl border">
          <h2 className="text-2xl font-bold text-indigo-800 mb-6">Informations personnelles</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Prénom</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block font-medium">Nom</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full border p-2 rounded" />
              </div>
            </div>

            <div>
              <label className="block font-medium">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block font-medium">Téléphone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block font-medium">Adresse</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block font-medium">Permis de conduire (PDF ou image)</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setLicenseFile(e.target.files[0])} required className="w-full border p-2 rounded" />
            </div>

            {error && <p className="text-red-600 font-semibold">{error}</p>}

            <button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-4 py-3 rounded">
              Continuer vers le paiement
            </button>

            {/* Petit rappel du total estimé */}
            {car?.price_per_day && startDate && endDate && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Total estimé : <strong>{estimateTotal(car.price_per_day, startDate, endDate).toFixed(2)} DH</strong>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
    {/* Comment ça marche */}
<section className="bg-indigo-700 text-white py-16 px-6 text-center">
  <h2 className="text-3xl font-semibold mb-10">Comment ça marche ?</h2>
  
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
    <div className="flex flex-col items-center">
      <div className="bg-yellow-400 rounded-full w-16 h-16 flex items-center justify-center text-indigo-900 font-bold text-2xl mb-4">
        1
      </div>
      <h3 className="font-bold text-xl mb-2">Choisissez</h3>
      <p className="max-w-xs">Parcourez notre sélection de voitures et choisissez celle qui vous plaît.</p>
    </div>

    <div className="flex flex-col items-center">
      <div className="bg-yellow-400 rounded-full w-16 h-16 flex items-center justify-center text-indigo-900 font-bold text-2xl mb-4">
        2
      </div>
      <h3 className="font-bold text-xl mb-2">Réservez</h3>
      <p className="max-w-xs">Réservez rapidement en ligne avec notre formulaire simple.</p>
    </div>

    <div className="flex flex-col items-center">
      <div className="bg-yellow-400 rounded-full w-16 h-16 flex items-center justify-center text-indigo-900 font-bold text-2xl mb-4">
        3
      </div>
      <h3 className="font-bold text-xl mb-2">Payez</h3>
      <p className="max-w-xs">Effectuez votre paiement en toute sécurité directement sur notre site.</p>
    </div>

    <div className="flex flex-col items-center">
      <div className="bg-yellow-400 rounded-full w-16 h-16 flex items-center justify-center text-indigo-900 font-bold text-2xl mb-4">
        4
      </div>
      <h3 className="font-bold text-xl mb-2">Conduisez</h3>
      <p className="max-w-xs">Prenez la route en toute confiance avec votre voiture de location.</p>
    </div>
  </div>
</section>

  </div>
);

}
function SpecItem({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-white border rounded-2xl shadow-sm p-5 text-center">
      <div className="mb-2">{icon}</div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-base font-semibold">{value || "-"}</div>
    </div>
  );
}

function estimateTotal(pricePerDay, start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.max(0, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
  return days * Number(pricePerDay || 0);
}

export default ReservationInfoPage;
