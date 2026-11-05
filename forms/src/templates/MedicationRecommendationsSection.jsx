// src/templates/MedicationRecommendationsSection.jsx
import React from "react";
import { useApp } from "../AppContext.jsx";

export default function MedicationRecommendationsSection({ data = {} }) {
  const { medicationRecommendations, pharm } = useApp();

  const recsSource =
    data.medicationRecommendations ||
    data.recommendations ||
    pharm?.recommendations ||
    medicationRecommendations ||
    {};

  const selectedList = Object.values(recsSource).filter(
    (item) =>
      item &&
      (item.alreadyTakes ||
        item.recommended ||
        item.patientAgreed ||
        (item.notes && item.notes.trim().length > 0))
  );

  if (selectedList.length === 0) return null;

  return (
    <section className="template-section medication-recommendations-section" style={{ marginTop: 20 }}>
      <h2 style={{ fontSize: "1.1rem", borderBottom: "2px solid #0d9488", paddingBottom: 6, marginBottom: 12, color: "#0f172a" }}>
        Medication &amp; Supplement Recommendations
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", marginBottom: 15 }}>
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
            <th style={{ textAlign: "left", padding: "8px 10px", width: "35%" }}>Product / Supplement</th>
            <th style={{ textAlign: "left", padding: "8px 10px", width: "20%" }}>Category</th>
            <th style={{ textAlign: "center", padding: "8px 10px", width: "15%" }}>Already Takes</th>
            <th style={{ textAlign: "center", padding: "8px 10px", width: "15%" }}>Recommended</th>
            <th style={{ textAlign: "center", padding: "8px 10px", width: "15%" }}>Agreed / Taking</th>
          </tr>
        </thead>
        <tbody>
          {selectedList.map((item, idx) => (
            <React.Fragment key={item.id || idx}>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px 10px", fontWeight: "bold", color: "#0f172a" }}>
                  {item.name}
                </td>
                <td style={{ padding: "8px 10px", color: "#64748b" }}>
                  {item.category || "General"}
                </td>
                <td style={{ padding: "8px 10px", textAlign: "center" }}>
                  {item.alreadyTakes ? (
                    <span style={{ color: "#2563eb", fontWeight: "bold" }}>✓ Yes</span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
                <td style={{ padding: "8px 10px", textAlign: "center" }}>
                  {item.recommended ? (
                    <span style={{ color: "#16a34a", fontWeight: "bold" }}>✓ Yes</span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
                <td style={{ padding: "8px 10px", textAlign: "center" }}>
                  {item.patientAgreed ? (
                    <span style={{ color: "#9333ea", fontWeight: "bold" }}>✓ Yes</span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
              </tr>
              {item.notes && item.notes.trim().length > 0 && (
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <td colSpan={5} style={{ padding: "4px 10px 8px 24px", fontSize: "0.8rem" }}>
                    <span style={{ fontWeight: 600, color: "#0d9488" }}>Pharmacist Notes: </span>
                    <span style={{ fontStyle: "italic", color: "#475569" }}>{item.notes}</span>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </section>
  );
}
