import { useNavigate, Link } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import LabeledField from "./LabeledField.jsx";
import SignatureBox from "./SignatureBox.jsx";
import VaccineRepeater from "./VaccineRepeater.jsx"; // ✅ new import
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
        {fields.patient?.map(f => {
          if (f.type === "vaccineRepeater") {
            return (
              <div key={f.name} className="field-span">
                <VaccineRepeater
                  value={patient[f.name] || []}
                  onChange={(val) => setPatientField(f.name, val)}
                />
              </div>
            );
          }

          return (
            <LabeledField key={f.name} label={f.label} span={f.span}>
              {f.type === "textarea" ? (
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
                />
              )}
            </LabeledField>
          );
        })}
      </div>

      {/* Pharmacist Fields */}
      <div className="grid grid--2 service-form__fields">
        {fields.pharmacist?.map(f => {
          if (f.type === "vaccineRepeater") {
            return (
              <div key={f.name} className="field-span">
                <VaccineRepeater
                  value={pharm[f.name] || []}
                  onChange={(val) => setPharmField(f.name, val)}
                />
              </div>
            );
          }

          return (
            <LabeledField key={f.name} label={f.label} span={f.span}>
              {f.type === "textarea" ? (
                <textarea
                  className="input textarea"
                  value={pharm[f.name] || ""}
                  onChange={e => setPharmField(f.name, e.target.value)}
                  placeholder={f.placeholder || ""}
                />
              ) : f.type === "select" ? (
                <select
                  className="input"
                  value={pharm[f.name] || ""}
                  onChange={e => setPharmField(f.name, e.target.value)}
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
                  value={pharm[f.name] || ""}
                  onChange={e => setPharmField(f.name, e.target.value)}
                  placeholder={f.placeholder || ""}
                />
              )}
            </LabeledField>
          );
        })}
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

      {/* Prescriber Signature */}
      {fields.signatures?.prescriber && (
        <div className="grid grid--2 mt items-end service-form__signature">
          <div>
            <div className="label">Prescriber Signature</div>
            <SignatureBox
              value={pharm.prescriberSignature}
              onChange={v => setPharmField("prescriberSignature", v)}
            />
          </div>
          <LabeledField label="Date">
            <input
              type="date"
              className="input"
              value={pharm.datePrescriber || ""}
              onChange={e => setPharmField("datePrescriber", e.target.value)}
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
