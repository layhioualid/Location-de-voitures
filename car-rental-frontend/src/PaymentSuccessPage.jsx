// src/PaymentSuccessPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaClock,
  FaChair, FaCogs, FaGasPump, FaPalette, FaFileInvoiceDollar
} from "react-icons/fa";

/* ========= Axios avec Bearer token (ANTI "Unauthenticated") ========= */
const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ===== Helpers ===== */
function formatDateFR(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d)) return dateStr;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function daysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start), e = new Date(end);
  const ms = e - s;
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
function SpecItem({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-white border rounded-2xl shadow-sm p-5 text-center">
      <div className="mb-2 text-3xl text-indigo-600">{icon}</div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-base font-semibold">{value || "-"}</div>
    </div>
  );
}
function CarCard({ car, onClick }) {
  const pricePerDay = Number(car?.price_per_day ?? 0);
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition"
    >
      <img
        src={car?.image_url ? `http://127.0.0.1:8000${car.image_url}` : "/placeholder-car.jpg"}
        className="w-full h-40 object-cover"
        alt={`${car?.brand} ${car?.model}`}
      />
      <div className="p-3">
        <div className="font-bold">{car?.brand} {car?.model}</div>
        <div className="text-sm text-gray-500">
          {pricePerDay.toFixed(2)} DH / jour
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Données passées depuis la page précédente
  // { id, car, start_date, end_date, pickup_location, dropoff_location, amount, payment_method, status }
  const data = location.state || {};
  const car = data.car || {};
  const nbDays = daysBetween(data.start_date, data.end_date);

  const [suggestions, setSuggestions] = useState([]);
  const isCardPaid   = data.payment_method === "card" && data.status === "succeeded";
  const isCashPending = data.payment_method === "cash" && (data.status === "pending" || !data.status);

  useEffect(() => {
    api
      .get("/cars") // lecture publique, mais passer par api ne gêne pas
      .then((res) => setSuggestions(res.data?.data?.slice(0, 4) || []))
      .catch(() => setSuggestions([]));
  }, []);

  /* ======= Ouverture PDF avec AUTH ======= */
  const openPdfWithAuth = async (path) => {
    try {
      // path doit être relatif à /api : ex "/invoices/123/pdf"
      const res = await api.get(path, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Optionnel: URL.revokeObjectURL(url) plus tard si tu veux
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Impossible de télécharger le PDF.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CONTENU */}
      <div className="max-w-7xl mx-auto p-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNE GAUCHE : visuel + specs + présentation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl shadow-xl overflow-hidden bg-white">
            <div className="relative">
              <img
                src={car?.image_url ? `http://127.0.0.1:8000${car.image_url}` : "/placeholder-car.jpg"}
                alt={`${car?.brand} ${car?.model}`}
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
                  {car?.brand} <span className="opacity-90">{car?.model}</span>
                </h1>
                {(car?.year || data.start_date) && (
                  <p className="text-white/80 text-sm mt-1">
                    {car?.year ? `${car.year}` : ""}{" "}
                    {data.start_date ? `• du ${formatDateFR(data.start_date)} au ${formatDateFR(data.end_date)}` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <SpecItem icon={<FaChair />}   label="Sièges"       value={car?.seats ? `${car.seats} places` : "-"} />
            <SpecItem icon={<FaCogs />}    label="Transmission" value={car?.transmission} />
            <SpecItem icon={<FaGasPump />} label="Carburant"    value={car?.fuel_type} />
            <SpecItem icon={<FaPalette />} label="Couleur"      value={car?.color} />
          </div>

          {/* Suggestions */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">Vous pourriez aussi aimer</h2>
            {suggestions.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune suggestion pour le moment.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestions.map((c) => (
                  <CarCard
                    key={c.id}
                    car={c}
                    onClick={() => navigate(`/cars/${c.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLONNE DROITE : message + récap + actions */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md p-6 rounded-2xl border">
            <div className="flex items-start gap-3">
              {isCardPaid ? (
                <FaCheckCircle className="text-green-600 mt-1" size={24} />
              ) : isCashPending ? (
                <FaCheckCircle className="text-yellow-500 mt-1" size={24} />
              ) : (
                <FaCheckCircle className="text-indigo-600 mt-1" size={24} />
              )}

              <div>
                {isCardPaid ? (
                  <>
                    <h2 className="text-2xl font-bold text-indigo-800">Paiement confirmé</h2>
                    <p className="text-gray-600 mt-1">
                      Merci ! Votre réservation est enregistrée et réglée par carte.
                      Un email de confirmation vous a été envoyé.
                    </p>
                  </>
                ) : isCashPending ? (
                  <>
                    <h2 className="text-2xl font-bold text-indigo-800">Réservation confirmée</h2>
                    <p className="text-gray-600 mt-1">
                      Paiement à effectuer en espèces lors de la remise du véhicule.
                      Vous recevrez un bon de réservation (pro forma).
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-indigo-800">Réservation enregistrée</h2>
                    <p className="text-gray-600 mt-1">Merci pour votre réservation.</p>
                  </>
                )}
              </div>
            </div>

            {/* Récap réservation */}
            <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt /> <span>Départ :</span>
                <strong className="ml-1">{data.pickup_location || "-"}</strong>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt /> <span>Retour :</span>
                <strong className="ml-1">{data.dropoff_location || "-"}</strong>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt /> <span>Du :</span>
                <strong className="ml-1">{formatDateFR(data.start_date)}</strong>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt /> <span>Au :</span>
                <strong className="ml-1">{formatDateFR(data.end_date)}</strong>
              </div>
              <div className="flex items-center gap-2">
                <FaClock /> <span>Durée :</span>
                <strong className="ml-1">{nbDays} jour(s)</strong>
              </div>
            </div>

            {/* Total + Méthode de paiement */}
            <div className="mt-5 rounded-xl bg-gray-50 border p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="text-lg font-semibold">{Number(data.amount ?? 0).toFixed(2)} DH</span>
              </div>

              {data.id && (
                <div className="flex justify-between text-gray-600">
                  <span>ID Réservation</span>
                  <span>#{data.id}</span>
                </div>
              )}

              {data.payment_method === "cash" ? (
                <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 text-sm rounded">
                  <strong>Paiement à la réception :</strong> votre réservation est <em>en attente</em>.
                  Merci de régler en espèces lors de la remise du véhicule à <b>{data.pickup_location || "-"}</b>.
                </div>
              ) : data.payment_method === "card" ? (
                <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm rounded">
                  Paiement par carte <b>{data.status === "succeeded" ? "confirmé" : "en cours"}</b>.
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {isCardPaid ? (
                <button
                  onClick={() => openPdfWithAuth(`/invoices/${data.id}/pdf`)}
                  className="w-full border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-semibold px-4 py-3 rounded flex items-center justify-center gap-2"
                >
                  <FaFileInvoiceDollar /> Télécharger la facture
                </button>
              ) : isCashPending ? (
                <button
                  onClick={() => openPdfWithAuth(`/reservations/${data.id}/proforma`)}
                  className="w-full border border-yellow-200 hover:bg-yellow-50 text-yellow-700 font-semibold px-4 py-3 rounded flex items-center justify-center gap-2"
                >
                  <FaFileInvoiceDollar /> Télécharger le bon de réservation
                </button>
              ) : null}

              <button
                onClick={() => navigate("/my-reservations")}
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-4 py-3 rounded"
              >
                Voir mes réservations
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full bg-white hover:bg-gray-50 border text-gray-700 font-semibold px-4 py-3 rounded"
              >
                Retour à l’accueil
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Astuce : vous pouvez retrouver cette réservation dans « Mes réservations » et télécharger votre reçu à tout moment.
            </p>
          </div>

          {/* Commentaire (optionnel) */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Laissez un commentaire</h3>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Partagez votre avis sur votre réservation..."
              rows="4"
            ></textarea>
            <button
              onClick={() => console.log("Commentaire envoyé")}
              className="mt-3 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
            >
              Envoyer le commentaire
            </button>
          </div>
        </div>
      </div>

      {/* Pourquoi nous */}
      <section className="max-w-4xl mx-auto py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          Pourquoi choisir HF Car Rental ?
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          Des prix compétitifs, un service client dédié, et une flotte moderne pour tous vos besoins.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          <div className="bg-white shadow-md rounded-lg p-6 flex-1">
            <h3 className="font-bold text-lg mb-2">Prix compétitifs</h3>
            <p className="text-gray-600">Location de qualité à des tarifs abordables.</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 flex-1">
            <h3 className="font-bold text-lg mb-2">Service 24/7</h3>
            <p className="text-gray-600">Une assistance toujours disponible pour vous aider.</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 flex-1">
            <h3 className="font-bold text-lg mb-2">Voitures modernes</h3>
            <p className="text-gray-600">Une flotte récente et entretenue pour votre confort.</p>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-indigo-700 text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-10">Comment ça marche ?</h2>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center gap-10">
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
            <h3 className="font-bold text-xl mb-2">Conduisez</h3>
            <p className="max-w-xs">Prenez la route en toute confiance avec votre voiture de location.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
