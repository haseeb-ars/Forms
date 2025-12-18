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
    { name: "reasonB12", label: "Reason for B12 Injection", type: "textarea", span: true },

    // Missing patient fields
    { name: "gpName", label: "GP Name", type: "text" },
    { name: "gpAddress", label: "GP Address", type: "text", span: true },
    { name: "emergencyContact", label: "Emergency Contact Name", type: "text" },
    { name: "emergencyPhone", label: "Emergency Contact Number", type: "text" },
    { name: "signaturePatient", label: "Patient Signature", type: "signature" },
    { name: "dateSignedPatient", label: "Date Signed by Patient", type: "date" }
  ],
  pharmacistFields: [
    { name: "drug", label: "Drug", type: "text" },
    { name: "dose", label: "Dose", type: "text" }, // new
    { name: "quantity", label: "Quantity", type: "text" }, // new
    { name: "injectionType", label: "Injection Type", type: "select", options: ["IM", "SC"] },
    { name: "route", label: "Injection Site (Route)", type: "select", options: ["Left Arm", "Right Arm", "Left Thigh", "Right Thigh"] },
    { name: "manufacturer", label: "Manufacturer", type: "text" },
    { name: "batchNumber", label: "Batch Number", type: "text" },
    { name: "expiry", label: "Expiry", type: "date" },
    { name: "adverseReactions", label: "Adverse Reactions", type: "text" },
    { name: "datePharm", label: "Date Given", type: "date" },

    // Missing pharmacist fields
    { name: "pharmacistName", label: "Pharmacist Name", type: "text" },
    { name: "pharmacistGPhC", label: "Pharmacist GPhC", type: "text" },
    { name: "pharmacistSignature", label: "Pharmacist Signature", type: "signature" },
    { name: "prescriber", label: "Prescriber Name", type: "text" },
    { name: "prescriberGPhC", label: "Prescriber GPhC", type: "text" },
    { name: "prescriberSignature", label: "Prescriber Signature", type: "signature" }
  ],
  template: "B12Template"
},
{
  id: "weightloss",
  name: "Weight Loss",
  color: "#f97316",

  patientFields: [
    { name: "fullName", label: "Full Name", type: "text" },
    { name: "dob", label: "Date of Birth", type: "date" },
    { name: "telephone", label: "Contact Number", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "address", label: "Address", type: "text", span: true },
    { name: "surgery", label: "Surgery Name", type: "text" },

    // Lifestyle + program-level inputs
    
    
    {
      name: "followUpPreference",
      label: "Preferred Follow-up Method",
      type: "select",
      options: ["In-person", "Video Call", "Phone Call", "Email"]
    },
    {
      name: "additionalNotes",
      label: "Additional Notes",
      type: "textarea",
      span: true
    }
  ],

  pharmacistFields: [
       {
      name: "medication",
      label: "Dispensed Medication",
      type: "select",
      options: [
        "Wegovy (Semaglutide)",
        "Ozempic (Semaglutide)",
        "Mounjaro (Tirzepatide)",
        "Saxenda (Liraglutide)",
        "Rybelsus (Semaglutide Oral)",
        "Trulicity (Dulaglutide)",
        "Other"
      ]
    },
    {
      name: "otherMedication",
      label: "If Other, Specify Medication",
      type: "text",
      conditional: { field: "medication", value: "Other" } // optional if your form renderer supports it
    },

    {
      name: "dosage",
      label: "Dosage",
      type: "text"
    },
    {
      name: "startDate",
      label: "Start Date",
      type: "date"
    },
    {
      name: "followUpDate",
      label: "Follow-up Date",
      type: "date"
    },
    {
      name: "batchNumber",
      label: "Batch Number",
      type: "text"
    },
    {
      name: "prescriberType",
      label: "Prescriber Type",
      type: "select",
      options: [
        "GP",
        "Pharmacist Independent Prescriber",
        "Nurse Prescriber",
        "Doctor (Specialist)",
        "Other"
      ]
    },
     {
      name: "prescriberName",
      label: "Prescriber Name",
      type: "text"
    },
     {
      name: "GPHCnumber",
      label: "GPHC Number",
      type: "text"
    },
    {
      name: "notes",
      label: "Pharmacist Notes",
      type: "textarea",
      span: true
    }
  ],

  template: "WeightLossTemplate"
}
,
{
  id: "weightlossFollowup",
  name: "Weight Loss Followup",
  color: "#F03D1A",

  patientFields: [
    { name: "fullName", label: "Full Name", type: "text" },
    { name: "dob", label: "Date of Birth", type: "date" },
    { name: "telephone", label: "Contact Number", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "address", label: "Address", type: "text", span: true },
    { name: "surgery", label: "Surgery Name", type: "text" },

    // Lifestyle + program-level inputs
    
    
    {
      name: "followUpPreference",
      label: "Preferred Follow-up Method",
      type: "select",
      options: ["In-person", "Video Call", "Phone Call", "Email"]
    },
    {
      name: "additionalNotes",
      label: "Additional Notes",
      type: "textarea",
      span: true
    }
  ],

  pharmacistFields: [
       {
      name: "medication",
      label: "Dispensed Medication",
      type: "select",
      options: [
        "Wegovy (Semaglutide)",
        "Ozempic (Semaglutide)",
        "Mounjaro (Tirzepatide)",
        "Saxenda (Liraglutide)",
        "Rybelsus (Semaglutide Oral)",
        "Trulicity (Dulaglutide)",
        "Other"
      ]
    },
    {
      name: "otherMedication",
      label: "If Other, Specify Medication",
      type: "text",
      conditional: { field: "medication", value: "Other" } // optional if your form renderer supports it
    },

    {
      name: "dosage",
      label: "Dosage",
      type: "text"
    },
    {
      name: "startDate",
      label: "Start Date",
      type: "date"
    },
    {
      name: "followUpDate",
      label: "Follow-up Date",
      type: "date"
    },
    {
      name: "batchNumber",
      label: "Batch Number",
      type: "text"
    },
    {
      name: "prescriberType",
      label: "Prescriber Type",
      type: "select",
      options: [
        "GP",
        "Pharmacist Independent Prescriber",
        "Nurse Prescriber",
        "Doctor (Specialist)",
        "Other"
      ]
    },
     {
      name: "prescriberName",
      label: "Prescriber Name",
      type: "text"
    },
     {
      name: "GPHCnumber",
      label: "GPHC Number",
      type: "text"
    },
    {
      name: "notes",
      label: "Pharmacist Notes",
      type: "textarea",
      span: true
    }
  ],

  template: "WeightLossFollowupTemplate"
}
,
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
      { name: "pregnant", label: "Pregnant", type: "select", options: ["Yes", "No"] },
       { name: "surgery", label: "Surgery Name", type: "text" },

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
      { name: "surgeryName", label: "Surgery Name", type: "text" },
      { name: "nhsNumber", label: "NHS Number", type: "text" },
      { name: "allergies", label: "Allergies", type: "textarea", span: true },
      { name: "hadCovid", label: "Had Covid Vaccine Before", type: "select", options: ["Yes", "No"] },
      { name: "previousDoses", label: "Previous Vaccine Doses", type: "select", options: ["0", "1", "2", "3", "4+"] },
      { name: "symptomsToday", label: "Any symptoms today?", type: "select", options: ["No", "Yes"] }
    ],
    pharmacistFields: [
      { name: "vaccineBrand", label: "Vaccine Brand", type: "text" },
      { name: "doseNumber", label: "Dose Number", type: "select", options: ["1", "2", "3", "Booster"] },
      { name: "dateGiven", label: "Date Given", type: "date" },
      { name: "dateExpiry", label: "Expiry Date", type: "date" },
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
    { name: "telephone", label: "Contact Number", type: "text" },
    { name: "address", label: "Address", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "surgery", label: "Surgery Name", type: "text" },
  ],
  pharmacistFields: [
     {
      name: "prescriberType",
      label: "Prescriber Type",
      type: "select",
      options: [
        "Doctor",
        "Independent Prescribing Pharmacist ",
        "Independent Prescribing Nurse"
      ]
    },
    { name: "Prescriber", label: "Prescriber's Name", type: "text" },
    { name: "prescriberGPhC", label: "GPHC Number", type: "text" },

    // ✅ Keep vaccine repeater (administered)
    { name: "vaccines" ,label: "Vaccinations Administered", type: "vaccineRepeater" },

    // ✅ Malaria fields
    {
      name: "malariaGiven",
      label: "Was malaria medication given?",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "malariaNotes",
      label: "Malaria Notes",
      type: "textarea",
      span: true,
      showIf: { field: "malariaGiven", equals: "Yes" },
    },
    {
      name: "malariaVaccines",
      label: "Vaccinations Administered (Malaria)",
      type: "vaccineRepeater",
      showIf: { field: "malariaGiven", equals: "Yes" },
    },
  ],
  template: "TravelTemplate",
},

