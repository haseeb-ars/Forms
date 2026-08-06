import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import LabeledField from "./LabeledField.jsx";
import "./StaffFileNoteFormPage.css";

const PURPOSE_OPTIONS = [
  "Formal Meeting",
  "Informal Meeting",
  "Disciplinary",
];

export default function StaffFileNoteFormPage() {
  const navigate = useNavigate();
  const {
    staffFileNoteConsultation,
    setStaffFileNoteConsultation,
    setPatient,
    setPharm,
    currentUser,
  } = useApp();

  const loggedInUserName = currentUser?.name || "HR / Manager";
  const todayDate = new Date().toISOString().split("T")[0];
  const nowFormatted = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const [formState, setFormState] = useState({
    employeeName: staffFileNoteConsultation.employeeName || "",
    employeeId: staffFileNoteConsultation.employeeId || "",
    department: staffFileNoteConsultation.department || "",
    jobTitle: staffFileNoteConsultation.jobTitle || "",
    manager: staffFileNoteConsultation.manager || "",
    meetingDate: staffFileNoteConsultation.meetingDate || todayDate,
    meetingTime: staffFileNoteConsultation.meetingTime || "",

    meetingPurpose: staffFileNoteConsultation.meetingPurpose || "Formal Meeting",

    keyDiscussionPoints: staffFileNoteConsultation.keyDiscussionPoints || "",
    criticalDetails: staffFileNoteConsultation.criticalDetails || "",

    actionsRequired: staffFileNoteConsultation.actionsRequired || "",
    responsiblePerson: staffFileNoteConsultation.responsiblePerson || "",
    followUpDueDate: staffFileNoteConsultation.followUpDueDate || "",
    followUpRequired: staffFileNoteConsultation.followUpRequired || "No",
    followUpMeetingDate: staffFileNoteConsultation.followUpMeetingDate || "",

    additionalComments: staffFileNoteConsultation.additionalComments || "",

    preparedBy: staffFileNoteConsultation.preparedBy || loggedInUserName,
    preparedDate: staffFileNoteConsultation.preparedDate || todayDate,
    reviewedBy: staffFileNoteConsultation.reviewedBy || "",
    approvalDate: staffFileNoteConsultation.approvalDate || "",

    isAuthorized: staffFileNoteConsultation.isAuthorized !== false,
    createdAt: staffFileNoteConsultation.createdAt || nowFormatted,
    updatedAt: nowFormatted,
  });

  const [validationError, setValidationError] = useState("");

  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
      updatedAt: nowFormatted,
    }));
    setValidationError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🛡️ Mandatory Field Validation
    // Mandatory fields per requirements: Employee Name, Date of Meeting, Purpose of Meeting, Key Discussion Points, and Prepared By
    const mandatoryFields = [
      { key: "employeeName", label: "Employee Name", section: "Employee Details" },
      { key: "meetingDate", label: "Date of Meeting", section: "Employee Details" },
      { key: "meetingPurpose", label: "Purpose of Meeting", section: "Purpose of Meeting" },
      { key: "keyDiscussionPoints", label: "Key Discussion Points", section: "Meeting Summary" },
      { key: "preparedBy", label: "Prepared By", section: "Sign-Off" },
    ];

    for (const field of mandatoryFields) {
      if (!formState[field.key] || !String(formState[field.key]).trim()) {
        setValidationError(`Mandatory field missing: "${field.label}" in ${field.section}.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    const updatedNote = {
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
    setStaffFileNoteConsultation(updatedNote);

    // Sync with generic patient & pharm slices for DB persistence & PDF generator compatibility
    setPatient({
      fullName: updatedNote.employeeName,
      name: updatedNote.employeeName,
      employeeId: updatedNote.employeeId,
      department: updatedNote.department,
      jobTitle: updatedNote.jobTitle,
      manager: updatedNote.manager,
      meetingDate: updatedNote.meetingDate,
      dob: updatedNote.meetingDate,
      signaturePatient: updatedNote.preparedBy,
      dateSignedPatient: updatedNote.preparedDate,
    });

    setPharm({
      preparedBy: updatedNote.preparedBy,
      preparedDate: updatedNote.preparedDate,
      reviewedBy: updatedNote.reviewedBy,
      approvalDate: updatedNote.approvalDate,
      meetingPurpose: updatedNote.meetingPurpose,
      createdAt: updatedNote.createdAt,
      updatedAt: updatedNote.updatedAt,
    });

    // Navigate to preview page with autoDownload
    navigate({
      pathname: "/service/staffFileNote/preview",
      search: "?autoDownload=true",
    });
  };

  return (
    <div className="staff-note-wrapper">
      <form className="staff-note-form" onSubmit={handleSubmit}>
        {/* Top Header Card */}
        <div className="staff-note-header">
          <div className="staff-note-header__top">
            <div className="header-badges">
              <span className="badge badge-brand">🏢 CarePlus Health HR</span>
              <span className={`badge ${formState.isAuthorized ? "badge-auth" : "badge-lock"}`}>
                {formState.isAuthorized ? "🔒 Authorised HR & Management Access" : "⚠️ Restricted Access"}
              </span>
            </div>
            <div className="timestamp-info">
              <span><strong>Created:</strong> {formState.createdAt}</span>
              <span className="dot-divider">•</span>
              <span><strong>Last Updated:</strong> {formState.updatedAt}</span>
            </div>
          </div>
          <h2>Staff File Note</h2>
          <p className="staff-note-subtitle">
            Document informal discussions, formal meetings, and disciplinary proceedings consistently against employee records.
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
        <section className="form-section">
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
                placeholder="Enter employee name..."
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
                placeholder="e.g. Lead Pharmacist"
                value={formState.jobTitle}
                onChange={(e) => updateField("jobTitle", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Manager">
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Dr. Vance"
                value={formState.manager}
                onChange={(e) => updateField("manager", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Date of Meeting *">
              <input
                type="date"
                className="field-input"
                required
                value={formState.meetingDate}
                onChange={(e) => updateField("meetingDate", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Time of Meeting (Optional)">
              <input
                type="time"
                className="field-input"
                value={formState.meetingTime}
                onChange={(e) => updateField("meetingTime", e.target.value)}
              />
            </LabeledField>
          </div>
        </section>

        {/* 2. Purpose of Meeting Section */}
        <section className="form-section">
          <div className="section-title-row">
            <span className="section-number">2</span>
            <h3>Purpose of Meeting</h3>
          </div>

          <div className="fields-grid grid-1-col">
            <LabeledField label="Purpose of Meeting *">
              <select
                className="field-input field-select"
                required
                value={formState.meetingPurpose}
                onChange={(e) => updateField("meetingPurpose", e.target.value)}
              >
                {PURPOSE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </LabeledField>
          </div>
        </section>

        {/* 3. Meeting Summary Section */}
        <section className="form-section">
          <div className="section-title-row">
            <span className="section-number">3</span>
            <h3>Meeting Summary</h3>
          </div>

          <div className="fields-grid grid-1-col">
            <LabeledField label="Key Discussion Points *">
              <textarea
                className="field-input field-textarea"
                rows={5}
                required
                placeholder="Detail key subjects, agendas, and main discussion points covered during the meeting..."
                value={formState.keyDiscussionPoints}
                onChange={(e) => updateField("keyDiscussionPoints", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Critical Details (Facts, Incidents, Concerns & Employee Responses)">
              <textarea
                className="field-input field-textarea"
                rows={5}
                placeholder="Record objective facts, specific incidents, expressed concerns, employee explanations, or relevant circumstances..."
                value={formState.criticalDetails}
                onChange={(e) => updateField("criticalDetails", e.target.value)}
              />
            </LabeledField>
          </div>
        </section>

        {/* 4. Follow-Up Actions Section */}
        <section className="form-section">
          <div className="section-title-row">
            <span className="section-number">4</span>
            <h3>Follow-Up Actions</h3>
          </div>

          <div className="fields-grid grid-2-col">
            <div className="field-span-full">
              <LabeledField label="Actions Required">
                <textarea
                  className="field-input field-textarea"
                  rows={4}
                  placeholder="Specify clear action items, expectations, or remedial steps agreed upon..."
                  value={formState.actionsRequired}
                  onChange={(e) => updateField("actionsRequired", e.target.value)}
                />
              </LabeledField>
            </div>

            <LabeledField label="Responsible Person">
              <input
                type="text"
                className="field-input"
                placeholder="Enter responsible person..."
                value={formState.responsiblePerson}
                onChange={(e) => updateField("responsiblePerson", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Follow-Up Due Date">
              <input
                type="date"
                className="field-input"
                value={formState.followUpDueDate}
                onChange={(e) => updateField("followUpDueDate", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Follow-Up Meeting Required?">
              <div className="radio-group-horizontal">
                <label className={`radio-pill ${formState.followUpRequired === "Yes" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="followUpRequired"
                    value="Yes"
                    checked={formState.followUpRequired === "Yes"}
                    onChange={(e) => updateField("followUpRequired", e.target.value)}
                  />
                  <span>Yes</span>
                </label>
                <label className={`radio-pill ${formState.followUpRequired === "No" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="followUpRequired"
                    value="No"
                    checked={formState.followUpRequired === "No"}
                    onChange={(e) => updateField("followUpRequired", e.target.value)}
                  />
                  <span>No</span>
                </label>
              </div>
            </LabeledField>

            {/* Conditionally rendered Follow-Up Meeting Date */}
            {formState.followUpRequired === "Yes" && (
              <LabeledField label="Follow-Up Meeting Date *">
                <input
                  type="date"
                  className="field-input highlight-date"
                  required={formState.followUpRequired === "Yes"}
                  value={formState.followUpMeetingDate}
                  onChange={(e) => updateField("followUpMeetingDate", e.target.value)}
                />
              </LabeledField>
            )}
          </div>
        </section>

        {/* 5. Additional Notes Section */}
        <section className="form-section">
          <div className="section-title-row">
            <span className="section-number">5</span>
            <h3>Additional Notes</h3>
          </div>

          <div className="fields-grid grid-1-col">
            <LabeledField label="Additional Comments">
              <textarea
                className="field-input field-textarea large-textarea"
                rows={6}
                placeholder="Include any supplementary comments, context, or additional notes relevant to this staff record..."
                value={formState.additionalComments}
                onChange={(e) => updateField("additionalComments", e.target.value)}
              />
            </LabeledField>
          </div>
        </section>

        {/* 6. Sign-Off Section */}
        <section className="form-section">
          <div className="section-title-row">
            <span className="section-number">6</span>
            <h3>Sign-Off</h3>
          </div>

          <div className="fields-grid grid-2-col">
            <LabeledField label="Prepared By *">
              <input
                type="text"
                className="field-input"
                required
                placeholder="Manager / HR Name"
                value={formState.preparedBy}
                onChange={(e) => updateField("preparedBy", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Prepared Date *">
              <input
                type="date"
                className="field-input"
                required
                value={formState.preparedDate}
                onChange={(e) => updateField("preparedDate", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Reviewed / Approved By (Optional)">
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Lead HR Manager"
                value={formState.reviewedBy}
                onChange={(e) => updateField("reviewedBy", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Approval Date (Optional)">
              <input
                type="date"
                className="field-input"
                value={formState.approvalDate}
                onChange={(e) => updateField("approvalDate", e.target.value)}
              />
            </LabeledField>
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
            Save File Note & Generate PDF →
          </button>
        </div>
      </form>
    </div>
  );
}
