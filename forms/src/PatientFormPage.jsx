import { useParams, useNavigate } from "react-router-dom";
import { services } from "./servicesConfig";
import { useApp } from "./AppContext.jsx";
import LabeledField from "./LabeledField.jsx";
import SignatureBox from "./SignatureBox.jsx";
import ImageUploader from "./ImageUploader.jsx";
import "./PatientFormPage.css";

export default function PatientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patient, setPatient } = useApp();
  const service = services.find(s => s.id === id);

  if (!service) return <div>Service not found</div>;

  const setPatientField = (key, value) =>
    setPatient(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id === "privateprescription") {
      // 🧭 Private Rx: Patient → Consultation
      navigate(`/service/${id}/consultation`);
    } else {
      // 🧭 Others: Patient → Pharmacist
      navigate(`/service/${id}/pharmacist`);
    }
  };

  return (
    <form className="patient-form" onSubmit={handleSubmit}>
      <h2>{service.name} – Patient Form</h2>
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
                className="input textarea"
                value={patient[f.name] || ""}
                onChange={e => setPatientField(f.name, e.target.value)}
                placeholder={f.placeholder || ""}
              />
            ) : f.type === "select" ? (
              <select
                className="input"
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
                className="input"
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

      {/* Patient Signature */}
      <div className="grid grid--2 mt items-end">
        <div>
          <div className="label">Patient Signature</div>
          <SignatureBox
            value={patient.signaturePatient}
            onChange={v => setPatientField("signaturePatient", v)}
          />
        </div>
        <LabeledField label="Date">
          <input
            type="date"
            className="input"
            value={patient.dateSignedPatient || ""}
            onChange={e => setPatientField("dateSignedPatient", e.target.value)}
          />
        </LabeledField>
      </div>

      <button type="submit" className="btn btn--primary" style={{ marginTop: 16 }}>
        Next
      </button>
    </form>
  );
}
