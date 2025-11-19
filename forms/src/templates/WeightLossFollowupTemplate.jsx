import React from "react";
import "./WeightlossTemplate.css"; // reuse existing styles

export default function WeightLossFollowupTemplate({ data = {} }) {
  const safe = (v) => (v && v !== "" ? v : "—");

  return (
    <div className="template weightloss-template">
      {/* Header */}
      <header className="template-header">
        <div className="logo">
          <img src="/Logo3.png" alt="CarePlus Logo" className="logo" />
        </div>
        <div className="form-meta">
          <h1>Weight Loss Follow-up Consent Form</h1>
        </div>
      </header>

      {/* Patient Details */}
      <section className="template-section two-column">
        <div>
          <p><strong>Full Name:</strong> {safe(data.fullName)}</p>
          <p><strong>Date of Birth:</strong> {safe(data.dob)}</p>
          <p><strong>Contact Number:</strong> {safe(data.telephone)}</p>
          <p><strong>Email:</strong> {safe(data.email)}</p>
        </div>
        <div>
          <p><strong>Address:</strong> {safe(data.address)}</p>
          <p><strong>Surgery:</strong> {safe(data.surgery)}</p>
          <p><strong>Preferred Follow-Up:</strong> {safe(data.followUpPreference)}</p>
        </div>
      </section>

      {/* Medication & Prescriber Info */}
      <section className="template-section">
        <h2>Medication & Prescriber Details</h2>
        <p><strong>Medication:</strong> {safe(data.medication)}</p>
        {data.medication === "Other" && (
          <p><strong>Specified Medication:</strong> {safe(data.otherMedication)}</p>
        )}
        <p><strong>Dosage:</strong> {safe(data.dosage)}</p>
        <p><strong>Start Date:</strong> {safe(data.startDate)}</p>
        <p><strong>Follow-up Date:</strong> {safe(data.followUpDate)}</p>
        <p><strong>Batch Number:</strong> {safe(data.batchNumber)}</p>
        <p><strong>Prescriber Type:</strong> {safe(data.prescriberType)}</p>
        <p><strong>Prescriber Name:</strong> {safe(data.prescriberName)}</p>
        <p><strong>GPhC Number:</strong> {safe(data.GPHCnumber)}</p>
      </section>

      {/* Additional Notes */}
      {data.notes && (
        <section className="template-section">
          <h2>Pharmacist Notes</h2>
          <p>{data.notes}</p>
        </section>
      )}

      {/* Consent Text */}
      <section className="template-section consent">
        <p>
          I consent to continue treatment in the weight loss follow-up program. I understand the
          medication, its potential risks and benefits, and have had the opportunity to ask
          questions. I confirm that the information provided is accurate to the best of my
          knowledge.
        </p>
      </section>

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
            <div className="signature-placeholder">Signature</div>
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
            <div className="signature-placeholder">Signature</div>
          )}
        </div>
      </section>
    </div>
  );
}
