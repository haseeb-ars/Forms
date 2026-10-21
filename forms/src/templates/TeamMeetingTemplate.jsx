import React from "react";
import "./TeamMeetingTemplate.css";

export default function TeamMeetingTemplate(props = {}) {
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

  // Parse team members into an array if provided as multiline text or array
  const teamMembersRaw = merged.teamMembers || "";
  const teamMembersList = Array.isArray(teamMembersRaw)
    ? teamMembersRaw
    : typeof teamMembersRaw === "string" && teamMembersRaw.trim()
    ? teamMembersRaw
        .split(/[\n,;]+/)
        .map((m) => m.trim())
        .filter(Boolean)
    : [];

  // Parse structured action items if available
  const actionItems = Array.isArray(merged.actionItems)
    ? merged.actionItems.filter(
        (item) => item && (item.action || item.responsiblePerson || item.deadline)
      )
    : [];

  const hasStructuredActions = actionItems.length > 0;
  const hasTextActionPlan =
    merged.actionPlan && String(merged.actionPlan).trim() !== "";

  return (
    <div className="template team-meeting-template">
      {/* 1. Header */}
      <header className="meeting-doc-header">
        <div className="header-left">
          <img src="/Logo3.png" alt="CarePlus Health Logo" className="brand-logo" />
          <div className="company-meta">
            <h2>{safe(merged.pharmacyName || "CarePlus Health")}</h2>
            <p>{safe(merged.pharmacyAddress || "Clinical Governance & Operations")}</p>
          </div>
        </div>
        <div className="header-right">
          <span className="doc-type-tag">Governance Record</span>
          <h1>Team Meeting</h1>
          <div>
            <span className="header-meeting-badge">
              CarePlus Health Team Record
            </span>
          </div>
        </div>
      </header>

      {/* Timestamp Bar */}
      <div className="meeting-timestamp-bar">
        <span>
          <strong>Meeting Date:</strong> {safe(merged.meetingDate || merged.date)}
        </span>
        <span className="bar-separator">|</span>
        <span>
          <strong>Meeting Time:</strong> {safe(merged.meetingTime || merged.time)}
        </span>
        <span className="bar-separator">|</span>
        <span>
          <strong>Recorded:</strong>{" "}
          {safe(merged.createdAt || merged.created_at || merged.updatedAt)}
        </span>
      </div>

      {/* 2. Section 1: Meeting Overview */}
      <section className="meeting-doc-section">
        <div className="meeting-section-title">
          <span className="meeting-sec-badge">1</span> Meeting Overview & Logistics
        </div>
        <div className="meeting-info-grid grid-3-col">
          <div className="meeting-info-cell">
            <span className="meeting-info-label">Date</span>
            <span className="meeting-info-value highlight">
              {safe(merged.meetingDate || merged.date)}
            </span>
          </div>
          <div className="meeting-info-cell">
            <span className="meeting-info-label">Time</span>
            <span className="meeting-info-value highlight">
              {safe(merged.meetingTime || merged.time)}
            </span>
          </div>
          <div className="meeting-info-cell">
            <span className="meeting-info-label">Facilitator / Chair</span>
            <span className="meeting-info-value">
              {safe(merged.meetingChair || merged.preparedBy || merged.currentUserName || "Lead Clinician / Manager")}
            </span>
          </div>
          <div className="meeting-info-cell cell-full">
            <span className="meeting-info-label">Location / Practice Branch</span>
            <span className="meeting-info-value">
              {safe(merged.pharmacyName || merged.location || "CarePlus Health Practice")}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Section 2: Team Members Involved */}
      <section className="meeting-doc-section">
        <div className="meeting-section-title">
          <span className="meeting-sec-badge">2</span> Team Members Involved
        </div>
        {teamMembersList.length > 0 ? (
          <div className="team-members-list">
            {teamMembersList.map((member, idx) => (
              <span key={idx} className="member-pill">
                <span className="member-icon">👤</span> {member}
              </span>
            ))}
          </div>
        ) : (
          <div className="meeting-text-block">
            <div className="meeting-text-content">
              {safe(merged.teamMembers)}
            </div>
          </div>
        )}
      </section>

      {/* 4. Section 3: Points Discussed */}
      <section className="meeting-doc-section">
        <div className="meeting-section-title">
          <span className="meeting-sec-badge">3</span> Points Discussed
        </div>
        <div className="meeting-text-block">
          <div className="meeting-text-content">
            {safe(merged.pointsDiscussed)}
          </div>
        </div>
      </section>

      {/* 5. Section 4: Targets */}
      <section className="meeting-doc-section">
        <div className="meeting-section-title">
          <span className="meeting-sec-badge">4</span> Targets & Objectives
        </div>
        <div className="meeting-text-block">
          <div className="meeting-text-content">
            {safe(merged.targets)}
          </div>
        </div>
      </section>

      {/* 6. Section 5: Action Plan and Deadline for Targets */}
      <section className="meeting-doc-section">
        <div className="meeting-section-title">
          <span className="meeting-sec-badge">5</span> Action Plan and Deadline for Targets
        </div>

        {hasStructuredActions && (
          <table className="action-plan-table">
            <thead>
              <tr>
                <th className="col-idx">#</th>
                <th className="col-action">Action / Target Description</th>
                <th className="col-resp">Responsible Person</th>
                <th className="col-deadline">Target Deadline</th>
              </tr>
            </thead>
            <tbody>
              {actionItems.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="col-idx">{index + 1}</td>
                  <td className="col-action">
                    {item.action ? item.action : <span className="empty-cell-text">—</span>}
                  </td>
                  <td className="col-resp">
                    {item.responsiblePerson ? (
                      item.responsiblePerson
                    ) : (
                      <span className="empty-cell-text">Unassigned</span>
                    )}
                  </td>
                  <td className="col-deadline">
                    {item.deadline ? (
                      item.deadline
                    ) : (
                      <span className="empty-cell-text">TBD</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {hasTextActionPlan && (
          <div className="meeting-text-block" style={{ borderTop: hasStructuredActions ? "1px solid #e2e8f0" : "none" }}>
            {hasStructuredActions && (
              <span className="meeting-info-label" style={{ display: "block", marginBottom: 6 }}>
                Additional Action Plan Notes:
              </span>
            )}
            <div className="meeting-text-content">
              {merged.actionPlan}
            </div>
          </div>
        )}

        {!hasStructuredActions && !hasTextActionPlan && (
          <div className="meeting-text-block">
            <span className="empty-cell-text">No action items recorded for this session.</span>
          </div>
        )}
      </section>

      {/* 7. Section 6: Sign-Off & Governance Record */}
      <section className="meeting-doc-section">
        <div className="meeting-section-title">
          <span className="meeting-sec-badge">6</span> Facilitator Sign-Off & Verification
        </div>
        <div className="meeting-sign-grid">
          <div className="meeting-sign-card">
            <div className="meeting-sign-role">Meeting Facilitator / Chair</div>
            <div className="meeting-sign-name">
              {safe(merged.meetingChair || merged.preparedBy || merged.currentUserName || "Lead Pharmacist / Manager")}
            </div>
            <div className="meeting-sign-date">
              <strong>Date:</strong> {safe(merged.meetingDate || merged.date)}
            </div>
          </div>
          <div className="meeting-sign-card">
            <div className="meeting-sign-role">Branch / Practice Verification</div>
            <div className="meeting-sign-name">
              {safe(merged.pharmacyName || "CarePlus Health")}
            </div>
            <div className="meeting-sign-date">
              <strong>Status:</strong> Completed & Logged
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="meeting-doc-footer">
        <span>CarePlus Health Clinical & Operational Governance</span>
        <span>Internal Professional Healthcare Record — Confidential</span>
      </footer>
    </div>
  );
}
