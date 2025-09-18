import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddCarForm() {
  const [car, setCar] = useState({
    brand: '',
    model: '',
    year: '',
    price_per_day: '',
    available: false,
    fuel_type: '',
    transmission: '',
    color: '',
    seats: '',
    trunk_size: ''
  });

  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCar({
      ...car,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    // ✅ Traitement spécial pour le champ "available"
    Object.entries(car).forEach(([key, value]) => {
      if (key === 'available') {
        formData.append('available', value ? 1 : 0); // ✅ int

      } else {
        formData.append(key, value);
      }
    });

    if (image) {
      formData.append('image', image);
    }

    axios.post('http://127.0.0.1:8000/api/cars', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    .then(() => navigate('/admin'))
    .catch(err => console.error(err));
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl mb-4 font-bold">Ajouter une nouvelle voiture</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" name="brand" value={car.brand} onChange={handleChange} placeholder="Marque" className="border p-2 rounded" required />
        <input type="text" name="model" value={car.model} onChange={handleChange} placeholder="Modèle" className="border p-2 rounded" required />
        <input type="number" name="year" value={car.year} onChange={handleChange} placeholder="Année" className="border p-2 rounded" required />
        <input type="number" step="0.01" name="price_per_day" value={car.price_per_day} onChange={handleChange} placeholder="Prix par jour" className="border p-2 rounded" required />

        <input type="file" accept="image/*" onChange={handleImageChange} className="border p-2 rounded" />

        <label className="flex items-center gap-2">
          <input type="checkbox" name="available" checked={car.available} onChange={handleChange} />
          Disponible
        </label>

        <select name="fuel_type" value={car.fuel_type} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Type de carburant</option>
          <option value="essence">Essence</option>
          <option value="diesel">Diesel</option>
          <option value="électrique">Électrique</option>
        </select>

        <select name="transmission" value={car.transmission} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Transmission</option>
          <option value="manuelle">Manuelle</option>
          <option value="automatique">Automatique</option>
        </select>

        
        <select name="color" value={car.color} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Couleur</option>
          <option value="noir">Noir</option>
          <option value="blanc">Blanc</option>
          <option value="gris">Gris</option>
          <option value="bleu">Bleu</option>
          <option value="rouge">Rouge</option>
          <option value="vert">Vert</option>
          <option value="argent">Argent</option>
        </select>


        <input type="number" name="seats" value={car.seats} onChange={handleChange} placeholder="Nombre de places" className="border p-2 rounded" required />

        <select name="trunk_size" value={car.trunk_size} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Taille du coffre</option>
          <option value="petit">Petit</option>
          <option value="moyen">Moyen</option>
          <option value="grand">Grand</option>
        </select>

        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Ajouter
        </button>
      </form>
    </div>
  );
}

export default AddCarForm;
