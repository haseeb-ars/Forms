import React from "react";
import "./WeightlossTemplate.css";

export default function WeightlossTemplate({ data }) {
  return (
    <div className="template weightloss-template">
      <h1>Weightloss Program Consent Form</h1>

      <section className="template-section">
        <h2>Patient Details</h2>
        <p><strong>Full Name:</strong> {data.fullName}</p>
        <p><strong>Date of Birth:</strong> {data.dob}</p>
        <p><strong>Contact Number:</strong> {data.telephone}</p>
        <p><strong>Address:</strong> {data.address}</p>
      </section>

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

      <section className="template-section">
        <h2>Medication Plan</h2>
        <p><strong>Medication:</strong> {data.medication}</p>
        <p><strong>Dosage:</strong> {data.dosage}</p>
        <p><strong>Start Date:</strong> {data.startDate}</p>
        <p><strong>Follow-up Date:</strong> {data.followUpDate}</p>
        <p><strong>Batch Number:</strong> {data.batchNumber}</p>
        <p><strong>Notes:</strong> {data.notes}</p>
      </section>

      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {data.signaturePatient ? (
            <img src={data.signaturePatient} alt="Patient Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>

        <div>
          <h3>Pharmacist Signature</h3>
          {data.pharmacistSignature ? (
            <img src={data.pharmacistSignature} alt="Pharmacist Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>
      </section>
    </div>
  );
}


