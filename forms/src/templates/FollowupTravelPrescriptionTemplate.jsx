import React from "react";
import "./B12Template.css"; // Reuse styling
import { useApp } from "../AppContext";

export default function FollowupTravelPrescriptionTemplate({ data = {} }) {
    const context = useApp();

    const safe = (val) => val || "—";

    // ✅ Bug 4: Build the array of historical doses (Cumulative History)
    // Prioritize data.history (from props/DB), then context.travelFollowUpOriginalData.history
    let previousDoses = [];
    if (data.history && Array.isArray(data.history)) {
        previousDoses = data.history;
    } else if (context.travelFollowUpOriginalData?.history) {
        previousDoses = context.travelFollowUpOriginalData.history;
    } else if (context.travelFollowUpOriginalData?.pharmacist_data) {
        const pData = context.travelFollowUpOriginalData.pharmacist_data;
        if (Array.isArray(pData.vaccines)) {
            previousDoses = previousDoses.concat(pData.vaccines);
        }
        if (pData.malariaGiven === "Yes" && Array.isArray(pData.malariaVaccines)) {
            previousDoses = previousDoses.concat(pData.malariaVaccines);
        }
    } else if (Array.isArray(data.vaccines)) {
        // Fallback for re-opened forms where history might be merged into vaccines
        previousDoses = data.vaccines;
    }


    return (
        <div className="template prescription-template">
            {/* HEADER */}
            <header className="template-header">
                <div className="logo">
                    <img src="/Logo3.png" alt="CarePlus Logo" />
                </div>
                <div className="form-meta">
                    <h1>Follow-up Travel Prescription</h1>
                </div>
            </header>

            {/* PATIENT DETAILS */}
            <section className="template-section">
                <h2 className="section-title">Patient Details</h2>
                <div className="grid grid--2">
                    <p><strong>Name:</strong> {safe(data.fullName || data.name)}</p>
                    <p><strong>DOB:</strong> {safe(data.dob)}</p>
                    <p><strong>Address:</strong> {safe(data.address)}</p>
                    <p><strong>Surgery Name:</strong> {safe(data.surgery)}</p>
                    <p><strong>Email:</strong> {safe(data.email)}</p>
                </div>
            </section>

            {/* A. PREVIOUS TRAVEL CONSULTATION VACCINES (Historical) */}
            <section className="template-section">
                <h2 className="section-title" style={{ color: "#4b5563" }}>A. Previous Travel Consultation Vaccines</h2>
                {previousDoses.length > 0 ? (
                    <table className="template-table">
                        <thead>
                            <tr>
                                <th>Vaccine Name</th>
                                <th>Dose No.</th>
                                <th>Date Given</th>
                                <th>Batch No.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {previousDoses.map((dose, i) => (
                                <React.Fragment key={i}>
                                    <tr>
                                        <td>{safe(dose.name || dose.vaccine || dose.vaccineName)}</td>
                                        <td>{safe(dose.doseNumber || "Dose 1")}</td>
                                        <td>{safe(dose.dateGiven)}</td>
                                        <td>{safe(dose.batchNumber)}</td>
                                    </tr>
                                    {dose.brand && (
                                        <tr className="sub-row">
                                            <td colSpan={4} style={{ fontSize: "0.85rem", padding: "4px 6px 6px", background: "#f9fafb" }}>
                                                <span><strong>Brand:</strong> {safe(dose.brand)}</span>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="muted">No historical vaccination records found.</p>
                )}
            </section>

            {/* B. CURRENT FOLLOW-UP VACCINES (New) */}
            <section className="template-section current-followup" style={{ border: "2px solid #118AB2", padding: "15px", borderRadius: "8px", background: "#f0f9ff" }}>
                <h2 className="section-title" style={{ color: "#118AB2" }}>B. Current Follow-Up Vaccines (Administered Today)</h2>
                {Array.isArray(data.followUpVaccines) && data.followUpVaccines.length > 0 ? (
                    <table className="template-table">
                        <thead>
                            <tr>
                                <th>Vaccine Name</th>
                                <th>Dose No.</th>
                                <th>Batch</th>
                                <th>Expiry</th>
                                <th>Site/Route</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.followUpVaccines.map((v, i) => (
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
                    <p>No new follow-up doses were recorded for this session.</p>
                )}
                {data.notes && (
                    <div style={{ marginTop: 15, padding: 10, background: "#fff", border: "1px solid #bae6fd", borderRadius: "5px" }}>
                        <strong>Clinical Notes:</strong> {data.notes}
                    </div>
                )}
            </section>

            {/* PRESCRIBER & SIGNATURE */}
            <section className="template-section signature-section">
                <div style={{ flex: 2 }}>
                    <h3>Prescriber Details</h3>
                    <p><strong>Type:</strong> {safe(data.prescriberType)}</p>
                    <p><strong>Name:</strong> {safe(data.prescriberName)}</p>
                    <p><strong>GPhC Number:</strong> {safe(data.prescriberGPhC || data.GPHCnumber)}</p>
                    {/* ✅ Bug 3: Use datePharm or fall back, but not just today */}
                    <p><strong>Date:</strong> {safe(data.datePharm || data.consultationDate || data.date)}</p>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                    <h3 style={{ marginBottom: 10 }}>Prescriber Signature</h3>
                    {data.pharmacistSignature ? (
                        <img src={data.pharmacistSignature} alt="Pharmacist Signature" className="signature-img" />
                    ) : (
                        <div className="signature-placeholder" style={{ border: "1px dashed #ccc", padding: "20px", color: "#aaa" }}>
                            Signature
                        </div>
                    )}
                </div>
            </section>


        </div>
    );
}
