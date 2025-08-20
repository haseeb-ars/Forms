import { useNavigate, Link } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import LabeledField from "./LabeledField.jsx";
import SignatureBox from "./SignatureBox.jsx";
import "./ServiceForm.css";

export default function ServiceForm({ serviceKey, fields, nextPath }) {
  const { patient, setPatient, pharm, setPharm } = useApp();
  const nav = useNavigate();

  const setPatientField = (key, value) =>
    setPatient(prev => ({ ...prev, [key]: value }));

  const setPharmField = (key, value) =>
    setPharm(prev => ({ ...prev, [key]: value }));

  return (
    <section className="card service-form">
      <h2 className="page__title">{fields.title || "Service Form"}</h2>

      {/* Patient Fields */}
      <div className="grid grid--2 service-form__fields">
        {fields.patient?.map(f => (
          <LabeledField key={f.key} label={f.label} span={f.span}>
            {f.type === "textarea" ? (
              <textarea
                className="input textarea"
                value={patient[f.key] || ""}
                onChange={e => setPatientField(f.key, e.target.value)}
                placeholder={f.placeholder || ""}
              />
            ) : f.type === "select" ? (
              <select
                className="input"
                value={patient[f.key] || ""}
                onChange={e => setPatientField(f.key, e.target.value)}
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
                value={patient[f.key] || ""}
                onChange={e => setPatientField(f.key, e.target.value)}
                placeholder={f.placeholder || ""}
              />
            )}
          </LabeledField>
        ))}
      </div>

      {/* Patient Signature */}
      {fields.signatures?.patient && (
        <div className="grid grid--2 mt items-end service-form__signature">
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
      )}

      {/* Pharmacist Signature */}
      {fields.signatures?.pharmacist && (
        <div className="grid grid--2 mt items-end service-form__signature">
          <div>
            <div className="label">Pharmacist Signature</div>
            <SignatureBox
              value={pharm.pharmacistSignature}
              onChange={v => setPharmField("pharmacistSignature", v)}
            />
          </div>
          <LabeledField label="Date">
            <input
              type="date"
              className="input"
              value={pharm.datePharm || ""}
              onChange={e => setPharmField("datePharm", e.target.value)}
            />
          </LabeledField>
        </div>
      )}

      {/* Actions */}
      <div className="page__actions">
        <Link to="/" className="btn">Home</Link>
        {nextPath && (
          <button className="btn btn--primary" onClick={() => nav(nextPath)}>
            Next
          </button>
        )}
      </div>
    </section>
  );
}
