// src/TravelTemplate.jsx
import React from "react";
import "./TravelTemplate.css";
import { useApp } from "../AppContext.jsx"; // ✅ fixed path

export default function TravelTemplate({
  data = {},
  patientForm = {},
  pharmacistForm = {},
  consultationData = {},
  serviceId
}) {
  const context = useApp();
  
  // 🧩 Data Sourcing: Prioritize props (for PDFs/DB reloads), fallback to context (for live previews)
  const activePatient = (patientForm && Object.keys(patientForm).length > 0) ? patientForm : context.patient;
  const activePharm = (pharmacistForm && Object.keys(pharmacistForm).length > 0) ? pharmacistForm : context.pharm;
  const activeConsultation = (consultationData && Object.keys(consultationData).length > 0) ? consultationData : context.travelConsultation;
  const history = activePharm?.history || context.travelFollowUpOriginalData?.history || [];

  // 🧠 Merge pharmacist + consultation data
  const merged = {
    ...activePharm,
    ...data, // Include merged data from props if available
    destinationCountry:
      activePharm?.destinationCountry ||
      (Array.isArray(activeConsultation?.countries) ? activeConsultation.countries.join(", ") : activeConsultation?.countries) ||
      "",
    travelDate:
      activePharm?.travelDate ||
      activeConsultation?.departureDate ||
      "",
    purpose: activePharm?.purpose || activeConsultation?.reason || "",
    conditions:
      activePharm?.conditions ||
      (activeConsultation?.medical
        ? Object.entries(activeConsultation.medical)
          .map(([k, v]) => {
            if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
            if (typeof v === "string" && v !== "No") return `${k}: ${v}`;
            return null;
          })
          .filter(Boolean)
          .join("; ")
        : ""),
    allergies:
      activePharm?.allergies ||
      (activeConsultation?.eggAllergy ? "Egg Allergy" : "None"),
    vaccines: activePharm?.vaccines || [],
    malariaGiven: activePharm?.malariaGiven || "",
    malariaNotes: activePharm?.malariaNotes || "",
    malariaVaccines: activePharm?.malariaVaccines || [],
  };


  const safe = (v) =>
    v && String(v).trim() !== "" ? v : "—";

  return (
    <div className="template travel-template">
      <img src="/Logo3.png" alt="CarePlus Logo" width={280} />
      <h1>Travel Vaccination Form</h1>
      <p style={{ marginBottom: 20, color: "#4b5563" }}>
        <strong>Consultation Date:</strong> {safe(activePharm?.datePharm || activePharm?.consultationDate || activePharm?.date)}
      </p>


      {/* ---------------- Patient Details ---------------- */}
      <section className="template-section">
        <h2>Patient Details</h2>
        <p><strong>Full Name:</strong> {activePatient?.fullName || merged.fullName || "—"}</p>
        <p><strong>Date of Birth:</strong> {activePatient?.dob || merged.dob || "—"}</p>
        <p><strong>Contact Number:</strong> {activePatient?.telephone || "—"}</p>
        <p><strong>Surgery Name:</strong> {activePatient?.surgery || "—"}</p>
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
        {serviceId === "travelFollowUp" ? (
          <>
            <h3 className="section-title" style={{ color: "#4b5563" }}>A. Previous Travel Consultation Vaccines</h3>
            {/* Bug 4: Show cumulative history if available */}
            {history && history.length > 0 ? (
              <table className="template-table">
                <thead>
                  <tr>
                    <th>Vaccine Name</th>
                    <th>Batch</th>
                    <th>Date Given</th>
                    <th>Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((v, i) => (
                    <React.Fragment key={i}>
                      <tr>
                        <td>{safe(v.name)}</td>
                        <td>{safe(v.batchNumber)}</td>
                        <td>{safe(v.dateGiven)}</td>
                        <td>{safe(v.expiry)}</td>
                      </tr>
                      {v.brand && (
                        <tr className="sub-row">
                          <td colSpan={4} style={{ fontSize: "0.85rem", padding: "4px 6px 6px", background: "#f9fafb" }}>
                            <span><strong>Brand:</strong> {safe(v.brand)}</span>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">No historical vaccinations found.</p>
            )}


            <h3 className="section-title" style={{ color: "#118AB2", marginTop: "20px" }}>B. Current Follow-Up Vaccines (Administered Today)</h3>
            {activePharm?.followUpVaccines && activePharm.followUpVaccines.length > 0 ? (
              <table className="template-table" style={{ border: "2px solid #118AB2" }}>
                <thead>
                  <tr style={{ background: "#e0f2fe" }}>
                    <th>Vaccine Name</th>
                    <th>Dose No</th>
                    <th>Batch</th>
                    <th>Expiry</th>
                    <th>Site/Route</th>
                  </tr>
                </thead>
                <tbody>
                  {activePharm.followUpVaccines.map((v, i) => (
                    <React.Fragment key={i}>
                      <tr>
                        <td><strong>{safe(v.name)}</strong></td>
                        <td>{safe(v.doseNumber)}</td>
                        <td>{safe(v.batchNumber)}</td>
                        <td>{safe(v.expiry)}</td>
                        <td>{safe(v.site)}</td>
                      </tr>
                      {v.brand && (
                        <tr className="sub-row">
                          <td colSpan={5} style={{ fontSize: "0.85rem", padding: "4px 6px 6px", background: "#f9fafb" }}>
                            <span><strong>Brand:</strong> {safe(v.brand)}</span>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No new vaccinations recorded today.</p>
            )}
          </>

        ) : (
          <>
            <h3>Vaccinations Administered</h3>
            {merged.vaccines && merged.vaccines.length > 0 ? (
              <table className="template-table">
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Batch</th>
                    <th>Date Given</th>
                    <th>Expiry</th>
                    <th>Administered Site</th>
                  </tr>
                </thead>
                <tbody>
                  {merged.vaccines.map((v, i) => (
                    <React.Fragment key={i}>
                      <tr>
                        <td>{safe(v.name)}</td>
                        <td>{safe(v.batchNumber)}</td>
                        <td>{safe(v.dateGiven)}</td>
                        <td>{safe(v.expiry)}</td>
                        <td>{safe(v.site)}</td>
                      </tr>
                      {(v.brand || v.indication) && (
                        <tr className="sub-row">
                          <td colSpan={5} style={{ fontSize: "0.85rem", padding: "4px 6px 6px", background: "#f9fafb" }}>
                            {v.brand && <span><strong>Brand:</strong> {safe(v.brand)}</span>}
                            {v.indication && <span style={{ marginLeft: "1.5rem" }}><strong>Indication:</strong> {safe(v.indication)}</span>}
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
          </>
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
                          <th>Administered Site</th>

                        </tr>
                      </thead>
                      <tbody>
                        {merged.malariaVaccines.map((v, i) => (
                          <React.Fragment key={i}>
                            {/* main row */}
                            <tr>
                              <td>{safe(v.name)}</td>
                              <td>{safe(v.batchNumber)}</td>
                              <td>{safe(v.dateGiven)}</td>
                              <td>{safe(v.expiry)}</td>
                              <td>{safe(v.site)}</td>

                            </tr>

                            {/* second line: brand + indication */}
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
          </div>
        )}
      </section>

      {/* ---------------- Signatures ---------------- */}
      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {activePatient?.signaturePatient || merged.signaturePatient ? (
            <img
              src={activePatient?.signaturePatient || merged.signaturePatient}
              alt="Patient Signature"
              className="signature-img"
            />
          ) : (
            <div className="signature-placeholder">No signature provided</div>
          )}
        </div>

        <div>
          <h3>Pharmacist Signature</h3>
          {activePharm?.pharmacistSignature || merged.pharmacistSignature ? (
            <img
              src={activePharm?.pharmacistSignature || merged.pharmacistSignature}
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
