// templates/TravelConsultationTemplate.jsx
import React from "react";
import "./TravelTemplate.css"; // reuse same styling

export default function TravelConsultationTemplate({ consultation, data }) {
  const tc = consultation || {};
  const f = data || {}; // pharmacist/patient form data combined

  const safe = (v) =>
    v && String(v).trim() !== "" ? v : "—";

  return (
    <div
      className="template travel-template"
      style={{ padding: 20, fontFamily: "sans-serif" }}
    >
      <img src="/Logo3.png" alt="CarePlus Logo" width={280} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Travel Vaccination Consultation Summary
      </h1>

      {/* ---------------- Patient Details ---------------- */}
      <section className="template-section">
        <h2>Patient Details</h2>
        <p>
          <strong>Full Name:</strong> {f.fullName || "-"}
        </p>
        <p>
          <strong>Date of Birth:</strong> {f.dob || "-"}
        </p>
        <p>
          <strong>Contact Number:</strong> {f.telephone || "-"}
        </p>
        <p>
          <strong>Email:</strong> {f.email || "-"}
        </p>
        <p>
          <strong>Surgery Name:</strong> {f.surgery || "-"}
        </p>
      </section>

      {/* ---------------- Trip Details ---------------- */}
      <section className="template-section">
        <h2>Travel Information</h2>
        <p>
          <strong>Destination Countries:</strong>{" "}
          {tc.countries?.join(", ") || f.destinationCountry || "-"}
        </p>
        <p>
          <strong>Departure Date:</strong> {tc.departureDate || f.travelDate || "-"}
        </p>
        <p>
          <strong>Return Date:</strong> {tc.returnDate || "-"}
        </p>
        <p>
          <strong>Purpose of Travel:</strong> {tc.reason || f.purpose || "-"}
        </p>
      </section>

      {/* ---------------- Risk Assessment ---------------- */}
      <section className="template-section">
        <h2>Risk Assessment</h2>
        <p>
          <strong>Egg Allergy:</strong> {tc.eggAllergy ? "Yes" : "No"}
        </p>
        <p>
          <strong>Pregnant:</strong> {tc.pregnant ? "Yes" : "No"}
        </p>
        <p>
          <strong>Immunosuppressed:</strong> {tc.immunosuppressed ? "Yes" : "No"}
        </p>
        <p>
          <strong>Existing Conditions:</strong> {f.conditions || "-"}
        </p>
        <p>
          <strong>Allergies:</strong> {f.allergies || "-"}
        </p>
        <p>
          <strong>Malaria Risks:</strong> {tc.malariaRisks?.join(", ") || "-"}
        </p>
        <p>
          <strong>Other Risks:</strong> {tc.otherRisks?.join(", ") || "-"}
        </p>
      </section>

      {/* ---------------- Recommended Vaccines ---------------- */}
      <section className="template-section">
        <h2>Vaccine Recommendations</h2>
        <p>
          <strong>Recommended Vaccines:</strong>{" "}
          {tc.recommendedVaccines?.join(", ") || "-"}
        </p>
        <p>
          <strong>Caution:</strong> {tc.cautionVaccines?.join(", ") || "-"}
        </p>
        <p>
          <strong>Contraindicated:</strong>{" "}
          {tc.contraindicatedVaccines?.join(", ") || "-"}
        </p>
      </section>

      {/* ---------------- Administered Vaccines ---------------- */}
      <section className="template-section">
        <h2>Vaccinations Administered</h2>
        {Array.isArray(f.vaccines) && f.vaccines.length > 0 ? (
          <table className="template-table">
            <thead>
              <tr>
                <th>Vaccine</th>
                <th>Batch No</th>
                <th>Date Given</th>
                <th>Expiry Date</th>
                <th>Administered Site</th>
            
              </tr>
            </thead>
            <tbody>
              {f.vaccines.map((v, i) => (
                <React.Fragment key={i}>
                  {/* main row */}
                  <tr>
                    <td>{safe(v.name)}</td>
                    <td>{safe(v.batchNumber)}</td>
                    <td>{safe(v.dateGiven)}</td>
                    <td>{safe(v.expiry)}</td>
                    <td>{safe(v.site)}</td>
            
                  </tr>

                  {/* brand + indication second line */}
                  {(v.brand || v.indication) && (
                    <tr className="sub-row">
                      <td
                        colSpan={6}
                        style={{
                          fontSize: "0.85rem",
                          padding: "4px 6px 6px",
                          background: "#f9fafb",
                        }}
                      >
                        {v.brand && (
                          <span>
                            <strong>Brand:</strong> {safe(v.brand)}
                          </span>
                        )}
                        {v.indication && (
                          <span style={{ marginLeft: "1.5rem" }}>
                            <strong>Indication:</strong> {safe(v.indication)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No vaccinations recorded.</p>
        )}
      </section>

      {/* ---------------- Malaria Section ---------------- */}
      {f.malariaGiven && (
        <section className="template-section">
          <h2>Malaria Prevention</h2>
          <p>
            <strong>Medication Given:</strong> {f.malariaGiven}
          </p>
          {f.malariaGiven === "Yes" && (
            <>
              <p>
                <strong>Malaria Notes:</strong> {f.malariaNotes || "-"}
              </p>
              {Array.isArray(f.malariaVaccines) && f.malariaVaccines.length > 0 && (
                <>
                  <h3>Malaria Vaccinations Administered</h3>
                  <table className="template-table">
                    <thead>
                      <tr>
                        <th>Vaccine</th>
                        <th>Batch No</th>
                        <th>Date Given</th>
                        <th>Expiry Date</th>
                        <th>Administered Site</th>
                       
                      </tr>
                    </thead>
                    <tbody>
                      {f.malariaVaccines.map((v, i) => (
                        <React.Fragment key={i}>
                          {/* main row */}
                          <tr>
                            <td>{safe(v.name)}</td>
                            <td>{safe(v.batchNumber)}</td>
                            <td>{safe(v.dateGiven)}</td>
                            <td>{safe(v.expiry)}</td>
                            <td>{safe(v.site)}</td>
                         
                          </tr>

                          {/* brand + indication second line */}
                          {(v.brand || v.indication) && (
                            <tr className="sub-row">
                              <td
                                colSpan={6}
                                style={{
                                  fontSize: "0.85rem",
                                  padding: "4px 6px 6px",
                                  background: "#f9fafb",
                                }}
                              >
                                {v.brand && (
                                  <span>
                                    <strong>Brand:</strong> {safe(v.brand)}
                                  </span>
                                )}
                                {v.indication && (
                                  <span style={{ marginLeft: "1.5rem" }}>
                                    <strong>Indication:</strong> {safe(v.indication)}
                                  </span>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </section>
      )}

      {/* ---------------- Medical Questions ---------------- */}
      <section className="template-section">
        <h2>Medical Questionnaire</h2>
        {tc.medical && Object.keys(tc.medical).length > 0 ? (
          Object.entries(tc.medical).map(([question, answer], idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <p style={{ fontWeight: 600 }}>{question}</p>
              {Array.isArray(answer) ? (
                <ul style={{ margin: "4px 0 0 16px" }}>
                  {answer.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              ) : (
                <p>{answer || "-"}</p>
              )}
            </div>
          ))
        ) : (
          <p>No medical questions answered.</p>
        )}
      </section>

      {/* ---------------- Signatures ---------------- */}
      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {f.signaturePatient ? (
            <img
              src={f.signaturePatient}
              alt="Patient Signature"
              className="signature-img"
            />
          ) : (
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>

        <div>
          <h3>Pharmacist Signature</h3>
          {f.pharmacistSignature ? (
            <img
              src={f.pharmacistSignature}
              alt="Pharmacist Signature"
              className="signature-img"
            />
          ) : (
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>

        <div>
          <h3>Prescriber Signature</h3>
          {f.prescriberSignature ? (
            <img
              src={f.prescriberSignature}
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
