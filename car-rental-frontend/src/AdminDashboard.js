import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    cars: 0,
    reservations: 0,
    revenue: 0,
  });
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/stats/global', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchMonthlyData = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/stats/monthly', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChartData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    fetchMonthlyData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-6"></h2>
        <nav className="flex flex-col gap-4 text-sm font-medium">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-indigo-700">📊 Dashboard</button>
          <button onClick={() => navigate('/admin/Users')} className="flex items-center gap-2 text-gray-700">👤 Utilisateurs</button>
          <button onClick={() => navigate('/admin/Car')} className="flex items-center gap-2 text-gray-700">🚗 Voitures</button>
          <button onClick={() => navigate('/admin/Reservations')} className="flex items-center gap-2 text-gray-700">📋 Réservations</button>
        </nav>
        <div className="mt-auto pt-6">
          <button onClick={handleLogout} className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600">
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <BsSearch className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Search here..." className="pl-10 pr-4 py-2 border rounded-md" />
            </div>
            <img
              src="https://randomuser.me/api/portraits/men/75.jpg"
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow rounded p-4">
            <p className="text-sm font-semibold text-gray-500">UTILISATEURS</p>
            <h2 className="text-2xl font-bold">{stats.users}</h2>
          </div>
          <div className="bg-white shadow rounded p-4">
            <p className="text-sm font-semibold text-gray-500">VOITURES</p>
            <h2 className="text-2xl font-bold">{stats.cars}</h2>
          </div>
          <div className="bg-white shadow rounded p-4">
            <p className="text-sm font-semibold text-gray-500">RÉSERVATIONS</p>
            <h2 className="text-2xl font-bold">{stats.reservations}</h2>
          </div>
          <div className="bg-white shadow rounded p-4">
            <p className="text-sm font-semibold text-gray-500">CHIFFRE D’AFFAIRES</p>
            <h2 className="text-2xl font-bold">{stats.revenue} MAD</h2>
          </div>
        </div>

        {/* Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Réservations par mois</h3>
            <LineChart width={500} height={250} data={chartData}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="reservations" stroke="#8884d8" />
            </LineChart>
          </div>
          <div className="bg-white shadow rounded p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Revenus par mois</h3>
            <BarChart width={500} height={250} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
