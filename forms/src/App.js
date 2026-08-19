import React, { useState } from "react";
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
import ConsultationPage from "./ConsultationPage.jsx";
import ContraceptionConsultationPage from "./ContraceptionConsultationPage.jsx";
import EmployeeAppraisalFormPage from "./EmployeeAppraisalFormPage.jsx";
import StaffFileNoteFormPage from "./StaffFileNoteFormPage.jsx";
import SicknessReviewFormPage from "./SicknessReviewFormPage.jsx";
import HealthyLivingLogFormPage from "./HealthyLivingLogFormPage.jsx";
import HolidaysPage from "./HolidaysPage.jsx";

// 🎨 Header Redesign Components
import ServicesDropdown from "./ServicesDropdown.jsx";
import AnimatedBackground from "./AnimatedBackground.jsx";

import "./designSystem.css";
import "./App.css";

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

/* 🧱 App Shell (floating glassmorphic header + animated background) */
function AppShell() {
  const location = useLocation();
  const { isAuthenticated, currentUser, branch } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isFullWidthPage =
    location.pathname === "/holidays" || location.pathname === "/patients";

  const userInitial = (currentUser?.name || "C")[0].toUpperCase();
  const branchDisplay = branch?.pharmacyName || currentUser?.name || "CarePlus Health";

  return (
    <AnimatedBackground>
      <div className="shell">
        {/* Floating Glassmorphic Topbar */}
        <header className="topbar">
          <div className="topbar__brand">
            <Link to="/">
              <img src="/Logo3.png" alt="CarePlus Logo" className="topbar__logo" />
            </Link>
          </div>

          {/* User Profile & Branch Pill */}
          {isAuthenticated && (
            <div className="topbar__profile-pill">
              <div className="profile-avatar">{userInitial}</div>
              <div className="profile-details">
                <span className="profile-name">{currentUser?.name || "Clinician"}</span>
                <span className="profile-branch">🏢 {branchDisplay}</span>
              </div>
              <span className="online-badge" title="System Active">🟢</span>
            </div>
          )}

          {/* Desktop Nav */}
          <nav className={`topbar__nav ${mobileNavOpen ? "topbar__nav--mobile-open" : ""}`}>
            <Link to="/" className="link-btn" onClick={() => setMobileNavOpen(false)}>
              Home
            </Link>

            <div className="nav-dropdown-wrapper">
              <ServicesDropdown />
            </div>

            <a
              href="https://holidaytracker.careplushealth.co.uk/#/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-btn3"
              style={{ marginLeft: 8 }}
              onClick={() => setMobileNavOpen(false)}
            >
              Holidays
            </a>

            <Link
              to="/patients"
              className="link-btn2"
              style={{ marginLeft: 8 }}
              onClick={() => setMobileNavOpen(false)}
            >
              Patients
            </Link>

            <AuthHeaderControls />
          </nav>

          {/* Mobile Drawer Toggle */}
          {isAuthenticated && (
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? "✕ Close" : "☰ Menu"}
            </button>
          )}
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

            {/* 👔 Employee Performance Appraisal Form */}
            <Route
              path="/service/employeeAppraisal/form"
              element={
                <RequireAuth>
                  <EmployeeAppraisalFormPage />
                </RequireAuth>
              }
            />

            {/* 📝 Staff File Note Form */}
            <Route
              path="/service/staffFileNote/form"
              element={
                <RequireAuth>
                  <StaffFileNoteFormPage />
                </RequireAuth>
              }
            />

            {/* 🤒 Sickness Review Form */}
            <Route
              path="/service/sicknessReview/form"
              element={
                <RequireAuth>
                  <SicknessReviewFormPage />
                </RequireAuth>
              }
            />

            {/* 📋 Healthy Living Advice / Signposting Log */}
            <Route
              path="/service/healthyLivingLog/form"
              element={
                <RequireAuth>
                  <HealthyLivingLogFormPage />
                </RequireAuth>
              }
            />

            {/* 🧑‍⚕️ Patient Form */}
            <Route
              path="/service/:id/patient"
              element={
                <RequireAuth>
                  <PatientFormPage />
                </RequireAuth>
              }
            />

            {/* 🩺 Consultation Step */}
            <Route
              path="/service/travel/consultation"
              element={
                <RequireAuth>
                  <TravelConsultationPage />
                </RequireAuth>
              }
            />

            <Route
              path="/service/weightloss/consultation"
              element={
                <RequireAuth>
                  <WeightlossConsultationPage />
                </RequireAuth>
              }
            />

            <Route
              path="/service/contraception/consultation"
              element={
                <RequireAuth>
                  <ContraceptionConsultationPage />
                </RequireAuth>
              }
            />

            <Route
              path="/service/:id/consultation"
              element={
                <RequireAuth>
                  <ConsultationPage />
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
    </AnimatedBackground>
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
    <button className="link-btn4" onClick={logout} style={{ marginLeft: 8 }}>
      Logout
    </button>
  );
}
