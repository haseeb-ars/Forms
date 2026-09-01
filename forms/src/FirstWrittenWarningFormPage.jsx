import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import LabeledField from "./LabeledField.jsx";
import SignatureBox from "./SignatureBox.jsx";
import "./FirstWrittenWarningFormPage.css";

export default function FirstWrittenWarningFormPage() {
  const navigate = useNavigate();
  const {
    firstWrittenWarningConsultation,
    setFirstWrittenWarningConsultation,
    setPatient,
    setPharm,
    currentUser,
  } = useApp();

  const loggedInUserName = currentUser?.name || "";
  const todayDate = new Date().toISOString().split("T")[0];
  const nowFormatted = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const [formState, setFormState] = useState({
    employeeName: firstWrittenWarningConsultation.employeeName || "",
    employeeId: firstWrittenWarningConsultation.employeeId || "",
    department: firstWrittenWarningConsultation.department || "",
    position: firstWrittenWarningConsultation.position || "",
    manager: firstWrittenWarningConsultation.manager || loggedInUserName,
    dateOfWarning: firstWrittenWarningConsultation.dateOfWarning || todayDate,

    reasonForWarning: firstWrittenWarningConsultation.reasonForWarning || "",
    discussionAndImprovement: firstWrittenWarningConsultation.discussionAndImprovement || "",
    employeeComments: firstWrittenWarningConsultation.employeeComments || "",

    acknowledgementAgreed: firstWrittenWarningConsultation.acknowledgementAgreed !== false,

    employeeSignature: firstWrittenWarningConsultation.employeeSignature || "",
    employeeSignatureName: firstWrittenWarningConsultation.employeeSignatureName || firstWrittenWarningConsultation.employeeName || "",
    employeeSignatureDate: firstWrittenWarningConsultation.employeeSignatureDate || todayDate,

    managerSignature: firstWrittenWarningConsultation.managerSignature || "",
    managerSignatureName: firstWrittenWarningConsultation.managerSignatureName || firstWrittenWarningConsultation.manager || loggedInUserName,
    managerSignatureDate: firstWrittenWarningConsultation.managerSignatureDate || todayDate,

    createdAt: firstWrittenWarningConsultation.createdAt || nowFormatted,
    updatedAt: nowFormatted,
  });

  const [validationError, setValidationError] = useState("");

  const updateField = (key, value) => {
    setFormState((prev) => {
      const next = {
        ...prev,
        [key]: value,
        updatedAt: nowFormatted,
      };
      // Keep signature names synced with main fields if user hasn't typed custom ones
      if (key === "employeeName" && (!prev.employeeSignatureName || prev.employeeSignatureName === prev.employeeName)) {
        next.employeeSignatureName = value;
      }
      if (key === "manager" && (!prev.managerSignatureName || prev.managerSignatureName === prev.manager)) {
        next.managerSignatureName = value;
      }
      return next;
    });
    setValidationError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🛡️ Mandatory Field Validation
    const mandatoryFields = [
      { key: "employeeName", label: "Employee Name", section: "Employee Details" },
      { key: "dateOfWarning", label: "Date of Warning", section: "Employee Details" },
      { key: "reasonForWarning", label: "Reason for Written Warning", section: "Reason for Warning" },
      { key: "discussionAndImprovement", label: "Discussion and Required Improvement", section: "Discussion & Improvement" },
    ];

    for (const field of mandatoryFields) {
      if (!formState[field.key] || !String(formState[field.key]).trim()) {
        setValidationError(`Mandatory field missing: "${field.label}" in ${field.section}.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    const updatedWarning = {
      ...formState,
      updatedAt: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Save in Context
    setFirstWrittenWarningConsultation(updatedWarning);

    // Sync with generic patient & pharm slices for DB persistence & PDF generator compatibility
    setPatient({
      fullName: updatedWarning.employeeName,
      name: updatedWarning.employeeName,
      employeeId: updatedWarning.employeeId,
      department: updatedWarning.department,
      position: updatedWarning.position,
      manager: updatedWarning.manager,
      dateOfWarning: updatedWarning.dateOfWarning,
      dob: updatedWarning.dateOfWarning,
      signaturePatient: updatedWarning.employeeSignature,
      dateSignedPatient: updatedWarning.employeeSignatureDate,
    });

    setPharm({
      preparedBy: updatedWarning.managerSignatureName || updatedWarning.manager,
      preparedDate: updatedWarning.managerSignatureDate,
      managerSignature: updatedWarning.managerSignature,
      createdAt: updatedWarning.createdAt,
      updatedAt: updatedWarning.updatedAt,
    });

    // Navigate to preview page with autoDownload query param
    navigate({
      pathname: "/service/firstWrittenWarning/preview",
      search: "?autoDownload=true",
    });
  };

  return (
    <div className="warning-form-wrapper">
      <form className="warning-form" onSubmit={handleSubmit}>
        {/* Header Card */}
        <div className="warning-form-header">
          <div className="warning-header-top">
            <div className="brand-pill">
              <img src="/Logo3.png" alt="CarePlus Logo" className="header-logo-img" />
              <span className="badge-brand">CarePlus Health HR</span>
            </div>
            <div className="header-meta-info">
              <span className="confidential-badge">🔒 Official HR Record</span>
              <span className="timestamp-text">Created: {formState.createdAt}</span>
            </div>
          </div>
          <h2>First Written Warning</h2>
          <p className="warning-subtitle">
            Formal record of a first written warning issued to an employee.
          </p>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="validation-error-banner">
            <span className="error-icon">⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* 1. Employee Details Section */}
        <section className="warning-section">
          <div className="section-title-row">
            <span className="section-number">1</span>
            <h3>Employee Details</h3>
          </div>

          <div className="fields-grid grid-2-col">
            <LabeledField label="Employee Name *">
              <input
                type="text"
                className="field-input"
                required
                placeholder="Full legal name of employee..."
                value={formState.employeeName}
                onChange={(e) => updateField("employeeName", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Employee ID">
              <input
                type="text"
                className="field-input"
                placeholder="e.g. CP-102"
                value={formState.employeeId}
                onChange={(e) => updateField("employeeId", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Department">
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Pharmacy Operations"
                value={formState.department}
                onChange={(e) => updateField("department", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Position / Job Title">
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Dispensing Assistant"
                value={formState.position}
                onChange={(e) => updateField("position", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Manager / Supervisor">
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Dr. Robert Vance"
                value={formState.manager}
                onChange={(e) => updateField("manager", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Date of Warning *">
              <input
                type="date"
                className="field-input"
                required
                value={formState.dateOfWarning}
                onChange={(e) => updateField("dateOfWarning", e.target.value)}
              />
            </LabeledField>
          </div>
        </section>

        {/* 2. Reason for Warning Section */}
        <section className="warning-section">
          <div className="section-title-row">
            <span className="section-number">2</span>
            <h3>Reason for Written Warning</h3>
          </div>

          <div className="fields-grid grid-1-col">
            <LabeledField label="Clear & Factual Description *">
              <textarea
                className="field-input field-textarea"
                rows={6}
                required
                placeholder="Please provide a clear and factual description of the reason for this written warning, including the relevant incident(s), behaviour, performance concerns, or policy issue."
                value={formState.reasonForWarning}
                onChange={(e) => updateField("reasonForWarning", e.target.value)}
              />
            </LabeledField>
          </div>
        </section>

        {/* 3. Discussion and Required Improvement Section */}
        <section className="warning-section">
          <div className="section-title-row">
            <span className="section-number">3</span>
            <h3>Discussion and Required Improvement</h3>
          </div>

          <div className="fields-grid grid-1-col">
            <LabeledField label="Key Points & Action Plan *">
              <textarea
                className="field-input field-textarea"
                rows={6}
                required
                placeholder="Record the key points discussed with the employee, the expected improvement, and any actions or follow-up required."
                value={formState.discussionAndImprovement}
                onChange={(e) => updateField("discussionAndImprovement", e.target.value)}
              />
            </LabeledField>
          </div>
        </section>

        {/* 4. Employee Comments (Optional) Section */}
        <section className="warning-section">
          <div className="section-title-row">
            <span className="section-number">4</span>
            <h3>Employee Comments <span className="optional-tag">(Optional)</span></h3>
          </div>

          <div className="fields-grid grid-1-col">
            <LabeledField label="Employee Response / Statements">
              <textarea
                className="field-input field-textarea"
                rows={4}
                placeholder="Optional: The employee may record their response, comments, or perspectives regarding this written warning here."
                value={formState.employeeComments}
                onChange={(e) => updateField("employeeComments", e.target.value)}
              />
            </LabeledField>
          </div>
        </section>

        {/* 5. Acknowledgement & Disclaimer Section */}
        <section className="warning-section acknowledgement-section">
          <div className="section-title-row">
            <span className="section-number">5</span>
            <h3>Acknowledgement</h3>
          </div>

          <div className="acknowledgement-card">
            <div className="acknowledgement-icon">📜</div>
            <div className="acknowledgement-text">
              <p>
                <strong>By signing below, I confirm that the information recorded in this form is factually correct to the best of my knowledge. I acknowledge that the above matters have been discussed with me and that I have had the opportunity to ask questions and provide comments. My signature confirms that I have received and understood the above written warning.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* 6. Signatures Section */}
        <section className="warning-section">
          <div className="section-title-row">
            <span className="section-number">6</span>
            <h3>Signatures</h3>
          </div>

          <div className="signatures-grid">
            {/* Employee Signature Card */}
            <div className="signature-card">
              <h4 className="sig-card-title">Employee</h4>
              <div className="sig-field-group">
                <label className="sig-label">Employee Signature</label>
                <SignatureBox
                  value={formState.employeeSignature}
                  onChange={(val) => updateField("employeeSignature", val)}
                  height={140}
                />
              </div>

              <LabeledField label="Employee Name">
                <input
                  type="text"
                  className="field-input"
                  placeholder="Printed Name"
                  value={formState.employeeSignatureName}
                  onChange={(e) => updateField("employeeSignatureName", e.target.value)}
                />
              </LabeledField>

              <LabeledField label="Date">
                <input
                  type="date"
                  className="field-input"
                  value={formState.employeeSignatureDate}
                  onChange={(e) => updateField("employeeSignatureDate", e.target.value)}
                />
              </LabeledField>
            </div>

            {/* Manager / Supervisor Signature Card */}
            <div className="signature-card">
              <h4 className="sig-card-title">Manager / Supervisor</h4>
              <div className="sig-field-group">
                <label className="sig-label">Manager / Supervisor Signature</label>
                <SignatureBox
                  value={formState.managerSignature}
                  onChange={(val) => updateField("managerSignature", val)}
                  height={140}
                />
              </div>

              <LabeledField label="Manager / Supervisor Name">
                <input
                  type="text"
                  className="field-input"
                  placeholder="Printed Name"
                  value={formState.managerSignatureName}
                  onChange={(e) => updateField("managerSignatureName", e.target.value)}
                />
              </LabeledField>

              <LabeledField label="Date">
                <input
                  type="date"
                  className="field-input"
                  value={formState.managerSignatureDate}
                  onChange={(e) => updateField("managerSignatureDate", e.target.value)}
                />
              </LabeledField>
            </div>
          </div>
        </section>

        {/* Action Buttons Footer */}
        <div className="form-footer-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/")}
          >
            ← Cancel & Return
          </button>
          <button type="submit" className="btn-primary">
            Save Warning Form & View/Download PDF →
          </button>
        </div>
      </form>
    </div>
  );
}
