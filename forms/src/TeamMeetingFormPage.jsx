import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, CAREPLUS_STAFF_LIST } from "./AppContext.jsx";
import LabeledField from "./LabeledField.jsx";
import "./TeamMeetingFormPage.css";

export default function TeamMeetingFormPage() {
  const navigate = useNavigate();
  const {
    teamMeetingConsultation,
    setTeamMeetingConsultation,
    setPatient,
    setPharm,
    currentUser,
    branch,
  } = useApp();

  const loggedInUserName = currentUser?.name || "Lead Pharmacist / Manager";
  const pharmacyName = branch?.pharmacyName || "CarePlus Health";
  const todayDate = new Date().toISOString().split("T")[0];
  const nowFormatted = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Current time in HH:MM
  const defaultTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  const [formState, setFormState] = useState({
    meetingDate: teamMeetingConsultation.meetingDate || todayDate,
    meetingTime: teamMeetingConsultation.meetingTime || defaultTime(),
    meetingChair: teamMeetingConsultation.meetingChair || loggedInUserName,
    location: teamMeetingConsultation.location || pharmacyName,

    teamMembers: teamMeetingConsultation.teamMembers || "",
    pointsDiscussed: teamMeetingConsultation.pointsDiscussed || "",
    targets: teamMeetingConsultation.targets || "",
    actionPlan: teamMeetingConsultation.actionPlan || "",

    actionItems:
      Array.isArray(teamMeetingConsultation.actionItems) &&
      teamMeetingConsultation.actionItems.length > 0
        ? teamMeetingConsultation.actionItems
        : [{ id: 1, action: "", responsiblePerson: "", deadline: "" }],

    createdAt: teamMeetingConsultation.createdAt || nowFormatted,
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

  // Structured action item management
  const handleActionChange = (id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
      updatedAt: nowFormatted,
    }));
  };

  const addActionItem = () => {
    setFormState((prev) => ({
      ...prev,
      actionItems: [
        ...prev.actionItems,
        {
          id: Date.now(),
          action: "",
          responsiblePerson: "",
          deadline: "",
        },
      ],
      updatedAt: nowFormatted,
    }));
  };

  const removeActionItem = (id) => {
    setFormState((prev) => ({
      ...prev,
      actionItems:
        prev.actionItems.length > 1
          ? prev.actionItems.filter((item) => item.id !== id)
          : [{ id: Date.now(), action: "", responsiblePerson: "", deadline: "" }],
      updatedAt: nowFormatted,
    }));
  };

  // Quick staff insert for team members
  const addQuickStaff = (staffName) => {
    setFormState((prev) => {
      const current = prev.teamMembers ? prev.teamMembers.trim() : "";
      if (current.includes(staffName)) return prev;
      const updated = current ? `${current}\n${staffName}` : staffName;
      return {
        ...prev,
        teamMembers: updated,
        updatedAt: nowFormatted,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🛡️ Required fields validation: Date & Time
    if (!formState.meetingDate || !String(formState.meetingDate).trim()) {
      setValidationError("Mandatory field missing: Please enter the Meeting Date.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formState.meetingTime || !String(formState.meetingTime).trim()) {
      setValidationError("Mandatory field missing: Please enter the Meeting Time.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const updatedMeeting = {
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
    setTeamMeetingConsultation(updatedMeeting);

    // Sync with generic patient & pharm slices for DB persistence & PDF generator compatibility
    const meetingTitle = `Team Meeting (${updatedMeeting.meetingDate} ${updatedMeeting.meetingTime})`;
    setPatient({
      fullName: meetingTitle,
      name: meetingTitle,
      meetingDate: updatedMeeting.meetingDate,
      date: updatedMeeting.meetingDate,
      dob: updatedMeeting.meetingDate,
      time: updatedMeeting.meetingTime,
      meetingTime: updatedMeeting.meetingTime,
      service: "teamMeeting",
    });

    setPharm({
      meetingChair: updatedMeeting.meetingChair,
      preparedBy: updatedMeeting.meetingChair,
      location: updatedMeeting.location,
      createdAt: updatedMeeting.createdAt,
      updatedAt: updatedMeeting.updatedAt,
      service: "teamMeeting",
    });

    // Navigate to preview page with autoDownload
    navigate({
      pathname: "/service/teamMeeting/preview",
      search: "?autoDownload=true",
    });
  };

  return (
    <div className="team-meeting-wrapper">
      <form onSubmit={handleSubmit} className="team-meeting-form">
        {/* Header Card */}
        <div className="team-meeting-header">
          <div className="team-meeting-header__top">
            <div className="header-badges">
              <span className="badge-brand-teal">CarePlus Health</span>
              <span className="badge-brand-teal">Clinical & Operational Governance</span>
            </div>
            <div className="timestamp-info">
              <span>📅 {formState.meetingDate}</span>
              <span>🕒 {formState.meetingTime}</span>
            </div>
          </div>
          <h2>Team Meeting Form</h2>
          <p className="team-meeting-subtitle">
            Document practice discussions, strategic targets, and assignable action plans with deadlines.
          </p>
        </div>

        {/* Error Banner */}
        {validationError && (
          <div className="error-banner">
            <span>⚠️</span> {validationError}
          </div>
        )}

        {/* 1. Meeting Overview (Date & Time) */}
        <div className="form-section-card">
          <h3 className="section-title">
            <span className="section-num">1</span> Date, Time & Logistics
          </h3>
          <div className="field-grid">
            <LabeledField label="Date *" description="Select meeting date (Required)">
              <input
                type="date"
                required
                value={formState.meetingDate}
                onChange={(e) => updateField("meetingDate", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Time *" description="Meeting time (Required)">
              <input
                type="time"
                required
                value={formState.meetingTime}
                onChange={(e) => updateField("meetingTime", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Meeting Chair / Facilitator" description="Staff member leading the session">
              <input
                type="text"
                placeholder="e.g. Dr. Sarah Jenkins"
                value={formState.meetingChair}
                onChange={(e) => updateField("meetingChair", e.target.value)}
              />
            </LabeledField>

            <LabeledField label="Location / Branch" description="Practice branch or virtual meeting room">
              <input
                type="text"
                placeholder="e.g. CarePlus Health Dispensary"
                value={formState.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </LabeledField>
          </div>
        </div>

        {/* 2. Team Members Involved */}
        <div className="form-section-card">
          <h3 className="section-title">
            <span className="section-num">2</span> Team Members Involved
          </h3>
          <div className="field-grid grid-full">
            <LabeledField
              label="Team Members"
              description="Enter the names of all team members and attendees present (one per line or comma-separated)"
            >
              <textarea
                rows={4}
                placeholder="e.g.&#10;Dr. Sarah Jenkins (Senior Lead Pharmacist)&#10;Michael Chang (Dispensary Technician)&#10;Emma Watson (HR Specialist)"
                value={formState.teamMembers}
                onChange={(e) => updateField("teamMembers", e.target.value)}
              />
            </LabeledField>

            {CAREPLUS_STAFF_LIST && CAREPLUS_STAFF_LIST.length > 0 && (
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b" }}>
                  Quick Insert Registered Staff:
                </span>
                <div className="quick-chips-wrapper">
                  {CAREPLUS_STAFF_LIST.map((staff) => (
                    <button
                      type="button"
                      key={staff.id}
                      className="quick-chip"
                      onClick={() => addQuickStaff(`${staff.name} (${staff.jobTitle})`)}
                    >
                      + {staff.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Points Discussed */}
        <div className="form-section-card">
          <h3 className="section-title">
            <span className="section-num">3</span> Points Discussed
          </h3>
          <div className="field-grid grid-full">
            <LabeledField
              label="Meeting Discussion Topics & Notes"
              description="Record detailed minutes, operational challenges, clinical review points, and updates"
            >
              <textarea
                rows={6}
                placeholder="Record all agenda topics, clinical updates, patient safety reviews, inventory status, dispensing protocols, or service improvements discussed during the meeting..."
                value={formState.pointsDiscussed}
                onChange={(e) => updateField("pointsDiscussed", e.target.value)}
              />
            </LabeledField>
          </div>
        </div>

        {/* 4. Targets */}
        <div className="form-section-card">
          <h3 className="section-title">
            <span className="section-num">4</span> Targets & Objectives
          </h3>
          <div className="field-grid grid-full">
            <LabeledField
              label="Agreed Targets"
              description="Record key objectives, quality indicators, delivery targets, or clinical milestones agreed upon"
            >
              <textarea
                rows={4}
                placeholder="e.g.&#10;1. Achieve 100% compliance on dispensing sign-offs.&#10;2. Implement weekly stock audits for high-turnover medication lines.&#10;3. Complete CPD training modules by month end."
                value={formState.targets}
                onChange={(e) => updateField("targets", e.target.value)}
              />
            </LabeledField>
          </div>
        </div>

        {/* 5. Action Plan and Deadline for Targets */}
        <div className="form-section-card">
          <h3 className="section-title">
            <span className="section-num">5</span> Action Plan and Deadline for Targets
          </h3>
          <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "-10px 0 16px 0" }}>
            Specify the actions to be taken, designate responsible team members, and assign target deadlines.
          </p>

          <div className="actions-table-wrapper">
            <table className="actions-table">
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>Action / Task Description</th>
                  <th style={{ width: "30%" }}>Responsible Person</th>
                  <th style={{ width: "20%" }}>Deadline</th>
                  <th style={{ width: "5%" }}></th>
                </tr>
              </thead>
              <tbody>
                {formState.actionItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="text"
                        placeholder={`Action ${index + 1}...`}
                        value={item.action}
                        onChange={(e) =>
                          handleActionChange(item.id, "action", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Responsible person..."
                        value={item.responsiblePerson}
                        onChange={(e) =>
                          handleActionChange(item.id, "responsiblePerson", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={item.deadline}
                        onChange={(e) =>
                          handleActionChange(item.id, "deadline", e.target.value)
                        }
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {formState.actionItems.length > 1 && (
                        <button
                          type="button"
                          className="action-row-delete-btn"
                          title="Remove item"
                          onClick={() => removeActionItem(item.id)}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="add-action-btn"
            onClick={addActionItem}
          >
            + Add Action Item
          </button>

          <div style={{ marginTop: "20px" }}>
            <LabeledField
              label="Additional Action Plan Notes / Narrative (Optional)"
              description="Additional details regarding execution, review dates, or support required"
            >
              <textarea
                rows={3}
                placeholder="Enter any additional contextual notes or review schedule for the action plans above..."
                value={formState.actionPlan}
                onChange={(e) => updateField("actionPlan", e.target.value)}
              />
            </LabeledField>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="form-actions-bar">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            ← Cancel
          </button>
          <button type="submit" className="btn-primary-teal">
            Generate Pre-Filled Form & Preview →
          </button>
        </div>
      </form>
    </div>
  );
}
