import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding, FaCalendarAlt, FaMapMarkerAlt, FaShieldAlt, FaHandshake,
  FaClock, FaCar, FaCogs, FaThumbsUp, FaUsers, FaFacebook, FaInstagram,
  FaPhone, FaEnvelope
} from "react-icons/fa";

/* ===== Petit composant stat ===== */
function Stat({ num, label }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center">
      <div className="text-4xl font-extrabold text-yellow-500">{num}</div>
      <div className="text-gray-700 mt-1">{label}</div>
    </div>
  );
}

/* ===== Page ===== */
export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO bleu – fond derrière la navbar, texte sous la navbar */}
      <section className="relative bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10
                        min-h-[50vh] pt-40 pb-16
                        grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold">
              À propos d’IMH CAR HIRE
            </h1>
            <p className="mt-3 text-white/90 max-w-3xl">
              Loueur de véhicules automobiles à Marrakech depuis 2021.
              Fiabilité, transparence et service client au cœur de notre mission.
            </p>
            <button
              onClick={() => navigate("/cars")}
              className="mt-6 bg-yellow-400 text-indigo-900 font-bold px-5 py-3 rounded hover:bg-yellow-500"
            >
              Voir nos voitures
            </button>
          </div>
        </div>
      </section>

      {/* Identité / Infos clés */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Identité de l’entreprise</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <FaBuilding className="mt-1 text-indigo-700" />
              <div>
                <div className="font-semibold">Raison sociale</div>
                <div>IMH CAR HIRE — Société à Responsabilité Limitée</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaCalendarAlt className="mt-1 text-indigo-700" />
              <div>
                <div className="font-semibold">Date de création</div>
                <div>25/06/2021</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-1 text-indigo-700" />
              <div>
                <div className="font-semibold">Adresse</div>
                <div>MAG 1 LOT SOCOMA Nº1534, Marrakech</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaCar className="mt-1 text-indigo-700" />
              <div>
                <div className="font-semibold">Activité</div>
                <div>Loueur de véhicules automobiles</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Mission / Vision / Valeurs */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Notre mission & vision</h2>
          <p className="text-gray-700">
            Offrir une expérience de location simple, rapide et sûre, avec des véhicules fiables
            et un accompagnement 7j/7. Notre vision : devenir la référence locale en matière de
            location premium accessible, en misant sur la qualité de service et la transparence.
          </p>
          <h3 className="mt-5 font-semibold text-gray-900">Nos valeurs</h3>
          <ul className="mt-3 space-y-3 text-gray-700">
            <li className="flex items-start gap-3"><FaShieldAlt className="mt-1 text-indigo-700" /> Transparence & sécurité</li>
            <li className="flex items-start gap-3"><FaHandshake className="mt-1 text-indigo-700" /> Proximité client</li>
            <li className="flex items-start gap-3"><FaClock className="mt-1 text-indigo-700" /> Réactivité & ponctualité</li>
            <li className="flex items-start gap-3"><FaCogs className="mt-1 text-indigo-700" /> Entretien rigoureux de la flotte</li>
          </ul>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Ce que nous proposons</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3"><FaCar className="mt-1 text-indigo-700" /> Location courte et moyenne durée</li>
            <li className="flex items-start gap-3"><FaUsers className="mt-1 text-indigo-700" /> Offres particulières & entreprises</li>
            <li className="flex items-start gap-3"><FaThumbsUp className="mt-1 text-indigo-700" /> Assurance & options flexibles</li>
            <li className="flex items-start gap-3"><FaCogs className="mt-1 text-indigo-700" /> Véhicules récents et entretenus</li>
          </ul>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Stat num="500+" label="Clients satisfaits" />
          <Stat num="1200+" label="Locations effectuées" />
          <Stat num="98%" label="Taux de satisfaction" />
        </div>
      </section>

      {/* Appel à l’action */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-indigo-900">Besoin d’un véhicule dès aujourd’hui ?</h3>
            <p className="text-gray-700 mt-1">Réservez en ligne en quelques clics ou contactez-nous pour un devis rapide.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/cars")}
              className="bg-yellow-400 text-indigo-900 font-bold px-5 py-3 rounded hover:bg-yellow-500"
            >
              Parcourir les voitures
            </button>
            <a href="mailto:IMHcarhire@gmail.com" className="px-5 py-3 rounded border border-indigo-200 hover:bg-white">
              Nous écrire
            </a>
          </div>
        </div>
      </section>

      {/* Contact & Réseaux */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold text-indigo-900 mb-3">Nous contacter</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3"><FaEnvelope className="text-indigo-700" /> IMHcarhire@gmail.com</li>
              <li className="flex items-center gap-3"><FaPhone className="text-indigo-700" /> 0601231688</li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-indigo-700" />
                <span>MAG 1 LOT SOCOMA Nº1534, Marrakech</span>
              </li>
            </ul>
          </div>
          <a
            href="https://www.facebook.com/IMH.carhire"
            target="_blank"
            rel="noreferrer"
            className="bg-[#1877F2]/10 hover:bg-[#1877F2]/20 rounded-2xl shadow p-6 flex items-center gap-4 transition"
          >
            <FaFacebook className="text-[#1877F2]" size={28} />
            <div>
              <div className="font-semibold text-gray-900">Facebook</div>
              <div className="text-gray-600 text-sm">/IMH.carhire</div>
            </div>
          </a>
          <a
            href="https://www.instagram.com/IMH.carhire"
            target="_blank"
            rel="noreferrer"
            className="bg-[#E1306C]/10 hover:bg-[#E1306C]/20 rounded-2xl shadow p-6 flex items-center gap-4 transition"
          >
            <FaInstagram className="text-[#E1306C]" size={28} />
            <div>
              <div className="font-semibold text-gray-900">Instagram</div>
              <div className="text-gray-600 text-sm">@IMH.carhire</div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
