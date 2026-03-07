import React from "react";
import "./WeightLossConsultationTemplate.css";
import { useApp } from "../AppContext.jsx";

export default function WeightLossConsultationTemplate({
  data = {},
  consultation = {},
  pharmacist = {},
  serviceId
}) {
  const { weightLossFollowupOriginalData } = useApp();

  const f = serviceId === "weightlossFollowup"
    ? { ...(weightLossFollowupOriginalData?.patient_data || {}), ...(weightLossFollowupOriginalData?.pharmacist_data || {}) }
    : data;
  const c = serviceId === "weightlossFollowup"
    ? (weightLossFollowupOriginalData?.consultation_data || {})
    : consultation;
  const safe = (val) => (val && val !== "" ? val : "—");

  // --- BMI Fallback Calculation ---
  const bmi =
    c.bmi ||
    (c.heightFeet && c.weightStones
      ? calculateBMI(
        c.heightFeet,
        c.heightInches,
        c.weightStones,
        c.weightPounds
      )
      : "—");

  function calculateBMI(feet, inches, stones, pounds) {
    const totalInches = Number(feet || 0) * 12 + Number(inches || 0);
    const heightM = totalInches * 0.0254;
    const totalPounds = Number(stones || 0) * 14 + Number(pounds || 0);
    const weightKg = totalPounds * 0.453592;
    return heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(2) : "—";
  }

  return (
    <div className="template weightloss-template">
      {/* Header */}
      <div className="header">
        <img src="/Logo3.png" alt="CarePlus Logo" className="logo" />
        <h1>Weight Loss Consultation Form</h1>
      </div>

      {/* Patient Details */}
      <section className="template-section">
        <h2>Patient Details</h2>
        <p><strong>Full Name:</strong> {safe(f.fullName)}</p>
        <p><strong>Date of Birth:</strong> {safe(f.dob)}</p>
        <p><strong>Contact Number:</strong> {safe(f.telephone)}</p>
        <p><strong>Email:</strong> {safe(f.email)}</p>
        <p><strong>Address:</strong> {safe(f.address)}</p>
        <p><strong>Surgery Name:</strong> {safe(f.surgery)}</p>
      </section>

      {/* Measurements */}
      <section className="template-section">
        <h2>Measurements</h2>
        <p>
          <strong>Height:</strong>{" "}
          {c.heightCm
            ? `${c.heightCm} cm`
            : `${safe(c.heightFeet)} ft ${safe(
              c.heightInches
            )} in`}
        </p>
        <p>
          <strong>Current Weight:</strong>{" "}
          {c.weightKg
            ? `${c.weightKg} kg`
            : `${safe(c.weightStones)} st ${safe(
              c.weightPounds
            )} lb`}
        </p>
        <p>
          <strong>Target Weight:</strong>{" "}
          {c.targetWeightKg
            ? `${c.targetWeightKg} kg`
            : `${safe(c.targetWeightStones)} st ${safe(
              c.targetWeightPounds
            )} lb`}
        </p>
        <p>
          <strong>Waist Circumference:</strong>{" "}
          {safe(c.waist)} {c.waistUnit || "cm"}
        </p>
        <p>
          <strong>Blood Pressure:</strong>{" "}
          {c.bpSystolic && c.bpDiastolic
            ? `${c.bpSystolic}/${c.bpDiastolic} mmHg`
            : "—"}
        </p>
        <p><strong>BMI:</strong> {bmi}</p>
      </section>

      {/* Lifestyle */}
      <section className="template-section">
        <h2>Lifestyle & Habits</h2>
        <p><strong>Lifestyle Summary:</strong> {safe(c.lifestyle || f.lifestyle)}</p>
        <p><strong>Currently taking contraception pills:</strong> {c.onContraception ? "Yes" : "No"}</p>
        <p><strong>Follow-up Preference:</strong> {safe(f.followUpPreference)}</p>
      </section>

      {/* Medical Screening */}
      <section className="template-section">
        <h2>Medical Screening Responses</h2>
        <table className="template-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
              <th>Details (if applicable)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>High cholesterol (dyslipidaemia)</td>
              <td>{safe(c.cholesterol)}</td>
              <td>{safe(c.cholesterolDetails)}</td>
            </tr>
            <tr>
              <td>Sleep apnoea</td>
              <td>{safe(c.sleepApnoea)}</td>
              <td>{safe(c.sleepApnoeaDetails)}</td>
            </tr>
            <tr>
              <td>Taking medication for blood pressure</td>
              <td>{safe(c.bpMeds)}</td>
              <td>{safe(c.bpMedsDetails)}</td>
            </tr>
            <tr>
              <td>Diabetes</td>
              <td>{safe(c.diabetes)}</td>
              <td>{safe(c.diabetesDetails)}</td>
            </tr>
            <tr>
              <td>Allergies</td>
              <td>{safe(c.allergies)}</td>
              <td>{safe(c.allergiesDetails)}</td>
            </tr>
            <tr>
              <td>Eating disorder (current or past)</td>
              <td>{safe(c.eatingDisorder)}</td>
              <td>{safe(c.eatingDisorderDetails)}</td>
            </tr>
            <tr>
              <td>Lactose intolerance</td>
              <td>{safe(c.lactoseIntolerance)}</td>
              <td>{safe(c.lactoseIntoleranceDetails)}</td>
            </tr>
            <tr>
              <td>Liver problems</td>
              <td>{c.liverProblems?.join(", ") || "—"}</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Kidney problems</td>
              <td>{safe(c.kidney)}</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Mental health conditions</td>
              <td>{c.mentalHealth?.join(", ") || "—"}</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Heart or circulation problems</td>
              <td>{safe(c.heart)}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Prescriber & Pharmacist Info */}
      <section className="template-section">
        <h2>Prescriber & Pharmacist Information</h2>
        <p><strong>Prescriber Name:</strong> {safe(f.prescriberName)}</p>
        <p><strong>Prescriber Type:</strong> {safe(f.prescriberType)}</p>
        <p><strong>GPhC Number:</strong> {safe(f.GPHCnumber)}</p>
        <p><strong>Pharmacist Notes:</strong> {safe(f.notes)}</p>
      </section>

      {/* Medication Details */}
      <section className="template-section">
        {serviceId === "weightlossFollowup" ? (
          <>
            <h2>Original Medication & Program</h2>
            <p><strong>Dispensed Medication:</strong> {safe(f.medication)}</p>
            {f.medication === "Other" && (
              <p><strong>Specified Medication:</strong> {safe(f.otherMedication)}</p>
            )}
            <p><strong>Dosage:</strong> {safe(f.dosage)}</p>
            <p><strong>Start Date:</strong> {safe(f.startDate)}</p>
            <p><strong>Batch Number:</strong> {safe(f.batchNumber)}</p>

            <h2 style={{ marginTop: "16px" }}>Follow-Up Medication & Program (Current Session)</h2>
            <p><strong>Dispensed Medication:</strong> {safe(data.medication)}</p>
            {data.medication === "Other" && (
              <p><strong>Specified Medication:</strong> {safe(data.otherMedication)}</p>
            )}
            <p><strong>Strength:</strong> {safe(data.strength)}</p>
            <p><strong>Dose Number:</strong> {safe(data.doseNumber)}</p>
            <p><strong>Date Given:</strong> {safe(data.dateGiven)}</p>
            <p><strong>Batch Number:</strong> {safe(data.batchNumber)}</p>
            <p><strong>Expiry Date:</strong> {safe(data.dateExpiry)}</p>
            <p><strong>Pharmacist Notes:</strong> {safe(data.notes)}</p>
          </>
        ) : (
          <>
            <h2>Medication & Program</h2>
            <p><strong>Dispensed Medication:</strong> {safe(f.medication)}</p>
            {f.medication === "Other" && (
              <p><strong>Specified Medication:</strong> {safe(f.otherMedication)}</p>
            )}
            <p><strong>Dosage:</strong> {safe(f.dosage)}</p>
            <p><strong>Start Date:</strong> {safe(f.startDate)}</p>
            <p><strong>Follow-Up Date:</strong> {safe(f.followUpDate)}</p>
            <p><strong>Batch Number:</strong> {safe(f.batchNumber)}</p>
            <p><strong>Additional Notes:</strong> {safe(f.additionalNotes)}</p>
          </>
        )}
      </section>

      {/* Signatures */}
      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {f.signaturePatient ? (
            <img src={f.signaturePatient} alt="Patient Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">Signature not provided</div>
          )}
        </div>

        <div>
          <h3>Pharmacist Signature</h3>
          {f.pharmacistSignature ? (
            <img src={f.pharmacistSignature} alt="Pharmacist Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">Signature not provided</div>
          )}
        </div>

        <div>
          <h3>Prescriber Signature</h3>
          {f.prescriberSignature ? (
            <img src={f.prescriberSignature} alt="Prescriber Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">Signature not provided</div>
          )}
        </div>
      </section>
    </div>
  );
}
