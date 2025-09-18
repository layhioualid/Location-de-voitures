// AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // create/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // delete modal
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // search
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // -------- Axios instance --------
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: "http://127.0.0.1:8000/api" });
    const token = localStorage.getItem("token");
    if (token) instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return instance;
  }, []);

  // -------- Load users --------
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await api.get("/users");
      let list = [];
      if (Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res.data?.data)) list = res.data.data;
      else if (Array.isArray(res.data?.users)) list = res.data.users;
      setUsers(list);
    } catch (e) {
      console.error(e);
      setErrMsg(e?.response?.data?.message || "Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // -------- Helpers --------
  const resetForm = () => setForm({ name: "", email: "", password: "", role: "user" });
  const openCreate = () => { setEditing(null); resetForm(); setShowModal(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name ?? "", email: u.email ?? "", password: "", role: u.role ?? "user" });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };
  const onChange = (e) => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); };

  // -------- CRUD --------
  const createUser = async () => {
    try {
      const payload = { ...form };
      if (!payload.password) { alert("Le mot de passe est requis pour créer un utilisateur."); return; }
      await api.post("/users", payload, { headers: { "Content-Type": "application/json" } });
      closeModal();
      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Erreur lors de la création.");
    }
  };

  const updateUser = async () => {
    if (!editing?.id) return;
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password && form.password.trim().length > 0) payload.password = form.password;
      await api.put(`/users/${editing.id}`, payload, { headers: { "Content-Type": "application/json" } });
      closeModal();
      await fetchUsers();
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
      await api.delete(`/users/${deleteId}`);
      setUsers(prev => prev.filter(u => u.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // -------- Filter users --------
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // -------- UI --------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-900">👤 Gestion des Utilisateurs</h1>
          <div className="flex gap-2">
            <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              + Nouvel utilisateur
            </button>
            <button onClick={() => navigate("/admin")} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Retour au Dashboard
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="bg-white shadow rounded p-4 overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-500">Chargement...</div>
          ) : errMsg ? (
            <div className="py-10 text-center text-red-600">{errMsg}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-gray-500">Aucun utilisateur trouvé.</div>
          ) : (
            <table className="min-w-full table-auto text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Rôle</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{u.id}</td>
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${u.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600">Modifier</button>
                        <button onClick={() => askDelete(u.id)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Supprimer</button>
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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-indigo-900">
                  {editing ? "Modifier l’utilisateur" : "Créer un utilisateur"}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nom</label>
                  <input type="text" name="name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded px-3 py-2" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Mot de passe {editing && <span className="text-xs text-gray-500">(laisser vide pour ne pas changer)</span>}
                  </label>
                  <input type="password" name="password" value={form.password} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder={editing ? "••••••••" : ""} />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Rôle</label>
                  <select name="role" value={form.role} onChange={onChange} className="w-full border rounded px-3 py-2">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button onClick={closeModal} className="px-4 py-2 rounded border">Annuler</button>
                {editing ? (
                  <button onClick={updateUser} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Enregistrer</button>
                ) : (
                  <button onClick={createUser} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Créer</button>
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
                Voulez-vous vraiment supprimer l’utilisateur #{deleteId} ?
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={cancelDelete} className="px-4 py-2 border rounded">Annuler</button>
                <button onClick={handleDelete} disabled={deleteLoading} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60">
                  {deleteLoading ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
