// src/templates/ContraceptionConsultationTemplate.jsx
import React from "react";
import "./ConsultationTemplate.css";

export default function ContraceptionConsultationTemplate({
  serviceName,
  patientForm = {},
  pharmacistForm = {},
  consultationData = {},
  data = {},
}) {
  const fullName =
    data.fullName ||
    [data.firstName || patientForm.firstName, data.surname || patientForm.surname]
      .filter(Boolean)
      .join(" ") ||
    patientForm.fullName ||
    "—";

  return (
    <div className="consultation-template">
      {/* ==== HEADER ==== */}
      <header className="template-header">
        <img src="/Logo3.png" alt="CarePlusHealth" className="template-logo" />
        <h1 className="template-title">Contraception Consultation Summary</h1>
      </header>

      {/* ==== PATIENT DETAILS ==== */}
      <section className="template-section">
        <h2 className="section-title">Patient Details</h2>
        <table className="details-table">
          <tbody>
            <tr>
              <td className="field-label">Full Name:</td>
              <td className="field-value">{fullName}</td>
            </tr>
            <tr>
              <td className="field-label">Date of Birth:</td>
              <td className="field-value">{patientForm.dob || data.dob || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Phone:</td>
              <td className="field-value">{patientForm.telephone || data.telephone || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Email:</td>
              <td className="field-value">{patientForm.email || data.email || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Address:</td>
              <td className="field-value">{patientForm.address || data.address || "-"}</td>
            </tr>
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
              {/* Q1 */}
              <tr>
                <td className="field-label">
                  Starting new, restarting, or continuing pill?
                </td>
                <td className="field-value">
                  {consultationData.pillStatus || "-"}
                </td>
              </tr>

              {/* Q2 */}
              <tr>
                <td className="field-label">
                  Current/previous contraceptive pill:
                </td>
                <td className="field-value">
                  {consultationData.currentPill || "-"}
                </td>
              </tr>

              {/* Q3 */}
              <tr>
                <td className="field-label">
                  Issues with pill (missed, side effects, allergies, change)?
                </td>
                <td className="field-value">
                  {consultationData.pillIssues || "-"}
                </td>
              </tr>
              {consultationData.pillIssues === "Yes" &&
                consultationData.issuesDetails && (
                  <tr>
                    <td className="field-label">Pill issues details:</td>
                    <td className="field-value">
                      {consultationData.issuesDetails}
                    </td>
                  </tr>
                )}

              {/* Q4 */}
              <tr>
                <td className="field-label">
                  Taking other medications, herbal products, or supplements?
                </td>
                <td className="field-value">
                  {consultationData.otherMedications || "-"}
                </td>
              </tr>
              {consultationData.otherMedications === "Yes" &&
                consultationData.medicationDetails && (
                  <tr>
                    <td className="field-label">Medication details:</td>
                    <td className="field-value">
                      {consultationData.medicationDetails}
                    </td>
                  </tr>
                )}

              {/* Q5 */}
              <tr>
                <td className="field-label">
                  BP checked in last 3 months?
                </td>
                <td className="field-value">
                  {consultationData.bpChecked || "-"}
                </td>
              </tr>
              <tr>
                <td className="field-label">Blood Pressure Reading:</td>
                <td className="field-value">
                  {consultationData.bpReading || "-"}
                </td>
              </tr>
              <tr>
                <td className="field-label">Height (cm):</td>
                <td className="field-value">
                  {consultationData.height || "-"}
                </td>
              </tr>
              <tr>
                <td className="field-label">Weight (kg):</td>
                <td className="field-value">
                  {consultationData.weight || "-"}
                </td>
              </tr>

              {/* Q6 */}
              <tr>
                <td className="field-label">
                  Smoking, migraines with aura, diabetes, liver disease, blood
                  clots, heart disease, cancer, or major medical conditions?
                </td>
                <td className="field-value">
                  {consultationData.medicalConditions || "-"}
                </td>
              </tr>
              {consultationData.medicalConditions === "Yes" &&
                consultationData.medicalConditionDetails && (
                  <tr>
                    <td className="field-label">
                      Medical condition details:
                    </td>
                    <td className="field-value">
                      {consultationData.medicalConditionDetails}
                    </td>
                  </tr>
                )}

              {/* Q7 */}
              <tr>
                <td className="field-label">
                  Pregnant, planning surgery, or family history of blood clots,
                  stroke, or breast cancer under 50?
                </td>
                <td className="field-value">
                  {consultationData.familyHistory || "-"}
                </td>
              </tr>
              {consultationData.familyHistory === "Yes" &&
                consultationData.familyHistoryDetails && (
                  <tr>
                    <td className="field-label">Family history details:</td>
                    <td className="field-value">
                      {consultationData.familyHistoryDetails}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        )}
      </section>

      {/* ==== MEDICATION SUPPLY DETAILS ==== */}
      <section className="template-section">
        <h2 className="section-title">Medication Supply Details</h2>
        <table className="details-table">
          <tbody>
            <tr>
              <td className="field-label">Drug Given:</td>
              <td className="field-value">{data.drugGiven || pharmacistForm.drugGiven || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Strength:</td>
              <td className="field-value">{data.strength || pharmacistForm.strength || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Quantity:</td>
              <td className="field-value">{data.quantity || pharmacistForm.quantity || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Directions / Dosage:</td>
              <td className="field-value">{data.dosage || pharmacistForm.dosage || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Batch Number:</td>
              <td className="field-value">{data.batchNumber || pharmacistForm.batchNumber || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Expiry Date:</td>
              <td className="field-value">{data.dateExpiry || pharmacistForm.dateExpiry || "-"}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ==== PHARMACIST DETAILS ==== */}
      <section className="template-section">
        <h2 className="section-title">Pharmacist Details</h2>
        <table className="details-table">
          <tbody>
            <tr>
              <td className="field-label">Pharmacist Name:</td>
              <td className="field-value">{data.pharmacistName || pharmacistForm.pharmacistName || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">GPhC Number:</td>
              <td className="field-value">{data.GPHCnumber || pharmacistForm.GPHCnumber || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Pharmacy Name:</td>
              <td className="field-value">{data.pharmacyNameField || data.pharmacyName || pharmacistForm.pharmacyNameField || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Pharmacy Address:</td>
              <td className="field-value">{data.pharmacyAddress || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Consultation Outcome:</td>
              <td className="field-value">{data.consultationOutcome || pharmacistForm.consultationOutcome || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Additional Notes:</td>
              <td className="field-value">{data.notes || pharmacistForm.notes || "-"}</td>
            </tr>
            <tr>
              <td className="field-label">Consultation Date:</td>
              <td className="field-value">{data.consultationDate || data.datePharm || pharmacistForm.consultationDate || "-"}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ==== SIGNATURES ==== */}
      <section className="template-section">
        <h2 className="section-title">Signatures</h2>
        <div className="signature-container" style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div className="signature-block">
            <h3>Patient Signature</h3>
            {(data.signaturePatient || patientForm.signaturePatient) ? (
              <img
                src={data.signaturePatient || patientForm.signaturePatient}
                alt="Patient Signature"
                className="signature-img"
              />
            ) : (
              <div className="signature-placeholder">No signature provided</div>
            )}
            <p><strong>Date:</strong> {data.dateSignedPatient || patientForm.dateSignedPatient || "—"}</p>
          </div>

          <div className="signature-block">
            <h3>Pharmacist Signature</h3>
            {(data.pharmacistSignature || pharmacistForm.pharmacistSignature) ? (
              <img
                src={data.pharmacistSignature || pharmacistForm.pharmacistSignature}
                alt="Pharmacist Signature"
                className="signature-img"
              />
            ) : (
              <div className="signature-placeholder">No signature provided</div>
            )}
            <p><strong>Date:</strong> {data.datePharm || pharmacistForm.datePharm || "—"}</p>
          </div>

          <div className="signature-block">
            <h3>Prescriber Signature</h3>
            {(data.prescriberSignature || pharmacistForm.prescriberSignature) ? (
              <img
                src={data.prescriberSignature || pharmacistForm.prescriberSignature}
                alt="Prescriber Signature"
                className="signature-img"
              />
            ) : (
              <div className="signature-placeholder">No signature provided</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
