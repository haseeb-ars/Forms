import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext.jsx";

import ServiceSelectPage from "./ServiceSelectPage.jsx";
import PatientFormPage from "./PatientFormPage.jsx";
import PharmacistFormPage from "./PharmacistFormPage.jsx";
import PreviewPage from "./PreviewPage.jsx";
import LoginPage from "./LoginPage.jsx";
import PatientsPage from "./PatientsPage.jsx";
import TravelConsultationPage from "./TravelConsultationPage";
import WeightlossConsultationPage from "./WeightLossConsultationPage"; // ✅ ADD THIS LINE


import "./App.css";

export default function App() {
  return (
    <AppProvider>
      <div className="shell">
        <header className="topbar">
          <div className="topbar__brand">
            <img src="/Logo3.png" alt="CarePlus Logo" className="topbar__logo" />
          </div>
          <nav className="topbar__nav">
            <Link to="/" className="link-btn">Home</Link>
            <Link to="/patients" className="link-btn2" style={{ marginLeft: 8 }}>Patients</Link>
            <AuthHeaderControls />
          </nav>
        </header>

        <main className="main">
          <Routes>
            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Home - Service Selection */}
            <Route path="/" element={
              <RequireAuth>
                <ServiceSelectPage />
              </RequireAuth>
            } />

            {/* 🔹 Travel Consultation (step before form) */}
            <Route path="/service/travel/consultation" element={
              <RequireAuth>
                <TravelConsultationPage />
              </RequireAuth>
            } />


            {/* 🔹 Weight Loss Consultation */}
            <Route path="/service/weightloss/consultation" element={
              <RequireAuth>
                <WeightlossConsultationPage />  {/* ✅ NEW ROUTE */}
              </RequireAuth>
            } />


            {/* Patient Form */}
            <Route path="/service/:id/patient" element={
              <RequireAuth>
                <PatientFormPage />
              </RequireAuth>
            } />

            {/* Pharmacist Form */}
            <Route path="/service/:id/pharmacist" element={
              <RequireAuth>
                <PharmacistFormPage />
              </RequireAuth>
            } />

            {/* Preview */}
            <Route path="/service/:id/preview" element={
              <RequireAuth>
                <PreviewPage />
              </RequireAuth>
            } />

            {/* Patients List */}
            <Route path="/patients" element={
              <RequireAuth>
                <PatientsPage />
              </RequireAuth>
            } />
          </Routes>
        </main>
      </div>
    </AppProvider>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, isHydrated } = useApp();
  const location = useLocation();
  if (!isHydrated) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AuthHeaderControls() {
  const { isAuthenticated, logout } = useApp();
  if (!isAuthenticated) return null;
  return (
    <>
      <button className="btn" onClick={logout}>Logout</button>
    </>
  );
}
