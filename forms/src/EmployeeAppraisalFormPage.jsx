import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import LabeledField from "./LabeledField.jsx";
import SignatureBox from "./SignatureBox.jsx";
import "./EmployeeAppraisalFormPage.css";

const RATING_CRITERIA = [
  { key: "qualityOfWork", label: "Quality of Work", desc: "Accuracy, thoroughness, and effectiveness of work output." },
  { key: "productivity", label: "Productivity", desc: "Volume and speed of work completed within established timelines." },
  { key: "communicationSkills", label: "Communication Skills", desc: "Clarity, active listening, and effective information sharing." },
  { key: "teamwork", label: "Teamwork and Collaboration", desc: "Cooperation with colleagues, willingness to assist, and team spirit." },
  { key: "attendance", label: "Attendance and Punctuality", desc: "Reliability, punctuality, and attendance record." },
  { key: "problemSolving", label: "Problem-Solving Skills", desc: "Analytical capability and resourcefulness in resolving issues." },
  { key: "initiative", label: "Initiative and Accountability", desc: "Proactive drive, ownership of responsibility, and self-motivation." },
  { key: "policyCompliance", label: "Compliance with Company Policies", desc: "Adherence to CarePlusHealth procedures, safety, and protocols." },
];

const RECOMMENDATION_OPTIONS = [
  "Exceeds Expectations",
  "Meets Expectations",
  "Needs Improvement",
  "Unsatisfactory",
];

