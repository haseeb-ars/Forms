import React from "react";
import "./LabeledField.css";

export default function LabeledField({ label, children, span }) {
  return (
    <label className={`lf ${span ? "lf--span" : ""}`}>
      <div className="lf__label">{label}</div>
      {children}
    </label>
  );
}

