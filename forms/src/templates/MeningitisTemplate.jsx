import React from "react";
import "./CovidTemplate.css"; // reuse same CSS

export default function MeningitisTemplate({ data }) {
    const vaccines = Array.isArray(data.vaccines) ? data.vaccines : [];
    const menVaccine = vaccines[0] || {};

    return (
        <div className="template covid-template">
            <img src="/Logo3.png" alt="CarePlus Logo" width={280} />
            <h1>Meningitis B Vaccination Consent Form</h1>

            {/* Patient Details */}
            <section className="template-section">
                <h2>Patient Details</h2>
                <p><strong>Full Name:</strong> {data.fullName}</p>
                <p><strong>Date of Birth:</strong> {data.dob}</p>
                <p><strong>Contact Number:</strong> {data.telephone}</p>
                <p><strong>Address:</strong> {data.address}</p>
                <p><strong>NHS Number:</strong> {data.nhsNumber}</p>
                <p><strong>Surgery Name:</strong> {data.surgeryName}</p>
            </section>

            {/* Consultation / Screening */}
            <section className="template-section">
                <h2>Consultation Screening</h2>

                <p>
                    <strong>Previous Meningitis B vaccination status:</strong>{" "}
                    {Array.isArray(data.previousMeningitis)
                        ? data.previousMeningitis.join(", ")
                        : data.previousMeningitis}
                </p>

                <p>
                    <strong>Severe allergy/anaphylaxis to Meningitis B vaccine components (e.g. diphtheria toxoid, latex):</strong>{" "}
                    {data.allergyReaction}
                </p>
                {data.allergyReaction === "Yes" && (
                    <p><strong>More information:</strong> {data.allergyReaction_extra}</p>
                )}

                <p>
                    <strong>Pregnant or planning pregnancy within 1 month:</strong>{" "}
                    {data.pregnancy}
                </p>
                {data.pregnancy === "Yes" && (
                    <p><strong>More information:</strong> {data.pregnancy_extra}</p>
                )}

                <p>
                    <strong>Immunosuppressed / on chemo, biologics or high-dose steroids:</strong>{" "}
                    {data.immunosuppression}
                </p>
                {data.immunosuppression === "Yes" && (
                    <p><strong>More information:</strong> {data.immunosuppression_extra}</p>
                )}

                <p>
                    <strong>Currently unwell / fever or acute illness:</strong>{" "}
                    {data.currentIllness}
                </p>
                {data.currentIllness === "Yes" && (
                    <p><strong>More information:</strong> {data.currentIllness_extra}</p>
                )}

                <p>
                    <strong>History of Guillain-Barré syndrome:</strong>{" "}
                    {data.guillainBarre}
                </p>
                {data.guillainBarre === "Yes" && (
                    <p><strong>More information:</strong> {data.guillainBarre_extra}</p>
                )}
            </section>

            {/* Vaccination Details */}
            <section className="template-section">
                <h2>Vaccination Details</h2>

                <p><strong>Vaccine:</strong> {menVaccine.name || "Meningitis B"}</p>
                <p><strong>Brand Name:</strong> {data.vaccineBrand}</p>
                <p><strong>Batch Number:</strong> {data.batchNumber}</p>
                <p><strong>Expiry Date:</strong> {data.dateExpiry}</p>
                <p><strong>Date Given:</strong> {data.dateGiven}</p>
                <p><strong>Administration Site:</strong> {data.site}</p>

                <p><strong>Pharmacist Name (GPhC):</strong> {data.pharmacistNameGPhC}</p>
                <p><strong>Pharmacy Name:</strong> {data.pharmacyName}</p>
                <p><strong>Pharmacy Address:</strong> {data.pharmacyAddress}</p>

                <p><strong>Adverse Reactions / Notes:</strong> {data.adverseReactions}</p>
                <p><strong>Point of Variance:</strong> {data.pointOfVariance}</p>
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
                        <div className="signature-placeholder">No signature provided</div>
                    )}
                    <p><strong>Date Signed:</strong> {data.dateSignedPatient}</p>
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
                    <p><strong>Date Signed:</strong> {data.datePharm}</p>
                </div>
            </section>
        </div>
    );
}
