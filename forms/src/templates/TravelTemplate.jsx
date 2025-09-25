import React from "react";
import "./TravelTemplate.css";

export default function TravelTemplate({ data }) {
  return (
    <div className="template travel-template">
          <img src="/Logo3.png" alt="CarePlus Logo" width={280} />
      <h1>Travel Vaccination Form</h1>

      <section className="template-section">
        <h2>Patient Details</h2>
        <p><strong>Full Name:</strong> {data.fullName}</p>
        <p><strong>Date of Birth:</strong> {data.dob}</p>
        <p><strong>Passport Number:</strong> {data.passportNumber}</p>
        <p><strong>Contact Number:</strong> {data.telephone}</p>
      </section>

      <section className="template-section">
        <h2>Travel Information</h2>
        <p><strong>Destination Country:</strong> {data.destinationCountry}</p>
        <p><strong>Travel Date:</strong> {data.travelDate}</p>
        <p><strong>Purpose of Travel:</strong> {data.purpose}</p>
      </section>

      <section className="template-section">
        <h2>Medical & Vaccination Details</h2>
        <p><strong>Existing Conditions:</strong> {data.conditions}</p>
        <p><strong>Allergies:</strong> {data.allergies}</p>
        <p><strong>Required Vaccinations:</strong> {data.vaccinations}</p>
        <p><strong>Date Given:</strong> {data.dateGiven}</p>
        <p><strong>Date Expiry:</strong> {data.dateExpiry}</p>
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
