import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const STORAGE_KEY = "prefilled-form-app-v2";

// 🔹 Auth users mapped to branch IDs
const AUTH_USERS = [
  {
    username: "WRP1",
    password: "wrp5678!",
    name: "Wilmslow Road Pharmacy",
    branchId: "wilmslow",
  },
  {
    username: "CPC1",
    password: "cpc5678!",
    name: "CarePlus Chemist",
    branchId: "southport",
  },
  { username: "2471", password: "2475678!", name: "247 Pharmacy", branchId: "liverpool" },
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

// 🔹 Default Patient Form
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

// 🔹 Default Pharmacist Form
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
  vaccines: [],
};

// 🔹 Default Travel Consultation
export const DEFAULT_TRAVEL_CONSULTATION = {
  countries: [],
  departureDate: "",
  returnDate: "",
  reason: "",
  eggAllergy: false,
  pregnant: false,
  immunosuppressed: false,
  allergiesText: "",
  medications: "",
  recommendedVaccines: [],
  cautionVaccines: [],
  contraindicatedVaccines: [],
  otherRisks: [],
};

// 🔹 Default Weight Loss Consultation
export const DEFAULT_WEIGHTLOSS_CONSULTATION = {
  ageGroup: "",
  medicalConditions: "",
  weightConditions: "",
  bmi: "",
  currentMedications: "",
  previousAttempts: "",
  familyHistory: "",
  lifestyle: "",
  goals: "",
  consent: false,
};

// 🔹 Default Private Prescription Consultation
export const DEFAULT_PRIVATE_PRESCRIPTION_CONSULTATION = {
  presentingComplaint: "",
  medicationHistory: "",
  allergies: "",
  otherNotes: "",
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
  const [branch, setBranch] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [apiBase] = useState(
    process.env.REACT_APP_API_BASE || "http://localhost:4000"
  );

  // 🔹 Consultation States
  const [travelConsultation, setTravelConsultation] = useState(
    DEFAULT_TRAVEL_CONSULTATION
  );
  const [weightLossConsultation, setWeightLossConsultation] = useState(
    DEFAULT_WEIGHTLOSS_CONSULTATION
  );

  const [earwaxConsultation, setEarwaxConsultation] = useState({});
  const [covidConsultation, setCovidConsultation] = useState({});
  const [b12Consultation, setB12Consultation] = useState({});
  const [fluConsultation, setFluConsultation] = useState({});
  const [mmrConsultation, setMmrConsultation] = useState({}); // ✅ ADDED
  const [privatePrescriptionConsultation, setPrivatePrescriptionConsultation] =
    useState({});
  const [weightLossFollowupConsultation, setWeightLossFollowupConsultation] =
    useState({});

  const resetTravelConsultation = () =>
    setTravelConsultation(DEFAULT_TRAVEL_CONSULTATION);
  const resetWeightLossConsultation = () =>
    setWeightLossConsultation(DEFAULT_WEIGHTLOSS_CONSULTATION);
  const resetPrivatePrescriptionConsultation = () =>
    setPrivatePrescriptionConsultation(
      DEFAULT_PRIVATE_PRESCRIPTION_CONSULTATION
    );

  // 🔹 Load saved auth data
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) {
        if (saved.selectedFormType) setSelectedFormType(saved.selectedFormType);
        if (saved.auth) {
          setIsAuthenticated(!!saved.auth.isAuthenticated);
          setCurrentUser(saved.auth.currentUser || null);

          if (saved.auth.currentUser?.branchId) {
            const branchConfig = BRANCH_CONFIG[saved.auth.currentUser.branchId];
            setBranch(branchConfig);
            setPharm((prev) => ({
              ...prev,
              pharmacyName: branchConfig.pharmacyName,
              pharmacyAddress: branchConfig.pharmacyAddress,
            }));
          }
        }
      }
    } catch {}
    setPatient(DEFAULT_PATIENT);
    setIsHydrated(true);
  }, []);

  // 🔹 Persist only auth + form type
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

  // 🔹 Update formData whenever patient or pharm changes
  const updateFormData = useCallback(() => {
    setFormData({ ...patient, ...pharm });
  }, [patient, pharm]);

  useEffect(() => {
    updateFormData();
  }, [updateFormData]);

  // 🔹 Login
  const login = (username, password) => {
    const found = AUTH_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setIsAuthenticated(true);
      setCurrentUser({
        username: found.username,
        name: found.name,
        branchId: found.branchId,
      });

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

  // 🔹 Logout
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setBranch(null);
    resetTravelConsultation();
    resetWeightLossConsultation();
    resetPrivatePrescriptionConsultation();
    setMmrConsultation({}); // ✅ ADDED (clear on logout)
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
        branch,
        isHydrated,
        login,
        logout,
        apiBase,

        // 🔹 Consultations
        travelConsultation,
        setTravelConsultation,
        resetTravelConsultation,

        weightLossConsultation,
        setWeightLossConsultation,
        resetWeightLossConsultation,

        weightLossFollowupConsultation,
        setWeightLossFollowupConsultation,

        earwaxConsultation,
        setEarwaxConsultation,
        covidConsultation,
        setCovidConsultation,
        b12Consultation,
        setB12Consultation,
        fluConsultation,
        setFluConsultation,

        // ✅ MMR
        mmrConsultation,
        setMmrConsultation,

        privatePrescriptionConsultation,
        setPrivatePrescriptionConsultation,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export { AppCtx as AppContext };
