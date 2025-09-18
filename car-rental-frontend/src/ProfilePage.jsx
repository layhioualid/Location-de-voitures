// src/pages/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaCalendarAlt,
  FaClipboardList, FaMoneyBillWave, FaClock, FaSave, FaEdit, FaShieldAlt
} from "react-icons/fa";
import axios from "axios";

const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8000") + "/api";
const token = () => localStorage.getItem("token") || "";
const authHeaders = () => {
  const t = token();
  return t
    ? {
        Authorization: `Bearer ${t}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    : { Accept: "application/json" };
};

function initialsFromName(name = "") {
  if (!name) return "HF";
  const parts = name.trim().split(/\s+/);
  const a = (parts[0]?.[0] || "").toUpperCase();
  const b = (parts[1]?.[0] || "").toUpperCase();
  return (a + (b || "")).slice(0, 2) || "HF";
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
  });
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName]   = useState(user?.name  || "");
  const [email, setEmail] = useState(user?.email || "");

  const [saveLoading, setSaveLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success'|'error'|'info', msg: string }

  // Helper: gestion 401
  const handleAuthError = (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAlert({ type: "error", msg: "Session expirée. Veuillez vous reconnecter." });
      navigate("/login");
      return true;
    }
    return false;
  };

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!token()) {
        navigate("/login"); // pas loggé
        return;
      }
      try {
        // 1) Profil
        const me = await axios.get(`${API_BASE}/me`, { headers: authHeaders() });
        if (!mounted) return;

        // Selon ton backend, "me" peut renvoyer {id, name, email, created_at} directement
        // ou {user: {...}}. On gère les deux cas :
        const meData = me.data?.user ?? me.data ?? null;
        if (!meData) throw new Error("Profil introuvable");

        setUser(meData);
        setName(meData?.name || "");
        setEmail(meData?.email || "");

        // 2) Mes réservations
        const res = await axios.get(`${API_BASE}/my-reservations`, { headers: authHeaders() });
        if (!mounted) return;
        const list = Array.isArray(res.data?.data) ? res.data.data
                    : Array.isArray(res.data)      ? res.data
                    : [];
        setReservations(list);
      } catch (e) {
        if (!handleAuthError(e)) {
          setAlert({ type: "error", msg: e.response?.data?.message || "Erreur de chargement." });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();
    return () => { mounted = false; };
  }, [navigate]);

  const stats = useMemo(() => {
    const total = reservations.length;
    const enAttente = reservations.filter(r => (r?.status || r?.payment_status) === "pending").length;
    const totalPaye = reservations.reduce((sum, r) => {
      const paid = Number(r?.amount_paid ?? r?.total_amount ?? 0);
      return sum + (isNaN(paid) ? 0 : paid);
    }, 0);
    return { total, enAttente, totalPaye };
  }, [reservations]);

  const handleSave = async (e) => {
    e.preventDefault();
    setAlert(null);
    setSaveLoading(true);

    const payload = { name, email };

    try {
      // PUT /api/profile -> renvoie { message, user, token? } (à adapter à ton backend)
      const resp = await axios.put(`${API_BASE}/profile`, payload, { headers: authHeaders() });

      if (resp.data?.token) localStorage.setItem("token", resp.data.token);

      const updated = resp.data?.user ? resp.data.user : { ...(user || {}), ...payload };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));

      setAlert({ type: "success", msg: resp.data?.message || "Profil mis à jour avec succès." });
    } catch (err) {
      if (!handleAuthError(err)) {
        setAlert({
          type: "error",
          msg: err.response?.data?.message || "Impossible de mettre à jour le profil."
        });
      }
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-28 bg-gray-200 rounded-xl" />
            <div className="h-28 bg-gray-200 rounded-xl" />
            <div className="h-28 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-96 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover + Avatar */}
      <header className="relative">
        <div className="h-40 md:h-48 bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-500" />
        <div className="h-40 md:h-48 bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-500 max-w-6xl mx-auto px-6">
          <div className="-mt-10 md:-mt-12 flex items-end gap-4">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-yellow-400 flex items-center justify-center ring-4 ring-white shadow-lg">
              <span className="text-2xl md:text-3xl font-extrabold text-indigo-900">
                {initialsFromName(user?.name)}
              </span>
            </div>
            <div className="pb-2 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">{user?.name || "Utilisateur"}</h1>
              <div className="opacity-90 text-sm flex items-center gap-2">
                <FaCalendarAlt /> Membre depuis&nbsp;
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("fr-FR")
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Alert */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        {alert?.type === "success" && (
          <div className="mb-4 rounded-md border border-green-300 bg-green-50 text-green-800 px-4 py-3 text-sm">
            {alert.msg}
          </div>
        )}
        {alert?.type === "error" && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {alert.msg}
          </div>
        )}
        {alert?.type === "info" && (
          <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 px-4 py-3 text-sm">
            {alert.msg}
          </div>
        )}
      </div>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<FaClipboardList />}
          label="Réservations"
          value={stats.total}
          tone="indigo"
        />
        <StatCard
          icon={<FaClock />}
          label="En attente"
          value={stats.enAttente}
          tone="yellow"
        />
        <StatCard
          icon={<FaMoneyBillWave />}
          label="Total payé (DH)"
          value={Number(stats.totalPaye || 0).toLocaleString("fr-FR")}
          tone="green"
        />
      </section>

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form profil */}
        <section className="lg:col-span-2">
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaEdit className="text-indigo-700" />
              <h2 className="text-xl font-bold text-indigo-900">Mes informations</h2>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nom complet" icon={<FaUser />} value={name} onChange={setName} />
              <Field label="Email" icon={<FaEnvelope />} value={email} onChange={setEmail} />
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-5 py-3 rounded-lg disabled:opacity-70"
                >
                  <FaSave /> {saveLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Panneau latéral */}
        <aside className="space-y-6">
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaShieldAlt className="text-indigo-700" />
              <h3 className="font-bold text-indigo-900">Sécurité</h3>
            </div>
            <p className="text-sm text-gray-600">
              Gérez votre mot de passe et consultez vos réservations.
            </p>
            <div className="mt-4 grid gap-2">
              <Link
                to="/change-password"
                className="inline-flex items-center justify-center gap-2 bg-white border hover:bg-gray-50 text-gray-800 font-medium px-4 py-2 rounded-lg"
              >
                <FaShieldAlt /> Modifier mon mot de passe
              </Link>
              <Link
                to="/my-reservations"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-indigo-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-500"
              >
                <FaClipboardList /> Mes réservations
              </Link>
            </div>
          </div>

          {/* Carte résumé utilisateur */}
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Résumé</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-2">
                <FaUser className="text-gray-500" /> {user?.name || "—"}
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-gray-500" /> {user?.email || "—"}
              </li>
              <li className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500" />
                Membre depuis&nbsp;
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("fr-FR")
                  : "—"}
              </li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Liste compacte des dernières résas */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <h3 className="text-lg md:text-xl font-bold text-indigo-900 flex items-center gap-2">
            <FaClipboardList /> Dernières réservations
          </h3>

          {reservations.length === 0 ? (
            <p className="text-sm text-gray-500 mt-3">Aucune réservation pour le moment.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Voiture</th>
                    <th className="py-2 pr-4">Période</th>
                    <th className="py-2 pr-4">Retrait</th>
                    <th className="py-2 pr-4">Retour</th>
                    <th className="py-2 pr-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.slice(0, 6).map((r, idx) => {
                    const status = (r?.status || r?.payment_status || "—").toLowerCase();
                    const tone =
                      status === "paid" ? "bg-green-100 text-green-700"
                      : status === "pending" ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-600";
                    const label = (r?.status || r?.payment_status || "—").toString().toUpperCase();
                    return (
                      <tr key={r?.id ?? r?._id ?? idx} className="border-b last:border-0">
                        <td className="py-3 pr-4 text-gray-700">#{r?.id ?? r?._id ?? "—"}</td>
                        <td className="py-3 pr-4">
                          <div className="text-gray-900 font-medium">
                            {r?.car ? `${r.car?.brand ?? ""} ${r.car?.model ?? ""}`.trim() : "—"}
                          </div>
                          <div className="text-gray-500">
                            {r?.car?.fuel_type || ""} {r?.car?.transmission ? `• ${r.car.transmission}` : ""}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {(r?.start_date ?? "—")} → {(r?.end_date ?? "—")}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{r?.pickup_location ?? "—"}</td>
                        <td className="py-3 pr-4 text-gray-700">{r?.dropoff_location ?? "—"}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${tone}`}>{label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {reservations.length > 6 && (
            <div className="mt-4">
              <Link
                to="/my-reservations"
                className="inline-flex items-center gap-2 text-indigo-700 font-semibold hover:underline"
              >
                Voir tout →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- Little UI bits ---------- */
function StatCard({ icon, label, value, tone = "indigo" }) {
  const tones =
    {
      indigo: "bg-indigo-50 text-indigo-800 ring-indigo-100",
      yellow: "bg-yellow-50 text-yellow-800 ring-yellow-100",
      green: "bg-green-50 text-green-800 ring-green-100",
    }[tone] || "bg-gray-50 text-gray-800 ring-gray-100";

  return (
    <div className={`rounded-2xl border bg-white shadow-sm p-5 flex items-center justify-between`}>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-extrabold text-gray-900 mt-1">{value}</div>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-8 ${tones}`}>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
  );
}

function Field({ label, icon, value, onChange, disabled }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className={`mt-1 flex items-center gap-2 border rounded-lg px-3 py-2 ${disabled ? "bg-gray-50" : ""}`}>
        <span className="text-gray-400">{icon}</span>
        <input
          className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          disabled={disabled}
          placeholder={label}
        />
      </div>
    </label>
  );
}
