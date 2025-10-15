// src/templates/ConsultationTemplate.jsx
import React from "react";
import "./ConsultationTemplate.css";

export default function ConsultationTemplate({
  serviceName,
  patientForm = {},
  pharmacistForm = {},
  consultationData = {},
}) {
  // Helper to format keys nicely
  const formatKey = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Helper to detect image data (base64 signatures)
  const isBase64Image = (val) =>
    typeof val === "string" && val.startsWith("data:image");

  return (
    <div className="consultation-template">
      {/* ==== HEADER ==== */}
      <header className="template-header">
        <img src="/Logo3.png" alt="CarePlusHealth" className="template-logo" />
        <h1 className="template-title">{serviceName} Consultation Summary</h1>
      </header>

      {/* ==== PATIENT DETAILS ==== */}
      <section className="template-section">
        <h2 className="section-title">Patient Details</h2>
        <table className="details-table">
          <tbody>
            {Object.entries(patientForm).map(([key, value]) => (
              <tr key={key}>
                <td className="field-label">{formatKey(key)}:</td>
                <td className="field-value">
                  {isBase64Image(value) ? (
                    <img
                      src={value}
                      alt={`${formatKey(key)} signature`}
                      className="signature-img"
                    />
                  ) : (
                    value?.toString() || "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ==== PHARMACIST DETAILS ==== */}
      <section className="template-section">
        <h2 className="section-title">Pharmacist Details</h2>
        <table className="details-table">
          <tbody>
            {Object.entries(pharmacistForm).map(([key, value]) => (
              <tr key={key}>
                <td className="field-label">{formatKey(key)}:</td>
                <td className="field-value">
                  {isBase64Image(value) ? (
                    <img
                      src={value}
                      alt={`${formatKey(key)} signature`}
                      className="signature-img"
                    />
                  ) : (
                    value?.toString() || "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ==== CONSULTATION QUESTIONS ==== */}
      <section className="template-section">
        <h2 className="section-title">Consultation Questionnaire</h2>
        {Object.keys(consultationData || {}).length === 0 ? (
          <p className="no-data">No consultation data provided.</p>
        ) : (
          <table className="details-table">
            <tbody>
              {Object.entries(consultationData).map(([key, value]) => (
                <tr key={key}>
                  <td className="field-label">{formatKey(key)}:</td>
                  <td className="field-value">
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
        )}
      </section>

      {/* ==== SIGNATURES (IF PRESENT) ==== */}
      {(patientForm.SignaturePatient ||
        pharmacistForm.SignaturePharmacist ||
        pharmacistForm.SignaturePrescriber) && (
        <section className="template-section signature-section">
          <h2 className="section-title">Signatures</h2>
          <div className="signature-container">
            {patientForm.SignaturePatient && (
              <div className="signature-block">
                <h3>Patient Signature</h3>
                <img
                  src={patientForm.SignaturePatient}
                  alt="Patient Signature"
                  className="signature-img"
                />
              </div>
            )}

            {pharmacistForm.SignaturePharmacist && (
              <div className="signature-block">
                <h3>Pharmacist Signature</h3>
                <img
                  src={pharmacistForm.SignaturePharmacist}
                  alt="Pharmacist Signature"
                  className="signature-img"
                />
              </div>
            )}

            {pharmacistForm.SignaturePrescriber && (
              <div className="signature-block">
                <h3>Prescriber Signature</h3>
                <img
                  src={pharmacistForm.SignaturePrescriber}
                  alt="Prescriber Signature"
                  className="signature-img"
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
