import React from "react";
import "./WeightlossTemplate.css";
import { useApp } from "../AppContext.jsx";

export default function WeightlossTemplate({ data = {}, serviceId }) {
  const { weightLossFollowupOriginalData } = useApp();
  const f = serviceId === "weightlossFollowup"
    ? {
      ...(weightLossFollowupOriginalData?.patient_data || {}),
      ...(weightLossFollowupOriginalData?.consultation_data || {}),
      ...(weightLossFollowupOriginalData?.pharmacist_data || {})
    }
    : data;
  const safe = (v) => (v !== undefined && v !== null && String(v).trim() !== "" ? v : "—");

  // Build display strings from either unit set
  const getHeightDisplay = () => {
    const cm = f.heightCm;
    const feet = f.heightFeet;
    const inches = f.heightInches;

    // Prefer cm if present
    if (cm !== undefined && cm !== null && String(cm).trim() !== "") {
      return `${safe(cm)} cm`;
    }

    // Otherwise show feet/inches if present
    const hasFeet = feet !== undefined && feet !== null && String(feet).trim() !== "";
    const hasInches = inches !== undefined && inches !== null && String(inches).trim() !== "";

    if (hasFeet || hasInches) {
      return `${hasFeet ? safe(feet) : "—"} ft ${hasInches ? safe(inches) : "—"} in`;
    }

    return "—";
  };

  const getWeightDisplay = () => {
    const kg = f.weightKg;
    const stones = f.weightStones;
    const pounds = f.weightPounds;

    // Prefer kg if present
    if (kg !== undefined && kg !== null && String(kg).trim() !== "") {
      return `${safe(kg)} kg`;
    }

    // Otherwise show stones/pounds if present
    const hasStones = stones !== undefined && stones !== null && String(stones).trim() !== "";
    const hasPounds = pounds !== undefined && pounds !== null && String(pounds).trim() !== "";

    if (hasStones || hasPounds) {
      return `${hasStones ? safe(stones) : "—"} st ${hasPounds ? safe(pounds) : "—"} lb`;
    }

    return "—";
  };

  return (
    <div className="template weightloss-template">
      {/* Header */}
      <header className="template-header">
        <div className="logo">
          <img src="/Logo3.png" alt="CarePlus Logo" className="logo" />
        </div>
        <div className="form-meta">
          <h1>Weight Loss Program Consent Form</h1>
        </div>
      </header>

      {/* Patient Details */}
      <section className="template-section two-column">
        <div>
          <p><strong>Full Name:</strong> {safe(f.fullName)}</p>
          <p><strong>Date of Birth:</strong> {safe(f.dob)}</p>
          <p><strong>Contact Number:</strong> {safe(f.telephone)}</p>
          <p><strong>Email:</strong> {safe(f.email)}</p>
        </div>
        <div>
          <p><strong>Address:</strong> {safe(f.address)}</p>
          <p><strong>Surgery:</strong> {safe(f.surgery)}</p>
          <p><strong>Preferred Follow-Up:</strong> {safe(f.followUpPreference)}</p>
        </div>
      </section>

      {/* Measurements */}
      <section className="template-section">
        <h2>Measurements</h2>
        <p><strong>Height:</strong> {getHeightDisplay()}</p>
        <p><strong>Weight:</strong> {getWeightDisplay()}</p>
        <p><strong>BMI:</strong> {safe(f.bmi)}</p>
      </section>

      {/* Medication Plan */}
      <section className="template-section">
        {serviceId === "weightlossFollowup" ? (
          <>
            <h2>Original Medication Plan</h2>
            <p><strong>Medication:</strong> {safe(f.medication)}</p>
            {f.medication === "Other" && (
              <p><strong>Specified Medication:</strong> {safe(f.otherMedication)}</p>
            )}
            <p><strong>Dosage:</strong> {safe(f.dosage)}</p>
            <p><strong>Start Date:</strong> {safe(f.startDate)}</p>
            <p><strong>Batch Number:</strong> {safe(f.batchNumber)}</p>

            <h2 style={{ marginTop: "16px" }}>Follow-Up Medication Plan (Current Session)</h2>
            <p><strong>Dispensed Medication:</strong> {safe(data.medication)}</p>
            {data.medication === "Other" && (
              <p><strong>Specified Medication:</strong> {safe(data.otherMedication)}</p>
            )}
            <p><strong>Strength:</strong> {safe(data.strength)}</p>
            <p><strong>Dose Number:</strong> {safe(data.doseNumber)}</p>
            <p><strong>Date Given:</strong> {safe(data.dateGiven)}</p>
            <p><strong>Batch Number:</strong> {safe(data.batchNumber)}</p>
            <p><strong>Expiry Date:</strong> {safe(data.dateExpiry)}</p>
          </>
        ) : (
          <>
            <h2>Medication Plan</h2>
            <p><strong>Medication:</strong> {safe(f.medication)}</p>
            {f.medication === "Other" && (
              <p><strong>Specified Medication:</strong> {safe(f.otherMedication)}</p>
            )}
            <p><strong>Dosage:</strong> {safe(f.dosage)}</p>
            <p><strong>Start Date:</strong> {safe(f.startDate)}</p>
            <p><strong>Follow-up Date:</strong> {safe(f.followUpDate)}</p>
            <p><strong>Batch Number:</strong> {safe(f.batchNumber)}</p>
          </>
        )}
      </section>

      {/* Prescriber Info */}
      <section className="template-section">
        <h2>Prescriber Details</h2>
        <p><strong>Prescriber Type:</strong> {safe(f.prescriberType)}</p>
        <p><strong>Prescriber Name:</strong> {safe(f.prescriberName)}</p>
        <p><strong>GPhC Number:</strong> {safe(f.GPHCnumber)}</p>
      </section>

      {/* Pharmacist Notes */}
      {f.notes && (
        <section className="template-section">
          <h2>Pharmacist Notes</h2>
          <p>{f.notes}</p>
        </section>
      )}

      {/* Consent */}
      <section className="template-section consent">
        <p>
          I consent to participate in the weight loss program. I understand the potential risks,
          benefits, and alternatives. I confirm that the information provided is accurate to the best
          of my knowledge and that I have discussed this treatment with my pharmacist.
        </p>
      </section>

      {/* Signatures */}
      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {f.signaturePatient ? (
            <img src={f.signaturePatient} alt="Patient Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">Signature</div>
          )}
        </div>

        <div>
          <h3>Pharmacist Signature</h3>
          {f.pharmacistSignature ? (
            <img src={f.pharmacistSignature} alt="Pharmacist Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">Signature</div>
          )}
        </div>
      </section>
    </div>
  );
}
