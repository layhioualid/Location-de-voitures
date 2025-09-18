import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminCars() {
  const [cars, setCars] = useState([]);
  const [editingCar, setEditingCar] = useState(null);
  const navigate = useNavigate();

  const fetchCars = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/cars', {
      params: { per_page: 1000 } // ajuste si besoin
    });
    setCars(res.data.data || []);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    fetchCars();
  }, []);

  const deleteCar = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette voiture ?")) {
      axios.delete(`http://127.0.0.1:8000/api/cars/${id}`)
        .then(() => fetchCars());
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
  };

  const handleSave = () => {
    axios.put(`http://127.0.0.1:8000/api/cars/${editingCar.id}`, editingCar)
      .then(() => {
        setEditingCar(null);
        fetchCars();
      });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingCar({
      ...editingCar,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">Gestion des voitures</h1>
        <button
          onClick={() => navigate('/admin/AddCar')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Ajouter une voiture
        </button>
      </div>
      <div className="bg-white shadow rounded p-4 overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Marque</th>
              <th className="px-4 py-2">Modèle</th>
              <th className="px-4 py-2">Année</th>
              <th className="px-4 py-2">Prix / jour</th>
              <th className="px-4 py-2">Disponible</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map(car => (
              <tr key={car.id} className="border-t">
                {editingCar?.id === car.id ? (
                  <>
                    <td className="px-4 py-2 text-gray-400">N/A</td>
                    <td className="px-4 py-2">
                      <input
                        name="brand"
                        value={editingCar.brand}
                        onChange={handleChange}
                        className="border rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="model"
                        value={editingCar.model}
                        onChange={handleChange}
                        className="border rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="year"
                        type="number"
                        value={editingCar.year}
                        onChange={handleChange}
                        className="border rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="price_per_day"
                        type="number"
                        step="0.01"
                        value={editingCar.price_per_day}
                        onChange={handleChange}
                        className="border rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        name="available"
                        checked={editingCar.available}
                        onChange={handleChange}
                      />
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={handleSave} className="bg-indigo-600 text-white px-3 py-1 rounded">✔</button>
                      <button onClick={() => setEditingCar(null)} className="bg-gray-300 px-3 py-1 rounded">✖</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">
                      {car.image_url ? (
                        <img
                          src={`http://127.0.0.1:8000${car.image_url}`}
                          alt={car.model}
                          className="w-20 h-12 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 italic">Aucune</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{car.brand}</td>
                    <td className="px-4 py-2">{car.model}</td>
                    <td className="px-4 py-2">{car.year}</td>
                    <td className="px-4 py-2">{car.price_per_day} DH</td>
                    <td className="px-4 py-2">{car.available ? '✅' : '❌'}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={() => handleEdit(car)} className="bg-yellow-400 px-3 py-1 rounded">✎</button>
                      <button onClick={() => deleteCar(car.id)} className="bg-red-500 text-white px-3 py-1 rounded">🗑</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCars;
