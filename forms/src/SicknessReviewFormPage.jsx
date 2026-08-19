import React, { useState } from "react";
import { useApp } from "./AppContext.jsx";
import { savePatientRow, saveFullSubmission } from "./api";
import LabeledField from "./LabeledField.jsx";
import "./SicknessReviewFormPage.css";

export default function SicknessReviewFormPage() {
  const {
    sicknessReviewConsultation,
    setSicknessReviewConsultation,
    setPatient,
    setPharm,
    currentUser,
    branch,
  } = useApp();

  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getFormattedNow = () => new Date().toLocaleString("en-GB");

  const [formState, setFormState] = useState({
    fullName: sicknessReviewConsultation.fullName || "",
    employeeId: sicknessReviewConsultation.employeeId || "",
    department: sicknessReviewConsultation.department || "",
    lineManager: sicknessReviewConsultation.lineManager || "",

    instance1Start: sicknessReviewConsultation.instance1Start || "",
    instance1End: sicknessReviewConsultation.instance1End || "",
    instance1Days: sicknessReviewConsultation.instance1Days || "—",

    instance2Start: sicknessReviewConsultation.instance2Start || "",
    instance2End: sicknessReviewConsultation.instance2End || "",
    instance2Days: sicknessReviewConsultation.instance2Days || "—",

    instance3Start: sicknessReviewConsultation.instance3Start || "",
    instance3End: sicknessReviewConsultation.instance3End || "",
    instance3Days: sicknessReviewConsultation.instance3Days || "—",

    illnessType: sicknessReviewConsultation.illnessType || "",
    illnessDescription: sicknessReviewConsultation.illnessDescription || "",

    fitFully: sicknessReviewConsultation.fitFully || false,
    fitDoctorNote: sicknessReviewConsultation.fitDoctorNote || false,
    fitAdjustments: sicknessReviewConsultation.fitAdjustments || false,
    adjustmentsNeeded: sicknessReviewConsultation.adjustmentsNeeded || "",

    discussionNotes: sicknessReviewConsultation.discussionNotes || "",
    managerSignature: sicknessReviewConsultation.managerSignature || "",
    reviewDate: sicknessReviewConsultation.reviewDate || getTodayStr(),

    createdAt: sicknessReviewConsultation.createdAt || getFormattedNow(),
    updatedAt: getFormattedNow(),
  });

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  const calculateDays = (start, end) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    if (isNaN(diffDays) || diffDays < 0) return "";
    const val = diffDays === 0 ? 1 : diffDays;
    return `${val} ${val === 1 ? "day" : "days"}`;
  };

  const handleFieldChange = (key, value) => {
    setFormState((prev) => {
      const updated = { ...prev, [key]: value, updatedAt: getFormattedNow() };

      if (key === "instance1Start" || key === "instance1End") {
        const auto = calculateDays(
          key === "instance1Start" ? value : prev.instance1Start,
          key === "instance1End" ? value : prev.instance1End
        );
        if (auto) updated.instance1Days = auto;
      }
      if (key === "instance2Start" || key === "instance2End") {
        const auto = calculateDays(
          key === "instance2Start" ? value : prev.instance2Start,
          key === "instance2End" ? value : prev.instance2End
        );
        if (auto) updated.instance2Days = auto;
      }
      if (key === "instance3Start" || key === "instance3End") {
        const auto = calculateDays(
          key === "instance3Start" ? value : prev.instance3Start,
          key === "instance3End" ? value : prev.instance3End
        );
        if (auto) updated.instance3Days = auto;
      }

      return updated;
    });
    setValidationError("");
  };

  const handleClear = () => {
    setFormState({
      fullName: "",
      employeeId: "",
      department: "",
      lineManager: "",

      instance1Start: "",
      instance1End: "",
      instance1Days: "—",

      instance2Start: "",
      instance2End: "",
      instance2Days: "—",

      instance3Start: "",
      instance3End: "",
      instance3Days: "—",

      illnessType: "",
      illnessDescription: "",

      fitFully: false,
      fitDoctorNote: false,
      fitAdjustments: false,
      adjustmentsNeeded: "",

      discussionNotes: "",
      managerSignature: "",
      reviewDate: getTodayStr(),

      createdAt: getFormattedNow(),
      updatedAt: getFormattedNow(),
    });
    setValidationError("");
  };

  const handleSavePdf = () => {
    window.print();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formState.fullName.trim()) {
      setValidationError("Full Name is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setValidationError("");

    try {
      setSicknessReviewConsultation(formState);

      setPatient({
        fullName: formState.fullName,
        name: formState.fullName,
        employeeId: formState.employeeId,
        department: formState.department,
        lineManager: formState.lineManager,
        dob: formState.reviewDate || getTodayStr(),
        reviewDate: formState.reviewDate,
        signaturePatient: formState.fullName,
        dateSignedPatient: formState.reviewDate,
      });

      setPharm({
        managerSignature: formState.managerSignature,
        reviewDate: formState.reviewDate,
      });

      const bId = currentUser?.branchId;
      let tenant = "";
      if (bId === "wilmslow") tenant = "WRP";
      else if (bId === "southport") tenant = "CPC";
      else if (bId === "liverpool") tenant = "247";
      else {
        const n = (currentUser?.name || "").toUpperCase();
        if (n.includes("WILMSLOW")) tenant = "WRP";
        else if (n.includes("CAREPLUS")) tenant = "CPC";
        else if (n.includes("247")) tenant = "247";
        else tenant = "WRP";
      }

      await savePatientRow({
        tenant,
        name: formState.fullName,
        dob: formState.reviewDate || getTodayStr(),
        address: formState.department || "",
        contactNo: formState.employeeId || "",
        email: "",
        service: "sicknessReview",
        date: formState.reviewDate ? new Date(formState.reviewDate) : new Date(),
      });

      await saveFullSubmission({
        tenant,
        service: "sicknessReview",
        patient: {
          fullName: formState.fullName,
          name: formState.fullName,
          employeeId: formState.employeeId,
          department: formState.department,
          lineManager: formState.lineManager,
          dob: formState.reviewDate || getTodayStr(),
        },
        pharm: {
          managerSignature: formState.managerSignature,
          reviewDate: formState.reviewDate,
        },
        consultation: formState,
        branch,
        extraMeta: { currentUserName: currentUser?.name || "" },
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Sickness Review save error:", err);
      setValidationError("Failed to save submission to database. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sickness-note-wrapper">
      {!submitted ? (
        <form className="sickness-note-form" onSubmit={handleSubmit}>
          {/* Top Header Card */}
          <div className="sickness-note-header">
            <div className="sickness-note-header__top">
              <div className="header-badges">
                <span className="badge badge-brand">🏢 CarePlus Health HR</span>
                <span className="badge badge-auth">🔒 HR · Return to Work</span>
              </div>
              <div className="timestamp-info">
                <span>
                  <strong>Created:</strong> {formState.createdAt}
                </span>
                <span className="dot-divider">•</span>
                <span>
                  <strong>Last Updated:</strong> {formState.updatedAt}
                </span>
              </div>
            </div>
            <h2>Sickness Review Form</h2>
            <p className="sickness-note-subtitle">
              Complete this form as part of the return-to-work process. All fields marked with <span className="req-star">*</span> are required unless stated otherwise.
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
              <LabeledField label="Full Name *">
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Jane Smith"
                  value={formState.fullName}
                  onChange={(e) => handleFieldChange("fullName", e.target.value)}
                />
              </LabeledField>

              <LabeledField label="Employee ID">
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. EMP-00123"
                  value={formState.employeeId}
                  onChange={(e) => handleFieldChange("employeeId", e.target.value)}
                />
              </LabeledField>

              <LabeledField label="Department">
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Engineering"
                  value={formState.department}
                  onChange={(e) => handleFieldChange("department", e.target.value)}
                />
              </LabeledField>

              <LabeledField label="Line Manager">
                <input
                  type="text"
                  className="field-input"
                  placeholder="Manager's name"
                  value={formState.lineManager}
                  onChange={(e) => handleFieldChange("lineManager", e.target.value)}
                />
              </LabeledField>
            </div>
          </section>

          {/* 2. Absence Period Section */}
          <section className="form-section">
            <div className="section-title-row">
              <span className="section-number">2</span>
              <h3>Absence Period</h3>
            </div>

            {/* Instance 1 Card */}
            <div className="absence-card">
              <div className="absence-card-header">
                <span className="absence-tag">Instance 1</span>
              </div>
              <div className="fields-grid grid-3-col">
                <LabeledField label="First Day Absent">
                  <input
                    type="date"
                    className="field-input"
                    value={formState.instance1Start}
                    onChange={(e) => handleFieldChange("instance1Start", e.target.value)}
                  />
                </LabeledField>

                <LabeledField label="Return to Work">
                  <input
                    type="date"
                    className="field-input"
                    value={formState.instance1End}
                    onChange={(e) => handleFieldChange("instance1End", e.target.value)}
                  />
                </LabeledField>

                <LabeledField label="Total Days Absent">
                  <input
                    type="text"
                    className="field-input days-editable-input"
                    placeholder="e.g. 0.5 day, 1.5 days, 2"
                    value={formState.instance1Days}
                    onChange={(e) => handleFieldChange("instance1Days", e.target.value)}
                  />
                  <div className="half-day-quick-chips">
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={() => handleFieldChange("instance1Days", "0.5 day")}
                    >
                      0.5 day
                    </button>
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={() => handleFieldChange("instance1Days", "1.5 days")}
                    >
                      1.5 days
                    </button>
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={() => handleFieldChange("instance1Days", "2.5 days")}
                    >
                      2.5 days
                    </button>
                  </div>
                </LabeledField>
              </div>
            </div>

            {/* Instance 2 Card */}
            <div className="absence-card mt-instance-card">
              <div className="absence-card-header">
                <span className="absence-tag">Instance 2</span>
              </div>
              <div className="fields-grid grid-3-col">
                <LabeledField label="First Day Absent">
                  <input
                    type="date"
                    className="field-input"
                    value={formState.instance2Start}
                    onChange={(e) => handleFieldChange("instance2Start", e.target.value)}
                  />
                </LabeledField>

                <LabeledField label="Return to Work">
                  <input
                    type="date"
                    className="field-input"
                    value={formState.instance2End}
                    onChange={(e) => handleFieldChange("instance2End", e.target.value)}
                  />
                </LabeledField>

                <LabeledField label="Total Days Absent">
                  <input
                    type="text"
                    className="field-input days-editable-input"
                    placeholder="e.g. 0.5 day, 1.5 days, 2"
                    value={formState.instance2Days}
                    onChange={(e) => handleFieldChange("instance2Days", e.target.value)}
                  />
                  <div className="half-day-quick-chips">
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={() => handleFieldChange("instance2Days", "0.5 day")}
                    >
                      0.5 day
                    </button>
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={() => handleFieldChange("instance2Days", "1.5 days")}
                    >
                      1.5 days
                    </button>
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={() => handleFieldChange("instance2Days", "2.5 days")}
                    >
                      2.5 days
                    </button>
                  </div>
                </LabeledField>
              </div>
            </div>

            {/* Instance 3 Card */}
            <div className="absence-card mt-instance-card">
              <div className="absence-card-header">
                <span className="absence-tag">Instance 3</span>
              </div>
              <div className="fields-grid grid-3-col">
                <LabeledField label="First Day Absent">
                  <input
                    type="date"
                    className="field-input"
                    value={formState.instance3Start}
                    onChange={(e) => handleFieldChange("instance3Start", e.target.value)}
                  />
                </LabeledField>

                <LabeledField label="Return to Work">
                  <input
                    type="date"
                    className="field-input"
                    value={formState.instance3End}
                    onChange={(e) => handleFieldChange("instance3End", e.target.value)}
                  />
                </LabeledField>

                <LabeledField label="Total Days Absent">
                  <input
                    type="text"
                    className="field-input days-editable-input"
                    placeholder="e.g. 0.5 day, 1.5 days, 2"
                    value={formState.instance3Days}
                    onChange={(e) => handleFieldChange("instance3Days", e.target.value)}
                  />
                  <div className="half-day-quick-chips">
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={() => handleFieldChange("instance3Days", "0.5 day")}
                    >
                      0.5 day
                    </button>
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={() => handleFieldChange("instance3Days", "1.5 days")}
                    >
                      1.5 days
                    </button>
                    <button
                      type="button"
                      className="chip-btn"
                      onClick={() => handleFieldChange("instance3Days", "2.5 days")}
                    >
                      2.5 days
                    </button>
                  </div>
                </LabeledField>
              </div>
            </div>
          </section>

          {/* 3. Nature of Illness Section */}
          <section className="form-section">
            <div className="section-title-row">
              <span className="section-number">3</span>
              <h3>Nature of Illness</h3>
            </div>
            <div className="illness-card-grid">
              <div
                className={`illness-card ${formState.illnessType === "general" ? "active" : ""}`}
                onClick={() => handleFieldChange("illnessType", "general")}
              >
                <span className="illness-emoji">🌡️</span>
                <span className="illness-title">General illness</span>
              </div>

              <div
                className={`illness-card ${formState.illnessType === "mental" ? "active" : ""}`}
                onClick={() => handleFieldChange("illnessType", "mental")}
              >
                <span className="illness-emoji">🧠</span>
                <span className="illness-title">Mental health</span>
              </div>

              <div
                className={`illness-card ${formState.illnessType === "injury" ? "active" : ""}`}
                onClick={() => handleFieldChange("illnessType", "injury")}
              >
                <span className="illness-emoji">🩹</span>
                <span className="illness-title">Injury</span>
              </div>

              <div
                className={`illness-card ${formState.illnessType === "surgery" ? "active" : ""}`}
                onClick={() => handleFieldChange("illnessType", "surgery")}
              >
                <span className="illness-emoji">🏥</span>
                <span className="illness-title">Medical procedure</span>
              </div>

              <div
                className={`illness-card span-full ${formState.illnessType === "other" ? "active" : ""}`}
                onClick={() => handleFieldChange("illnessType", "other")}
              >
                <span className="illness-emoji">💬</span>
                <span className="illness-title">Other / prefer not to say</span>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <LabeledField label="Brief Description (Optional)" span={true}>
                <textarea
                  className="field-input field-textarea"
                  rows={3}
                  placeholder="Provide any additional context you're comfortable sharing..."
                  value={formState.illnessDescription}
                  onChange={(e) => handleFieldChange("illnessDescription", e.target.value)}
                />
              </LabeledField>
            </div>
          </section>

          {/* 4. Fitness to Work Section */}
          <section className="form-section">
            <div className="section-title-row">
              <span className="section-number">4</span>
              <h3>Fitness to Work</h3>
            </div>
            <div className="fitness-checkbox-group">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  className="cph-checkbox"
                  checked={formState.fitFully}
                  onChange={(e) => handleFieldChange("fitFully", e.target.checked)}
                />
                <span>I am fully fit and able to return to my normal duties</span>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  className="cph-checkbox"
                  checked={formState.fitDoctorNote}
                  onChange={(e) => handleFieldChange("fitDoctorNote", e.target.checked)}
                />
                <span>I have a GP / doctor's note to submit</span>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  className="cph-checkbox"
                  checked={formState.fitAdjustments}
                  onChange={(e) => handleFieldChange("fitAdjustments", e.target.checked)}
                />
                <span>I may need adjustments or a phased return to work</span>
              </label>
            </div>

            <div style={{ marginTop: "20px" }}>
              <LabeledField label="Adjustments Needed (If Applicable)" span={true}>
                <textarea
                  className="field-input field-textarea"
                  rows={3}
                  placeholder="Describe any workplace adjustments, reduced hours, or support required..."
                  value={formState.adjustmentsNeeded}
                  onChange={(e) => handleFieldChange("adjustmentsNeeded", e.target.value)}
                />
              </LabeledField>
            </div>
          </section>

          {/* 5. Manager Notes Section */}
          <section className="form-section">
            <div className="section-title-row">
              <span className="section-number">5</span>
              <h3>Manager Notes & Sign-Off</h3>
            </div>
            <div className="fields-grid grid-1-col">
              <LabeledField label="Discussion Notes" span={true}>
                <textarea
                  className="field-input field-textarea large-textarea"
                  rows={4}
                  placeholder="Record key points from the return-to-work discussion..."
                  value={formState.discussionNotes}
                  onChange={(e) => handleFieldChange("discussionNotes", e.target.value)}
                />
              </LabeledField>
            </div>

            <div className="fields-grid grid-2-col" style={{ marginTop: "18px" }}>
              <LabeledField label="Manager Signature">
                <input
                  type="text"
                  className="field-input"
                  placeholder="Type full name to sign"
                  value={formState.managerSignature}
                  onChange={(e) => handleFieldChange("managerSignature", e.target.value)}
                />
              </LabeledField>

              <LabeledField label="Review Date">
                <input
                  type="date"
                  className="field-input highlight-date"
                  value={formState.reviewDate}
                  onChange={(e) => handleFieldChange("reviewDate", e.target.value)}
                />
              </LabeledField>
            </div>
          </section>

          {/* Action Buttons Footer */}
          <div className="form-footer-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClear}
              disabled={saving}
            >
              Clear Form
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={handleSavePdf}
              disabled={saving}
            >
              🖨️ Save as PDF
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Review & Persist to DB →"}
            </button>
          </div>
        </form>
      ) : (
        /* Success state matching CarePlus theme */
        <div className="sickness-success-card">
          <div className="success-icon-badge">
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Sickness Review Submitted</h2>
          <p>The sickness review has been recorded and saved successfully in the CarePlus database.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              handleClear();
              setSubmitted(false);
            }}
          >
            + Submit Another Review
          </button>
        </div>
      )}
    </div>
  );
}
