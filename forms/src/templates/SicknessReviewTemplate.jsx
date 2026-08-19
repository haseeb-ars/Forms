import React from "react";
import "./SicknessReviewTemplate.css";

export default function SicknessReviewTemplate(props = {}) {
  const {
    data = {},
    patientF = {},
    pharmF = {},
    consultF = {},
    branchF = {},
    patient = {},
    pharm = {},
    consultation = {},
    branch = {},
  } = props;

  const merged = {
    ...data,
    ...patient,
    ...pharm,
    ...consultation,
    ...branch,
    ...patientF,
    ...pharmF,
    ...consultF,
    ...branchF,
  };

  const safe = (val) =>
    val !== undefined && val !== null && String(val).trim() !== "" ? val : "—";

  const formatIllnessType = (type) => {
    switch (type) {
      case "general":
        return "🌡️ General illness";
      case "mental":
        return "🧠 Mental health";
      case "injury":
        return "🩹 Injury";
      case "surgery":
        return "🏥 Medical procedure";
      case "other":
        return "💬 Other / prefer not to say";
      default:
        return safe(type);
    }
  };

  return (
    <div className="template sickness-template">
      {/* Header */}
      <header className="sickness-doc-header">
        <div className="header-left">
          <img src="/Logo3.png" alt="CarePlusHealth Logo" className="brand-logo" />
          <div className="company-meta">
            <h2>{safe(merged.pharmacyName || "CarePlus Health")}</h2>
            <p>{safe(merged.pharmacyAddress || "HR Management Office")}</p>
          </div>
        </div>
        <div className="header-right">
          <span className="doc-type-tag">HR · Return to work</span>
          <h1>Sickness Review</h1>
        </div>
      </header>

      {/* 1. Employee Details */}
      <section className="sickness-doc-section">
        <div className="doc-section-title">Employee details</div>
        <div className="info-grid grid-2">
          <div className="info-cell">
            <span className="info-label">Full Name</span>
            <span className="info-value highlight">{safe(merged.fullName || merged.name)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Employee ID</span>
            <span className="info-value">{safe(merged.employeeId)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Department</span>
            <span className="info-value">{safe(merged.department)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Line Manager</span>
            <span className="info-value">{safe(merged.lineManager)}</span>
          </div>
        </div>
      </section>

      {/* 2. Absence Period */}
      <section className="sickness-doc-section">
        <div className="doc-section-title">Absence period</div>
        
        {/* Instance 1 */}
        <div className="instance-block">
          <div className="instance-tag">Instance 1</div>
          <div className="info-grid grid-3">
            <div className="info-cell">
              <span className="info-label">First day absent</span>
              <span className="info-value">{safe(merged.instance1Start)}</span>
            </div>
            <div className="info-cell">
              <span className="info-label">Return to work</span>
              <span className="info-value">{safe(merged.instance1End)}</span>
            </div>
            <div className="info-cell">
              <span className="info-label">Total days absent</span>
              <span className="info-value">{safe(merged.instance1Days)}</span>
            </div>
          </div>
        </div>

        {/* Instance 2 */}
        {(merged.instance2Start || merged.instance2End) && (
          <div className="instance-block mt-block">
            <div className="instance-tag">Instance 2</div>
            <div className="info-grid grid-3">
              <div className="info-cell">
                <span className="info-label">First day absent</span>
                <span className="info-value">{safe(merged.instance2Start)}</span>
              </div>
              <div className="info-cell">
                <span className="info-label">Return to work</span>
                <span className="info-value">{safe(merged.instance2End)}</span>
              </div>
              <div className="info-cell">
                <span className="info-label">Total days absent</span>
                <span className="info-value">{safe(merged.instance2Days)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Instance 3 */}
        {(merged.instance3Start || merged.instance3End) && (
          <div className="instance-block mt-block">
            <div className="instance-tag">Instance 3</div>
            <div className="info-grid grid-3">
              <div className="info-cell">
                <span className="info-label">First day absent</span>
                <span className="info-value">{safe(merged.instance3Start)}</span>
              </div>
              <div className="info-cell">
                <span className="info-label">Return to work</span>
                <span className="info-value">{safe(merged.instance3End)}</span>
              </div>
              <div className="info-cell">
                <span className="info-label">Total days absent</span>
                <span className="info-value">{safe(merged.instance3Days)}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Nature of Illness */}
      <section className="sickness-doc-section">
        <div className="doc-section-title">Nature of illness</div>
        <div className="text-block-box">
          <div className="info-label">Selected Category</div>
          <div className="illness-type-badge">{formatIllnessType(merged.illnessType)}</div>
          {merged.illnessDescription && (
            <div className="text-desc-wrapper">
              <div className="info-label">Brief Description</div>
              <div className="text-desc">{safe(merged.illnessDescription)}</div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Fitness to Work */}
      <section className="sickness-doc-section">
        <div className="doc-section-title">Fitness to work</div>
        <div className="fitness-list">
          <div className={`fitness-item ${merged.fitFully ? "active" : ""}`}>
            <span>{merged.fitFully ? "☑" : "☐"}</span> I am fully fit and able to return to my normal duties
          </div>
          <div className={`fitness-item ${merged.fitDoctorNote ? "active" : ""}`}>
            <span>{merged.fitDoctorNote ? "☑" : "☐"}</span> I have a GP / doctor's note to submit
          </div>
          <div className={`fitness-item ${merged.fitAdjustments ? "active" : ""}`}>
            <span>{merged.fitAdjustments ? "☑" : "☐"}</span> I may need adjustments or a phased return to work
          </div>
        </div>
        {merged.adjustmentsNeeded && (
          <div className="text-block-box mt-block">
            <div className="info-label">Adjustments Needed</div>
            <div className="text-desc">{safe(merged.adjustmentsNeeded)}</div>
          </div>
        )}
      </section>

      {/* 5. Manager Notes */}
      <section className="sickness-doc-section">
        <div className="doc-section-title">Manager notes</div>
        {merged.discussionNotes && (
          <div className="text-block-box">
            <div className="info-label">Discussion Notes</div>
            <div className="text-desc">{safe(merged.discussionNotes)}</div>
          </div>
        )}
        <div className="info-grid grid-2 mt-block">
          <div className="info-cell">
            <span className="info-label">Manager Signature</span>
            <span className="info-value">{safe(merged.managerSignature)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Review Date</span>
            <span className="info-value">{safe(merged.reviewDate)}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="doc-footer">
        <span>CarePlus Health Sickness Review Record</span>
        <span>Internal HR Document</span>
      </footer>
    </div>
  );
}
