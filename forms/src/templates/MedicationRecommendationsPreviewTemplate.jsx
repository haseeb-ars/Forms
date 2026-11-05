// src/templates/MedicationRecommendationsPreviewTemplate.jsx
import React from "react";
import { useApp } from "../AppContext.jsx";
import "./MedicationRecommendationsPreviewTemplate.css";

export default function MedicationRecommendationsPreviewTemplate({
  data = {},
  serviceId = "",
  serviceName = "",
}) {
  const { medicationRecommendations, branch, patient, pharm } = useApp();

  // Combine recommendations from props or context
  const recsSource =
    data.medicationRecommendations ||
    data.recommendations ||
    pharm?.recommendations ||
    medicationRecommendations ||
    {};

  const selectedList = Object.values(recsSource).filter(
    (item) =>
      item &&
      (item.alreadyTakes ||
        item.recommended ||
        item.patientAgreed ||
        (item.notes && item.notes.trim().length > 0))
  );

  const pharmacyLogo = branch?.logo || `${process.env.PUBLIC_URL || ""}/logos/southport.png`;
  const pharmacyName = branch?.pharmacyName || pharm?.pharmacyName || "CarePlus Health";
  const pharmacyAddress = branch?.pharmacyAddress || pharm?.pharmacyAddress || "";

  const patientName =
    data.fullName ||
    patient?.fullName ||
    [patient?.firstName, patient?.surname].filter(Boolean).join(" ") ||
    "Patient";
  const patientDob = data.dob || patient?.dob || "—";
  const patientContact = data.telephone || patient?.telephone || "—";
  const consultDate = data.datePharm || pharm?.datePharm || new Date().toLocaleDateString("en-GB");

  return (
    <div className="med-rec-preview-template">
      {/* Header */}
      <div className="med-rec-pdf-header">
        <div className="pharmacy-branding">
          {pharmacyLogo && (
            <img src={pharmacyLogo} alt="Pharmacy Logo" className="pharmacy-logo-img" />
          )}
          <div>
            <h2 className="pharmacy-name">{pharmacyName}</h2>
            <p className="pharmacy-address">{pharmacyAddress}</p>
          </div>
        </div>
        <div className="document-meta">
          <span className="doc-badge">Clinical Consultation Record</span>
          <h1 className="doc-title">Medication &amp; Supplement Recommendations</h1>
          <p className="doc-date">Date: {consultDate}</p>
        </div>
      </div>

      {/* Patient Summary */}
      <div className="med-rec-patient-box">
        <div className="patient-box-item">
          <span className="pbox-label">Patient Name:</span>
          <span className="pbox-value">{patientName}</span>
        </div>
        <div className="patient-box-item">
          <span className="pbox-label">Date of Birth:</span>
          <span className="pbox-value">{patientDob}</span>
        </div>
        <div className="patient-box-item">
          <span className="pbox-label">Contact:</span>
          <span className="pbox-value">{patientContact}</span>
        </div>
        <div className="patient-box-item">
          <span className="pbox-label">Clinical Service:</span>
          <span className="pbox-value">{serviceName || (serviceId ? serviceId.toUpperCase() : "CONSULTATION")}</span>
        </div>
      </div>

      {/* Clinical Notice */}
      <div className="med-rec-clinical-disclaimer">
        <strong>Pharmacist Review Record:</strong> The medications and supplementary products listed below were reviewed with the patient during their clinical consultation. Selection denotes independent clinical review, patient history reconciliation, and mutually agreed treatment plans.
      </div>

      {/* Recommendations Table / List */}
      <div className="med-rec-table-wrap">
        <div className="med-rec-section-heading">
          <h2>Medication &amp; Supplement Recommendations</h2>
          <span className="recs-count-badge">
            {selectedList.length} {selectedList.length === 1 ? "Item" : "Items"} Recorded
          </span>
        </div>

        {selectedList.length === 0 ? (
          <div className="med-rec-none-box">
            <p>No supplementary medications or product recommendations recorded for this consultation.</p>
          </div>
        ) : (
          <table className="med-rec-table">
            <thead>
              <tr>
                <th style={{ width: "28%" }}>Product / Medication</th>
                <th style={{ width: "16%" }}>Category</th>
                <th style={{ width: "16%", textAlign: "center" }}>Already Takes</th>
                <th style={{ width: "18%", textAlign: "center" }}>Pharmacist Recommended</th>
                <th style={{ width: "22%", textAlign: "center" }}>Patient Agreed / Taking</th>
              </tr>
            </thead>
            <tbody>
              {selectedList.map((item, idx) => {
                const publicUrl = process.env.PUBLIC_URL || "";
                const img = item.image ? `${publicUrl}${item.image}` : null;
                return (
                  <React.Fragment key={item.id || idx}>
                    <tr className="med-rec-row">
                      <td className="product-col">
                        <div className="product-cell">
                          {img && (
                            <img
                              src={img}
                              alt={item.name}
                              className="thumb-img"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <div className="prod-name-wrap">
                            <span className="prod-name">{item.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="category-col">
                        <span className="cat-pill">{item.category || "General"}</span>
                      </td>
                      <td className="status-col" style={{ textAlign: "center" }}>
                        <span
                          className={`status-indicator-badge ${
                            item.alreadyTakes ? "yes-badge blue" : "no-badge"
                          }`}
                        >
                          {item.alreadyTakes ? "✓ Yes" : "—"}
                        </span>
                      </td>
                      <td className="status-col" style={{ textAlign: "center" }}>
                        <span
                          className={`status-indicator-badge ${
                            item.recommended ? "yes-badge green" : "no-badge"
                          }`}
                        >
                          {item.recommended ? "✓ Recommended" : "—"}
                        </span>
                      </td>
                      <td className="status-col" style={{ textAlign: "center" }}>
                        <span
                          className={`status-indicator-badge ${
                            item.patientAgreed ? "yes-badge purple" : "no-badge"
                          }`}
                        >
                          {item.patientAgreed ? "✓ Agreed / Taking" : "—"}
                        </span>
                      </td>
                    </tr>
                    {item.notes && item.notes.trim().length > 0 && (
                      <tr className="notes-row">
                        <td colSpan={5} className="notes-col">
                          <span className="notes-label">Pharmacist Notes:</span>
                          <span className="notes-text">{item.notes}</span>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pharmacist Verification & Signatures */}
      <div className="med-rec-signatures-wrap">
        <div className="sig-block">
          <div className="sig-header">Pharmacist Signature</div>
          <div className="sig-box">
            {pharm?.pharmacistSignature ? (
              <img
                src={pharm.pharmacistSignature}
                alt="Pharmacist Signature"
                className="sig-image"
              />
            ) : (
              <span className="sig-placeholder">Signature on Main Consultation</span>
            )}
          </div>
          <div className="sig-meta">
            <span>
              <strong>Name:</strong> {pharm?.pharmacistName || pharm?.pharmacistNameGPhC || "Pharmacist"}
            </span>
            <span>
              <strong>GPhC:</strong> {pharm?.GPHCnumber || pharm?.pharmacistGPhC || "Registered"}
            </span>
          </div>
        </div>

        <div className="sig-block">
          <div className="sig-header">Patient Acknowledgment</div>
          <div className="sig-box">
            {patient?.signaturePatient ? (
              <img
                src={patient.signaturePatient}
                alt="Patient Signature"
                className="sig-image"
              />
            ) : (
              <span className="sig-placeholder">Confirmed by Patient</span>
            )}
          </div>
          <div className="sig-meta">
            <span>
              <strong>Patient:</strong> {patientName}
            </span>
            <span>
              <strong>Date:</strong> {consultDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
