// src/templates/ContraceptionTemplate.jsx
import React from "react";
import "./CovidTemplate.css";

export default function ContraceptionTemplate({ data }) {
  const fullName =
    data.fullName ||
    [data.firstName, data.surname].filter(Boolean).join(" ") ||
    "—";

  return (
    <div className="template covid-template">
      <img src="/Logo3.png" alt="CarePlus Logo" width={280} />
      <h1>Contraception Service – Patient Form</h1>

      {/* Patient Details */}
      <section className="template-section">
        <h2>Patient Details</h2>
        <p><strong>Full Name:</strong> {fullName}</p>
        <p><strong>Date of Birth:</strong> {data.dob}</p>
        <p><strong>Contact Number:</strong> {data.telephone}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Address:</strong> {data.address}</p>
      </section>

      {/* Pharmacist Details */}
      <section className="template-section">
        <h2>Pharmacist Details</h2>
        <p><strong>Pharmacist Name:</strong> {data.pharmacistName || "—"}</p>
        <p><strong>GPhC Number:</strong> {data.GPHCnumber || "—"}</p>
        <p><strong>Pharmacy Name:</strong> {data.pharmacyNameField || data.pharmacyName || "—"}</p>
        <p><strong>Pharmacy Address:</strong> {data.pharmacyAddress || "—"}</p>
        <p><strong>Consultation Outcome:</strong> {data.consultationOutcome || "—"}</p>
        <p><strong>Consultation Date:</strong> {data.consultationDate || data.datePharm || "—"}</p>
      </section>

      {/* Medication Supply Details */}
      <section className="template-section">
        <h2>Medication Supply Details</h2>
        <p><strong>Drug Given:</strong> {data.drugGiven || "—"}</p>
        <p><strong>Strength:</strong> {data.strength || "—"}</p>
        <p><strong>Quantity:</strong> {data.quantity || "—"}</p>
        <p><strong>Directions / Dosage:</strong> {data.dosage || "—"}</p>
        <p><strong>Batch Number:</strong> {data.batchNumber || "—"}</p>
        <p><strong>Expiry Date:</strong> {data.dateExpiry || "—"}</p>
      </section>

      {/* Additional Notes */}
      {data.notes && (
        <section className="template-section">
          <h2>Additional Notes</h2>
          <p>{data.notes}</p>
        </section>
      )}

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
            <div className="signature-placeholder">No signature provided</div>
          )}
          <p><strong>Date Signed:</strong> {data.dateSignedPatient || "—"}</p>
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
          <p><strong>Date Signed:</strong> {data.datePharm || "—"}</p>
        </div>

        <div>
          <h3>Prescriber Signature</h3>
          {data.prescriberSignature ? (
            <img
              src={data.prescriberSignature}
              alt="Prescriber Signature"
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
