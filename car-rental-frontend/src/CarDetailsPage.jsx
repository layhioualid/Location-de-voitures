// src/CarDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaChair, FaCogs, FaGasPump, FaPalette, FaMapMarkerAlt, FaCalendarAlt,
  FaSearch, FaCalendarCheck, FaCreditCard, FaKey
} from "react-icons/fa";

function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u) setCurrentUser(u);
    } catch {}

    axios
      .get(`http://127.0.0.1:8000/api/cars/${id}`)
      .then((res) => setCar(res.data.data))
      .catch(() => setCar(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReservation = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Veuillez vous connecter pour réserver.");
      navigate("/"); // bouton Login dans ta navbar
      return;
    }

    const days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const totalPrice = Number(car.price_per_day) * days;

    navigate("/reservation-info", {
      state: {
        car_id: car.id,
        car,
        user_id: currentUser.id,
        start_date: startDate,
        end_date: endDate,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        price_per_day: car.price_per_day,
        total_price: totalPrice,
      },
    });
  };

  if (loading) return <p className="text-center p-6">Chargement...</p>;
  if (!car) return <p className="text-center p-6">Voiture introuvable.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Détails */}
      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Infos voiture */}
        <div className="lg:col-span-2">
          {/* Image et bandeau */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <img
              src={`http://127.0.0.1:8000${car.image_url}`}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6">
              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">
                {car.brand} <span className="opacity-90">{car.model}</span>
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {car.year || "Catégorie non spécifiée"}
              </p>
            </div>
          </div>

          {/* Caractéristiques avec icônes */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SpecItem icon={<FaChair className="text-indigo-600" />} label="Sièges" value={`${car.seats} places`} />
            <SpecItem icon={<FaCogs className="text-indigo-600" />} label="Transmission" value={car.transmission} />
            <SpecItem icon={<FaGasPump className="text-indigo-600" />} label="Carburant" value={car.fuel_type} />
            <SpecItem icon={<FaPalette className="text-indigo-600" />} label="Couleur" value={car.color} />
          </div>

          {/* Description */}
          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-indigo-900">Présentation</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Découvrez la <strong>{car.brand} {car.model}</strong>, idéale pour vos voyages confortables.
              Avec sa configuration {car.seats} places et sa transmission {car.transmission}, ce modèle allie confort et performance.
              Son moteur {car.fuel_type} vous garantit efficacité et fiabilité, tandis que sa couleur {car.color} lui apporte une touche d’élégance.
            </p>
          </div>
        </div>

        {/* Réservation — entête bleu ajouté */}
        <div className="bg-white shadow-md rounded-2xl overflow-hidden">
          {/* Entête bleu avec prix */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-5">
            <div className="text-3xl font-extrabold">{car.price_per_day} DH / jour</div>
            <div className="text-white/90 text-sm">Taxes & frais inclus</div>
          </div>

          <div className="p-6">
            <form onSubmit={handleReservation} className="space-y-4">
              <div>
                <label className="font-semibold mb-1 flex items-center gap-2"><FaMapMarkerAlt /> Lieu de récupération</label>
                <input type="text" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200" required />
              </div>
              <div>
                <label className="font-semibold mb-1 flex items-center gap-2"><FaMapMarkerAlt /> Lieu de retour</label>
                <input type="text" value={dropoffLocation} onChange={e => setDropoffLocation(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200" required />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="font-semibold mb-1 flex items-center gap-2"><FaCalendarAlt /> Date début</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200" required />
                </div>
                <div>
                  <label className="font-semibold mb-1 flex items-center gap-2"><FaCalendarAlt /> Date fin</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-200" required />
                </div>
              </div>


              <button type="submit" className="bg-indigo-700 hover:bg-indigo-800 text-white w-full py-2.5 rounded-md font-semibold shadow">
                Réserver maintenant
              </button>

              {message && <p className="text-center text-green-700 mt-2">{message}</p>}
            </form>
          </div>
        </div>
      </div>

      {/* Comment ça marche — avec icônes */}
      <section className="bg-white text-black py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-10">Comment ça marche ?</h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 1 */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-700 text-2xl">
                  <FaSearch />
                </span>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-yellow-400 text-indigo-900 font-bold text-sm flex items-center justify-center">1</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Choisissez</h3>
              <p className="max-w-xs text-gray-700">Parcourez notre sélection de voitures et choisissez celle qui vous plaît.</p>
            </div>
          </div>

          {/* 2 */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-700 text-2xl">
                  <FaCalendarCheck />
                </span>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-yellow-400 text-indigo-900 font-bold text-sm flex items-center justify-center">2</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Réservez</h3>
              <p className="max-w-xs text-gray-700">Réservez rapidement en ligne avec notre formulaire simple.</p>
            </div>
          </div>

          {/* 3 */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-700 text-2xl">
                  <FaCreditCard />
                </span>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-yellow-400 text-indigo-900 font-bold text-sm flex items-center justify-center">3</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Payez</h3>
              <p className="max-w-xs text-gray-700">Effectuez votre paiement en toute sécurité directement sur notre site.</p>
            </div>
          </div>

          {/* 4 */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-700 text-2xl">
                  <FaKey />
                </span>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-yellow-400 text-indigo-900 font-bold text-sm flex items-center justify-center">4</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Conduisez</h3>
              <p className="max-w-xs text-gray-700">Prenez la route en toute confiance avec votre voiture de location.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// === Petit composant pour une spec avec icône ===
function SpecItem({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-white border rounded-lg shadow-sm p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-base font-semibold">{value ?? "-"}</div>
    </div>
  );
}

export default CarDetailPage;
