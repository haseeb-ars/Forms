import React from "react";
import "./EarwaxTemplate.css";

export default function EarwaxTemplate({ data }) {
  return (
    <div className="template earwax-template">
      <img src="/Logo3.png" alt="CarePlus Logo" width={300} />
      <h1>Earwax Removal Consent Form</h1>

      <section className="template-section">
        <h2>Patient Details</h2>
        <p><strong>Full Name:</strong> {data.fullName}</p>
        <p><strong>Date of Birth:</strong> {data.dob}</p>
        <p><strong>Contact Number:</strong> {data.telephone}</p>
        <p><strong>Address:</strong> {data.address}</p>
      </section>

      <section className="template-section">
        <h2>Symptoms & History</h2>
        <p><strong>Symptoms:</strong> {data.symptoms}</p>
        <p><strong>Affected Ear:</strong> {data.affectedEar}</p>
        <p><strong>Contraindications:</strong> {data.contraindications}</p>
        <p><strong>Previous Ear Surgery:</strong> {data.previousEarSurgery}</p>
        <p><strong>Pain Level (0-10):</strong> {data.painLevel}</p>
      </section>

      <section className="template-section">
        <h2>Procedure Details</h2>
        <p><strong>Procedure Type:</strong> {data.procedureType}</p>
        <p><strong>Ear Treated:</strong> {data.earTreated}</p>
        <p><strong>Findings:</strong> {data.findings}</p>
        <p><strong>Outcome:</strong> {data.outcome}</p>
        <p><strong>Complications:</strong> {data.complications}</p>
        <p><strong>Advice Given:</strong> {data.adviceGiven}</p>
        <p><strong>Date:</strong> {data.dateGiven}</p>
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


