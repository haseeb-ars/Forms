import React from "react";
import "./B12Template.css"; // Reuse styling
import { useApp } from "../AppContext";

export default function FollowupTravelPrescriptionTemplate({ data }) {
    const { followupTravelOriginalData } = useApp();

    const safe = (val) => val || "—";

    // Build the array of historical doses
    let previousDoses = [];
    if (followupTravelOriginalData?.pharmacist_data) {
        const pData = followupTravelOriginalData.pharmacist_data;
        if (Array.isArray(pData.vaccines)) {
            previousDoses = previousDoses.concat(pData.vaccines);
        }
        if (pData.malariaGiven === "Yes" && Array.isArray(pData.malariaVaccines)) {
            previousDoses = previousDoses.concat(pData.malariaVaccines);
        }
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
                <h2>Patient Details</h2>
                <div className="grid grid--2">
                    <p><strong>Name:</strong> {safe(data.fullName || data.name)}</p>
                    <p><strong>DOB:</strong> {safe(data.dob)}</p>
                    <p><strong>Address:</strong> {safe(data.address)}</p>
                    <p><strong>NHS No:</strong> {safe(data.nhsNumber)}</p>
                    <p><strong>GP Details:</strong> {safe(data.surgery)}</p>
                </div>
            </section>

            {/* ORIGINAL DOSES (HISTORY) */}
            <section className="template-section">
                <h2>Previous Travel Dose(s)</h2>
                {previousDoses.length > 0 ? (
                    <table className="template-table">
                        <thead>
                            <tr>
                                <th>Vaccine</th>
                                <th>Brand</th>
                                <th>Batch</th>
                                <th>Date Given</th>
                                <th>Expiry</th>
                            </tr>
                        </thead>
                        <tbody>
                            {previousDoses.map((dose, i) => (
                                <tr key={i}>
                                    <td>{safe(dose.name || dose.vaccine || dose.vaccineName)}</td>
                                    <td>{safe(dose.brand)}</td>
                                    <td>{safe(dose.batchNumber)}</td>
                                    <td>{safe(dose.dateGiven)}</td>
                                    <td>{safe(dose.expiry)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No previous vaccinations found in the original record.</p>
                )}
            </section>

            {/* NEW DOSE */}
            <section className="template-section">
                <h2>Follow-up Dose(s) (Current Session)</h2>
                {Array.isArray(data.followUpVaccines) && data.followUpVaccines.length > 0 ? (
                    <table className="template-table">
                        <thead>
                            <tr>
                                <th>Vaccine</th>
                                <th>Dose Number</th>
                                <th>Batch</th>
                                <th>Date Given</th>
                                <th>Expiry</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.followUpVaccines.map((v, i) => (
                                <tr key={i}>
                                    <td>{safe(v.name)}</td>
                                    <td>{safe(v.doseNumber)}</td>
                                    <td>{safe(v.batchNumber)}</td>
                                    <td>{safe(v.dateGiven)}</td>
                                    <td>{safe(v.expiry)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No follow-up doses recorded for this session.</p>
                )}
                {data.notes && (
                    <p style={{ marginTop: 10 }}>
                        <strong>Pharmacist Notes:</strong> {data.notes}
                    </p>
                )}
            </section>

            {/* PRESCRIBER & SIGNATURE */}
            <section className="template-section signature-section">
                <div style={{ flex: 2 }}>
                    <h3>Prescriber Details</h3>
                    <p><strong>Type:</strong> {safe(data.prescriberType)}</p>
                    <p><strong>Name:</strong> {safe(data.prescriberName)}</p>
                    <p><strong>GPhC Number:</strong> {safe(data.prescriberGPhC || data.GPHCnumber)}</p>
                    <p><strong>Date:</strong> {safe(data.datePharm || new Date().toISOString().split("T")[0])}</p>
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
