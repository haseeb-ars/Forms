import React from "react";
import "./CovidTemplate.css";

export default function CovidTemplate({ data }) {
  return (
    <div className="template covid-template">
      <h1>COVID-19 Vaccination Consent Form</h1>

      <section className="template-section">
        <h2>Patient Details</h2>
        <p><strong>Full Name:</strong> {data.fullName}</p>
        <p><strong>Date of Birth:</strong> {data.dob}</p>
        <p><strong>Contact Number:</strong> {data.telephone}</p>
        <p><strong>Address:</strong> {data.address}</p>
        <p><strong>NHS Number:</strong> {data.nhsNumber}</p>
      </section>

      <section className="template-section">
        <h2>Medical Screening</h2>
        <p><strong>Allergies:</strong> {data.allergies}</p>
        <p><strong>Had Covid Before:</strong> {data.hadCovid}</p>
        <p><strong>Previous Vaccine Doses:</strong> {data.previousDoses}</p>
        <p><strong>Any symptoms today?</strong> {data.symptomsToday}</p>
      </section>

      <section className="template-section">
        <h2>Vaccination Details</h2>
        <p><strong>Vaccine Brand:</strong> {data.vaccineBrand}</p>
        <p><strong>Dose Number:</strong> {data.doseNumber}</p>
        <p><strong>Date Given:</strong> {data.dateGiven}</p>
        <p><strong>Batch Number:</strong> {data.batchNumber}</p>
        <p><strong>Injection Site:</strong> {data.site}</p>
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


