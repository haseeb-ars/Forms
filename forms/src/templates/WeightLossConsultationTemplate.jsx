import React from "react";
import "./WeightLossConsultationTemplate.css";

export default function WeightLossConsultationTemplate({
  data = {},
  consultation = {},
  pharmacist = {},
}) {
  const safe = (val) => (val && val !== "" ? val : "—");

  // --- BMI Fallback Calculation ---
  const bmi =
    consultation.bmi ||
    (consultation.heightFeet && consultation.weightStones
      ? calculateBMI(
          consultation.heightFeet,
          consultation.heightInches,
          consultation.weightStones,
          consultation.weightPounds
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
        <p><strong>Full Name:</strong> {safe(data.fullName)}</p>
        <p><strong>Date of Birth:</strong> {safe(data.dob)}</p>
        <p><strong>Contact Number:</strong> {safe(data.telephone)}</p>
        <p><strong>Email:</strong> {safe(data.email)}</p>
        <p><strong>Address:</strong> {safe(data.address)}</p>
        <p><strong>Surgery Name:</strong> {safe(data.surgery)}</p>
      </section>

      {/* Measurements */}
      <section className="template-section">
        <h2>Measurements</h2>
        <p>
          <strong>Height:</strong>{" "}
          {consultation.heightCm
            ? `${consultation.heightCm} cm`
            : `${safe(consultation.heightFeet)} ft ${safe(
                consultation.heightInches
              )} in`}
        </p>
        <p>
          <strong>Current Weight:</strong>{" "}
          {consultation.weightKg
            ? `${consultation.weightKg} kg`
            : `${safe(consultation.weightStones)} st ${safe(
                consultation.weightPounds
              )} lb`}
        </p>
        <p>
          <strong>Target Weight:</strong>{" "}
          {consultation.targetWeightKg
            ? `${consultation.targetWeightKg} kg`
            : `${safe(consultation.targetWeightStones)} st ${safe(
                consultation.targetWeightPounds
              )} lb`}
        </p>
        <p>
          <strong>Waist Circumference:</strong>{" "}
          {safe(consultation.waist)} {consultation.waistUnit || "cm"}
        </p>
        <p>
          <strong>Blood Pressure:</strong>{" "}
          {consultation.bpSystolic && consultation.bpDiastolic
            ? `${consultation.bpSystolic}/${consultation.bpDiastolic} mmHg`
            : "—"}
        </p>
        <p><strong>BMI:</strong> {bmi}</p>
      </section>

      {/* Lifestyle */}
      <section className="template-section">
        <h2>Lifestyle & Habits</h2>
        <p><strong>Lifestyle Summary:</strong> {safe(consultation.lifestyle || data.lifestyle)}</p>
        <p><strong>Currently taking contraception pills:</strong> {consultation.onContraception ? "Yes" : "No"}</p>
        <p><strong>Follow-up Preference:</strong> {safe(data.followUpPreference)}</p>
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
              <td>{safe(consultation.cholesterol)}</td>
              <td>{safe(consultation.cholesterolDetails)}</td>
            </tr>
            <tr>
              <td>Sleep apnoea</td>
              <td>{safe(consultation.sleepApnoea)}</td>
              <td>{safe(consultation.sleepApnoeaDetails)}</td>
            </tr>
            <tr>
              <td>Taking medication for blood pressure</td>
              <td>{safe(consultation.bpMeds)}</td>
              <td>{safe(consultation.bpMedsDetails)}</td>
            </tr>
            <tr>
              <td>Diabetes</td>
              <td>{safe(consultation.diabetes)}</td>
              <td>{safe(consultation.diabetesDetails)}</td>
            </tr>
            <tr>
              <td>Allergies</td>
              <td>{safe(consultation.allergies)}</td>
              <td>{safe(consultation.allergiesDetails)}</td>
            </tr>
            <tr>
              <td>Eating disorder (current or past)</td>
              <td>{safe(consultation.eatingDisorder)}</td>
              <td>{safe(consultation.eatingDisorderDetails)}</td>
            </tr>
            <tr>
              <td>Lactose intolerance</td>
              <td>{safe(consultation.lactoseIntolerance)}</td>
              <td>{safe(consultation.lactoseIntoleranceDetails)}</td>
            </tr>
            <tr>
              <td>Liver problems</td>
              <td>{consultation.liverProblems?.join(", ") || "—"}</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Kidney problems</td>
              <td>{safe(consultation.kidney)}</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Mental health conditions</td>
              <td>{consultation.mentalHealth?.join(", ") || "—"}</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Heart or circulation problems</td>
              <td>{safe(consultation.heart)}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Prescriber & Pharmacist Info */}
      <section className="template-section">
        <h2>Prescriber & Pharmacist Information</h2>
        <p><strong>Prescriber Name:</strong> {safe(data.prescriberName)}</p>
        <p><strong>Prescriber Type:</strong> {safe(data.prescriberType)}</p>
        <p><strong>GPhC Number:</strong> {safe(data.GPHCnumber)}</p>
        <p><strong>Pharmacist Notes:</strong> {safe(data.notes)}</p>
      </section>

      {/* Medication Details */}
      <section className="template-section">
        <h2>Medication & Program</h2>
        <p><strong>Dispensed Medication:</strong> {safe(data.medication)}</p>
        {data.medication === "Other" && (
          <p><strong>Specified Medication:</strong> {safe(data.otherMedication)}</p>
        )}
        <p><strong>Dosage:</strong> {safe(data.dosage)}</p>
        <p><strong>Start Date:</strong> {safe(data.startDate)}</p>
        <p><strong>Follow-Up Date:</strong> {safe(data.followUpDate)}</p>
        <p><strong>Batch Number:</strong> {safe(data.batchNumber)}</p>
        <p><strong>Additional Notes:</strong> {safe(data.additionalNotes)}</p>
      </section>

      {/* Signatures */}
      <section className="template-section signature-section">
        <div>
          <h3>Patient Signature</h3>
          {data.signaturePatient ? (
            <img src={data.signaturePatient} alt="Patient Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">Signature not provided</div>
          )}
        </div>

        <div>
          <h3>Pharmacist Signature</h3>
          {data.pharmacistSignature ? (
            <img src={data.pharmacistSignature} alt="Pharmacist Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">Signature not provided</div>
          )}
        </div>

        <div>
          <h3>Prescriber Signature</h3>
          {data.prescriberSignature ? (
            <img src={data.prescriberSignature} alt="Prescriber Signature" className="signature-img" />
          ) : (
            <div className="signature-placeholder">Signature not provided</div>
          )}
        </div>
      </section>
    </div>
  );
}
