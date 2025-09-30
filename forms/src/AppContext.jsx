import React, { createContext, useContext, useEffect, useState, useCallback } from "react"


const STORAGE_KEY = "prefilled-form-app-v2";

// 🔹 Auth users mapped to branch IDs
const AUTH_USERS = [
  { username: "WRP1", password: "wrp5678!", name: "Wilmslow Road Pharmacy", branchId: "wilmslow" },
  { username: "CPC1", password: "cpc5678!", name: "CarePlus Chemist", branchId: "southport" },
  { username: "2471", password: "2475678!", name: "247 Pharmacy", branchId: "pharmacy247" },
];

// 🔹 Branch-specific configuration
const BRANCH_CONFIG = {
  wilmslow: {
    logo: `${process.env.PUBLIC_URL}/logos/wilmslow.png`,
    pharmacyName: "Wilmslow Road Pharmacy",
    pharmacyAddress: "480 Wilmslow Rd, Withington, Manchester M20 3BG",
  },
  southport: {
    logo: `${process.env.PUBLIC_URL}/logos/southport.png`,
    pharmacyName: "Care Plus Chemist",
    pharmacyAddress: "34 Shakespeare St, Southport PR8 5AB",
  },
  liverpool: {
    logo: `${process.env.PUBLIC_URL}/logos/liverpool.png`,
    pharmacyName: "247 Pharmacy",
    pharmacyAddress: "15 Stuart Rd, Waterloo, Liverpool L22 4QR",
  },
};


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
  pharmacyName: "",
  pharmacyAddress: "",
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
  const [branch, setBranch] = useState(null); // 🔹 NEW
  const [isHydrated, setIsHydrated] = useState(false);
  const [apiBase] = useState(process.env.REACT_APP_API_BASE || "http://localhost:4000");

  // Load saved auth data
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) {
        if (saved.selectedFormType) setSelectedFormType(saved.selectedFormType);
        if (saved.auth) {
          setIsAuthenticated(!!saved.auth.isAuthenticated);
          setCurrentUser(saved.auth.currentUser || null);

          // Restore branch config
          if (saved.auth.currentUser?.branchId) {
            setBranch(BRANCH_CONFIG[saved.auth.currentUser.branchId]);
            setPharm((prev) => ({
              ...prev,
              pharmacyName: BRANCH_CONFIG[saved.auth.currentUser.branchId].pharmacyName,
              pharmacyAddress: BRANCH_CONFIG[saved.auth.currentUser.branchId].pharmacyAddress,
            }));
          }
        }
      }
    } catch {}
    setPatient(DEFAULT_PATIENT);
    setIsHydrated(true);
  }, []);

  // Persist only auth + form type
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

  // 🔹 Login function sets branch info
  const login = (username, password) => {
    const found = AUTH_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setIsAuthenticated(true);
      setCurrentUser({ username: found.username, name: found.name, branchId: found.branchId });

      const branchConfig = BRANCH_CONFIG[found.branchId];
      setBranch(branchConfig);
      setPharm((prev) => ({
        ...prev,
        pharmacyName: branchConfig.pharmacyName,
        pharmacyAddress: branchConfig.pharmacyAddress,
      }));

      return { ok: true };
    }
    return { ok: false, error: "Invalid username or password" };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setBranch(null);
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
        branch, // 🔹 branch info available here
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


export { AppCtx as AppContext };
