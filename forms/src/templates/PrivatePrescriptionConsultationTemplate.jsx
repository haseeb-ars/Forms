import React from "react";
import "./TravelTemplate.css"; // reuse same styling as TravelConsultationTemplate

export default function PrivatePrescriptionConsultationTemplate({
  consultation,
  data,
  consultationData = {},
}) {
  const c = consultationData || consultation || {};
  const f = data || {};

  const formatKey = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const isBase64Image = (val) =>
    typeof val === "string" && val.startsWith("data:image");



  

  return (
    <div
      className="template travel-template"
      style={{ padding: 20, fontFamily: "sans-serif" }}
    >
      {/* ---------------- Header ---------------- */}
      <img src="/Logo3.png" alt="CarePlus Logo" width={280} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Private Prescription Consultation Summary
      </h1>

      {/* ---------------- Patient Details ---------------- */}
      <section className="template-section">
        <h2>Patient Details</h2>
        <p><strong>Full Name:</strong> {f.fullName || "-"}</p>
        <p><strong>Date of Birth:</strong> {f.dob || "-"}</p>
        <p><strong>Address:</strong> {f.address || "-"}</p>
        <p><strong>Telephone:</strong> {f.telephone || "-"}</p>
        <p><strong>Email:</strong> {f.email || "-"}</p>
      </section>

      

      {/* ---------------- Consultation Questionnaire ---------------- */}
      {Object.keys(c).length > 0 && (
        <section className="template-section">
          <h2>Consultation Questionnaire</h2>
          <table className="template-table">
            <tbody>
              {Object.entries(c).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ fontWeight: 600, width: "40%" }}>
                    {formatKey(key)}:
                  </td>
                  <td>
                    {isBase64Image(value) ? (
                      <img
                        src={value}
                        alt={`${formatKey(key)} signature`}
                        className="signature-img"
                      />
                    ) : Array.isArray(value) ? (
                      value.join(", ")
                    ) : (
                      value?.toString() || "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ---------------- Drugs Prescribed ---------------- */}
      <section className="template-section">
        <h2>Drugs Prescribed</h2>
        {Array.isArray(f.prescribedDrugs) && f.prescribedDrugs.length > 0 ? (
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
              {f.prescribedDrugs.map((d, i) => (
                <tr key={i}>
                  <td>{d.name || "-"}</td>
                  <td>{d.strength || "-"}</td>
                  <td>{d.dosage || "-"}</td>
                  <td>{d.quantity || "-"}</td>
                  <td>{d.dateGiven || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No drugs prescribed.</p>
        )}
      </section>


      {/* ---------------- Prescriber Info ---------------- */}
      <section className="template-section">
        <h2>Prescriber Information</h2>
        <p>
          <strong>Prescriber Name:</strong>{" "}
          {f.prescriberName || f.pharmacistName || "-"}
        </p>
        <p>
          <strong>Prescriber Type:</strong>{" "}
          {f.prescriberType ||
            f.prescriber_type ||
            "Independent Prescribing Pharmacist"}
        </p>
        <p>
          <strong>GPhC Number:</strong>{" "}
          {f.prescriberGPhC || f.gphcNumber || "-"}
        </p>
      </section>

      {/* ---------------- Signatures ---------------- */}
      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {f.signaturePatient || f.SignaturePatient ? (
            <img
              src={f.signaturePatient || f.SignaturePatient}
              alt="Patient Signature"
              className="signature-img"
            />
          ) : (
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>

        <div>
          <h3>Prescriber Signature</h3>
          {f.prescriberSignature ||
          f.SignaturePrescriber ||
          f.signaturePharmacist ? (
            <img
              src={
                f.prescriberSignature ||
                f.SignaturePrescriber ||
                f.signaturePharmacist
              }
              alt="Prescriber Signature"
              className="signature-img"
            />
          ) : (
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#666",
          marginTop: 24,
        }}
      >
        <p>
          This document is a record of a private prescription consultation.
          Medications listed above have been prescribed and dispensed by an
          authorised prescriber following a patient assessment.
        </p>
      </footer>
    </div>
  );
}
