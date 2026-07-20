import React from "react";
import "./EmployeeAppraisalTemplate.css";

export default function EmployeeAppraisalTemplate({ data = {} }) {
  const safe = (val) =>
    val !== undefined && val !== null && String(val).trim() !== "" ? val : "—";

  const RATING_CRITERIA = [
    { key: "qualityOfWork", label: "Quality of Work", desc: "Accuracy, thoroughness, and effectiveness" },
    { key: "productivity", label: "Productivity", desc: "Volume and speed within established timelines" },
    { key: "communicationSkills", label: "Communication Skills", desc: "Clarity, active listening, and information sharing" },
    { key: "teamwork", label: "Teamwork and Collaboration", desc: "Cooperation and willingness to assist" },
    { key: "attendance", label: "Attendance and Punctuality", desc: "Reliability and punctuality" },
    { key: "problemSolving", label: "Problem-Solving Skills", desc: "Analytical capability and resourcefulness" },
    { key: "initiative", label: "Initiative and Accountability", desc: "Proactive drive and ownership" },
    { key: "policyCompliance", label: "Compliance with Company Policies", desc: "Adherence to procedures and safety protocols" },
  ];

  const getRecommendationBadgeClass = (rec) => {
    switch (rec) {
      case "Exceeds Expectations": return "badge--exceeds";
      case "Meets Expectations": return "badge--meets";
      case "Needs Improvement": return "badge--improvement";
      case "Unsatisfactory": return "badge--unsatisfactory";
      default: return "badge--default";
    }
  };

  return (
    <div className="template appraisal-template">
      {/* 1. Header */}
      <header className="appraisal-doc-header">
        <div className="header-left">
          <img src="/Logo3.png" alt="CarePlusHealth Logo" className="brand-logo" />
          <div className="company-meta">
            <h2>{safe(data.pharmacyName || "CarePlusHealth")}</h2>
            <p>{safe(data.pharmacyAddress || "CarePlusHealth Head Office")}</p>
          </div>
        </div>
        <div className="header-right">
          <span className="doc-type-tag">HR Document</span>
          <h1>Employee Performance Appraisal</h1>
        </div>
      </header>

      {/* 2. Employee Information */}
      <section className="appraisal-doc-section">
        <div className="doc-section-title">
          <span>1</span> Employee Information
        </div>
        <div className="info-grid">
          <div className="info-cell">
            <span className="info-label">Employee Name</span>
            <span className="info-value highlight">{safe(data.employeeName || data.fullName || data.name)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Employee ID</span>
            <span className="info-value">{safe(data.employeeId)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Job Title</span>
            <span className="info-value">{safe(data.jobTitle)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Department</span>
            <span className="info-value">{safe(data.department)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Manager/Supervisor</span>
            <span className="info-value">{safe(data.managerName)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Employment Start Date</span>
            <span className="info-value">{safe(data.startDate || data.dob)}</span>
          </div>
          <div className="info-cell full-width">
            <span className="info-label">Date of Appraisal</span>
            <span className="info-value">{safe(data.appraisalDate || data.dateSigned)}</span>
          </div>
        </div>
      </section>

      {/* 3. Performance Evaluation */}
      <section className="appraisal-doc-section">
        <div className="doc-section-title">
          <span>2</span> Performance Evaluation
        </div>
        <table className="eval-table">
          <thead>
            <tr>
              <th>Performance Competency</th>
              <th>Description</th>
              <th className="center-col">Rating (1–5)</th>
            </tr>
          </thead>
          <tbody>
            {RATING_CRITERIA.map((criterion) => {
              const score = data[criterion.key] || 5;
              return (
                <tr key={criterion.key}>
                  <td className="comp-name">{criterion.label}</td>
                  <td className="comp-desc">{criterion.desc}</td>
                  <td className="center-col">
                    <span className={`score-pill score-${score}`}>{score} / 5</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* 4. Goals and Achievements */}
      <section className="appraisal-doc-section">
        <div className="doc-section-title">
          <span>3</span> Goals and Achievements
        </div>
        <div className="text-block">
          <h4>Key Achievements During Review Period</h4>
          <p>{safe(data.keyAchievements)}</p>
        </div>
        <div className="text-block">
          <h4>Goals Met Since Last Appraisal</h4>
          <p>{safe(data.goalsMet)}</p>
        </div>
        <div className="text-block">
          <h4>Areas for Improvement</h4>
          <p>{safe(data.areasForImprovement)}</p>
        </div>
      </section>

      {/* 5. Development Plan */}
      <section className="appraisal-doc-section">
        <div className="doc-section-title">
          <span>4</span> Development Plan
        </div>
        <div className="text-block">
          <h4>Training Needs</h4>
          <p>{safe(data.trainingNeeds)}</p>
        </div>
        <div className="text-block">
          <h4>Career Development Objectives</h4>
          <p>{safe(data.careerObjectives)}</p>
        </div>
        <div className="text-block">
          <h4>Agreed Action Plan</h4>
          <p>{safe(data.agreedActionPlan)}</p>
        </div>
      </section>

      {/* 6. Overall Assessment */}
      <section className="appraisal-doc-section">
        <div className="doc-section-title">
          <span>5</span> Overall Assessment
        </div>

        <div className="overall-summary-bar">
          <div className="overall-score-display">
            <span className="summary-label">Overall Rating</span>
            <span className={`overall-score-badge score-${data.overallRating || 5}`}>
              {safe(data.overallRating || 5)} / 5
            </span>
          </div>

          <div className="recommendation-display">
            <span className="summary-label">Recommendation</span>
            <span className={`rec-badge ${getRecommendationBadgeClass(data.recommendation)}`}>
              {safe(data.recommendation || "Meets Expectations")}
            </span>
          </div>
        </div>

        <div className="text-block">
          <h4>Manager's Comments</h4>
          <p>{safe(data.managerComments)}</p>
        </div>

        <div className="text-block">
          <h4>Employee's Comments</h4>
          <p>{safe(data.employeeComments)}</p>
        </div>
      </section>

      {/* 7. Sign-Off */}
      <section className="appraisal-doc-section">
        <div className="doc-section-title">
          <span>6</span> Sign-Off
        </div>

        <div className="signatures-grid">
          <div className="sig-box">
            <span className="sig-label">Employee Signature</span>
            {data.employeeSignature || data.signaturePatient ? (
              <img
                src={data.employeeSignature || data.signaturePatient}
                alt="Employee Signature"
                className="sig-img"
              />
            ) : (
              <div className="sig-placeholder">Signature Required</div>
            )}
            <span className="sig-name">{safe(data.employeeName || data.fullName)}</span>
          </div>

          <div className="sig-box">
            <span className="sig-label">Manager Signature</span>
            {data.managerSignature || data.pharmacistSignature ? (
              <img
                src={data.managerSignature || data.pharmacistSignature}
                alt="Manager Signature"
                className="sig-img"
              />
            ) : (
              <div className="sig-placeholder">Signature Required</div>
            )}
            <span className="sig-name">{safe(data.managerName)}</span>
          </div>
        </div>

        <div className="sign-date-row">
          <p><strong>Date Signed:</strong> {safe(data.dateSigned || data.dateSignedPatient || new Date().toISOString().split("T")[0])}</p>
        </div>
      </section>

      <footer className="doc-footer">
        <p>CarePlusHealth Performance Management System • Confidential Employee Record</p>
      </footer>
    </div>
  );
}