{
  id: "privateprescription",
  name: "Private Prescription",
  color: "#8B5CF6",
  pharmacistFields: [
    {
      name: "prescriberType",
      label: "Prescriber Type",
      type: "select",
      options: [
        "Doctor",
        "Independent Prescribing Pharmacist ",
        "Independent Prescribing Nurse"
      ]
    },
    
    { name: "prescriberName", label: "Prescriber's Name", type: "text" },
    { name: "prescriberGPhC", label: "GPHC Number", type: "text" },

    // ✅ Keep vaccine repeater (administered)
     { name: "prescribedDrugs", label: "Drugs prescribed", type: "drugRepeater" },
  ],
  patientFields: [
    { label: "Full Name", name: "fullName", type: "text" },
    { label: "Date of Birth", name: "dob", type: "date" },
    { label: "Address", name: "address", type: "text" },
    { name: "surgeryName", label: "Surgery Name", type: "text" },
    { label: "Contact Number", name: "telephone", type: "text" },
    { label: "Email", name: "email", type: "email" },
  ],
},

{
  id: "followupprescription",
  name: "Follow-up Prescription",
  color: "#ff006e",
  pharmacistFields: [
    {
      name: "prescriberType",
      label: "Prescriber Type",
      type: "select",
      options: [
        "Doctor",
        "Independent Prescribing Pharmacist ",
        "Independent Prescribing Nurse"
      ]
    },
    
    { name: "prescriberName", label: "Prescriber's Name", type: "text" },
    { name: "prescriberGPhC", label: "GPHC Number", type: "text" },

    // ✅ Keep vaccine repeater (administered)
     { name: "prescribedDrugs", label: "Drugs prescribed", type: "drugRepeater" },
  ],
  patientFields: [
    { label: "Full Name", name: "fullName", type: "text" },
    { label: "Date of Birth", name: "dob", type: "date" },
    { label: "Address", name: "address", type: "text" },
    { name: "surgeryName", label: "Surgery Name", type: "text" },
    { label: "Contact Number", name: "telephone", type: "text" },
    { label: "Email", name: "email", type: "email" },
  ],
}


];

