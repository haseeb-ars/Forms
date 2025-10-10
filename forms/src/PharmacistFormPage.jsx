import { useParams, useNavigate } from "react-router-dom";
import { services } from "./servicesConfig";
import { useApp } from "./AppContext.jsx";
import LabeledField from "./LabeledField.jsx";
import SignatureBox from "./SignatureBox.jsx";
import VaccineRepeater from "./VaccineRepeater.jsx";
import "./PharmacistFormPage.css";

export default function PharmacistFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pharm, setPharm } = useApp();
  const service = services.find((s) => s.id === id);

  if (!service) return <div>Service not found</div>;

  const setPharmField = (key, value) =>
    setPharm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🧩 Ensure pharmacist form data is stored and trigger auto download flag
    navigate(`/service/${id}/preview?autoDownload=true`);
  };

  return (
    <form className="pharmacist-form" onSubmit={handleSubmit}>
      <h2>{service.name} – Pharmacist Form</h2>

      {/* Regular pharmacist fields */}
      <div className="grid grid--2">
        {service.pharmacistFields
          .filter((f) => !f.name.startsWith("malaria"))
          .map((f) => {
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
                    onChange={(e) => setPharmField(f.name, e.target.value)}
                  />
                ) : f.type === "select" ? (
                  <select
                    className="input"
                    value={pharm[f.name] || ""}
                    onChange={(e) => setPharmField(f.name, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {f.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="input"
                    type={f.type || "text"}
                    value={pharm[f.name] || ""}
                    onChange={(e) => setPharmField(f.name, e.target.value)}
                  />
                )}
              </LabeledField>
            );
          })}
      </div>

      {/* 🟩 Malaria Section */}
      <div className="malaria-section">
        {service.pharmacistFields
          .filter((f) => f.name.startsWith("malaria"))
          .map((f) => {
            const shouldShow =
              !f.showIf || pharm[f.showIf.field] === f.showIf.equals;

            if (!shouldShow) return null;

            if (f.type === "vaccineRepeater") {
              return (
                <div key={f.name} className="field-span">
                  <h3>{f.label}</h3>
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
                    onChange={(e) => setPharmField(f.name, e.target.value)}
                  />
                ) : f.type === "select" ? (
                  <select
                    className="input"
                    value={pharm[f.name] || ""}
                    onChange={(e) => setPharmField(f.name, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {f.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="input"
                    type={f.type || "text"}
                    value={pharm[f.name] || ""}
                    onChange={(e) => setPharmField(f.name, e.target.value)}
                  />
                )}
              </LabeledField>
            );
          })}
      </div>

      {/* Pharmacist Signature */}
      <div className="grid grid--2 mt items-end">
        <div>
          <div className="label">Pharmacist Signature</div>
          <SignatureBox
            value={pharm.pharmacistSignature}
            onChange={(v) => setPharmField("pharmacistSignature", v)}
          />
        </div>
        <LabeledField label="Date">
          <input
            type="date"
            className="input"
            value={pharm.datePharm || ""}
            onChange={(e) => setPharmField("datePharm", e.target.value)}
          />
        </LabeledField>
      </div>

      {/* Prescriber Signature */}
      <div className="grid grid--2 mt items-end">
        <div>
          <div className="label">Prescriber Signature</div>
          <SignatureBox
            value={pharm.prescriberSignature}
            onChange={(v) => setPharmField("prescriberSignature", v)}
          />
        </div>
      </div>

      {/* ✅ Updated Preview Button */}
      <button
        type="submit"
        className="btn btn--primary"
        style={{ marginTop: 16 }}
      >
        Preview & Download
      </button>
    </form>
  );
}
