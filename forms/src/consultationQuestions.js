// src/consultationQuestions.js
export const consultationQuestions = {
  earwax: [
    { id: "pain", text: "Are you experiencing ear pain?", type: "yesno" },
    { id: "discharge", text: "Is there any ear discharge?", type: "yesno" },
    { id: "hearingLoss", text: "Do you have hearing loss?", type: "yesno" },
    { id: "previousTreatment", text: "Have you had earwax removal before?", type: "yesno" },
    { id: "otherIssues", text: "Do you have any other ear-related problems?", type: "text" },
  ],

  flu: [
    {
      id: "fever",
      text: "Have you had a high fever or temperature in the last 24 hours?",
      type: "yesno",
    },
    {
      id: "allergies",
      text: "Do you have any allergies?",
      type: "yesno",
    },
    {
      id: "vaccineReaction",
      text: "Have you ever had an allergic or anaphylactic reaction to a vaccine before?",
      type: "yesno",
    },
    {
      id: "bleedingDisorder",
      text: "Do you have a bleeding disorder, including taking any medication that thins your blood (anticoagulants)?",
      type: "yesno",
    },
    {
      id: "currentMeds",
      text: "Are you currently taking any medication (over the counter or prescription)?",
      type: "yesno",
    },
    {
      id: "clinicalRiskGroups",
      text: "Please tick if any of the below clinical risk groups apply:",
      type: "checkbox",
      options: [
        "Chronic respiratory disease",
        "Chronic liver disease",
        "Chronic heart disease",
        "Chronic renal disease",
        "BMI 40 or above",
        "Diabetes",
        "Chronic neurological disease (excluding stroke/transient ischaemic attack)",
        "Immunosuppression",
        "Asplenia or dysfunction of the spleen",
        "None of the above",
      ],
    },
    {
      id: "previousFluVaccine",
      text: "Have you already had a flu vaccine for this flu season?",
      type: "yesno",
    },
    {
      id: "otherGroups",
      text: "Please tick if any of the following apply:",
      type: "checkbox",
      options: [
        "Carer",
        "Social care worker",
        "Hospice worker",
        "Close contact of an immunocompromised person",
        "Person in a long-stay residential home",
        "None of the above",
      ],
    },
  ],

  covid: [
    { id: "fever", text: "Do you currently have a fever or symptoms of illness?", type: "yesno" },
    { id: "recentInfection", text: "Have you tested positive for COVID-19 in the last 4 weeks?", type: "yesno" },
    { id: "previousDose", text: "Have you received any COVID-19 vaccine before?", type: "yesno" },
    { id: "allergies", text: "Do you have any severe allergies?", type: "yesno" },
    { id: "pregnant", text: "Are you pregnant or breastfeeding?", type: "yesno" },
  ],

  b12: [
    { id: "deficiencyDiagnosed", text: "Has a B12 deficiency been formally diagnosed?", type: "yesno" },
    { id: "previousInjection", text: "Have you had B12 injections before?", type: "yesno" },
    { id: "pregnant", text: "Are you pregnant or breastfeeding?", type: "yesno" },
    { id: "allergies", text: "Do you have any allergies?", type: "yesno" },
    { id: "medications", text: "Are you currently taking any medications?", type: "text" },
  ],
  privateprescription: [
    {
      id: "presentingComplaint",
      text: "Presenting Complaint",
      type: "textarea",
    },
    {
      id: "medicationHistory",
      text: "Medication History",
      type: "textarea",
    },
    {
      id: "allergies",
      text: "Allergies",
      type: "textarea",
    },
  ],
};
