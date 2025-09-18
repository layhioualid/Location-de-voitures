import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#222] text-white mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14 grid gap-10 md:grid-cols-3">
        {/* À propos */}
        <div>
          <h3 className="text-lg font-semibold uppercase">À propos</h3>
          <ul className="mt-4 space-y-2 text-gray-300 text-sm">
            <li>📞 +212 6 12 34 56 78</li>
            <li>📧 contact@imhcarhire.com</li>
            <li>📍 MAG 1 LOT SOCOMA Nº1534, Marrakech</li>
          </ul>
        </div>

        {/* Actus */}
        <div>
          <h3 className="text-lg font-semibold uppercase">Actualités</h3>
          <ul className="mt-4 space-y-4 text-sm">
            <li>
              <p className="font-medium">Nouveaux modèles disponibles dès cet été</p>
              <p className="text-gray-400">08 Août 2025</p>
            </li>
            <li>
              <p className="font-medium">Réductions spéciales pour les réservations en ligne</p>
              <p className="text-gray-400">20 Juillet 2025</p>
            </li>
          </ul>
        </div>

        {/* Liens rapides */}
        <div>
          <h3 className="text-lg font-semibold uppercase">Liens rapides</h3>
          <ul className="mt-4 grid grid-cols-2 gap-y-2 text-gray-300 text-sm">
            <li><Link to="/about" className="hover:text-white">À propos</Link></li>
            <li><Link to="/cars" className="hover:text-white">Nos voitures</Link></li>
            <li><Link to="/services" className="hover:text-white">Services</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li className="col-span-2 mt-4">
              <Link to="/cars" className="inline-block rounded-md bg-yellow-400 px-5 py-3 text-indigo-900 font-bold hover:bg-yellow-500">
                Trouver une voiture
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bas */}
      <div className="border-t border-white/10 py-6">
        <div className="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between px-4 text-sm text-gray-400 gap-4 md:gap-0">
          <span>© 2025 IMH Car Hire. Tous droits réservés.</span>
          <div className="flex items-center gap-4 opacity-80 text-lg">
            <a href="https://www.instagram.com/IMH.carhire" target="_blank" rel="noreferrer" className="hover:text-white"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white"><FaInstagram /></a>
            <a href="https://www.instagram.com/IMH.carhire" target="_blank" rel="noreferrer" className="hover:text-white"><FaTwitter /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
