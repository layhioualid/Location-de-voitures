// AdminReservations.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // Modal create/edit
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Modal delete confirm
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal details card (au clic sur une ligne)
  const [selected, setSelected] = useState(null);

  // Form avec tous les champs que tu as listés
  const [form, setForm] = useState({
    user_id: "",
    car_id: "",
    start_date: "",
    end_date: "",
    pickup_location: "",
    dropoff_location: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    email: "",
    license_file_path: null, // File | null
    payment_method: "cash",
    payment_status: "pending",
    total_amount: "",
    amount_paid: "",
    paid_at: "",
    payment_reference: "",
  });

  const navigate = useNavigate();

  // ---------- AXIOS ----------
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: "http://127.0.0.1:8000/api",
    });
    const token = localStorage.getItem("token");
    if (token) instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return instance;
  }, []);

  // ---------- LOAD ----------
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await api.get("/reservations");
      let list = [];
      if (Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res.data?.data)) list = res.data.data;
      else if (Array.isArray(res.data?.reservations)) list = res.data.reservations;
      setReservations(list);
    } catch (e) {
      console.error(e);
      setErrMsg(e?.response?.data?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // ---------- HELPERS ----------
  const resetForm = () =>
    setForm({
      user_id: "",
      car_id: "",
      start_date: "",
      end_date: "",
      pickup_location: "",
      dropoff_location: "",
      first_name: "",
      last_name: "",
      phone: "",
      address: "",
      email: "",
      license_file_path: null,
      payment_method: "cash",
      payment_status: "pending",
      total_amount: "",
      amount_paid: "",
      paid_at: "",
      payment_reference: "",
    });

  const isoToDate = (d) => (d ? String(d).slice(0, 10) : "");
  const isoToDateTimeLocal = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
      dt.getHours()
    )}:${pad(dt.getMinutes())}`;
  };

  const onChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((f) => ({ ...f, [name]: files && files[0] ? files[0] : null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      user_id: r.user_id ?? r.user?.id ?? "",
      car_id: r.car_id ?? r.car?.id ?? "",
      start_date: isoToDate(r.start_date),
      end_date: isoToDate(r.end_date),
      pickup_location: r.pickup_location ?? "",
      dropoff_location: r.dropoff_location ?? "",
      first_name: r.first_name ?? "",
      last_name: r.last_name ?? "",
      phone: r.phone ?? "",
      address: r.address ?? "",
      email: r.email ?? "",
      license_file_path: null, // on ne pré-remplit pas le fichier
      payment_method: r.payment_method ?? "cash",
      payment_status: r.payment_status ?? "pending",
      total_amount: r.total_amount ?? "",
      amount_paid: r.amount_paid ?? "",
      paid_at: isoToDateTimeLocal(r.paid_at),
      payment_reference: r.payment_reference ?? "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const buildPayload = () => {
    const hasFile = !!form.license_file_path;
    const payload = hasFile ? new FormData() : {};

    const toNum = (v) => (v === "" || v === null || v === undefined ? "" : Number(v));
    const toISO = (v) => (v ? new Date(v).toISOString() : "");

    const entries = {
      user_id: form.user_id,
      car_id: form.car_id,
      start_date: form.start_date, // YYYY-MM-DD
      end_date: form.end_date, // YYYY-MM-DD
      pickup_location: form.pickup_location,
      dropoff_location: form.dropoff_location,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      address: form.address,
      email: form.email,
      payment_method: form.payment_method,
      payment_status: form.payment_status,
      total_amount: toNum(form.total_amount),
      amount_paid: toNum(form.amount_paid),
      paid_at: toISO(form.paid_at),
      payment_reference: form.payment_reference,
    };

    if (hasFile) {
      Object.entries(entries).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) payload.append(k, v);
      });
      payload.append("license_file_path", form.license_file_path);
    } else {
      Object.assign(payload, entries);
    }

    return {
      payload,
      headers: hasFile
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    };
  };

  // ---------- CRUD ----------
  const createReservation = async () => {
    try {
      const { payload, headers } = buildPayload();
      await api.post("/reservations", payload, { headers });
      closeModal();
      await fetchReservations();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Erreur lors de la création.");
    }
  };

  const updateReservation = async () => {
    if (!editing?.id) return;
    try {
      const { payload, headers } = buildPayload();
      await api.put(`/reservations/${editing.id}`, payload, { headers });
      closeModal();
      await fetchReservations();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Erreur lors de la modification.");
    }
  };

  const askDelete = (id) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/reservations/${deleteId}`);
      setReservations((prev) => prev.filter((r) => r.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ---------- UTILS D’AFFICHAGE ----------
  const fmt = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));
  const money = (v) => {
    if (v === null || v === undefined || v === "") return "—";
    const n = Number(v);
    return Number.isNaN(n) ? String(v) : n.toFixed(2);
  };
  const BASE_STORAGE_URL = "http://127.0.0.1:8000/storage/";
  const buildLicenseUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return BASE_STORAGE_URL + String(path).replace(/^\/?storage\/?/, "");
  };

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-900">📋 Gestion des Réservations</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={openCreate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Nouvelle réservation
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Retour au Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded p-4 overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-500">Chargement...</div>
          ) : errMsg ? (
            <div className="py-10 text-center text-red-600">{errMsg}</div>
          ) : reservations.length === 0 ? (
            <div className="py-10 text-center text-gray-500">Aucune réservation trouvée.</div>
          ) : (
            <table className="min-w-full table-auto text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Voiture</th>
                  <th className="px-4 py-2">Client</th>
                  <th className="px-4 py-2">Début</th>
                  <th className="px-4 py-2">Fin</th>
                  <th className="px-4 py-2">Récupération</th>
                  <th className="px-4 py-2">Retour</th>
                  <th className="px-4 py-2">Paiement</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr
                    key={res.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelected(res)}
                  >
                    <td className="px-4 py-2">{res.id}</td>
                    <td className="px-4 py-2">
                      {res.car?.brand && res.car?.model
                        ? `${res.car.brand} ${res.car.model}`
                        : res.car_name || "—"}
                    </td>
                    <td className="px-4 py-2">
                      {res.first_name || res.last_name
                        ? `${res.first_name ?? ""} ${res.last_name ?? ""}`.trim()
                        : res.user?.name || res.customer_name || "—"}
                    </td>
                    <td className="px-4 py-2">{res.start_date}</td>
                    <td className="px-4 py-2">{res.end_date}</td>
                    <td className="px-4 py-2">{res.pickup_location}</td>
                    <td className="px-4 py-2">{res.dropoff_location}</td>
                    <td className="px-4 py-2">{res.payment_status || "—"}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(res);
                          }}
                          className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            askDelete(res.id);
                          }}
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL CREATE / EDIT */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-indigo-900">
                  {editing ? "Modifier la réservation" : "Créer une réservation"}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* IDs */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">User ID</label>
                  <input type="number" name="user_id" value={form.user_id} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Car ID</label>
                  <input type="number" name="car_id" value={form.car_id} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date début</label>
                  <input type="date" name="start_date" value={form.start_date} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date fin</label>
                  <input type="date" name="end_date" value={form.end_date} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>

                {/* Lieux */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Lieu de récupération</label>
                  <input type="text" name="pickup_location" value={form.pickup_location} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Lieu de retour</label>
                  <input type="text" name="dropoff_location" value={form.dropoff_location} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>

                {/* Identité client */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Prénom</label>
                  <input type="text" name="first_name" value={form.first_name} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nom</label>
                  <input type="text" name="last_name" value={form.last_name} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Téléphone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Adresse</label>
                  <input type="text" name="address" value={form.address} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>

                {/* Permis */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Permis (PDF/JPG/PNG)</label>
                  <input type="file" name="license_file_path" accept=".pdf,.jpg,.jpeg,.png" onChange={onChange} className="w-full border rounded px-3 py-2" />
                  {editing?.license_file_path && (
                    <p className="mt-1 text-xs text-gray-500">Fichier existant: {String(editing.license_file_path)}</p>
                  )}
                </div>

                {/* Paiement */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Méthode de paiement</label>
                  <select name="payment_method" value={form.payment_method} onChange={onChange} className="w-full border rounded px-3 py-2">
                    <option value="cash">cash</option>
                    <option value="card">card</option>
                    <option value="transfer">transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Statut de paiement</label>
                  <select name="payment_status" value={form.payment_status} onChange={onChange} className="w-full border rounded px-3 py-2">
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="partial">partial</option>
                    <option value="failed">failed</option>
                    <option value="refunded">refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Montant total</label>
                  <input type="number" step="0.01" name="total_amount" value={form.total_amount} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Montant payé</label>
                  <input type="number" step="0.01" name="amount_paid" value={form.amount_paid} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Payé le</label>
                  <input type="datetime-local" name="paid_at" value={form.paid_at} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Référence paiement</label>
                  <input type="text" name="payment_reference" value={form.payment_reference} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button onClick={closeModal} className="px-4 py-2 rounded border">Annuler</button>
                {editing ? (
                  <button onClick={updateReservation} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
                    Enregistrer
                  </button>
                ) : (
                  <button onClick={createReservation} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
                    Créer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL CONFIRM DELETE */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-2">Confirmer la suppression</h2>
              <p className="text-sm text-gray-600 mb-6">
                Voulez-vous vraiment supprimer la réservation #{deleteId} ?
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={cancelDelete} className="px-4 py-2 border rounded">Annuler</button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteLoading ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETAILS CARD */}
        {selected && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-indigo-900">
                  Détails de la réservation #{selected.id}
                </h2>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
                <DetailItem label="ID" value={fmt(selected.id)} />
                <DetailItem label="Statut paiement" value={fmt(selected.payment_status)} />

                <DetailItem
                  label="Voiture"
                  value={
                    selected.car?.brand && selected.car?.model
                      ? `${selected.car.brand} ${selected.car.model}`
                      : fmt(selected.car_name)
                  }
                />
                <DetailItem label="Car ID" value={fmt(selected.car_id ?? selected.car?.id)} />

                <DetailItem
                  label="Client"
                  value={
                    selected.first_name || selected.last_name
                      ? `${selected.first_name ?? ""} ${selected.last_name ?? ""}`.trim()
                      : fmt(selected.user?.name || selected.customer_name)
                  }
                />
                <DetailItem label="User ID" value={fmt(selected.user_id ?? selected.user?.id)} />

                <DetailItem label="Début" value={fmt(selected.start_date)} />
                <DetailItem label="Fin" value={fmt(selected.end_date)} />
                <DetailItem label="Récupération" value={fmt(selected.pickup_location)} />
                <DetailItem label="Retour" value={fmt(selected.dropoff_location)} />

                <DetailItem label="Téléphone" value={fmt(selected.phone)} />
                <DetailItem label="Email" value={fmt(selected.email)} />
                <div className="md:col-span-2">
                  <DetailItem label="Adresse" value={fmt(selected.address)} />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <span className="block text-xs text-gray-500 mb-1">Permis</span>
                  {buildLicenseUrl(selected.license_file_path) ? (
                    <a
                      href={buildLicenseUrl(selected.license_file_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-indigo-700 underline break-all"
                    >
                      Ouvrir le fichier
                    </a>
                  ) : (
                    <span className="text-gray-700">—</span>
                  )}
                </div>

                <DetailItem label="Méthode paiement" value={fmt(selected.payment_method)} />
                <DetailItem label="Montant total" value={money(selected.total_amount)} />
                <DetailItem label="Montant payé" value={money(selected.amount_paid)} />
                <DetailItem label="Payé le" value={fmt(selected.paid_at)} />
                <DetailItem label="Référence paiement" value={fmt(selected.payment_reference)} />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded border">
                  Fermer
                </button>
                <button
                  onClick={() => {
                    const r = selected;
                    setSelected(null);
                    openEdit(r);
                  }}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="border rounded-lg p-3">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      <span className="text-gray-800 break-words">{value}</span>
    </div>
  );
}

export default AdminReservations;
