import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "prefilled-form-app-v2";
const AUTH_USERS = [
  { username: "WRP1", password: "wrp5678!", name: "Wilmslow Road Pharmacy" },
  { username: "CPC1", password: "cpc5678!", name: "CarePlus Chemist" },
  { username: "2471", password: "2475678!", name: "247 Pharmacy" },
];

export const DEFAULT_PATIENT = {
  fullName: "",
  address: "",
  telephone: "",
  dob: "",
  gpName: "",
  gpAddress: "",
  emergencyContact: "",
  emergencyPhone: "",
  reasonB12: "",
  signaturePatient: "",
  dateSignedPatient: "",
};

export const DEFAULT_PHARM = {
  pharmacistNameGPhC: "",
  pharmacistSignature: "",
  datePharm: "",
  drug: "",
  route: "",
  manufacturer: "",
  batchAndExpiry: "",
  adverseReactions: "",
  pointOfVariance: "",
  pharmacyName: "Care Plus Chemist",
  pharmacyAddress: "34 Shakespeare Street, Southport, Merseyside, PR8 5AB",
};

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  const [patient, setPatient] = useState(DEFAULT_PATIENT);
  const [pharm, setPharm] = useState(DEFAULT_PHARM);
  const [selectedFormType, setSelectedFormType] = useState("");
  const [formData, setFormData] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [apiBase] = useState(process.env.REACT_APP_API_BASE || "http://localhost:4000");

  // Load saved auth data from localStorage on mount (do NOT hydrate form fields)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) {
        // Optional: retain selected form type if you want
        if (saved.selectedFormType) setSelectedFormType(saved.selectedFormType);
        if (saved.auth) {
          setIsAuthenticated(!!saved.auth.isAuthenticated);
          setCurrentUser(saved.auth.currentUser || null);
        }
      }
    } catch {}
    // Always clear any persisted form values on fresh load
    setPatient(DEFAULT_PATIENT);
    setPharm(DEFAULT_PHARM);
    setIsHydrated(true);
  }, []);

  // Persist only auth (and optionally selected form type). Do not persist form fields
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            selectedFormType,
            auth: { isAuthenticated, currentUser },
          })
        );
      } catch {}
    }, 300);
    return () => clearTimeout(id);
  }, [selectedFormType, isAuthenticated, currentUser]);

  // Update formData whenever patient or pharm changes
  const updateFormData = useCallback(() => {
    setFormData({ ...patient, ...pharm });
  }, [patient, pharm]);

  useEffect(() => {
    updateFormData();
  }, [updateFormData]);

  const login = (username, password) => {
    const found = AUTH_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setIsAuthenticated(true);
      setCurrentUser({ username: found.username, name: found.name });
      return { ok: true };
    }
    return { ok: false, error: "Invalid username or password" };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AppCtx.Provider
      value={{
        patient,
        setPatient,
        pharm,
        setPharm,
        selectedFormType,
        setSelectedFormType,
        formData,
        setFormData,
        isAuthenticated,
        currentUser,
        isHydrated,
        login,
        logout,
        apiBase,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
