import React from "react";
import "./WeightlossTemplate.css"; // Reuse styling for orange bars and grey box

export default function PeriodDelayTemplate({ data }) {
    const safe = (val) => (val !== undefined && val !== null && String(val).trim() !== "" ? val : "—");

    // Calculate age if dob exists
    const getAge = (dob) => {
        if (!dob) return "—";
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return isNaN(age) ? "—" : age;
    };

    return (
        <div className="template weightloss-template">
            {/* 1. Header */}
            <header className="template-header">
                <div className="logo">
                    <img src="/Logo3.png" alt="CarePlus Logo" className="logo" />
                </div>
                <div className="form-meta">
                    <h1 style={{ textDecoration: "underline", color: "#007bb5" }}>Patient Consent Form</h1>
                </div>
            </header>

            {/* 2. Patient Demographics section */}
            <section className="template-section two-column">
                <div>
                    <p><strong>Title:</strong> {safe(data.title)}</p>
                    <p><strong>First Name:</strong> {safe(data.firstName || data.fullName?.split(" ")[0])}</p>
                    <p><strong>Surname:</strong> {safe(data.surname || data.fullName?.split(" ").slice(1).join(" "))}</p>
                    <p><strong>Date of Birth:</strong> {safe(data.dob)}</p>
                    <p><strong>Age:</strong> {getAge(data.dob)}</p>
                </div>
                <div>
                    <p><strong>Telephone:</strong> {safe(data.telephone)}</p>
                    <p><strong>Email:</strong> {safe(data.email)}</p>
                    <p><strong>Home Address:</strong> {safe(data.address)}</p>
                </div>
            </section>

            {/* 3. GP Details section */}
            <section className="template-section">
                <h2>GP Information</h2>
                <p><strong>GP Name & Address:</strong> {data.gpName && data.gpAddress ? `${data.gpName}, ${data.gpAddress}` : safe(data.gpName || data.gpAddress)}</p>
            </section>

            {/* 4. Medication & Prescriber Info */}
            <section className="template-section">
                <h2>Medication & Prescriber Details</h2>
                <p><strong>Medication:</strong> {safe(data.medication === "Other" ? data.otherMedication : data.medication)}</p>
                <p><strong>Dosage:</strong> {safe(data.dosage)}</p>
                <p><strong>Start Date:</strong> {safe(data.startDate || data.datePharm)}</p>
                <p><strong>Follow-up Date:</strong> {safe(data.followUpDate)}</p>
                <p><strong>Batch Number:</strong> {safe(data.batchNumber)}</p>
                <p><strong>Expiry Date:</strong> {safe(data.dateExpiry)}</p>
                <p><strong>Prescriber Type:</strong> {safe(data.prescriberType)}</p>
                <p><strong>Prescriber Name:</strong> {safe(data.prescriberName)}</p>
                <p><strong>Prescriber Address:</strong> {safe(data.prescriberAddress)}</p>
                <p><strong>GPhC Number:</strong> {safe(data.GPHCnumber)}</p>
            </section>

            {/* 5. Consent Text */}
            <section className="template-section consent">
                <p>
                    I consent to continue treatment in the period delay program. I understand the medication, its potential risks and benefits, and have had the opportunity to ask questions. I confirm that the information provided is accurate to the best of my knowledge.
                </p>
            </section>

            {/* 6. Signatures */}
            <section className="template-section signature-section">
                <div>
                    <h3>Patient Signature</h3>
                    {data.signaturePatient ? (
                        <img src={data.signaturePatient} alt="Patient Signature" className="signature-img" />
                    ) : (
                        <div className="signature-placeholder">Signature</div>
                    )}
                </div>
                <div>
                    <h3>Pharmacist Signature</h3>
                    {data.pharmacistSignature ? (
                        <img src={data.pharmacistSignature} alt="Pharmacist Signature" className="signature-img" />
                    ) : (
                        <div className="signature-placeholder">Signature</div>
                    )}
                </div>
            </section>

            <section className="template-section dates-section" style={{ display: "flex", justifyContent: "space-between", marginTop: -20 }}>
                <div>
                    <p><strong>Date:</strong> {safe(data.dateSignedPatient || new Date().toISOString().split("T")[0])}</p>
                </div>
                <div>
                    <p><strong>Date:</strong> {safe(data.datePharm || new Date().toISOString().split("T")[0])}</p>
                </div>
            </section>
        </div>
    );
}
