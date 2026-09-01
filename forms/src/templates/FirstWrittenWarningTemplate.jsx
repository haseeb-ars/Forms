import React from "react";
import "./FirstWrittenWarningTemplate.css";

export default function FirstWrittenWarningTemplate(props = {}) {
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

  return (
    <div className="template warning-doc-template">
      {/* 1. Header */}
      <header className="warning-doc-header">
        <div className="header-left">
          <img src="/Logo3.png" alt="CarePlus Logo" className="brand-logo" />
          <div className="company-meta">
            <h2>{safe(merged.pharmacyName || "CarePlus Health")}</h2>
            <p>{safe(merged.pharmacyAddress || "CarePlus Health Management Office")}</p>
          </div>
        </div>
        <div className="header-right">
          <span className="doc-type-tag">Official HR Record</span>
          <h1>First Written Warning</h1>
        </div>
      </header>

      {/* Timestamp Bar */}
      <div className="doc-timestamp-bar">
        <span><strong>Date of Warning:</strong> {safe(merged.dateOfWarning || merged.meetingDate)}</span>
        <span className="bar-separator">|</span>
        <span><strong>Created:</strong> {safe(merged.createdAt || merged.created_at)}</span>
        <span className="bar-separator">|</span>
        <span><strong>Last Updated:</strong> {safe(merged.updatedAt || merged.updated_at || merged.createdAt || merged.created_at)}</span>
      </div>

      {/* 2. Section 1: Employee Details */}
      <section className="warning-doc-section">
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
            <span className="info-value">{safe(merged.position || merged.jobTitle)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Manager / Supervisor</span>
            <span className="info-value">{safe(merged.manager || merged.preparedBy)}</span>
          </div>
          <div className="info-cell">
            <span className="info-label">Date of Warning</span>
            <span className="info-value">{safe(merged.dateOfWarning || merged.meetingDate)}</span>
          </div>
        </div>
      </section>

      {/* 3. Section 2: Reason for Warning */}
      <section className="warning-doc-section">
        <div className="doc-section-title">
          <span className="sec-badge">2</span> Reason for Written Warning
        </div>
        <div className="text-block-wrapper">
          <div className="text-block-content">{safe(merged.reasonForWarning)}</div>
        </div>
      </section>

      {/* 4. Section 3: Discussion and Required Improvement */}
      <section className="warning-doc-section">
        <div className="doc-section-title">
          <span className="sec-badge">3</span> Discussion and Required Improvement
        </div>
        <div className="text-block-wrapper">
          <div className="text-block-content">{safe(merged.discussionAndImprovement)}</div>
        </div>
      </section>

      {/* 5. Section 4: Employee Comments */}
      <section className="warning-doc-section">
        <div className="doc-section-title">
          <span className="sec-badge">4</span> Employee Comments (Optional)
        </div>
        <div className="text-block-wrapper">
          <div className="text-block-content">
            {merged.employeeComments && String(merged.employeeComments).trim() !== ""
              ? merged.employeeComments
              : "No employee comments recorded."}
          </div>
        </div>
      </section>

      {/* 6. Section 5: Acknowledgement Disclaimer */}
      <section className="warning-doc-section acknowledgement-doc-section">
        <div className="doc-section-title">
          <span className="sec-badge">5</span> Acknowledgement
        </div>
        <div className="acknowledgement-doc-box">
          <p>
            By signing below, I confirm that the information recorded in this form is factually correct to the best of my knowledge. I acknowledge that the above matters have been discussed with me and that I have had the opportunity to ask questions and provide comments. My signature confirms that I have received and understood the above written warning.
          </p>
        </div>
      </section>

      {/* 7. Section 6: Signatures */}
      <section className="warning-doc-section sign-off-section">
        <div className="doc-section-title">
          <span className="sec-badge">6</span> Signatures
        </div>
        <div className="sign-grid">
          {/* Employee Signature Card */}
          <div className="sign-card">
            <div className="sign-role">EMPLOYEE</div>
            <div className="sign-image-container">
              {merged.employeeSignature ? (
                <img src={merged.employeeSignature} alt="Employee Signature" className="sig-img" />
              ) : (
                <div className="sig-placeholder">Signature on File</div>
              )}
            </div>
            <div className="sign-name">
              <strong>Name:</strong> {safe(merged.employeeSignatureName || merged.employeeName || merged.fullName)}
            </div>
            <div className="sign-date">
              <strong>Date:</strong> {safe(merged.employeeSignatureDate || merged.dateSignedPatient || merged.dateOfWarning)}
            </div>
          </div>

          {/* Manager / Supervisor Signature Card */}
          <div className="sign-card">
            <div className="sign-role">MANAGER / SUPERVISOR</div>
            <div className="sign-image-container">
              {merged.managerSignature ? (
                <img src={merged.managerSignature} alt="Manager Signature" className="sig-img" />
              ) : (
                <div className="sig-placeholder">Signature on File</div>
              )}
            </div>
            <div className="sign-name">
              <strong>Name:</strong> {safe(merged.managerSignatureName || merged.manager || merged.preparedBy)}
            </div>
            <div className="sign-date">
              <strong>Date:</strong> {safe(merged.managerSignatureDate || merged.preparedDate || merged.dateOfWarning)}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="doc-footer">
        <span>CarePlus Health Staff Management System</span>
        <span>Strictly Confidential - Official HR Employment Record</span>
      </footer>
    </div>
  );
}
