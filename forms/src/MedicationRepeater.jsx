// src/MedicationRepeater.jsx
import React from "react";
import "./PharmacistFormPage.css"; // re-use your existing styles

const blankItem = (mode) => ({
  name: "",
  brand: "",
  indication: "",
  batchNumber: "",
  expiry: "",
  dateGiven: "",
  quantity: "",
  dosage: "",
  strength: "",
  _mode: mode || "vaccine",
});

export default function MedicationRepeater({
  value = [],
  onChange,
  mode = "vaccine", // "vaccine" | "drug"
  label = "Drugs prescribed",
  // visibility toggles (override defaults per mode)
  showBatch = mode === "vaccine",
  showExpiry = mode === "vaccine",
  showDateGiven = true,
  showStrength = mode === "drug",
  showQuantity = true,
  showDosage = true,
  showBrand = mode === "vaccine",
  showIndication = mode === "vaccine",
  // optional placeholders
  placeholders = {},
}) {
  const items = Array.isArray(value) ? value : [];

  const update = (idx, patch) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange?.(next);
  };

  const add = () => onChange?.([...items, blankItem(mode)]);
  const remove = (idx) => onChange?.(items.filter((_, i) => i !== idx));

  return (
    <div className="repeater">
      <h3 className="section-title">{label}</h3>

      {items.map((it, idx) => (
        <div key={idx} className="repeater-row">
          {/* Drug/Vaccine name */}
          <div className="field">
            <div className="label">Drug/Vaccine</div>
            <input
              className="input"
              value={it.name || ""}
              onChange={(e) => update(idx, { name: e.target.value })}
              placeholder={
                placeholders.name ||
                (mode === "vaccine" ? "e.g. MMR" : "e.g. Amoxicillin")
              }
            />
          </div>

          {/* Brand name (vaccines typically have a brand) */}
          {showBrand && (
            <div className="field">
              <div className="label">Brand Name</div>
              <input
                className="input"
                value={it.brand || ""}
                onChange={(e) => update(idx, { brand: e.target.value })}
                placeholder={
                  placeholders.brand ||
                  (mode === "vaccine" ? "e.g. Pfizer Comirnaty" : "Brand (optional)")
                }
              />
            </div>
          )}

          {/* Batch No (vaccines only by default) */}
          {showBatch && (
            <div className="field">
              <div className="label">Batch No</div>
              <input
                className="input"
                value={it.batchNumber || ""}
                onChange={(e) => update(idx, { batchNumber: e.target.value })}
                placeholder={placeholders.batchNumber || "Batch No"}
              />
            </div>
          )}

          {/* Expiry (vaccines only by default) */}
          {showExpiry && (
            <div className="field">
              <div className="label">Expiry</div>
              <input
                className="input"
                type="date"
                value={it.expiry || ""}
                onChange={(e) => update(idx, { expiry: e.target.value })}
              />
            </div>
          )}

          {/* Date Given */}
          {showDateGiven && (
            <div className="field">
              <div className="label">Date Given</div>
              <input
                className="input"
                type="date"
                value={it.dateGiven || ""}
                onChange={(e) => update(idx, { dateGiven: e.target.value })}
              />
            </div>
          )}

          {/* Strength (drugs) */}
          {showStrength && (
            <div className="field">
              <div className="label">Strength</div>
              <input
                className="input"
                value={it.strength || ""}
                onChange={(e) => update(idx, { strength: e.target.value })}
                placeholder={placeholders.strength || "e.g. 500mg"}
              />
            </div>
          )}

          {/* Quantity */}
          {showQuantity && (
            <div className="field">
              <div className="label">Quantity</div>
              <input
                className="input"
                type="number"
                min="0"
                value={it.quantity || ""}
                onChange={(e) => update(idx, { quantity: e.target.value })}
              />
            </div>
          )}

          {/* Dosage */}
          {showDosage && (
            <div className="field">
              <div className="label">Dosage</div>
              <input
                className="input"
                value={it.dosage || ""}
                onChange={(e) => update(idx, { dosage: e.target.value })}
                placeholder={
                  placeholders.dosage ||
                  (mode === "vaccine"
                    ? "e.g. 0.5ml IM"
                    : "e.g. 1 cap TDS 5 days")
                }
              />
            </div>
          )}

          {/* Indication / What it's treating (especially useful for vaccines) */}
          {showIndication && (
            <div className="field">
              <div className="label">Indication / What it is treating</div>
              <input
                className="input"
                value={it.indication || ""}
                onChange={(e) => update(idx, { indication: e.target.value })}
                placeholder={
                  placeholders.indication ||
                  "e.g. Flu prevention, Travel to India – Typhoid"
                }
              />
            </div>
          )}

          <button
            type="button"
            className="link danger"
            onClick={() => remove(idx)}
          >
            Remove
          </button>
        </div>
      ))}

      <button type="button" className="btn btn--primary" onClick={add}>
        + Add Another {mode === "vaccine" ? "Vaccine" : "Drug"}
      </button>
    </div>
  );
}
