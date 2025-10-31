// src/templates/PrivatePrescriptionTemplate.jsx
import React from "react";
import "./WeightlossTemplate.css"; // reuse existing styles

export default function PrivatePrescriptionTemplate({ data = {} }) {
  const safe = (v) => (v !== undefined && v !== null && String(v).trim() !== "" ? v : "—");

  const drugs = Array.isArray(data.prescribedDrugs) ? data.prescribedDrugs : [];

  return (
    <div className="template privateprescription-template">
      {/* ---------- Header ---------- */}
      <header className="template-header">
        <div className="logo">
          <img src="/Logo3.png" alt="CarePlus Logo" className="logo" />
        </div>
        <div className="form-meta">
          <h1>Private Prescription Form</h1>
        </div>
      </header>

      {/* ---------- Patient Details ---------- */}
      <section className="template-section two-column">
        <div>
          <p><strong>Full Name:</strong> {safe(data.fullName)}</p>
          <p><strong>Date of Birth:</strong> {safe(data.dob)}</p>
          <p><strong>Telephone:</strong> {safe(data.telephone)}</p>
          <p><strong>Email:</strong> {safe(data.email)}</p>
        </div>
        <div>
          <p><strong>Address:</strong> {safe(data.address)}</p>
          <p><strong>Surgery Name:</strong> {safe(data.surgeryName)}</p>
        </div>
      </section>

      {/* ---------- Drugs Prescribed (from MedicationRepeater) ---------- */}
      <section className="template-section">
        <h2>Drugs Prescribed</h2>
        {drugs.length > 0 ? (
          <table className="template-table">
            <thead>
              <tr>
                <th>Drug Name</th>
                <th>Strength</th>
                <th>Dosage / Directions</th>
                <th>Quantity</th>
                <th>Date Given</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map((d, i) => (
                <tr key={i}>
                  <td>{safe(d.name)}</td>
                  <td>{safe(d.strength)}</td>
                  <td>{safe(d.dosage)}</td>
                  <td>{safe(d.quantity)}</td>
                  <td>{safe(d.dateGiven)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No medications recorded.</p>
        )}
      </section>

      {/* ---------- Prescriber Details ---------- */}
      <section className="template-section">
        <h2>Prescriber Details</h2>
        <p><strong>Prescriber Name:</strong> {safe(data.prescriberName || data.pharmacistName)}</p>
        <p><strong>Prescriber Type:</strong> {safe(data.prescriberType || "Independent Prescribing Pharmacist")}</p>
        <p><strong>GPhC Number:</strong> {safe(data.prescriberGPhC || data.gphcNumber)}</p>
        <p><strong>Pharmacy Name:</strong> {safe(data.pharmacyName)}</p>
        <p><strong>Pharmacy Address:</strong> {safe(data.pharmacyAddress)}</p>
      </section>

      {/* ---------- Notes ---------- */}
      {data.notes && (
        <section className="template-section">
          <h2>Notes / Additional Comments</h2>
          <p>{safe(data.notes)}</p>
        </section>
      )}

      {/* ---------- Signatures ---------- */}
      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {data.signaturePatient || data.SignaturePatient ? (
            <img
              src={data.signaturePatient || data.SignaturePatient}
              alt="Patient Signature"
              className="signature-img"
            />
          ) : (
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>

        <div>
          <h3>Prescriber Signature</h3>
          {data.pharmacistSignature || data.prescriberSignature || data.SignaturePrescriber ? (
            <img
              src={
                data.pharmacistSignature ||
                data.prescriberSignature ||
                data.SignaturePrescriber
              }
              alt="Prescriber Signature"
              className="signature-img"
            />
          ) : (
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#666",
          marginTop: 24,
        }}
      >
        <p>
          This document is a record of a private prescription issued following a clinical consultation.
          The prescriber confirms that appropriate checks have been performed and the medication is
          prescribed in accordance with professional standards.
        </p>
      </footer>
    </div>
  );
}
