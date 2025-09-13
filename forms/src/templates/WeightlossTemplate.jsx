import React from "react";
import "./WeightlossTemplate.css";
import { useApp } from "../AppContext";

export default function WeightlossTemplate({ data }) {

const { branch } = useApp();                // <— define branch
  const logoSrc = branch?.logo || `${process.env.PUBLIC_URL}/Logo3.png`; // fallback


  
  return (
    <div className="template weightloss-template">
      {/* Header */}
      <header className="template-header">
        <div className="logo">
        
<img src={logoSrc} alt="CarePlus Health" className="logo-img" />

        </div>
        <div className="form-meta">
          <p><strong>Weightloss Program Consent Form</strong></p>
        </div>
      </header>

      {/* Patient Details */}
      <section className="template-section two-column">
        <div>
          <p><strong>Full Name:</strong> {data.fullName}</p>
          <p><strong>Date of Birth:</strong> {data.dob}</p>
          <p><strong>Contact Number:</strong> {data.telephone}</p>
        </div>
        <div>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Address:</strong> {data.address}</p>
        </div>
      </section>

      {/* Measurements & History */}
      <section className="template-section">
        <h2>Measurements & History</h2>
        <p><strong>Height (cm):</strong> {data.heightCm}</p>
        <p><strong>Weight (kg):</strong> {data.weightKg}</p>
        <p><strong>BMI:</strong> {data.bmi}</p>
        <p><strong>Program Type:</strong> {data.programType}</p>
        <p><strong>Pregnancy Status:</strong> {data.pregnancyStatus}</p>
        <p><strong>Medical History:</strong> {data.medicalHistory}</p>
        <p><strong>Current Medications:</strong> {data.currentMedications}</p>
      </section>

      {/* Medication Plan */}
      <section className="template-section">
        <h2>Medication Plan</h2>
        <p><strong>Medication:</strong> {data.medication}</p>
        <p><strong>Dosage:</strong> {data.dosage}</p>
        <p><strong>Start Date:</strong> {data.startDate}</p>
        <p><strong>Follow-up Date:</strong> {data.followUpDate}</p>
        <p><strong>Batch Number:</strong> {data.batchNumber}</p>
        <p><strong>Notes:</strong> {data.notes}</p>
      </section>

      {/* Consent */}
      <section className="template-section consent">
        <p>
          I consent to participate in the weightloss program. I understand the potential risks,
          benefits, and alternatives. I confirm that the information provided is accurate to the best
          of my knowledge and that I have discussed this treatment with my pharmacist.
        </p>
      </section>

      {/* Signatures */}
      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {data.signaturePatient ? (
            <img src={data.signaturePatient} alt="Patient Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">Signature</div>
          )}
        </div>

        <div>
          <h3>Pharmacist Signature</h3>
          {data.pharmacistSignature ? (
            <img src={data.pharmacistSignature} alt="Pharmacist Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">Signature</div>
          )}
        </div>
      </section>
    </div>
  );
}
