import React from "react";
import "./WeightlossTemplate.css"; // Reuse existing styles
import { useApp } from "../AppContext.jsx";

export default function WeightLossFollowupTemplate({ data = {} }) {
  const context = useApp();
  const safe = (v) => (v && v !== "" ? v : "—");

  // 🧩 Data Sourcing: Prioritize props (for PDFs/DB), fallback to context (for live previews)
  const originalPatient = (data.originalPatient) ? data.originalPatient : context.weightLossFollowupOriginalData?.patient_data || {};
  const originalMeds = (data.originalMeds) ? data.originalMeds : context.weightLossFollowupOriginalData?.pharmacist_data || {};


  return (
    <div className="template weightloss-template">
      {/* Header */}
      <header className="template-header">
        <div className="logo">
          <img src="/Logo3.png" alt="CarePlus Logo" className="logo" />
        </div>
        <div className="form-meta">
          <h1>Weight Loss Follow-up Prescription</h1>
        </div>
      </header>

      {/* Patient Details (From Original) */}
      <section className="template-section two-column">
        <div>
          <h2>Patient Details</h2>
          <p><strong>Full Name:</strong> {safe(originalPatient.fullName || data.name)}</p>
          <p><strong>Date of Birth:</strong> {safe(originalPatient.dob || data.dob)}</p>
          <p><strong>Contact Number:</strong> {safe(originalPatient.telephone || data.telephone)}</p>
        </div>
        <div>
          <h2 style={{ color: "transparent" }}>_</h2>
          <p><strong>Email:</strong> {safe(originalPatient.email || data.email)}</p>
          <p><strong>Address:</strong> {safe(originalPatient.address || data.address)}</p>
          <p><strong>Surgery:</strong> {safe(originalPatient.surgery || data.surgery)}</p>
        </div>
      </section>

      {/* A. PREVIOUS MEDICATION DETAILS (Historical) */}
      <section className="template-section">
        <h2 className="section-title" style={{ color: "#4b5563" }}>A. Previous Medication Details</h2>
        <table className="template-table">
          <thead>
            <tr>
              <th>Previous Medication</th>
              <th>Previous Dose</th>
              <th>Original Start Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{safe(originalMeds.medication)} {originalMeds.medication === "Other" ? `(${safe(originalMeds.otherMedication)})` : ""}</td>
              <td>{safe(originalMeds.dosage)}</td>
              <td>{safe(originalMeds.startDate)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* B. CURRENT FOLLOW-UP MEDICATION DETAILS (New) */}
      <section className="template-section current-followup" style={{ border: "2px solid #F03D1A", padding: "16px", borderRadius: "8px", background: "#fffaf0" }}>
        <h2 className="section-title" style={{ color: "#F03D1A" }}>B. Current Follow-Up Medication Details (Newly Supplied)</h2>
        <div className="grid grid--2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <p><strong>New Medication:</strong> {safe(data.medication)} {data.medication === "Other" ? `(${safe(data.otherMedication)})` : ""}</p>
          <p><strong>New Dose/Strength:</strong> {safe(data.strength)}</p>
          <p><strong>Quantity Supplied:</strong> {safe(data.quantity)}</p>
          <p><strong>Dose/Month Number:</strong> {safe(data.doseNumber)}</p>
          <p><strong>Batch Number:</strong> {safe(data.batchNumber)}</p>
          <p><strong>Expiry Date:</strong> {safe(data.dateExpiry)}</p>
          <p><strong>Date Supplied:</strong> {safe(data.dateGiven || new Date().toISOString().split("T")[0])}</p>
          <p><strong>Prescriber:</strong> {safe(data.prescriberName)}</p>
        </div>
        <div style={{ marginTop: "16px", padding: "10px", background: "#fff", border: "1px solid #fed7aa", borderRadius: "5px" }}>
          <p><strong>Follow-up Clinical Notes:</strong><br />{safe(data.notes)}</p>
        </div>
      </section>

      {/* Consent Text */}
      <section className="template-section consent">
        <p>
          I consent to continue treatment in the weight loss follow-up program. I understand the
          medication, its potential risks and benefits, and have had the opportunity to ask
          questions. I confirm that the information provided is accurate to the best of my
          knowledge.
        </p>
      </section>

      {/* Signatures */}
      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {data.signaturePatient ? (
            <img
              src={data.signaturePatient}
              alt="Patient Signature"
              className="signature-img"
            />
          ) : (
            <div className="signature-placeholder">Signature</div>
          )}
        </div>

        <div>
          <h3>Pharmacist Signature</h3>
          {data.pharmacistSignature ? (
            <img
              src={data.pharmacistSignature}
              alt="Pharmacist Signature"
              className="signature-img"
            />
          ) : (
            <div className="signature-placeholder">Signature</div>
          )}
        </div>
      </section>
    </div>
  );
}
