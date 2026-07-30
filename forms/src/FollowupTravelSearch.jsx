import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPatients, fetchConsultationHistory } from "./api";
import { useApp } from "./AppContext";
import ConsultationHistoryTimeline from "./ConsultationHistoryTimeline";
import "./designSystem.css";
import "./PatientsPage.css";

export default function FollowupTravelSearch() {
  const navigate = useNavigate();
  const { currentUser, setTravelFollowUpOriginalData, setPatient } = useApp();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [searchDob, setSearchDob] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const tenant = useMemo(() => {
    const n = (currentUser?.name || "").toUpperCase();
    if (n.includes("WILMSLOW")) return "WRP";
    if (n.includes("CAREPLUS")) return "CPC";
    if (n.includes("247")) return "247";
    return "";
  }, [currentUser]);

  useEffect(() => {
    fetchPatients(tenant || "")
      .then((data) => {
        const travelPatients = data.filter(
          (r) => r.service === "travel" || r.service === "travelFollowUp"
        );

        // Deduplicate by name & dob
        const unique = [];
        const seen = new Set();
        for (const p of travelPatients) {
          const key = `${(p.name || "").trim().toLowerCase()}|${p.dob || ""}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(p);
          }
        }
        setPatients(unique);
      })
      .catch((err) => setError(`Failed to load patients: ${err.message}`))
      .finally(() => setLoading(false));
  }, [tenant]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (searchName && !(p.name || "").toLowerCase().includes(searchName.toLowerCase())) return false;
      if (searchDob && !p.dob?.includes(searchDob)) return false;
      if (searchEmail && !(p.email || "").toLowerCase().includes(searchEmail.toLowerCase())) return false;
      return true;
    });
  }, [patients, searchName, searchDob, searchEmail]);

  const handleSelectPatient = async (row) => {
    try {
      setFetchingHistory(true);
      setError("");

      let history = [];
      try {
        history = await fetchConsultationHistory({
          name: row.name,
          dob: row.dob,
          service: "travel",
        });
      } catch (err) {
        console.warn("History lookup error, using row fallback", err);
      }

      const vaxHistory = [];
      if (history && history.length > 0) {
        for (const visit of history) {
          const rx = visit.pharmacist_data || visit.pharmacist || {};
          if (Array.isArray(rx.vaccines)) vaxHistory.push(...rx.vaccines);
          if (Array.isArray(rx.malariaVaccines)) vaxHistory.push(...rx.malariaVaccines);
          if (Array.isArray(rx.followUpVaccines)) vaxHistory.push(...rx.followUpVaccines);
        }
      }

      const latest = (history && history.length > 0) ? history[history.length - 1] : row;
      const pData = latest.patient_data || latest.patient || {
        fullName: row.name,
        name: row.name,
        dob: row.dob,
        email: row.email,
        date: row.created_at || row.date,
      };
      const cData = latest.consultation_data || latest.consultation || {};
      const rxData = latest.pharmacist_data || latest.pharmacist || {};

      setTravelFollowUpOriginalData({
        patient_data: pData,
        consultation_data: cData,
        pharmacist_data: rxData,
        history: vaxHistory,
        fullConsultationHistory: history.length > 0 ? history : [latest],
      });

      setPatient(pData || {});
      navigate(`/service/travelFollowUp/pharmacist`);
    } catch (err) {
      console.error("Selection error:", err);
      const pData = row.patient_data || { fullName: row.name, name: row.name, dob: row.dob, email: row.email };
      setTravelFollowUpOriginalData({
        patient_data: pData,
        consultation_data: row.consultation_data || {},
        pharmacist_data: row.pharmacist_data || {},
        history: [],
        fullConsultationHistory: [row],
      });
      setPatient(pData);
      navigate(`/service/travelFollowUp/pharmacist`);
    } finally {
      setFetchingHistory(false);
    }
  };


  const handlePreviewHistory = async (row) => {
    try {
      setFetchingHistory(true);
      const history = await fetchConsultationHistory({
        name: row.name,
        dob: row.dob,
        service: "travel",
      });
      setSelectedPatientHistory({ patient: row, history });
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="patients-page patients" style={{ padding: 24 }}>
      <div className="cph-card" style={{ marginBottom: 20 }}>
        <div className="cph-card-header">
          <div>
            <h2 className="cph-card-title">✈️ Search Travel Clinic Follow-Up Patient</h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
              Retrieve prior travel risk assessments, vaccination history, and administer booster/follow-up vaccines.
            </p>
          </div>
          <span className="cph-badge cph-badge-emerald">
            {tenant ? `Tenant: ${tenant}` : "All Branches"}
          </span>
        </div>

        {error && (
          <div className="error-message" style={{ background: "#fef2f2", color: "#b91c1c", padding: 12, borderRadius: 8, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="patients__filters">
          <div className="patients__filter-group">
            <label className="cph-field-label">Search Name</label>
            <input
              type="text"
              className="cph-input"
              placeholder="e.g. John Smith..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="patients__filter-group">
            <label className="cph-field-label">Date of Birth</label>
            <input
              type="date"
              className="cph-input"
              value={searchDob}
              onChange={(e) => setSearchDob(e.target.value)}
            />
          </div>
          <div className="patients__filter-group">
            <label className="cph-field-label">Email</label>
            <input
              type="text"
              className="cph-input"
              placeholder="email@..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedPatientHistory && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>
              Travel History Chain: <strong>{selectedPatientHistory.patient.name}</strong>
            </h3>
            <button className="cph-btn cph-btn-secondary" onClick={() => setSelectedPatientHistory(null)}>
              Close Timeline Preview
            </button>
          </div>
          <ConsultationHistoryTimeline history={selectedPatientHistory.history} serviceType="travel" />
        </div>
      )}

      {loading || fetchingHistory ? (
        <div className="cph-card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "#166534", fontWeight: 600 }}>Loading travel consultation history...</p>
        </div>
      ) : (
        <div className="tablewrap">
          <table className="table patients-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>DOB</th>
                <th>Email</th>
                <th>Last Visit Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                    No previous Travel Clinic consultations found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{p.name}</td>
                    <td>{formatDate(p.dob)}</td>
                    <td>{p.email || "—"}</td>
                    <td>{formatDate(p.created_at || p.date)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="cph-btn cph-btn-primary"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          onClick={() => handleSelectPatient(p)}
                        >
                          Start Follow-Up
                        </button>
                        <button
                          className="cph-btn cph-btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          onClick={() => handlePreviewHistory(p)}
                        >
                          📜 View Timeline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
