// src/MyReservations.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch, FaInfoCircle, FaTimes, FaTrash, FaCheckCircle, FaClock,
  FaCar, FaMapMarkerAlt, FaCalendarAlt, FaCreditCard, FaMoneyBillAlt,
  FaGasPump, FaCogs, FaChair, FaPalette, FaTag
} from "react-icons/fa";

/* ===== Helpers ===== */
const API_ORIGIN = process.env.REACT_APP_API_URL || "http://localhost:8000";
const API_BASE = `${API_ORIGIN}/api`;
const token = () => localStorage.getItem("token") || "";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token()}`
});
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const fmtDT = (d) => (d ? new Date(d).toLocaleString() : "—");
const money = (v, currency = "MAD") => (v == null ? "—" :
  Number(v).toLocaleString(undefined, { style: "currency", currency })
);
const badge = (status) => {
  switch ((status || "").toLowerCase()) {
    case "paid": case "succeeded": return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    case "pending": case "processing": return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
    case "failed": case "canceled": case "cancelled": return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
    default: return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
};

// 🔗 rend absolue une URL/chemin d'image
const toAbsoluteUrl = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
};
// 🔧 récupère l'image voiture depuis car.image_url (ou car.image)
const carImg = (car) => toAbsoluteUrl(car?.image_url || car?.image);
// 🖼️ fallback si l’image casse
const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='360'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            font-family='Arial' font-size='24' fill='#9ca3af'>Image indisponible</text>
    </svg>`
  );

