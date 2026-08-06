import React from "react";
import "./StaffFileNoteTemplate.css";

export default function StaffFileNoteTemplate(props = {}) {
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

  const getPurposeBadgeClass = (purpose) => {
    switch (purpose) {
      case "Disciplinary":
        return "badge--disciplinary";
      case "Formal Meeting":
        return "badge--formal";
      case "Informal Meeting":
        return "badge--informal";
      default:
        return "badge--default";
    }
  };

  return (
    <div className="template staff-note-template">
      {/* 1. Header */}
      <header className="note-doc-header">
        <div className="header-left">
          <img src="/Logo3.png" alt="CarePlusHealth Logo" className="brand-logo" />
          <div className="company-meta">
            <h2>{safe(merged.pharmacyName || "CarePlus Health")}</h2>
            <p>{safe(merged.pharmacyAddress || "CarePlus Health Management Office")}</p>
          </div>
        </div>
        <div className="header-right">
          <span className="doc-type-tag">HR Record</span>
          <h1>Staff File Note</h1>
          <div className="header-purpose">
            <span className={`purpose-badge ${getPurposeBadgeClass(merged.meetingPurpose)}`}>
              {safe(merged.meetingPurpose)}
            </span>
          </div>
        </div>
      </header>

      {/* Timestamp Bar */}
      <div className="doc-timestamp-bar">
        <span><strong>Created:</strong> {safe(merged.createdAt || merged.created_at)}</span>
        <span className="bar-separator">|</span>
        <span><strong>Last Updated:</strong> {safe(merged.updatedAt || merged.updated_at || merged.createdAt || merged.created_at)}</span>
      </div>

      {/* 2. Section 1: Employee Details */}
      <section className="note-doc-section">
        <div className="doc-section-title">
          <span className="sec-badge">1</span> Employee Details
        </div>
        <div className="info-grid">
          <div className="info-cell">
            <span className="info-label">Employee Name</span>
            <span className="info-value highlight">{safe(merged.employeeName || merged.fullName || merged.name)}</span>
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
            <span className="info-label">Position / Job Title</span>
            <span className="info-value">{safe(merged.jobTitle)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Manager</span>
            <span className="info-value">{safe(merged.manager)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Date of Meeting</span>
            <span className="info-value">{safe(merged.meetingDate)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Time of Meeting</span>
            <span className="info-value">{safe(merged.meetingTime)}</span>
          </div>
        </div>
      </section>

      {/* 3. Section 2: Purpose of Meeting */}
      <section className="note-doc-section">
        <div className="doc-section-title">
          <span className="sec-badge">2</span> Purpose of Meeting
        </div>
        <div className="purpose-box">
          <span className="purpose-label">Meeting Purpose Classification:</span>
          <span className={`purpose-pill-large ${getPurposeBadgeClass(merged.meetingPurpose)}`}>
            {safe(merged.meetingPurpose)}
          </span>
        </div>
      </section>

      {/* 4. Section 3: Meeting Summary */}
      <section className="note-doc-section">
        <div className="doc-section-title">
          <span className="sec-badge">3</span> Meeting Summary
        </div>
        <div className="text-block-wrapper">
          <div className="text-sub-block">
            <h4 className="text-block-label">Key Discussion Points</h4>
            <div className="text-block-content">{safe(merged.keyDiscussionPoints)}</div>
          </div>
          {merged.criticalDetails && merged.criticalDetails !== "—" && (
            <div className="text-sub-block">
              <h4 className="text-block-label">Critical Details (Facts, Incidents, Concerns & Employee Responses)</h4>
              <div className="text-block-content">{safe(merged.criticalDetails)}</div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Section 4: Follow-Up Actions */}
      <section className="note-doc-section">
        <div className="doc-section-title">
          <span className="sec-badge">4</span> Follow-Up Actions
        </div>
        <div className="info-grid grid-3-col">
          <div className="info-cell cell-full">
            <span className="info-label">Actions Required</span>
            <div className="text-block-content inline-block">{safe(merged.actionsRequired)}</div>
          </div>
          <div className="info-cell">
            <span className="info-label">Responsible Person</span>
            <span className="info-value">{safe(merged.responsiblePerson)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Follow-Up Due Date</span>
            <span className="info-value">{safe(merged.followUpDueDate)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Follow-Up Meeting Required?</span>
            <span className="info-value">{safe(merged.followUpRequired)}</span>
          </div>
          {merged.followUpRequired === "Yes" && (
            <div className="info-cell highlight-cell">
              <span className="info-label">Follow-Up Meeting Date</span>
              <span className="info-value text-blue">{safe(merged.followUpMeetingDate)}</span>
            </div>
          )}
        </div>
      </section>

      {/* 6. Section 5: Additional Notes */}
      <section className="note-doc-section">
        <div className="doc-section-title">
          <span className="sec-badge">5</span> Remarks / Additional Notes
        </div>
        <div className="text-block-wrapper">
          <div className="text-sub-block">
            <div className="text-block-content">{safe(merged.additionalComments)}</div>
          </div>
        </div>
      </section>

      {/* 7. Section 6: Sign-Off */}
      <section className="note-doc-section sign-off-section">
        <div className="doc-section-title">
          <span className="sec-badge">6</span> Sign-Off
        </div>
        <div className="sign-grid">
          <div className="sign-card">
            <div className="sign-role">Prepared By (Manager / HR)</div>
            <div className="sign-name">{safe(merged.preparedBy)}</div>
            <div className="sign-date"><strong>Date:</strong> {safe(merged.preparedDate)}</div>
          </div>
          <div className="sign-card">
            <div className="sign-role">Reviewed / Approved By</div>
            <div className="sign-name">{safe(merged.reviewedBy)}</div>
            <div className="sign-date"><strong>Date:</strong> {safe(merged.approvalDate)}</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="doc-footer">
        <span>CarePlus Health Staff Management System</span>
        <span>Strictly Confidential - Internal HR Record</span>
      </footer>
    </div>
  );
}