export default function EmployeeAppraisalFormPage() {
  const navigate = useNavigate();
  const {
    employeeAppraisalConsultation,
    setEmployeeAppraisalConsultation,
    setPatient,
    setPharm,
  } = useApp();

  const [formState, setFormState] = useState({
    employeeName: employeeAppraisalConsultation.employeeName || "",
    employeeId: employeeAppraisalConsultation.employeeId || "",
    jobTitle: employeeAppraisalConsultation.jobTitle || "",
    department: employeeAppraisalConsultation.department || "",
    managerName: employeeAppraisalConsultation.managerName || "",
    startDate: employeeAppraisalConsultation.startDate || "",
    appraisalDate: employeeAppraisalConsultation.appraisalDate || new Date().toISOString().split("T")[0],

    qualityOfWork: employeeAppraisalConsultation.qualityOfWork || 5,
    productivity: employeeAppraisalConsultation.productivity || 5,
    communicationSkills: employeeAppraisalConsultation.communicationSkills || 5,
    teamwork: employeeAppraisalConsultation.teamwork || 5,
    attendance: employeeAppraisalConsultation.attendance || 5,
    problemSolving: employeeAppraisalConsultation.problemSolving || 5,
    initiative: employeeAppraisalConsultation.initiative || 5,
    policyCompliance: employeeAppraisalConsultation.policyCompliance || 5,

    keyAchievements: employeeAppraisalConsultation.keyAchievements || "",
    goalsMet: employeeAppraisalConsultation.goalsMet || "",
    areasForImprovement: employeeAppraisalConsultation.areasForImprovement || "",

    trainingNeeds: employeeAppraisalConsultation.trainingNeeds || "",
    careerObjectives: employeeAppraisalConsultation.careerObjectives || "",
    agreedActionPlan: employeeAppraisalConsultation.agreedActionPlan || "",

    overallRating: employeeAppraisalConsultation.overallRating || 5,
    managerComments: employeeAppraisalConsultation.managerComments || "",
    employeeComments: employeeAppraisalConsultation.employeeComments || "",
    recommendation: employeeAppraisalConsultation.recommendation || "Meets Expectations",

    employeeSignature: employeeAppraisalConsultation.employeeSignature || "",
    managerSignature: employeeAppraisalConsultation.managerSignature || "",
    dateSigned: employeeAppraisalConsultation.dateSigned || new Date().toISOString().split("T")[0],
  });

  const [validationError, setValidationError] = useState("");

  const updateField = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setValidationError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🛡️ Mandatory Field Validation (Employee Information & Overall Assessment)
    const requiredEmployeeFields = [
      { key: "employeeName", label: "Employee Name" },
      { key: "employeeId", label: "Employee ID" },
      { key: "jobTitle", label: "Job Title" },
      { key: "department", label: "Department" },
      { key: "managerName", label: "Manager/Supervisor Name" },
      { key: "startDate", label: "Employment Start Date" },
      { key: "appraisalDate", label: "Date of Appraisal" },
    ];

    for (const field of requiredEmployeeFields) {
      if (!formState[field.key] || !String(formState[field.key]).trim()) {
        setValidationError(`Mandatory field missing: ${field.label} in Employee Information section.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    if (!formState.recommendation) {
      setValidationError("Mandatory field missing: Recommendation in Overall Assessment section.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Save into Context
    setEmployeeAppraisalConsultation(formState);

    // Sync with generic patient & pharm slices for DB persistence & PDF auto-saving compatibility
    setPatient({
      fullName: formState.employeeName,
      name: formState.employeeName,
      dob: formState.startDate,
      employeeId: formState.employeeId,
      jobTitle: formState.jobTitle,
      department: formState.department,
      managerName: formState.managerName,
      startDate: formState.startDate,
      appraisalDate: formState.appraisalDate,
      signaturePatient: formState.employeeSignature,
      dateSignedPatient: formState.dateSigned,
    });

    setPharm({
      managerSignature: formState.managerSignature,
      recommendation: formState.recommendation,
      managerComments: formState.managerComments,
      employeeComments: formState.employeeComments,
      dateSigned: formState.dateSigned,
    });

    // Navigate to preview page with autoDownload
    navigate({
      pathname: "/service/employeeAppraisal/preview",
      search: "?autoDownload=true",
    });
  };

  return (
    <form className="appraisal-form" onSubmit={handleSubmit}>
      <div className="appraisal-header">
        <span className="appraisal-badge">CarePlusHealth HR</span>
        <h2>Employee Performance Appraisal Form</h2>
        <p className="appraisal-subtitle">
          Complete annual or periodic performance evaluations, development planning, and sign-offs.
        </p>
      </div>

      {validationError && (
        <div className="validation-alert">
          <span className="alert-icon">⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* SECTION 1: Employee Information */}
      <section className="appraisal-section">
        <div className="section-header">
          <span className="section-number">1</span>
          <h3>Employee Information <span className="req-star">* Required</span></h3>
        </div>
        <div className="grid grid--2">
          <LabeledField label="Employee Name *">
            <input
              type="text"
              className="input"
              value={formState.employeeName}
              onChange={(e) => updateField("employeeName", e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              required
            />
          </LabeledField>

          <LabeledField label="Employee ID *">
            <input
              type="text"
              className="input"
              value={formState.employeeId}
              onChange={(e) => updateField("employeeId", e.target.value)}
              placeholder="e.g. CPH-8492"
              required
            />
          </LabeledField>

          <LabeledField label="Job Title *">
            <input
              type="text"
              className="input"
              value={formState.jobTitle}
              onChange={(e) => updateField("jobTitle", e.target.value)}
              placeholder="e.g. Clinical Pharmacist"
              required
            />
          </LabeledField>

          <LabeledField label="Department *">
            <input
              type="text"
              className="input"
              value={formState.department}
              onChange={(e) => updateField("department", e.target.value)}
              placeholder="e.g. Healthcare Operations"
              required
            />
          </LabeledField>

          <LabeledField label="Manager/Supervisor Name *">
            <input
              type="text"
              className="input"
              value={formState.managerName}
              onChange={(e) => updateField("managerName", e.target.value)}
              placeholder="e.g. Dr. Robert Taylor"
              required
            />
          </LabeledField>

          <LabeledField label="Employment Start Date *">
            <input
              type="date"
              className="input"
              value={formState.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              required
            />
          </LabeledField>

          <LabeledField label="Date of Appraisal *" span>
            <input
              type="date"
              className="input"
              value={formState.appraisalDate}
              onChange={(e) => updateField("appraisalDate", e.target.value)}
              required
            />
          </LabeledField>
        </div>
      </section>

      {/* SECTION 2: Performance Evaluation */}
      <section className="appraisal-section">
        <div className="section-header">
          <span className="section-number">2</span>
          <h3>Performance Evaluation (Rating: 1–5)</h3>
        </div>
        <p className="section-desc">
          Rate the employee's performance across key competencies: 1 (Unsatisfactory) to 5 (Outstanding).
        </p>

        <div className="ratings-grid">
          {RATING_CRITERIA.map((criterion) => (
            <div key={criterion.key} className="rating-card">
              <div className="rating-info">
                <h4>{criterion.label}</h4>
                <p>{criterion.desc}</p>
              </div>
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    className={`rating-btn ${formState[criterion.key] === score ? "active" : ""}`}
                    onClick={() => updateField(criterion.key, score)}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: Goals and Achievements */}
      <section className="appraisal-section">
        <div className="section-header">
          <span className="section-number">3</span>
          <h3>Goals and Achievements</h3>
        </div>

        <LabeledField label="Key Achievements During the Review Period" span>
          <textarea
            className="input textarea"
            rows={4}
            value={formState.keyAchievements}
            onChange={(e) => updateField("keyAchievements", e.target.value)}
            placeholder="Highlight major milestones, completed projects, and personal achievements..."
          />
        </LabeledField>

        <LabeledField label="Goals Met Since the Last Appraisal" span>
          <textarea
            className="input textarea"
            rows={4}
            value={formState.goalsMet}
            onChange={(e) => updateField("goalsMet", e.target.value)}
            placeholder="Detail objectives accomplished against previously agreed targets..."
          />
        </LabeledField>

        <LabeledField label="Areas for Improvement" span>
          <textarea
            className="input textarea"
            rows={4}
            value={formState.areasForImprovement}
            onChange={(e) => updateField("areasForImprovement", e.target.value)}
            placeholder="Identify skills or performance aspects requiring further growth..."
          />
        </LabeledField>
      </section>

      {/* SECTION 4: Development Plan */}
      <section className="appraisal-section">
        <div className="section-header">
          <span className="section-number">4</span>
          <h3>Development Plan</h3>
        </div>

        <LabeledField label="Training Needs" span>
          <textarea
            className="input textarea"
            rows={3}
            value={formState.trainingNeeds}
            onChange={(e) => updateField("trainingNeeds", e.target.value)}
            placeholder="Specific clinical, professional, or soft-skill training courses needed..."
          />
        </LabeledField>

        <LabeledField label="Career Development Objectives" span>
          <textarea
            className="input textarea"
            rows={3}
            value={formState.careerObjectives}
            onChange={(e) => updateField("careerObjectives", e.target.value)}
            placeholder="Long-term career goals and professional growth aspirations..."
          />
        </LabeledField>

        <LabeledField label="Agreed Action Plan" span>
          <textarea
            className="input textarea"
            rows={3}
            value={formState.agreedActionPlan}
            onChange={(e) => updateField("agreedActionPlan", e.target.value)}
            placeholder="Actionable steps, deadlines, and responsibilities for the upcoming review period..."
          />
        </LabeledField>
      </section>

      {/* SECTION 5: Overall Assessment */}
      <section className="appraisal-section">
        <div className="section-header">
          <span className="section-number">5</span>
          <h3>Overall Assessment <span className="req-star">* Required</span></h3>
        </div>

        <div className="overall-score-picker">
          <label className="label">Overall Performance Rating (1–5)</label>
          <div className="rating-buttons rating-buttons--large">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                className={`rating-btn rating-btn--large ${formState.overallRating === score ? "active" : ""}`}
                onClick={() => updateField("overallRating", score)}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        <LabeledField label="Recommendation *" span>
          <select
            className="input"
            value={formState.recommendation}
            onChange={(e) => updateField("recommendation", e.target.value)}
            required
          >
            {RECOMMENDATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </LabeledField>

        <LabeledField label="Manager's Comments" span>
          <textarea
            className="input textarea"
            rows={4}
            value={formState.managerComments}
            onChange={(e) => updateField("managerComments", e.target.value)}
            placeholder="Overall evaluation and summary from the line manager..."
          />
        </LabeledField>

        <LabeledField label="Employee's Comments" span>
          <textarea
            className="input textarea"
            rows={4}
            value={formState.employeeComments}
            onChange={(e) => updateField("employeeComments", e.target.value)}
            placeholder="Feedback, responses, or additional comments from the employee..."
          />
        </LabeledField>
      </section>

      {/* SECTION 6: Sign-Off */}
      <section className="appraisal-section">
        <div className="section-header">
          <span className="section-number">6</span>
          <h3>Sign-Off</h3>
        </div>

        <div className="grid grid--2">
          <div>
            <div className="label">Employee Signature</div>
            <SignatureBox
              value={formState.employeeSignature}
              onChange={(v) => updateField("employeeSignature", v)}
            />
          </div>

          <div>
            <div className="label">Manager Signature</div>
            <SignatureBox
              value={formState.managerSignature}
              onChange={(v) => updateField("managerSignature", v)}
            />
          </div>

          <LabeledField label="Date Signed" span>
            <input
              type="date"
              className="input"
              value={formState.dateSigned}
              onChange={(e) => updateField("dateSigned", e.target.value)}
            />
          </LabeledField>
        </div>
      </section>

      <div className="form-actions">
        <button type="submit" className="btn btn--primary btn--lg">
          Generate Preview & Save Appraisal
        </button>
      </div>
    </form>
  );
}
