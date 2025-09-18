// src/PaymentPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  FaChair, FaCogs, FaGasPump, FaPalette, FaMapMarkerAlt, FaCalendarAlt, FaClock,
  FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover, FaCcDinersClub, FaCcJcb
} from "react-icons/fa";

/* ================= Axios (avec Bearer auto) ================= */
const API_BASE = (process.env.REACT_APP_API_URL || "http://127.0.0.1:8000") + "/api";
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // <- token stocké au login (Navbar)
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers.Accept = "application/json";
  return config;
});

/* ================= Stripe ================= */
const stripePromise = loadStripe(
  "pk_test_51RtK8l2Qa0YguYEF9rUy1r2gRUHcQkRjaWkqQGQVu3X8Y9U9jSxQFcPWbh27W6sfDY64WXCshOEEQg8Vcr7qT6GT00es6w749i"
);

/* ================= Helpers ================= */
function formatDateFR(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d)) return dateStr;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function parseISODate(d) {
  const [y, m, day] = String(d).split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, day || 1));
}
function daysBetween(start, end) {
  const ms = parseISODate(end) - parseISODate(start);
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}
function calcTotal({
  dailyPrice,
  startDate,
  endDate,
  insurancePerDay = 0,
  youngDriverFeePerDay = 0,
  pickupFee = 0,
  dropoffFee = 0,
  discount = 0,
  taxRate = 0.2,
}) {
  const nbDays = daysBetween(startDate, endDate);
  const base = nbDays * (Number(dailyPrice) || 0);
  const options =
    nbDays * ((Number(insurancePerDay) || 0) + (Number(youngDriverFeePerDay) || 0));
  const fees = (Number(pickupFee) || 0) + (Number(dropoffFee) || 0);
  const subtotal = base + options + fees;
  const afterDiscount = subtotal * (1 - (Number(discount) || 0));
  const tax = afterDiscount * (Number(taxRate) || 0);
  const total = Number((afterDiscount + tax).toFixed(2));
  return { nbDays, base, options, fees, subtotal, afterDiscount, tax, total };
}

/* ================= UI utils ================= */
function SpecItem({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-white border rounded-2xl shadow-sm p-5 text-center">
      <div className="mb-2 text-3xl text-indigo-600">{icon}</div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-base font-semibold">{value || "-"}</div>
    </div>
  );
}

