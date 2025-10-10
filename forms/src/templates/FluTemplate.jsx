import React from "react";
import "./FluTemplate.css";

export default function FluTemplate({ data }) {
  return (
    <div className="template flu-template">
      <img src="/Logo3.png" alt="CarePlus Logo" width={280} />

      <h1>Flu Vaccination Consent Form</h1>

      <section className="template-section">
        <h2>Patient Details</h2>
        <p><strong>Full Name:</strong> {data.fullName}</p>
        <p><strong>Date of Birth:</strong> {data.dob}</p>
        <p><strong>Contact Number:</strong> {data.telephone}</p>
        <p><strong>Address:</strong> {data.address}</p>
        <p><strong>Surgery Name:</strong> {data.surgery}</p>
      </section>

      <section className="template-section">
        <h2>Medical History</h2>
        <p><strong>Allergies:</strong> {data.allergies}</p>
        <p><strong>Chronic Conditions:</strong> {data.conditions}</p>
        <p><strong>Pregnant:</strong> {data.pregnant}</p>
      </section>

      <section className="template-section">
        <h2>Vaccination Details</h2>
        <p><strong>Vaccine Brand:</strong> {data.vaccineBrand}</p>
        <p><strong>Date Given:</strong> {data.dateGiven}</p>
        <p><strong>Batch Number:</strong> {data.batchNumber}</p>
      </section>

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
            <div className="signature-placeholder">No signature provided</div>
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
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>
      </section>
    </div>
  );
}
