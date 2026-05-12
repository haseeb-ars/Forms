// src/ContraceptionConsultationPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext";
import "./ContraceptionConsultationPage.css";

export default function ContraceptionConsultationPage() {
  const navigate = useNavigate();
  const { setContraceptionConsultation } = useApp();

  const [form, setForm] = useState({
    pillStatus: "",
    currentPill: "",
    pillIssues: "",
    issuesDetails: "",
    otherMedications: "",
    medicationDetails: "",
    bpChecked: "",
    bpReading: "",
    height: "",
    weight: "",
    medicalConditions: "",
    medicalConditionDetails: "",
    familyHistory: "",
    familyHistoryDetails: "",
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setContraceptionConsultation(form);
    navigate("/service/contraception/pharmacist");
  };

  return (
    <form className="contraception-consultation" onSubmit={handleSubmit}>
      <h1 className="consultation-title">Contraception Consultation</h1>

      {/* Q1 – Pill status */}
      <div className="question-card">
        <label className="question-text">
          1. Are you starting a new contraceptive pill, restarting a previous
          one, or continuing your current pill?
        </label>
        <div className="radio-group">
          {["New", "Restarting", "Continuing"].map((opt) => (
            <label key={opt} className="radio-option">
              <input
                type="radio"
                name="pillStatus"
                value={opt}
                checked={form.pillStatus === opt}
                onChange={() => set("pillStatus", opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Q2 – Current/previous pill */}
      <div className="question-card">
        <label className="question-text">
          2. What contraceptive pill are you currently taking or previously took?
        </label>
        <input
          className="input"
          type="text"
          value={form.currentPill}
          onChange={(e) => set("currentPill", e.target.value)}
          placeholder="Enter pill name..."
        />
      </div>

      {/* Q3 – Pill issues */}
      <div className="question-card">
        <label className="question-text">
          3. Have you had any issues with your pill, including missed pills,
          side effects, allergies, or wanting to change pill type?
        </label>
        <div className="radio-group">
          {["Yes", "No"].map((opt) => (
            <label key={opt} className="radio-option">
              <input
                type="radio"
                name="pillIssues"
                value={opt}
                checked={form.pillIssues === opt}
                onChange={() => set("pillIssues", opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {form.pillIssues === "Yes" && (
          <textarea
            className="input textarea extra-info"
            value={form.issuesDetails}
            onChange={(e) => set("issuesDetails", e.target.value)}
            placeholder="Please provide details"
          />
        )}
      </div>

      {/* Q4 – Other medications */}
      <div className="question-card">
        <label className="question-text">
          4. Are you taking any other medications, herbal products, or
          supplements?
        </label>
        <div className="radio-group">
          {["Yes", "No"].map((opt) => (
            <label key={opt} className="radio-option">
              <input
                type="radio"
                name="otherMedications"
                value={opt}
                checked={form.otherMedications === opt}
                onChange={() => set("otherMedications", opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {form.otherMedications === "Yes" && (
          <textarea
            className="input textarea extra-info"
            value={form.medicationDetails}
            onChange={(e) => set("medicationDetails", e.target.value)}
            placeholder="Medication details"
          />
        )}
      </div>

      {/* Q5 – Blood pressure, height, weight */}
      <div className="question-card">
        <label className="question-text">
          5. Have you had a recent blood pressure check, and can you provide
          your blood pressure, height, and weight?
        </label>

        <div className="bp-group">
          <div className="bp-field">
            <label className="bp-label">
              Blood pressure checked in last 3 months?
            </label>
            <div className="radio-group">
              {["Yes", "No"].map((opt) => (
                <label key={opt} className="radio-option">
                  <input
                    type="radio"
                    name="bpChecked"
                    value={opt}
                    checked={form.bpChecked === opt}
                    onChange={() => set("bpChecked", opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bp-inputs">
            <div className="bp-field">
              <label className="bp-label">Blood Pressure Reading</label>
              <input
                className="input"
                type="text"
                value={form.bpReading}
                onChange={(e) => set("bpReading", e.target.value)}
                placeholder="e.g. 120/80"
              />
            </div>
            <div className="bp-field">
              <label className="bp-label">Height (cm)</label>
              <input
                className="input"
                type="text"
                value={form.height}
                onChange={(e) => set("height", e.target.value)}
                placeholder="e.g. 165"
              />
            </div>
            <div className="bp-field">
              <label className="bp-label">Weight (kg)</label>
              <input
                className="input"
                type="text"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                placeholder="e.g. 65"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Q6 – Medical conditions */}
      <div className="question-card">
        <label className="question-text">
          6. Do you smoke/vape, have migraines with aura, diabetes, liver
          disease, blood clots, heart disease, cancer, or any major medical
          conditions?
        </label>
        <div className="radio-group">
          {["Yes", "No"].map((opt) => (
            <label key={opt} className="radio-option">
              <input
                type="radio"
                name="medicalConditions"
                value={opt}
                checked={form.medicalConditions === opt}
                onChange={() => set("medicalConditions", opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {form.medicalConditions === "Yes" && (
          <textarea
            className="input textarea extra-info"
            value={form.medicalConditionDetails}
            onChange={(e) => set("medicalConditionDetails", e.target.value)}
            placeholder="Medical condition details"
          />
        )}
      </div>

      {/* Q7 – Family history / pregnancy / surgery */}
      <div className="question-card">
        <label className="question-text">
          7. Are you pregnant, planning major surgery, or do you have any
          significant family history of blood clots, stroke, or breast cancer
          under age 50?
        </label>
        <div className="radio-group">
          {["Yes", "No"].map((opt) => (
            <label key={opt} className="radio-option">
              <input
                type="radio"
                name="familyHistory"
                value={opt}
                checked={form.familyHistory === opt}
                onChange={() => set("familyHistory", opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {form.familyHistory === "Yes" && (
          <textarea
            className="input textarea extra-info"
            value={form.familyHistoryDetails}
            onChange={(e) => set("familyHistoryDetails", e.target.value)}
            placeholder="Please provide details"
          />
        )}
      </div>

      <button type="submit" className="btn btn--primary continue-btn">
        Continue to Pharmacist Form
      </button>
    </form>
  );
}
