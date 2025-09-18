// src/HomePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTags, FaHeadset, FaCarSide, FaPiggyBank, FaCrown } from "react-icons/fa";

const BRANDS = [
  { name: "BMW",        logo: "/brands/bmw.png" },
  { name: "Dacia",      logo: "/brands/Dacia.png" },
  { name: "Mercedes",   logo: "/brands/mercedes.png" },
  { name: "Renault",    logo: "/brands/Renault.png" },
  { name: "Volkswagen", logo: "/brands/Volkswagen.png" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);

  // (Optionnel) Rediriger un admin qui atterrit ici
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u?.role === "admin") navigate("/admin");
    } catch {}
  }, [navigate]);

  // Charger 4 voitures comme “offres”
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/cars")
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setOffers(list.slice(0, 4));
      })
      .catch(() => setOffers([]));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO vidéo — la nav est au-dessus, le texte commence sous la nav */}
      <section className="relative w-full min-h-[54vh] rounded-b-3xl -hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/publi.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-7xl mx-auto px-6 pt-40 pb-16 flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-5xl font-bold text-white mb-4">HF Car Rental</h1>
            <p className="text-lg text-white/95 mb-6">
              Des véhicules de rêve, accessibles dès aujourd&apos;hui
            </p>
            <button
              onClick={() => navigate("/cars")}
              className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold px-6 py-3 rounded shadow-lg transition"
            >
              Voir nos voitures
            </button>
          </div>
        </div>
      </section>

      {/* Offres Spéciales (cartes fixes) */}
<section className="max-w-5xl mx-auto py-9 px-6 text-center">
  <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Offres Spéciales :</h2>
  <div className="flex flex-col md:flex-row justify-center gap-8">

    {/* Économique */}
    <div className="bg-yellow-400 text-indigo-900 rounded-lg p-6 flex-1 shadow-lg hover:scale-105 transform transition">
      <div className="mb-4 flex justify-center">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/90">
          <FaPiggyBank className="text-indigo-900 text-xl" />
        </span>
      </div>
      <h3 className="font-bold text-2xl mb-3">Voiture Économique</h3>
      <p>À partir de <strong>250 DH / jour</strong></p>
      <p className="mt-2 text-sm">Parfaite pour la ville et petits budgets.</p>
    </div>

    {/* Luxueuse */}
    <div className="bg-yellow-400 text-indigo-900 rounded-lg p-6 flex-1 shadow-lg hover:scale-105 transform transition">
      <div className="mb-4 flex justify-center">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/90">
          <FaCrown className="text-indigo-900 text-xl" />
        </span>
      </div>
      <h3 className="font-bold text-2xl mb-3">Voiture Luxueuse</h3>
      <p>À partir de <strong>700 DH / jour</strong></p>
      <p className="mt-2 text-sm">Confort et puissance pour toutes vos aventures.</p>
    </div>

  </div>
