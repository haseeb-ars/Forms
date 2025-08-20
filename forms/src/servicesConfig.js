// src/servicesConfig.js
export const services = [
  {
    id: "b12",
    name: "B12 Injection",
    color: "#FFD166",
    patientFields: [
      { name: "fullName", label: "Full Name", type: "text" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "telephone", label: "Contact Number", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "address", label: "Address", type: "text", span: true },
      { name: "reasonB12", label: "Reason for B12 Injection", type: "textarea", span: true }
    ],
    pharmacistFields: [
      { name: "drug", label: "Drug", type: "text" },
      { name: "route", label: "Injection Site (Route)", type: "text" },
      { name: "manufacturer", label: "Manufacturer", type: "text" },
      { name: "batchAndExpiry", label: "Batch Number & Expiry", type: "text" },
      { name: "adverseReactions", label: "Adverse Reactions", type: "text" },
      { name: "datePharm", label: "Date Given", type: "date" }
    ],
    template: "B12Template"
  },
  {
    id: "weightloss",
    name: "Weightloss",
    color: "#f97316",
    patientFields: [
      { name: "fullName", label: "Full Name", type: "text" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "telephone", label: "Contact Number", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "address", label: "Address", type: "text", span: true },
      { name: "heightCm", label: "Height (cm)", type: "number" },
      { name: "weightKg", label: "Weight (kg)", type: "number" },
      { name: "bmi", label: "BMI", type: "text" },
      { name: "medicalHistory", label: "Medical History", type: "textarea", span: true },
      { name: "currentMedications", label: "Current Medications", type: "textarea", span: true },
      { name: "programType", label: "Program Type", type: "select", options: ["Semaglutide", "Tirzepatide", "Other"] },
      { name: "pregnancyStatus", label: "Pregnancy Status", type: "select", options: ["N/A", "Pregnant", "Planning Pregnancy"] }
    ],
    pharmacistFields: [
      { name: "medication", label: "Medication", type: "text" },
      { name: "dosage", label: "Dosage", type: "text" },
      { name: "startDate", label: "Start Date", type: "date" },
      { name: "followUpDate", label: "Follow-up Date", type: "date" },
      { name: "batchNumber", label: "Batch Number", type: "text" },
      { name: "notes", label: "Notes", type: "textarea", span: true }
    ],
    template: "WeightlossTemplate"
  },
  {
    id: "earwax",
    name: "Earwax",
    color: "#22c55e",
    patientFields: [
      { name: "fullName", label: "Full Name", type: "text" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "telephone", label: "Contact Number", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "address", label: "Address", type: "text", span: true },
      { name: "postcode", label: "Post Code", type: "text" },
      // Referral letter specific
      { name: "appointmentDate", label: "Date of appointment", type: "date" },
      { name: "gpName", label: "GP Name", type: "text" },
      { name: "gpAddress", label: "GP Address", type: "textarea", span: true },
      { name: "clinicianName", label: "Clinician Name", type: "text" },
      { name: "clinicAddress", label: "Clinic Address", type: "textarea", span: true },
      { name: "companyName", label: "Company Name", type: "text" },
      { name: "entImage", label: "Endoscope/Ear camera image", type: "image" },
      // Consent questionnaire
      { name: "qBalanceIssues", label: "Balance problems or vertigo attacks?", type: "select", options: ["Yes", "No"] },
      { name: "qRecentVertigo", label: "Vertigo attack within last 30 days?", type: "select", options: ["Yes", "No"] },
      { name: "qEarPain", label: "Ear pain within last 30 days?", type: "select", options: ["Yes", "No"] },
      { name: "qPerforated", label: "Perforated ear drum?", type: "select", options: ["Yes", "No"] },
      { name: "qPerforatedEar", label: "If yes, which ear?", type: "select", options: ["Left", "Right", "Both"] },
      { name: "qPerforatedYears", label: "If yes, how long ago (years)", type: "number" },
      { name: "qPerforatedMonths", label: "If yes, how long ago (months)", type: "number" },
      { name: "qTriedYourself", label: "Tried to remove wax yourself?", type: "select", options: ["Yes", "No"] },
      { name: "qPreviousOperations", label: "Previous ENT operations?", type: "select", options: ["Yes", "No"] },
      { name: "qOperationEar", label: "If yes, which ear?", type: "select", options: ["Left", "Right", "Both"] },
      { name: "qOperationYears", label: "If yes, how long ago (years)", type: "number" },
      { name: "qOperationMonths", label: "If yes, how long ago (months)", type: "number" },
      { name: "qUnderENT", label: "Under an ENT consultant now?", type: "select", options: ["Yes", "No"] },
      { name: "qAnticoagulants", label: "Using anticoagulants (e.g. Warfarin)?", type: "select", options: ["Yes", "No"] },
      { name: "qAnyReason", label: "Any reason not to proceed with micro suction?", type: "select", options: ["Yes", "No"] },
      { name: "qWaxRemovedBefore", label: "Had wax removed previously?", type: "select", options: ["Yes", "No"] },
      { name: "qCottonBuds", label: "Do you use cotton buds?", type: "select", options: ["Yes", "No"] }
    ],
    pharmacistFields: [
      { name: "procedureType", label: "Procedure Type", type: "select", options: ["Microsuction", "Irrigation", "Manual Removal"] },
      { name: "earTreated", label: "Ear Treated", type: "select", options: ["Left", "Right", "Both"] },
      { name: "findings", label: "Findings", type: "textarea", span: true },
      { name: "outcome", label: "Outcome", type: "select", options: ["Successful", "Partial", "Unsuccessful"] },
      { name: "complications", label: "Complications", type: "textarea", span: true },
      { name: "adviceGiven", label: "Advice Given", type: "textarea", span: true },
      { name: "dateGiven", label: "Date", type: "date" }
    ],
    template: "EarwaxTemplate"
  },
  {
    id: "flu",
    name: "Flu Vaccine",
    color: "#06D6A0",
    patientFields: [
      { name: "fullName", label: "Full Name", type: "text" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "telephone", label: "Contact Number", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "address", label: "Address", type: "text", span: true },
      { name: "allergies", label: "Allergies", type: "textarea", span: true },
      { name: "conditions", label: "Chronic Conditions", type: "textarea", span: true },
      { name: "pregnant", label: "Pregnant", type: "select", options: ["Yes", "No"] }
    ],
    pharmacistFields: [
      { name: "vaccineBrand", label: "Vaccine Brand", type: "text" },
      { name: "dateGiven", label: "Date Given", type: "date" },
      { name: "batchNumber", label: "Batch Number", type: "text" }
    ],
    template: "FluTemplate"
  },
  {
    id: "covid",
    name: "Covid Vaccine",
    color: "#2563eb",
    patientFields: [
      { name: "fullName", label: "Full Name", type: "text" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "telephone", label: "Contact Number", type: "text" },
      { name: "address", label: "Address", type: "text", span: true },
      { name: "nhsNumber", label: "NHS Number", type: "text" },
      { name: "allergies", label: "Allergies", type: "textarea", span: true },
      { name: "hadCovid", label: "Had Covid Before", type: "select", options: ["Yes", "No"] },
      { name: "previousDoses", label: "Previous Vaccine Doses", type: "select", options: ["0", "1", "2", "3", "4+"] },
      { name: "symptomsToday", label: "Any symptoms today?", type: "select", options: ["No", "Yes"] }
    ],
    pharmacistFields: [
      { name: "vaccineBrand", label: "Vaccine Brand", type: "text" },
      { name: "doseNumber", label: "Dose Number", type: "select", options: ["1", "2", "3", "Booster"] },
      { name: "dateGiven", label: "Date Given", type: "date" },
      { name: "batchNumber", label: "Batch Number", type: "text" },
      { name: "site", label: "Injection Site", type: "text" }
    ],
    template: "CovidTemplate"
  },
  {
    id: "travel",
    name: "Travel Clinic",
    color: "#118AB2",
    patientFields: [
      { name: "fullName", label: "Full Name", type: "text" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "passportNumber", label: "Passport Number", type: "text" },
      { name: "telephone", label: "Contact Number", type: "text" },
      { name: "email", label: "Email", type: "email" }
    ],
    pharmacistFields: [
      { name: "destinationCountry", label: "Destination Country", type: "text" },
      { name: "travelDate", label: "Travel Date", type: "date" },
      { name: "purpose", label: "Purpose of Travel", type: "text" },
      { name: "conditions", label: "Existing Conditions", type: "textarea", span: true },
      { name: "allergies", label: "Allergies", type: "textarea", span: true },
      { name: "vaccinations", label: "Required Vaccinations", type: "textarea", span: true }
    ],
    template: "TravelTemplate"
  }
];

