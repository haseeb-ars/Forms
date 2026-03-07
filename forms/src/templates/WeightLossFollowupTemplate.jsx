import React from "react";
import "./WeightlossTemplate.css"; // Reuse existing styles
import { useApp } from "../AppContext.jsx";

export default function WeightLossFollowupTemplate({ data = {} }) {
  const { weightLossFollowupOriginalData } = useApp();
  const safe = (v) => (v && v !== "" ? v : "—");

  const originalPatient = weightLossFollowupOriginalData?.patient_data || {};
  const originalMeds = weightLossFollowupOriginalData?.pharmacist_data || {};

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

      {/* Prior Medication details (From Original) */}
      <section className="template-section">
        <h2>Original Weight Loss Prescription</h2>
        <table className="template-table">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Date Started</th>
              <th>Batch</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{safe(originalMeds.medication)} {originalMeds.medication === "Other" ? `(${safe(originalMeds.otherMedication)})` : ""}</td>
              <td>{safe(originalMeds.dosage)}</td>
              <td>{safe(originalMeds.startDate)}</td>
              <td>{safe(originalMeds.batchNumber)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* New Medication Details (Current Follow-up) */}
      <section className="template-section" style={{ backgroundColor: "#fafafa", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <h2>Follow-up Dose (Current Session)</h2>
        <div className="grid grid--2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <p><strong>Dispensed Medication:</strong> {safe(data.medication)} {data.medication === "Other" ? `(${safe(data.otherMedication)})` : ""}</p>
          <p><strong>Strength:</strong> {safe(data.strength)}</p>
          <p><strong>Dose Number:</strong> {safe(data.doseNumber)}</p>
          <p><strong>Batch Number:</strong> {safe(data.batchNumber)}</p>
          <p><strong>Expiry Date:</strong> {safe(data.dateExpiry)}</p>
          <p><strong>Date Given:</strong> {safe(data.dateGiven)}</p>
          <p><strong>Prescriber Name:</strong> {safe(data.prescriberName)}</p>
          <p><strong>Prescriber Address:</strong> {safe(data.prescriberAddress)}</p>
        </div>
        <div style={{ marginTop: "16px" }}>
          <p><strong>Pharmacist Notes / Additional Comments:</strong><br />{safe(data.notes)}</p>
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
