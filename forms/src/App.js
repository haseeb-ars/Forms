import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext.jsx";

import ServiceSelectPage from "./ServiceSelectPage.jsx";
import PatientFormPage from "./PatientFormPage.jsx";
import PharmacistFormPage from "./PharmacistFormPage.jsx";
import PreviewPage from "./PreviewPage.jsx";
import LoginPage from "./LoginPage.jsx";
import PatientsPage from "./PatientsPage.jsx";

// 🧩 Consultation Pages
import TravelConsultationPage from "./TravelConsultationPage.jsx";
import WeightlossConsultationPage from "./WeightLossConsultationPage.jsx";
import ConsultationPage from "./ConsultationPage.jsx"; // ✅ Shared for earwax, flu, covid, b12
import ContraceptionConsultationPage from "./ContraceptionConsultationPage.jsx";
import HolidaysPage from "./HolidaysPage.jsx";

import "./App.css";

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

/* 🧱 App Shell (allows full-width pages like Holidays) */
function AppShell() {
  const location = useLocation();
  const isFullWidthPage =
  location.pathname === "/holidays" ||
  location.pathname === "/patients";

  return (
    <div className="shell">
      {/* Header */}
      <header className="topbar">
        <div className="topbar__brand">
          <img src="/Logo3.png" alt="CarePlus Logo" className="topbar__logo" />
        </div>

        <nav className="topbar__nav">
          <Link to="/" className="link-btn">
            Home
          </Link>

          <a
  href="https://holidaytracker.careplushealth.co.uk/#/"
  target="_blank"
  rel="noopener noreferrer"
  className="link-btn3"
  style={{ marginLeft: 8 }}
>
  Holidays
</a>

          <Link to="/patients" className="link-btn2" style={{ marginLeft: 8 }}>
            Patients
          </Link>

          <AuthHeaderControls />
        </nav>
      </header>

      {/* Main Routes */}
      <main className={`main ${isFullWidthPage ? "main--full" : ""}`}>
        <Routes>
          {/* 🔐 Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* 🏠 Home - Service Selection */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <ServiceSelectPage />
              </RequireAuth>
            }
          />

          {/* 🌴 Holidays (embedded app) */}
          <Route
            path="/holidays"
            element={
              <RequireAuth>
                <HolidaysPage />
              </RequireAuth>
            }
          />

          {/* 🧭 Travel Consultation */}
          <Route
            path="/service/travel/consultation"
            element={
              <RequireAuth>
                <TravelConsultationPage />
              </RequireAuth>
            }
          />

          {/* ⚖️ Weight Loss Consultation */}
          <Route
            path="/service/weightloss/consultation"
            element={
              <RequireAuth>
                <WeightlossConsultationPage />
              </RequireAuth>
            }
          />

          {/* 💊 Contraception Consultation */}
          <Route
            path="/service/contraception/consultation"
            element={
              <RequireAuth>
                <ContraceptionConsultationPage />
              </RequireAuth>
            }
          />

          {/* 🧠 Shared Consultation for: earwax, flu, covid, b12 */}
          <Route
            path="/service/:id/consultation"
            element={
              <RequireAuth>
                <ConsultationPage />
              </RequireAuth>
            }
          />

          {/* 🧍 Patient Form */}
          <Route
            path="/service/:id/patient"
            element={
              <RequireAuth>
                <PatientFormPage />
              </RequireAuth>
            }
          />

          {/* 💊 Pharmacist Form */}
          <Route
            path="/service/:id/pharmacist"
            element={
              <RequireAuth>
                <PharmacistFormPage />
              </RequireAuth>
            }
          />

          {/* 🧾 Preview */}
          <Route
            path="/service/:id/preview"
            element={
              <RequireAuth>
                <PreviewPage />
              </RequireAuth>
            }
          />

          {/* 👥 Patients List */}
          <Route
            path="/patients"
            element={
              <RequireAuth>
                <PatientsPage />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

/* 🔒 Auth Protection */
function RequireAuth({ children }) {
  const { isAuthenticated, isHydrated } = useApp();
  const location = useLocation();

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/* 🚪 Logout Button */
function AuthHeaderControls() {
  const { isAuthenticated, logout } = useApp();
  if (!isAuthenticated) return null;

  return (
    <button className="link-btn4" onClick={logout}>
      Logout
    </button>
  );
}