/* ================= Checkout form ================= */
function CheckoutForm({ reservation }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [cardBrand, setCardBrand] = React.useState("unknown");
  const [paymentMethod, setPaymentMethod] = React.useState("card"); // "card" | "cash"

  const car = reservation.car;
  const dailyPrice =
    car?.price_per_day ?? car?.daily_price ?? reservation?.price_per_day ?? 0;

  const pricing = calcTotal({
    dailyPrice,
    startDate: reservation.start_date,
    endDate: reservation.end_date,
    insurancePerDay: reservation.insurance_per_day || 0,
    youngDriverFeePerDay: reservation.young_driver_fee_per_day || 0,
    pickupFee: reservation.pickup_fee || 0,
    dropoffFee: reservation.dropoff_fee || 0,
    discount: reservation.discount || 0,
    taxRate: reservation.tax_rate ?? 0.2,
  });

  const currencyCode = reservation?.currency || "MAD";

  const confirmAfter3DS = async (paymentIntentId) => {
    try {
      const confirmRes = await api.post("/pay/confirm", {
        payment_intent_id: paymentIntentId,
        reservation_id: reservation.id,
      });
      if (confirmRes.data.success) {
        navigate("/success", {
          state: {
            id: reservation.id,
            car: reservation.car,
            start_date: reservation.start_date,
            end_date: reservation.end_date,
            pickup_location: reservation.pickup_location,
            dropoff_location: reservation.dropoff_location,
            amount: pricing.total,
            payment_method: "card",
            status: "succeeded",
          },
        });
      } else {
        setError(confirmRes.data.message || "Confirmation 3D Secure échouée côté serveur.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Erreur pendant la confirmation 3D Secure.";
      setError(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const amountToCharge = Math.round(pricing.total * 100); // centimes

    try {
      if (paymentMethod === "cash") {
        // Enregistre un paiement "cash" protégé (Bearer auto via api)
        const res = await api.post("/payments", {
          reservation_id: reservation.id,
          amount: amountToCharge,
          currency: currencyCode,
          payment_method: "cash",
          status: "pending",
          transaction_id: null,
          breakdown: pricing,
        });

        if (res.data.success) {
          navigate("/success", {
            state: {
              id: reservation.id,
              car: reservation.car,
              start_date: reservation.start_date,
              end_date: reservation.end_date,
              pickup_location: reservation.pickup_location,
              dropoff_location: reservation.dropoff_location,
              amount: pricing.total,
              payment_method: "cash",
              status: "pending",
            },
          });
        } else {
          setError(res.data.message || "Impossible d’enregistrer le paiement en espèces.");
        }
        return;
      }

      // Paiement par carte (Stripe)
      if (!stripe || !elements) return;

      const cardNumberEl = elements.getElement(CardNumberElement);
      const { token, error: stripeErr } = await stripe.createToken(cardNumberEl);
      if (stripeErr) {
        setError(stripeErr.message);
        return;
      }

      // Création paiement carte (protégé)
      const response = await api.post("/payments", {
        token: token.id,
        amount: amountToCharge,
        currency: currencyCode,
        reservation_id: reservation.id,
        payment_method: "card",
        breakdown: pricing,
      });

      if (response.data.success) {
        navigate("/success", {
          state: {
            id: reservation.id,
            car: reservation.car,
            start_date: reservation.start_date,
            end_date: reservation.end_date,
            pickup_location: reservation.pickup_location,
            dropoff_location: reservation.dropoff_location,
            amount: pricing.total,
            payment_method: "card",
            status: "succeeded",
          },
        });
        return;
      }

      if (response.data.requires_action && response.data.client_secret) {
        const result = await stripe.handleCardAction(response.data.client_secret);
        if (result.error) {
          setError(result.error.message || "Authentification 3D Secure échouée.");
        } else {
          await confirmAfter3DS(result.paymentIntent.id);
        }
      } else {
        setError(response.data.message || "Paiement refusé.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Une erreur s'est produite lors du paiement.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* COLONNE GAUCHE */}
      <div className="lg:col-span-2 space-y-6">
        <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white">
          {car?.image_url && (
            <img
              src={`http://127.0.0.1:8000${car.image_url}`}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-[420px] object-cover"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
              {car.brand} <span className="opacity-90">{car.model}</span>
            </h1>
            {(car?.year || reservation.start_date) && (
              <p className="text-white/80 text-sm mt-1">
                {car?.year ? `${car.year}` : ""}{" "}
                {reservation.start_date
                  ? `• du ${formatDateFR(reservation.start_date)} au ${formatDateFR(reservation.end_date)}`
                  : ""}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SpecItem icon={<FaChair />} label="Sièges" value={`${car.seats} places`} />
          <SpecItem icon={<FaCogs />} label="Transmission" value={car.transmission} />
          <SpecItem icon={<FaGasPump />} label="Carburant" value={car.fuel_type} />
          <SpecItem icon={<FaPalette />} label="Couleur" value={car.color} />
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-indigo-900">Présentation</h2>
          <p className="mt-3 text-gray-700 leading-relaxed">
            Explorez cette <strong>{car.brand} {car.model}</strong> — confortable, efficace et fiable.
          </p>
        </div>
      </div>

      {/* COLONNE DROITE — Récap + Paiement */}
      <div className="lg:col-span-1 space-y-5">
        {/* Récapitulatif */}
        <div className="bg-white shadow-md p-6 rounded-2xl border">
          <h2 className="text-2xl font-bold text-indigo-800">Récapitulatif</h2>

          {/* Lieux & dates */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt /> <span>Départ :</span>
              <strong className="ml-1">{reservation.pickup_location}</strong>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt /> <span>Retour :</span>
              <strong className="ml-1">{reservation.dropoff_location}</strong>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt /> <span>Du :</span>
              <strong className="ml-1">{formatDateFR(reservation.start_date)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt /> <span>Au :</span>
              <strong className="ml-1">{formatDateFR(reservation.end_date)}</strong>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <FaClock /> <span>Durée :</span>
              <strong className="ml-1">{pricing.nbDays} jour(s)</strong>
            </div>
          </div>

          {/* Détail du prix */}
          <div className="mt-6 rounded-xl bg-gray-50 border p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Sous-total (location)</span>
              <span>{pricing.base.toFixed(2)} {currencyCode}</span>
            </div>
            {pricing.options > 0 && (
              <div className="flex justify-between">
                <span>Options</span>
                <span>{pricing.options.toFixed(2)} {currencyCode}</span>
              </div>
            )}
            {pricing.fees > 0 && (
              <div className="flex justify-between">
                <span>Frais</span>
                <span>{pricing.fees.toFixed(2)} {currencyCode}</span>
              </div>
            )}
            {(reservation.discount || 0) > 0 && (
              <div className="flex justify-between">
                <span>Remise</span>
                <span>− {(pricing.subtotal - pricing.afterDiscount).toFixed(2)} {currencyCode}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>TVA</span>
              <span>{pricing.tax.toFixed(2)} {currencyCode}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{pricing.total.toFixed(2)} {currencyCode}</span>
            </div>
          </div>
        </div>

        {/* Paiement */}
        <div className="bg-white shadow-md rounded-2xl border p-5">
          <h3 className="text-lg font-bold text-gray-900">Méthode de paiement</h3>

          {/* Sélecteur de méthode */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`w-full rounded-md border px-3 py-2 text-sm font-semibold ${
                paymentMethod === "card" ? "border-blue-600 text-blue-700 bg-blue-50" : "border-gray-300 text-gray-700"
              }`}
            >
              Carte bancaire
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`w-full rounded-md border px-3 py-2 text-sm font-semibold ${
                paymentMethod === "cash" ? "border-green-600 text-green-700 bg-green-50" : "border-gray-300 text-gray-700"
              }`}
            >
              Espèces à la réception
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            {/* Zone carte visible uniquement si "card" */}
            {paymentMethod === "card" && (
              <>
                <p className="text-sm text-gray-500 mb-2">Informations de la carte</p>

                {/* Numéro + logos */}
                <div className="relative mb-3">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    {["visa","unknown"].includes(cardBrand) && <FaCcVisa size={24} color="#1a1f71" />}
                    {cardBrand === "mastercard" && <FaCcMastercard size={24} color="#EB001B" />}
                    {cardBrand === "amex" && <FaCcAmex size={24} color="#2E77BC" />}
                    {cardBrand === "discover" && <FaCcDiscover size={24} color="#FF6000" />}
                    {cardBrand === "diners" && <FaCcDinersClub size={24} color="#006272" />}
                    {cardBrand === "jcb" && <FaCcJcb size={24} color="#0B4EA2" />}
                  </div>
                  <div className="border rounded-lg px-3 py-3">
                    <CardNumberElement
                      onChange={(e) => setCardBrand(e.brand)}
                      options={{
                        placeholder: "1234 1234 1234 1234",
                        style: {
                          base: { fontSize: "15px", color: "#111827", "::placeholder": { color: "#9ca3af" } },
                          invalid: { color: "#e11d48" },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* MM/AA & CVC */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-lg px-3 py-3">
                    <CardExpiryElement
                      options={{
                        placeholder: "MM / AA",
                        style: {
                          base: { fontSize: "15px", color: "#111827", "::placeholder": { color: "#9ca3af" } },
                          invalid: { color: "#e11d48" },
                        },
                      }}
                    />
                  </div>
                  <div className="border rounded-lg px-3 py-3">
                    <CardCvcElement
                      options={{
                        placeholder: "CVC",
                        style: {
                          base: { fontSize: "15px", color: "#111827", "::placeholder": { color: "#9ca3af" } },
                          invalid: { color: "#e11d48" },
                        },
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {error && <div className="text-red-600 text-sm mt-3">{error}</div>}

            {/* Bouton d'action */}
            <button
              type="submit"
              disabled={loading || (paymentMethod === "card" && (!stripe || !elements))}
              className={`w-full mt-4 rounded-md ${
                paymentMethod === "cash" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
              } text-white font-semibold py-3`}
            >
              {loading
                ? "Traitement en cours..."
                : paymentMethod === "cash"
                ? `Réserver et payer à la réception (${pricing.total.toLocaleString()} ${currencyCode})`
                : `Payer ${pricing.total.toLocaleString()} ${currencyCode}`}
            </button>

            {paymentMethod === "cash" && (
              <p className="text-xs text-gray-500 mt-3">
                Votre réservation sera confirmée. Le montant ({pricing.total.toFixed(2)} {currencyCode}) sera réglé à la réception.
              </p>
            )}

            {paymentMethod === "card" && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                Paiement sécurisé. Le montant débité sera {pricing.total.toFixed(2)} {currencyCode}.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

/* ================= Page wrapper ================= */
export default function PaymentPage() {
  const location = useLocation();
  const reservation = location.state;

  React.useEffect(() => {
    // petite vérification : si pas de token → (optionnel) rediriger vers login
    // if (!localStorage.getItem("token")) window.location.href = "/login";
  }, []);

  if (!reservation || !reservation.car) {
    return <div className="text-center mt-10">Aucune réservation détectée.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Elements stripe={stripePromise}>
        <CheckoutForm reservation={reservation} />
      </Elements>
    </div>
  );
}
