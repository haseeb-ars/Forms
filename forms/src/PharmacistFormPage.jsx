// src/PharmacistFormPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { services } from "./servicesConfig";
import { useApp } from "./AppContext.jsx";
import LabeledField from "./LabeledField.jsx";
import SignatureBox from "./SignatureBox.jsx";
import MedicationRepeater from "./MedicationRepeater.jsx";
import "./designSystem.css";
import "./PharmacistFormPage.css";

export default function PharmacistFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pharm, setPharm, travelFollowUpOriginalData, branch } = useApp();
  const service = services.find((s) => s.id === id);

  if (!service) return <div style={{ padding: 40, textAlign: "center" }}>Service not found</div>;

  const setPharmField = (key, value) =>
    setPharm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // ✅ Always navigate to Preview with autoDownload query
    navigate({
      pathname: `/service/${id}/preview`,
      search: `?autoDownload=true`,
    });
  };

  const malariaFields = service.pharmacistFields.filter((f) => f.name.startsWith("malaria"));

  return (
    <div className="pharmacist-form-wrapper">
      <div className="pharmacist-form-header">
        <div className="pharmacist-header-title">
          <h2>💊 {service.name} – Pharmacist &amp; Supply Details</h2>
          <p>Record prescription details, medication supplies, batch numbers, and signatures.</p>
        </div>
        <span className="cph-badge cph-badge-emerald">
          🏢 {branch?.pharmacyName || "CarePlus Health"}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="pharmacist-form-card">
          <h3>🩺 Pharmacist Assessment &amp; Supply</h3>
          <div className="grid grid--2">
            {service.pharmacistFields
              .filter((f) => !f.name.startsWith("malaria"))
              .map((f) => {

                if (f.type === "followUpVaccineRepeater") {
                  const rxData = travelFollowUpOriginalData?.pharmacist_data || {};
                  const pastVaccines = Array.isArray(rxData.vaccines) ? rxData.vaccines : [];
                  const pastMalaria = Array.isArray(rxData.malariaVaccines) ? rxData.malariaVaccines : [];
                  const uniqueNames = Array.from(new Set([...pastVaccines, ...pastMalaria].map(v => v.name).filter(Boolean)));

                  return (
                    <div
                      key={f.name}
                      className="field-span"
                      style={{ gridColumn: "1 / -1", width: "100%" }}
                    >
                      <MedicationRepeater
                        mode="vaccine"
                        label={f.label || "Follow-Up Doses"}
                        value={pharm[f.name] || []}
                        onChange={(val) => setPharmField(f.name, val)}
                        showBatch
                        showExpiry
                        showDateGiven
                        showQuantity={false}
                        showDosage={false}
                        showStrength={false}
                        showDoseNumber
                        showSite
                        showBrand
                        options={uniqueNames}
                      />
                    </div>
                  );
                }

                if (f.type === "vaccineRepeater") {
                  return (
                    <div
                      key={f.name}
                      className="field-span"
                      style={{ gridColumn: "1 / -1", width: "100%" }}
                    >
                      <MedicationRepeater
                        mode="vaccine"
                        label={f.label || "Vaccines"}
                        value={pharm[f.name] || []}
                        onChange={(val) => setPharmField(f.name, val)}
                        showBatch
                        showExpiry
                        showDateGiven
                        showQuantity
                        showDosage
                        showStrength={false}
                      />
                    </div>
                  );
                }

                if (f.type === "drugRepeater") {
                  return (
                    <div
                      key={f.name}
                      className="field-span"
                      style={{ gridColumn: "1 / -1", width: "100%" }}
                    >
                      <MedicationRepeater
                        mode="drug"
                        label={f.label || "Drugs prescribed"}
                        value={pharm[f.name] || []}
                        onChange={(val) => setPharmField(f.name, val)}
                        showBatch={false}
                        showExpiry={false}
                        showDateGiven
                        showQuantity
                        showDosage
                        showStrength
                      />
                    </div>
                  );
                }

                // Standard inputs
                return (
                  <LabeledField key={f.name} label={f.label} span={f.span}>
                    {f.type === "textarea" ? (
                      <textarea
                        className="cph-textarea"
                        value={pharm[f.name] || ""}
                        onChange={(e) => setPharmField(f.name, e.target.value)}
                        placeholder={f.placeholder || ""}
                      />
                    ) : f.type === "select" ? (
                      <select
                        className="cph-select"
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
                        className="cph-input"
                        type={f.type || "text"}
                        value={pharm[f.name] || ""}
                        onChange={(e) => setPharmField(f.name, e.target.value)}
                        placeholder={f.placeholder || ""}
                        required={f.required}
                      />
                    )}
                  </LabeledField>
                );
              })}
          </div>
        </div>

        {/* 🟩 Malaria Section (if present) */}
        {malariaFields.length > 0 && (
          <div className="pharmacist-form-card malaria-section">
            <h3>🦟 Malaria Prophylaxis &amp; Supply</h3>
            <div className="grid grid--2">
              {malariaFields.map((f) => {
                const shouldShow =
                  !f.showIf || pharm[f.showIf.field] === f.showIf.equals;
                if (!shouldShow) return null;

                if (f.type === "vaccineRepeater") {
                  return (
                    <div key={f.name} className="field-span" style={{ gridColumn: "1 / -1" }}>
                      <h4 style={{ margin: "0 0 8px 0" }}>{f.label}</h4>
                      <MedicationRepeater
                        mode="vaccine"
                        value={pharm[f.name] || []}
                        onChange={(val) => setPharmField(f.name, val)}
                        showBatch
                        showExpiry
                        showDateGiven
                        showQuantity
                        showDosage
                        showStrength={false}
                      />
                    </div>
                  );
                }

                if (f.type === "drugRepeater") {
                  return (
                    <div key={f.name} className="field-span" style={{ gridColumn: "1 / -1" }}>
                      <h4 style={{ margin: "0 0 8px 0" }}>{f.label}</h4>
                      <MedicationRepeater
                        mode="drug"
                        value={pharm[f.name] || []}
                        onChange={(val) => setPharmField(f.name, val)}
                        showBatch={false}
                        showExpiry={false}
                        showDateGiven
                        showQuantity
                        showDosage
                        showStrength
                      />
                    </div>
                  );
                }

                return (
                  <LabeledField key={f.name} label={f.label} span={f.span}>
                    {f.type === "textarea" ? (
                      <textarea
                        className="cph-textarea"
                        value={pharm[f.name] || ""}
                        onChange={(e) => setPharmField(f.name, e.target.value)}
                      />
                    ) : f.type === "select" ? (
                      <select
                        className="cph-select"
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
                        className="cph-input"
                        type={f.type || "text"}
                        value={pharm[f.name] || ""}
                        onChange={(e) => setPharmField(f.name, e.target.value)}
                      />
                    )}
                  </LabeledField>
                );
              })}
            </div>
          </div>
        )}

        {/* 🏢 Prescriber Address Dropdown & Signatures */}
        <div className="pharmacist-form-card">
          <h3>✍️ Signatures &amp; Prescriber Authorization</h3>
          <div className="grid grid--2" style={{ marginBottom: 16 }}>
            <LabeledField label="Prescriber Address">
              <select
                className="cph-select"
                value={pharm.prescriberAddress || ""}
                onChange={(e) => setPharmField("prescriberAddress", e.target.value)}
              >
                <option value="">Select Address...</option>
                <option value="34 Shakespeare St, Southport PR8 5AB">Careplus Chemist (Southport)</option>
                <option value="480 Wilmslow Rd, Withington, Manchester M20 3BG">Wilmslow Road Pharmacy (Manchester)</option>
                <option value="15 Stuart Rd, Waterloo, Liverpool L22 4QR">247 Pharmacy (Liverpool)</option>
              </select>
            </LabeledField>
          </div>

          <div className="grid grid--2 mt items-end" style={{ gap: 20 }}>
            <div>
              <div className="cph-field-label">Pharmacist Signature</div>
              <SignatureBox
                value={pharm.pharmacistSignature}
                onChange={(v) => setPharmField("pharmacistSignature", v)}
              />
            </div>
            <LabeledField label="Date Signed">
              <input
                type="date"
                className="cph-input"
                value={pharm.datePharm || ""}
                onChange={(e) => setPharmField("datePharm", e.target.value)}
              />
            </LabeledField>
          </div>

          <div className="grid grid--2 mt items-end" style={{ marginTop: 20 }}>
            <div>
              <div className="cph-field-label">Prescriber Signature</div>
              <SignatureBox
                value={pharm.prescriberSignature}
                onChange={(v) => setPharmField("prescriberSignature", v)}
              />
            </div>
          </div>
        </div>

        <div className="pharmacist-actions-bar">
          <button
            type="submit"
            className="cph-btn cph-btn-primary"
            style={{ padding: "12px 28px", fontSize: "1rem" }}
          >
            Preview &amp; Generate Documents →
          </button>
        </div>
      </form>
    </div>
  );
}
