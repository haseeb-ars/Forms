// src/TravelTemplate.jsx
import React from "react";
import "./TravelTemplate.css";
import { useApp } from "../AppContext.jsx"; // ✅ fixed path

export default function TravelTemplate() {
  const { patient, pharm, travelConsultation } = useApp();

  // 🧠 Merge pharmacist + consultation data
  const merged = {
    ...pharm,
    destinationCountry:
      pharm?.destinationCountry ||
      (travelConsultation?.countries || []).join(", "),
    travelDate:
      pharm?.travelDate ||
      travelConsultation?.departureDate ||
      "",
    purpose: pharm?.purpose || travelConsultation?.reason || "",
    conditions:
      pharm?.conditions ||
      (travelConsultation?.medical
        ? Object.entries(travelConsultation.medical)
            .map(([k, v]) => {
              if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
              if (typeof v === "string" && v !== "No") return `${k}: ${v}`;
              return null;
            })
            .filter(Boolean)
            .join("; ")
        : ""),
    allergies:
      pharm?.allergies ||
      (travelConsultation?.eggAllergy ? "Egg Allergy" : "None"),
    vaccines: pharm?.vaccines || [],
    malariaGiven: pharm?.malariaGiven || "",
    malariaNotes: pharm?.malariaNotes || "",
    malariaVaccines: pharm?.malariaVaccines || [],
  };

  return (
    <div className="template travel-template">
      <img src="/Logo3.png" alt="CarePlus Logo" width={280} />
      <h1>Travel Vaccination Form</h1>

      {/* ---------------- Patient Details ---------------- */}
      <section className="template-section">
        <h2>Patient Details</h2>
        <p><strong>Full Name:</strong> {patient?.fullName || merged.fullName || "—"}</p>
        <p><strong>Date of Birth:</strong> {patient?.dob || merged.dob || "—"}</p>
        <p><strong>Contact Number:</strong> {patient?.telephone || "—"}</p>
        <p><strong>Surgery Name:</strong> {patient?.surgery || "—"}</p>
      </section>

      {/* ---------------- Travel Info ---------------- */}
      <section className="template-section">
        <h2>Travel Information</h2>
        <p><strong>Destination Country:</strong> {merged.destinationCountry || "—"}</p>
        <p><strong>Travel Date:</strong> {merged.travelDate || "—"}</p>
        <p><strong>Purpose of Travel:</strong> {merged.purpose || "—"}</p>
      </section>

      {/* ---------------- Medical & Vaccination ---------------- */}
      <section className="template-section">
        

        <h3>Vaccinations Administered</h3>
        {merged.vaccines && merged.vaccines.length > 0 ? (
          <table className="template-table">
            <thead>
              <tr>
                <th>Vaccine</th>
                <th>Batch</th>
                <th>Date Given</th>
                <th>Expiry</th>
                <th>Dosage</th>
                        <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {merged.vaccines.map((v, i) => (
                <tr key={i}>
                  <td>{v.vaccine}</td>
                  <td>{v.batch}</td>
                  <td>{v.dateGiven}</td>
                  <td>{v.expiry}</td>
                  <td>{v.dosage || "-"}</td>
                          <td>{v.quantity || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No vaccinations recorded.</p>
        )}

        {/* ---------------- Malaria Section ---------------- */}
        {merged.malariaGiven && (
          <div className="malaria-block">
            <h3>Malaria Prophylaxis</h3>
            <p>
              <strong>Was malaria medication given?:</strong> {merged.malariaGiven}
            </p>

            {merged.malariaGiven === "Yes" && (
              <>
                {merged.malariaNotes && (
                  <p>
                    <strong>Notes:</strong> {merged.malariaNotes}
                  </p>
                )}

                {merged.malariaVaccines && merged.malariaVaccines.length > 0 && (
                  <>
                    <h4>Vaccinations Administered (Malaria)</h4>
                    <table className="template-table">
                      <thead>
                        <tr>
                          <th>Vaccine</th>
                          <th>Batch</th>
                          <th>Date Given</th>
                          <th>Expiry</th>
                          <th>Dosage</th>
                        <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {merged.malariaVaccines.map((v, i) => (
                          <tr key={i}>
                            <td>{v.vaccine}</td>
                            <td>{v.batch}</td>
                            <td>{v.dateGiven}</td>
                            <td>{v.expiry}</td>
                            <td>{v.dosage || "-"}</td>
                          <td>{v.quantity || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* ---------------- Signatures ---------------- */}
      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {patient?.signaturePatient || merged.signaturePatient ? (
            <img
              src={patient?.signaturePatient || merged.signaturePatient}
              alt="Patient Signature"
              className="signature-img"
            />
          ) : (
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>

        <div>
          <h3>Pharmacist Signature</h3>
          {pharm?.pharmacistSignature || merged.pharmacistSignature ? (
            <img
              src={pharm?.pharmacistSignature || merged.pharmacistSignature}
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