/* ===== Page ===== */
export default function MyReservations() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  // Modal détail
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/my-reservations`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Erreur de chargement");
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        if (alive) setItems(list);
      } catch (e) {
        setErr(e.message || "Erreur");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items;
    return items.filter((r) => {
      const car = r?.car || {};
      return [
        r.id, r.payment_status, r.payment_method, r.pickup_location, r.dropoff_location,
        car.brand, car.model, car.color, car.fuel_type, car.transmission
      ].filter(Boolean).join(" ").toLowerCase().includes(k);
    });
  }, [q, items]);

  const openDetails = async (id) => {
    setOpen(true); setLoadingDetail(true); setDetail(null);
    try {
      const res = await fetch(`${API_BASE}/reservations/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur");
      setDetail(data?.id ? data : (data?.data ?? null));
    } catch (e) {
      setDetail({ error: e.message || "Erreur" });
    } finally {
      setLoadingDetail(false);
    }
  };

  const cancelReservation = async (r) => {
    if (!window.confirm(`Annuler la réservation #${r.id} ?`)) return;
    try {
      let res = await fetch(`${API_BASE}/reservations/${r.id}/cancel`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({})
      });
      if (res.status === 404) {
        res = await fetch(`${API_BASE}/reservations/${r.id}`, {
          method: "DELETE", headers: authHeaders()
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Échec de l’annulation");
      setItems((prev) => prev.filter((x) => x.id !== r.id));
      setToast(`Réservation #${r.id} annulée.`);
      setTimeout(() => setToast(""), 3000);
    } catch (e) {
      setToast(e.message || "Impossible d’annuler");
      setTimeout(() => setToast(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mes réservations</h1>
          <p className="text-sm text-gray-500 mt-1">Vos locations, statuts de paiement et détails.</p>
        </div>
        <div className="relative w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (voiture, lieu, statut...)"
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        {toast && <div className="mb-4 rounded-xl bg-emerald-50 text-emerald-800 px-4 py-3 ring-1 ring-emerald-200">{toast}</div>}
        {err && <div className="mb-4 rounded-xl bg-rose-50 text-rose-800 px-4 py-3 ring-1 ring-rose-200">{err}</div>}

        {loading ? (
          <div className="text-center text-gray-500 py-16">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-16">Aucune réservation trouvée.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((r) => {
              const car = r?.car || {};
              const label = [car.brand, car.model].filter(Boolean).join(" ");
              const img = carImg(car);
              return (
                <div key={r.id} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition">
                  <div className="relative">
                    {img ? (
                      <img
                        src={img}
                        alt={label || `Car ${car.id || ""}`}
                        className="h-44 w-full object-cover"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                      />
                    ) : (
                      <div className="h-44 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <FaCar className="text-3xl" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full backdrop-blur bg-white/80">
                      {(r.payment_method || "").toLowerCase() === "cash" ? <FaMoneyBillAlt /> : <FaCreditCard />}
                      <span className="text-xs uppercase font-semibold">{r.payment_method || "—"}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{label || `#${r.car_id}`}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${badge(r.payment_status)}`}>{r.payment_status || "—"}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2"><FaCalendarAlt /><span>{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</span></div>
                      <div className="flex items-center gap-2"><FaMapMarkerAlt /><span>{r.pickup_location || "—"} → {r.dropoff_location || "—"}</span></div>
                      <div className="flex items-center gap-2">
                        <FaTag /><span className="font-medium">{money(r.total_amount, r?.currency || "MAD")}</span>
                        {r.amount_paid > 0 && <span className="text-emerald-700">• Payé {money(r.amount_paid, r?.currency || "MAD")}</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-gray-600">
                        {car.transmission && <span className="inline-flex items-center gap-1.5"><FaCogs /> {car.transmission}</span>}
                        {car.fuel_type && <span className="inline-flex items-center gap-1.5"><FaGasPump /> {car.fuel_type}</span>}
                        {car.seats && <span className="inline-flex items-center gap-1.5"><FaChair /> {car.seats} sièges</span>}
                        {car.color && <span className="inline-flex items-center gap-1.5"><FaPalette /> {car.color}</span>}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => openDetails(r.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <FaInfoCircle /> Détails
                      </button>
                      <button
                        onClick={() => cancelReservation(r)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                        title="Annuler la réservation"
                      >
                        <FaTrash /> Annuler
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 pt-1 flex items-center gap-2">
                      {r.payment_status?.toLowerCase() === "paid" ? <FaCheckCircle /> : <FaClock />}
                      <span>Créée {fmtDT(r.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ===== Modal détails ===== */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Détails de la réservation {detail?.id ? `#${detail.id}` : ""}</h3>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setOpen(false)} aria-label="Fermer">
                <FaTimes />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-8 text-center text-gray-500">Chargement…</div>
            ) : detail?.error ? (
              <div className="p-6 text-rose-600">{detail.error}</div>
            ) : detail ? (
              <div className="p-6 space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Réservation</h4>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2"><FaCalendarAlt /> {fmtDate(detail.start_date)} → {fmtDate(detail.end_date)}</li>
                      <li className="flex items-center gap-2"><FaMapMarkerAlt /> {detail.pickup_location || "—"} → {detail.dropoff_location || "—"}</li>
                      <li className="flex items-center gap-2"><FaClock /> Créée {fmtDT(detail.created_at)}</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Paiement</h4>
                    <ul className="text-sm space-y-2">
                      <li>
                        <span className={`px-2 py-1 rounded-full text-xs ${badge(detail.payment_status)}`}>{detail.payment_status || "—"}</span>
                        <span className="ml-2 uppercase text-gray-700 inline-flex items-center gap-2">
                          {(detail.payment_method || "").toLowerCase() === "cash" ? <FaMoneyBillAlt /> : <FaCreditCard />}
                          {detail.payment_method || "—"}
                        </span>
                      </li>
                      <li className="flex items-center gap-2"><FaTag /> Total : <span className="font-medium">{money(detail.total_amount, detail?.currency || "MAD")}</span></li>
                      <li className="flex items-center gap-2"><FaCheckCircle /> Payé : <span className="font-medium">{money(detail.amount_paid, detail?.currency || "MAD")}</span></li>
                      <li>Réf : <span className="break-all">{detail.payment_reference || "—"}</span></li>
                      <li>Payé le : {fmtDT(detail.paid_at)}</li>
                    </ul>
                  </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Véhicule</h4>
                    <div className="flex items-start gap-4">
                      {carImg(detail?.car) && (
                        <img
                          src={carImg(detail?.car)}
                          alt={`${detail?.car?.brand || ""} ${detail?.car?.model || ""}`}
                          className="w-28 h-20 object-cover rounded-xl ring-1 ring-gray-200"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                        />
                      )}
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {[detail?.car?.brand, detail?.car?.model].filter(Boolean).join(" ") || `#${detail?.car_id}`}
                        </div>
                        <div className="text-gray-600 flex flex-wrap gap-3 mt-1">
                          {detail?.car?.transmission && <span className="inline-flex items-center gap-1.5"><FaCogs /> {detail.car.transmission}</span>}
                          {detail?.car?.fuel_type && <span className="inline-flex items-center gap-1.5"><FaGasPump /> {detail.car.fuel_type}</span>}
                          {detail?.car?.seats && <span className="inline-flex items-center gap-1.5"><FaChair /> {detail.car.seats} sièges</span>}
                          {detail?.car?.color && <span className="inline-flex items-center gap-1.5"><FaPalette /> {detail.car.color}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Client</h4>
                    <ul className="text-sm space-y-2">
                      <li>Prénom : <span className="font-medium">{detail.first_name || "—"}</span></li>
                      <li>Nom : <span className="font-medium">{detail.last_name || "—"}</span></li>
                      <li>Téléphone : <span className="font-medium">{detail.phone || "—"}</span></li>
                      <li>Adresse : <span className="font-medium">{detail.address || "—"}</span></li>
                    </ul>
                  </div>
                </section>

                {Array.isArray(detail?.payments) && detail.payments.length > 0 && (
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">Historique des paiements</h4>
                    <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr className="text-left">
                            <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Méthode</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Montant</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Statut</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Transaction</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {detail.payments.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">#{p.id}</td>
                              <td className="px-4 py-3 uppercase">{p.payment_method}</td>
                              <td className="px-4 py-3">{money(p.amount, p.currency || "MAD")}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${badge(p.status)}`}>{p.status}</span>
                              </td>
                              <td className="px-4 py-3 break-all">{p.transaction_id || "—"}</td>
                              <td className="px-4 py-3">{fmtDT(p.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="p-6 text-gray-500">Aucune donnée.</div>
            )}

            <div className="px-6 py-4 border-t flex justify-end">
              <button className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200" onClick={() => setOpen(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
