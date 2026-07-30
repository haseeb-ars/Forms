// src/ServiceSelectPage.jsx
import { services } from "./servicesConfig";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import "./designSystem.css";
import "./ServiceSelectPage.css";

const SERVICE_ICONS = {
  perioddelay: "🌸",
  b12: "💉",
  weightloss: "⚖️",
  weightlossFollowup: "📉",
  earwax: "👂",
  flu: "🛡️",
  covid: "🔬",
  travel: "✈️",
  travelFollowUp: "🧭",
  privateprescription: "💊",
  followupprescription: "📝",
  mmr: "💉",
  meningitis: "🧠",
  contraception: "🌸",
  employeeAppraisal: "👔",
  healthyLivingLog: "📋",
};

export default function ServiceSelectPage() {
  const navigate = useNavigate();
  const { setSelectedFormType, branch, currentUser } = useApp();

  const handleSelect = (serviceId) => {
    setSelectedFormType(serviceId);
    if (serviceId === "employeeAppraisal") {
      navigate(`/service/employeeAppraisal/form`);
    } else if (serviceId === "healthyLivingLog") {
      navigate(`/service/healthyLivingLog/form`);
    } else {
      navigate(`/service/${serviceId}/patient`);
    }
  };

  const activeServices = services;

  return (
    <div className="service-select-container">
      <div className="service-select-header">
        <div className="service-header-info">
          <h1>CarePlus Health Services Portal</h1>
          <p>Select a service below to initiate patient registration, consultation, or follow-up form.</p>
        </div>
        <span className="cph-badge cph-badge-emerald" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
          🏢 {branch?.pharmacyName || currentUser?.name || "CarePlus Health"}
        </span>
      </div>

      <div className="bento-grid">
        {activeServices.map((s) => (
          <div
            key={s.id}
            className="bento-card service"
            style={{ backgroundColor: s.color || "#166534" }}
            onClick={() => handleSelect(s.id)}
          >
            <div className="bento-content">
              <div className="bento-top-row">
                <span className="service-icon-badge">
                  {SERVICE_ICONS[s.id] || "📋"}
                </span>
              </div>
              <h3>{s.name}</h3>
              <div className="bento-bottom-row">
                <span className="start-btn-label">Open Service Form →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
