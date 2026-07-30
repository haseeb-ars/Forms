import React, { useState } from "react";
import "./ConsultationHistoryTimeline.css";

export default function ConsultationHistoryTimeline({ history = [], serviceType = "weightloss" }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="history-empty-card">
        <div className="empty-icon">📜</div>
        <div className="empty-title">No previous consultations found</div>
        <div className="empty-sub">
          No prior consultation records exist for this patient and service. This will be recorded as their initial baseline consultation.
        </div>
      </div>
    );
  }

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const formatDate = (dStr) => {
    if (!dStr) return "—";
    try {
      return new Date(dStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(dStr);
    }
  };

  return (
    <div className="history-timeline-container">
      <div className="timeline-header-bar">
        <div className="timeline-title-group">
          <span className="timeline-icon">📊</span>
          <h3>Consultation History Chain</h3>
          <span className="records-count-badge">{history.length} Visits Recorded</span>
        </div>
      </div>

      <div className="timeline-items-wrapper">
        {history.map((record, idx) => {
          const isExpanded = expandedIndex === idx;
          const pData = record.patient_data || record.patient || {};
          const cData = record.consultation_data || record.consultation || {};
          const rxData = record.pharmacist_data || record.pharmacist || {};
          const bData = record.branch_data || record.branch || {};
          const meta = record.extra_meta || {};

          const dateStr = record.created_at || pData.date || record.date;
          const clinicianName = meta.currentUserName || rxData.pharmacistNameGPhC || rxData.prescriberName || "Staff Clinician";
          const branchName = bData.pharmacyName || meta.branchName || "CarePlus Health Branch";

          // Calculate weight trend if previous visit exists
          let weightDiff = null;
          if (serviceType === "weightloss" && idx > 0) {
            const prevWeight = parseFloat(history[idx - 1]?.consultation_data?.weight || history[idx - 1]?.patient_data?.weight);
            const currWeight = parseFloat(cData.weight || pData.weight);
            if (!isNaN(prevWeight) && !isNaN(currWeight)) {
              weightDiff = (currWeight - prevWeight).toFixed(1);
            }
          }

          return (
            <div key={idx} className={`timeline-item-card ${isExpanded ? "expanded" : ""}`}>
              <div className="timeline-item-header" onClick={() => toggleExpand(idx)}>
                <div className="timeline-badge-column">
                  <span className="visit-number-circle">#{idx + 1}</span>
                  <span className="timeline-date">{formatDate(dateStr)}</span>
                </div>

                <div className="timeline-summary-column">
                  <div className="summary-main-row">
                    <span className="service-tag">{record.service || serviceType}</span>
                    <span className="clinician-text">👨‍⚕️ {clinicianName}</span>
                    <span className="branch-text">🏢 {branchName}</span>
                  </div>

                  <div className="summary-details-row">
                    {serviceType === "weightloss" && (
                      <>
                        {(cData.weight || pData.weight) && (
                          <span className="stat-pill">
                            ⚖️ Weight: <strong>{cData.weight || pData.weight} kg</strong>
                          </span>
                        )}
                        {(cData.bmi || pData.bmi) && (
                          <span className="stat-pill">
                            📐 BMI: <strong>{cData.bmi || pData.bmi}</strong>
                          </span>
                        )}
                        {rxData.medication && (
                          <span className="stat-pill med-pill">
                            💊 Supplied: <strong>{rxData.medication}</strong>
                          </span>
                        )}
                        {weightDiff !== null && (
                          <span className={`stat-pill trend-pill ${parseFloat(weightDiff) <= 0 ? "loss" : "gain"}`}>
                            {parseFloat(weightDiff) <= 0 ? `📉 ${weightDiff} kg` : `📈 +${weightDiff} kg`}
                          </span>
                        )}
                      </>
                    )}

                    {serviceType === "travel" && (
                      <>
                        {Array.isArray(cData.countries) && cData.countries.length > 0 && (
                          <span className="stat-pill">
                            ✈️ Destinations: <strong>{cData.countries.join(", ")}</strong>
                          </span>
                        )}
                        {Array.isArray(rxData.vaccines) && rxData.vaccines.length > 0 && (
                          <span className="stat-pill med-pill">
                            💉 Vaccines: <strong>{rxData.vaccines.map(v => v.name).filter(Boolean).join(", ")}</strong>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <button type="button" className="btn-toggle-expand">
                  {isExpanded ? "▲ Hide Details" : "▼ View Snapshot"}
                </button>
              </div>

              {isExpanded && (
                <div className="timeline-item-drawer">
                  <div className="drawer-section">
                    <h4>📋 Consultation Notes & Recommendations</h4>
                    <p className="drawer-notes-text">
                      {cData.notes || cData.additionalNotes || rxData.notes || "No additional notes recorded for this visit."}
                    </p>
                  </div>

                  <div className="drawer-grid">
                    {cData.medicalConditions && (
                      <div className="drawer-detail-box">
                        <span className="detail-label">Medical Conditions:</span>
                        <span className="detail-value">{cData.medicalConditions}</span>
                      </div>
                    )}
                    {cData.currentMedications && (
                      <div className="drawer-detail-box">
                        <span className="detail-label">Current Medications:</span>
                        <span className="detail-value">{cData.currentMedications}</span>
                      </div>
                    )}
                    {cData.sideEffects && (
                      <div className="drawer-detail-box">
                        <span className="detail-label">Side Effects Reported:</span>
                        <span className="detail-value">{cData.sideEffects}</span>
                      </div>
                    )}
                    {rxData.dosage && (
                      <div className="drawer-detail-box">
                        <span className="detail-label">Dosage Instructions:</span>
                        <span className="detail-value">{rxData.dosage}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
