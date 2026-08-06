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
    pharmacyName: "CarePlus Chemist",
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

// 🔹 Default Employee Performance Appraisal Form
export const DEFAULT_EMPLOYEE_APPRAISAL = {
  employeeName: "",
  employeeId: "",
  jobTitle: "",
  department: "",
  managerName: "",
  startDate: "",
  appraisalDate: "",
  qualityOfWork: 5,
  productivity: 5,
  communicationSkills: 5,
  teamwork: 5,
  attendance: 5,
  problemSolving: 5,
  initiative: 5,
  policyCompliance: 5,
  keyAchievements: "",
  goalsMet: "",
  areasForImprovement: "",
  trainingNeeds: "",
  careerObjectives: "",
  agreedActionPlan: "",
  overallRating: 5,
  managerComments: "",
  employeeComments: "",
  recommendation: "Meets Expectations",
  employeeSignature: "",
  managerSignature: "",
  dateSigned: "",
};

// 🔹 CarePlus Health Staff Directory for autocomplete/selection
export const CAREPLUS_STAFF_LIST = [
  { id: "CP-101", name: "Dr. Sarah Jenkins", department: "Clinical Services", jobTitle: "Senior Lead Pharmacist", manager: "Dr. Robert Vance" },
  { id: "CP-102", name: "Michael Chang", department: "Pharmacy Operations", jobTitle: "Dispensary Technician", manager: "Dr. Sarah Jenkins" },
  { id: "CP-103", name: "Emma Watson", department: "Human Resources", jobTitle: "HR Specialist", manager: "David Miller" },
  { id: "CP-104", name: "James Wilson", department: "Patient Care", jobTitle: "Healthcare Assistant", manager: "Dr. Sarah Jenkins" },
  { id: "CP-105", name: "Sophia Patel", department: "Administration", jobTitle: "Practice Administrator", manager: "David Miller" },
  { id: "CP-106", name: "Alexander Wright", department: "Clinical Operations", jobTitle: "Independent Prescriber", manager: "Dr. Robert Vance" },
  { id: "CP-107", name: "Emily Davies", department: "Customer Support", jobTitle: "Front Desk Coordinator", manager: "Sophia Patel" },
  { id: "CP-108", name: "Oliver Taylor", department: "Logistics", jobTitle: "Inventory Manager", manager: "Michael Chang" },
];

// 🔹 Default Staff File Note Form State
export const DEFAULT_STAFF_FILE_NOTE = {
  employeeName: "",
  employeeId: "",
  department: "",
  jobTitle: "",
  manager: "",
  meetingDate: new Date().toISOString().split("T")[0],
  meetingTime: "",

  meetingPurpose: "Formal Meeting", // Formal Meeting | Informal Meeting | Disciplinary

  keyDiscussionPoints: "",
  criticalDetails: "",

  actionsRequired: "",
  responsiblePerson: "",
  followUpDueDate: "",
  followUpRequired: "No", // "Yes" | "No"
  followUpMeetingDate: "",

  additionalComments: "",

  preparedBy: "",
  preparedDate: new Date().toISOString().split("T")[0],
  reviewedBy: "",
  approvalDate: "",

  isAuthorized: true,
  createdAt: null,
  updatedAt: null,
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
  const [mmrConsultation, setMmrConsultation] = useState({});
  const [meningitisConsultation, setMeningitisConsultation] = useState({});
  const [perioddelayConsultation, setPerioddelayConsultation] = useState({}); // ✅ ADDED
  const [contraceptionConsultation, setContraceptionConsultation] = useState({});
  const [privatePrescriptionConsultation, setPrivatePrescriptionConsultation] =
    useState({});
  const [employeeAppraisalConsultation, setEmployeeAppraisalConsultation] =
    useState(DEFAULT_EMPLOYEE_APPRAISAL);
  const [staffFileNoteConsultation, setStaffFileNoteConsultation] =
    useState(DEFAULT_STAFF_FILE_NOTE);
  const [healthyLivingLogConsultation, setHealthyLivingLogConsultation] = useState({
    entries: [
      {
        date: new Date().toISOString().split("T")[0],
        staffInitials: "",
        nhsNumber: "",
        clinicalLocation: false,
        nonClinicalLocation: false,
        lifestyleAdvice: false,
        otcAdvice: false,
        selfCare: false,
        signposting: false,
        briefDescription: "",
        gpInformed: false,
        recordedInPnr: false,
        outcomeSummary: "",
      },
    ],
  });
  const [weightLossFollowupConsultation, setWeightLossFollowupConsultation] =
    useState({});
  const [weightLossFollowupOriginalData, setWeightLossFollowupOriginalData] = useState(null);
  const [travelFollowUpOriginalData, setTravelFollowUpOriginalData] = useState(null);

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
    } catch { }
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
      } catch { }
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
    setMmrConsultation({}); // ✅ clear on logout
    setMeningitisConsultation({}); // ✅ clear on logout
    setContraceptionConsultation({}); // ✅ clear on logout
    setEmployeeAppraisalConsultation(DEFAULT_EMPLOYEE_APPRAISAL); // ✅ clear on logout
    setStaffFileNoteConsultation(DEFAULT_STAFF_FILE_NOTE); // ✅ clear on logout
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
        staffList: CAREPLUS_STAFF_LIST,

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

        // ✅ Meningitis
        meningitisConsultation,
        setMeningitisConsultation,

        perioddelayConsultation,
        setPerioddelayConsultation,

        // ✅ Contraception
        contraceptionConsultation,
        setContraceptionConsultation,

        privatePrescriptionConsultation,
        setPrivatePrescriptionConsultation,

        employeeAppraisalConsultation,
        setEmployeeAppraisalConsultation,

        staffFileNoteConsultation,
        setStaffFileNoteConsultation,

        healthyLivingLogConsultation,
        setHealthyLivingLogConsultation,

        travelFollowUpOriginalData,
        setTravelFollowUpOriginalData,

        weightLossFollowupOriginalData,
        setWeightLossFollowupOriginalData,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export { AppCtx as AppContext };