</section>


      {/* Offres dynamiques depuis l'API */}
      <section className="max-w-7xl mx-auto py-9 px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-gray-800">Promotion :</h2>
          <button onClick={() => navigate("/cars")} className="text-indigo-700 font-medium hover:underline">
            Voir toutes les voitures →
          </button>
        </div>

        {offers.length === 0 ? (
          <p className="text-gray-500">Aucune offre pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((c) => {
              const price = Number(c?.price_per_day ?? 0);
              const fakeOldPrice = price + (Math.random() < 0.5 ? 50 : 100);

              return (
                <div
                  key={c.id}
                  className="cursor-pointer bg-white rounded-xl shadow-lg border overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition"
                  onClick={() => navigate(`/cars/${c.id}`)}
                >
                  {/* Image */}
                  <div className="w-full aspect-[16/10] bg-gray-50">
                    {c?.image_url ? (
                      <img
                        src={`http://127.0.0.1:8000${c.image_url}`}
                        alt={`${c?.brand} ${c?.model}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Pas d&apos;image
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                        {c?.brand} {c?.model}
                      </h3>
                      <span className=" left-4 top-4 text-xs bg-red-500 text-white font-bold px-2 py-1 rounded">
                        Promo 20%
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      {c?.year ? `Année ${c.year}` : c?.category || "Location"}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="line-through text-gray-400 text-sm">
                        {fakeOldPrice.toLocaleString("fr-FR")} DH
                      </span>
                      <span className="inline-block bg-yellow-400 text-indigo-900 px-3 py-1.5 rounded-md text-sm font-bold">
                        {price.toLocaleString("fr-FR")} DH / jour
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/cars/${c.id}`);
                      }}
                      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md font-medium"
                    >
                      Voir l’offre
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Marques partenaires */}
      <section className="bg-white text-black py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Nos marques partenaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center">
            {BRANDS.map((brand) => (
              <Link
                key={brand.name}
                to={`/cars?brand=${encodeURIComponent(brand.name)}`}
                className="group flex items-center justify-center bg-white border rounded-xl p-4 hover:shadow-md transition"
                title={`Voir les voitures ${brand.name}`}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-16 w-auto object-contain opacity-90 group-hover:opacity-100"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

          {/* Pourquoi nous */}
    <section className="max-w-4xl mx-auto py-16 px-6 text-center">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">
        Pourquoi choisir HF Car Rental ?
      </h2>
      <p className="text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
        Des prix compétitifs, un service client dédié, et une flotte moderne pour tous vos besoins.
      </p>
      <div className="flex flex-col md:flex-row justify-center gap-8">
        {/* Prix compétitifs */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex-1 hover:shadow-lg transition">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50">
              <FaTags className="text-indigo-700 text-xl" />
            </span>
          </div>
          <h3 className="font-bold text-lg mb-2">Prix compétitifs</h3>
          <p className="text-gray-600">Location de qualité à des tarifs abordables.</p>
        </div>

        {/* Service 24/7 */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex-1 hover:shadow-lg transition">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50">
              <FaHeadset className="text-indigo-700 text-xl" />
            </span>
          </div>
          <h3 className="font-bold text-lg mb-2">Service 24/7</h3>
          <p className="text-gray-600">Une assistance toujours disponible pour vous aider.</p>
        </div>

        {/* Voitures modernes */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex-1 hover:shadow-lg transition">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50">
              <FaCarSide className="text-indigo-700 text-xl" />
            </span>
          </div>
          <h3 className="font-bold text-lg mb-2">Voitures modernes</h3>
          <p className="text-gray-600">Une flotte récente et entretenue pour votre confort.</p>
        </div>
      </div>
    </section>


      {/* Avis clients */}
      <section className="bg-gray-50 py- px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-800">Ce que disent nos clients</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
              <img
                src="https://randomuser.me/api/portraits/women/68.jpg"
                alt="Client 1"
                className="w-16 h-16 rounded-full mb-4 object-cover"
              />
              <p className="text-gray-600 italic">
                “Service impeccable ! Voiture propre, livraison rapide et prix imbattable. Je recommande à 100%.”
              </p>
              <h4 className="mt-4 font-semibold text-gray-800">Sophie L.</h4>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
              <img
                src="https://randomuser.me/api/portraits/men/45.jpg"
                alt="Client 2"
                className="w-16 h-16 rounded-full mb-4 object-cover"
              />
              <p className="text-gray-600 italic">
                “La réservation en ligne est simple et rapide. Très satisfait de ma location.”
              </p>
              <h4 className="mt-4 font-semibold text-gray-800">Marc D.</h4>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
              <img
                src="https://randomuser.me/api/portraits/women/12.jpg"
                alt="Client 3"
                className="w-16 h-16 rounded-full mb-4 object-cover"
              />
              <p className="text-gray-600 italic">
                “Un service client très réactif et des voitures en parfait état.”
              </p>
              <h4 className="mt-4 font-semibold text-gray-800">Claire M.</h4>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
