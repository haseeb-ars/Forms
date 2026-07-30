import { useParams, useNavigate } from "react-router-dom";
import { services } from "./servicesConfig";
import { useApp } from "./AppContext.jsx";
import LabeledField from "./LabeledField.jsx";
import SignatureBox from "./SignatureBox.jsx";
import ImageUploader from "./ImageUploader.jsx";
import FollowupTravelSearch from "./FollowupTravelSearch.jsx";
import FollowupWeightLossSearch from "./FollowupWeightLossSearch.jsx";
import "./designSystem.css";
import "./PatientFormPage.css";

export default function PatientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patient, setPatient, branch } = useApp();
  const service = services.find(s => s.id === id);

  if (!service) return <div style={{ padding: 40, textAlign: "center" }}>Service not found</div>;

  const setPatientField = (key, value) =>
    setPatient(prev => ({ ...prev, [key]: value }));

  // 🔹 Services that have a consultation step
  const withConsultation = [
    "travel", "weightloss", "earwax", "covid", "flu",
    "b12", "mmr", "privateprescription",
    "perioddelay", "meningitis", "contraception"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (withConsultation.includes(id)) {
      // 🧭 Patient → Consultation
      navigate(`/service/${id}/consultation`);
    } else {
      // 🧭 Patient → Pharmacist (no consultation)
      navigate(`/service/${id}/pharmacist`);
    }
  };

  // 🔹 Intercept specific services that don't need a normal Patient Form
  if (id === "travelFollowUp") {
    return <FollowupTravelSearch />;
  }
  if (id === "weightlossFollowup") {
    return <FollowupWeightLossSearch />;
  }

  return (
    <div className="patient-form-wrapper">
      <div className="patient-form-header">
        <div className="patient-header-title">
          <h2>🧑‍⚕️ {service.name} – Patient Registration</h2>
          <p>Please complete patient demographics and consent details below.</p>
        </div>
        <span className="cph-badge cph-badge-emerald">
          🏢 {branch?.pharmacyName || "CarePlus Health"}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="patient-form-card">
          <h3>📋 Patient Information</h3>
          <div className="grid grid--2">
            {service.patientFields.map(f => (
              <LabeledField key={f.name} label={f.label} span={f.span}>
                {f.type === "image" ? (
                  <ImageUploader
                    value={patient[f.name] || ""}
                    onChange={v => setPatientField(f.name, v)}
                  />
                ) : f.type === "textarea" ? (
                  <textarea
                    className="cph-textarea"
                    value={patient[f.name] || ""}
                    onChange={e => setPatientField(f.name, e.target.value)}
                    placeholder={f.placeholder || ""}
                  />
                ) : f.type === "select" ? (
                  <select
                    className="cph-select"
                    value={patient[f.name] || ""}
                    onChange={e => setPatientField(f.name, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {f.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="cph-input"
                    type={f.type || "text"}
                    value={patient[f.name] || ""}
                    onChange={e => setPatientField(f.name, e.target.value)}
                    placeholder={f.placeholder || ""}
                    required={f.required}
                  />
                )}
              </LabeledField>
            ))}
          </div>
        </div>

        {/* Patient Signature */}
        <div className="patient-form-card">
          <h3>✍️ Patient Declaration & Signature</h3>
          <div className="grid grid--2 mt items-end">
            <div>
              <div className="cph-field-label">Patient Signature</div>
              <SignatureBox
                value={patient.signaturePatient}
                onChange={v => setPatientField("signaturePatient", v)}
              />
            </div>
            <LabeledField label="Date Signed">
              <input
                type="date"
                className="cph-input"
                value={patient.dateSignedPatient || ""}
                onChange={e => setPatientField("dateSignedPatient", e.target.value)}
              />
            </LabeledField>
          </div>
        </div>

        <div className="patient-actions-bar">
          <button type="submit" className="cph-btn cph-btn-primary" style={{ padding: "12px 28px", fontSize: "1rem" }}>
            Continue to Consultation →
          </button>
        </div>
      </form>
    </div>
  );
}
