import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./HomePage";
import CarListPage from "./CarListPage";
import AdminDashboard from "./AdminDashboard";
import AddCarForm from "./AddCarForm";
import CarDetailsPage from "./CarDetailsPage";
import AdminCars from "./AdminCars";
import AdminReservations from "./AdminReservations";
import AdminUsers from "./AdminUsers";   // 👈 nouvel import
import ReservationInfoPage from "./ReservationInfoPage";
import PaymentPage from "./PaymentPage";
import PaymentSuccessPage from "./PaymentSuccessPage";
import AboutPage from "./AboutPage";
import MyReservations from "./MyReservations";
import ProfilePage from "./ProfilePage";

function Layout() {
  const location = useLocation();
  const heroRoutes = ["/", "/about", "/profile"]; // 👈 routes avec hero plein écran
  const isHero = heroRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* 👉 pas de pt-28 sur la home, sinon la vidéo ne monte pas sous la navbar */}
      <main className={isHero ? "pt-0" : "pt-28"}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/cars" element={<CarListPage />} />
          <Route path="/cars/:id" element={<CarDetailsPage />} />
          <Route path="/reservation-info" element={<ReservationInfoPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/success" element={<PaymentSuccessPage />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/AddCar" element={<AddCarForm />} />
          <Route path="/admin/Car" element={<AdminCars />} />
          <Route path="/admin/Reservations" element={<AdminReservations />} />
          <Route path="/admin/Users" element={<AdminUsers />} /> {/* 👈 nouvelle route */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
