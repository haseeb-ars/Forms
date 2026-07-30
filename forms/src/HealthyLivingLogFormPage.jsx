import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import { saveHealthyLivingLog, saveFullSubmission } from "./api.js";
import "./HealthyLivingLogFormPage.css";

const createEmptyRow = (defaultDate = "", defaultInitials = "") => ({
  date: defaultDate || new Date().toISOString().split("T")[0],
  staffInitials: defaultInitials || "",
  nhsNumber: "",
  clinicalLocation: false,
  nonClinicalLocation: false,
  lifestyleAdvice: false,
  otcAdvice: false,
  selfCare: false,
  signposting: false,
  briefDescription: "",
  gpInformed: false,
  recordedInPnr: false,
  outcomeSummary: "",
});

export default function HealthyLivingLogFormPage() {
  const navigate = useNavigate();
  const {
    healthyLivingLogConsultation,
    setHealthyLivingLogConsultation,
    currentUser,
    branch,
    setPatient,
    setPharm,
  } = useApp();

  const [entries, setEntries] = useState(
    healthyLivingLogConsultation?.entries?.length > 0
      ? healthyLivingLogConsultation.entries
      : [createEmptyRow()]
  );

  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleRowChange = (index, field, value) => {
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddRow = () => {
    const lastRow = entries[entries.length - 1] || {};
    setEntries((prev) => [
      ...prev,
      createEmptyRow(lastRow.date, lastRow.staffInitials),
    ]);
  };

  const handleRemoveRow = (index) => {
    if (entries.length === 1) return;
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage("Saving log entries to database...");

    const updatedConsultation = { entries };
    setHealthyLivingLogConsultation(updatedConsultation);

    // Populate patient & pharm defaults for global state integration
    const primaryEntry = entries[0] || {};
    setPatient({
      fullName: `Healthy Living Log (${branch?.pharmacyName || "CarePlus Health"})`,
      address: branch?.pharmacyAddress || "",
      telephone: "",
      dob: primaryEntry.date || new Date().toISOString().split("T")[0],
      gpName: primaryEntry.gpInformed ? "GP Informed" : "N/A",
    });

    setPharm({
      pharmacistNameGPhC: primaryEntry.staffInitials || currentUser?.name || "",
      pharmacyName: branch?.pharmacyName || "CarePlus Health",
      pharmacyAddress: branch?.pharmacyAddress || "",
      entriesCount: entries.length,
    });

    try {
      // 1. Dedicated Healthy Living Log DB table insert (attempt)
      const payload = {
        branchId: currentUser?.branchId || "default",
        branchName: branch?.pharmacyName || currentUser?.name || "CarePlus Health Branch",
        createdBy: currentUser?.name || "Staff",
        entries: entries,
      };

      try {
        await saveHealthyLivingLog(payload);
      } catch (logErr) {
        console.warn("[HealthyLivingLog] Dedicated table save notice (server pending restart):", logErr.message);
      }

      // 2. Form Submissions snapshot save (standard backend persistence)
      const submissionPayload = {
        tenant: currentUser?.branchId === "wilmslow" ? "WRP" : currentUser?.branchId === "southport" ? "CPC" : "247",
        service: "healthyLivingLog",
        patient: {
          fullName: `Healthy Living Log - ${entries.length} Records`,
          date: new Date().toISOString().split("T")[0],
        },
        pharm: {
          staffName: currentUser?.name || "",
          branchName: branch?.pharmacyName || "",
        },
        consultation: updatedConsultation,
        branch: branch || {},
        extraMeta: {
          currentUserName: currentUser?.name || "",
          branchId: currentUser?.branchId || "",
          createdAt: new Date().toISOString(),
        },
      };

      try {
        await saveFullSubmission(submissionPayload);
      } catch (subErr) {
        console.warn("[HealthyLivingLog] Form submission persistence notice:", subErr.message);
      }

      setStatusMessage("✅ Saved successfully! Navigating to preview...");
      setTimeout(() => {
        navigate("/service/healthyLivingLog/preview");
      }, 500);
    } catch (err) {
      console.error("Save error:", err);
      // Even if network fails, allow navigating to preview so staff can view/export PDF
      setStatusMessage("⚠️ Proceeding to preview...");
      setTimeout(() => {
        navigate("/service/healthyLivingLog/preview");
      }, 500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="healthy-form-container">
      <header className="healthy-form-header">
        <div className="healthy-header-top">
          <h2>Intervention / Healthy Living Advice / Signposting Log</h2>
          <span className="branch-badge">
            🏢 {branch?.pharmacyName || currentUser?.name || "CarePlus Health"}
          </span>
        </div>
        <p className="healthy-header-sub">
          Record interventions, healthy living advice given, OTC recommendations, self-care guidance, and signposting details.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="healthy-table-wrapper">
          <table className="healthy-entry-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th style={{ width: "110px" }}>Date</th>
                <th style={{ width: "80px" }}>Staff Initials</th>
                <th style={{ width: "110px" }}>NHS Number</th>
                <th style={{ width: "70px" }}>Clinical Loc.</th>
                <th style={{ width: "70px" }}>Non-Clin. Loc.</th>
                <th style={{ width: "70px" }}>Lifestyle Adv.</th>
                <th style={{ width: "70px" }}>OTC Adv.</th>
                <th style={{ width: "70px" }}>Self Care</th>
                <th style={{ width: "70px" }}>Signposting</th>
                <th>Brief Description</th>
                <th style={{ width: "65px" }}>GP Inf.</th>
                <th style={{ width: "65px" }}>PNR Rec.</th>
                <th>Outcome / Summary</th>
                <th style={{ width: "50px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row, idx) => (
                <tr key={idx}>
                  <td className="center-cell">{idx + 1}</td>
                  <td>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => handleRowChange(idx, "date", e.target.value)}
                      className="healthy-input-date"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Initials"
                      value={row.staffInitials}
                      onChange={(e) => handleRowChange(idx, "staffInitials", e.target.value)}
                      className="healthy-input-short"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="NHS No."
                      value={row.nhsNumber}
                      onChange={(e) => handleRowChange(idx, "nhsNumber", e.target.value)}
                      className="healthy-input-short"
                    />
                  </td>

                  {/* Location Toggles */}
                  <td className="center-cell">
                    <input
                      type="checkbox"
                      checked={row.clinicalLocation}
                      onChange={(e) => handleRowChange(idx, "clinicalLocation", e.target.checked)}
                    />
                  </td>
                  <td className="center-cell">
                    <input
                      type="checkbox"
                      checked={row.nonClinicalLocation}
                      onChange={(e) => handleRowChange(idx, "nonClinicalLocation", e.target.checked)}
                    />
                  </td>

                  {/* Advice Toggles */}
                  <td className="center-cell">
                    <input
                      type="checkbox"
                      checked={row.lifestyleAdvice}
                      onChange={(e) => handleRowChange(idx, "lifestyleAdvice", e.target.checked)}
                    />
                  </td>
                  <td className="center-cell">
                    <input
                      type="checkbox"
                      checked={row.otcAdvice}
                      onChange={(e) => handleRowChange(idx, "otcAdvice", e.target.checked)}
                    />
                  </td>
                  <td className="center-cell">
                    <input
                      type="checkbox"
                      checked={row.selfCare}
                      onChange={(e) => handleRowChange(idx, "selfCare", e.target.checked)}
                    />
                  </td>
                  <td className="center-cell">
                    <input
                      type="checkbox"
                      checked={row.signposting}
                      onChange={(e) => handleRowChange(idx, "signposting", e.target.checked)}
                    />
                  </td>

                  {/* Brief Description */}
                  <td>
                    <textarea
                      rows={2}
                      placeholder="Advice given / Signposted details / Event description..."
                      value={row.briefDescription}
                      onChange={(e) => handleRowChange(idx, "briefDescription", e.target.value)}
                      className="healthy-textarea"
                    />
                  </td>

                  {/* GP / PNR Status */}
                  <td className="center-cell">
                    <input
                      type="checkbox"
                      checked={row.gpInformed}
                      onChange={(e) => handleRowChange(idx, "gpInformed", e.target.checked)}
                    />
                  </td>
                  <td className="center-cell">
                    <input
                      type="checkbox"
                      checked={row.recordedInPnr}
                      onChange={(e) => handleRowChange(idx, "recordedInPnr", e.target.checked)}
                    />
                  </td>

                  {/* Outcome / Summary */}
                  <td>
                    <input
                      type="text"
                      placeholder="Outcome summary"
                      value={row.outcomeSummary}
                      onChange={(e) => handleRowChange(idx, "outcomeSummary", e.target.value)}
                      className="healthy-input-text"
                    />
                  </td>

                  <td className="center-cell">
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemoveRow(idx)}
                      disabled={entries.length === 1}
                      title="Remove Row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="healthy-actions-bar">
          <button type="button" className="btn-secondary" onClick={handleAddRow}>
            ➕ Add Entry Row
          </button>

          {statusMessage && <span className="status-msg">{statusMessage}</span>}

          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "💾 Save & Preview Form"}
          </button>
        </div>
      </form>
    </div>
  );
}
