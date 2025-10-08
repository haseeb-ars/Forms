import React, { useState, useEffect } from "react";
import "./VaccineRepeater.css";

const VaccineRepeater = ({ value = [], onChange }) => {
  const [rows, setRows] = useState(
    value.length ? value : [{ vaccine: "", batch: "", dateGiven: "", expiry: "" }]
  );

  useEffect(() => {
    onChange(rows);
  }, [rows, onChange]);

  const handleChange = (index, field, val) => {
    const updated = [...rows];
    updated[index][field] = val;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { vaccine: "", batch: "", dateGiven: "", expiry: "" }]);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  return (
    <div className="vaccine-repeater">
      <label className="repeater-title">Vaccinations Administered</label>

      {rows.map((row, i) => (
        <div key={i} className="vaccine-row">
          <div className="field">
            <label>Vaccine</label>
            <input
              type="text"
              placeholder="e.g. Hepatitis A"
              value={row.vaccine}
              onChange={(e) => handleChange(i, "vaccine", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Batch No</label>
            <input
              type="text"
              placeholder="Batch No"
              value={row.batch}
              onChange={(e) => handleChange(i, "batch", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Date Given</label>
            <input
              type="date"
              value={row.dateGiven}
              onChange={(e) => handleChange(i, "dateGiven", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Expiry</label>
            <input
              type="date"
              value={row.expiry}
              onChange={(e) => handleChange(i, "expiry", e.target.value)}
            />
          </div>

          <div className="remove-container">
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={addRow} className="add-btn">
        + Add Another Vaccine
      </button>
    </div>
  );
};

export default VaccineRepeater;
