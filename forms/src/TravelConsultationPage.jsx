// src/TravelConsultationPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useApp } from "./AppContext";
import risksData from "./cdc_travel_risks_clean.json";
import vaccineInfo from "./vaccineInfo"; // ✅ new import
import "./TravelConsultationPage.css";
import CountryPreviewGrid from "./CountryPreviewGrid";
import countryIdMap from "./countryIdMap.js"; // ✅ new import

const LIVE_VACCINES = new Set([
  "Yellow Fever",
  "MMR",
  "Varicella",
  "Typhoid (Oral)",
  "Cholera (Oral)",
]);

export default function TravelConsultationPage({ onContinue }) {
  const navigate = useNavigate();
  const { travelConsultation, setTravelConsultation } = useApp();
  const [step, setStep] = useState(1);
  const [expandedVaccine, setExpandedVaccine] = useState(null); // ✅ Track which vaccine info is open

  const toggleVaccineInfo = (name) => {
    setExpandedVaccine(expandedVaccine === name ? null : name);
  };

  const countryOptions = Object.keys(risksData).map((c) => ({
    value: c,
    label: c,
  }));

  const handleChange = (field, value) => {
    setTravelConsultation((prev) => ({ ...prev, [field]: value }));
  };

  // ---------- derive risks & categories whenever inputs change ----------
  useEffect(() => {
    const countries = travelConsultation.countries || [];
    const eggAllergy = travelConsultation.eggAllergy;
    const pregnant = travelConsultation.pregnant;
    const immunosuppressed = travelConsultation.immunosuppressed;

    if (!countries.length) {
      setTravelConsultation((prev) => ({
        ...prev,
        recommendedVaccines: [],
        cautionVaccines: [],
        contraindicatedVaccines: [],
        malariaRisks: [],
        otherRisks: [],
      }));
      return;
    }

    const vaccines = new Set();
    const malaria = new Set();
    const otherRisks = new Set();

    countries.forEach((c) => {
      const row = risksData[c];
      if (!row) return;
      (row.vaccines || []).forEach((v) => vaccines.add(v));
      (row.malaria || []).forEach((m) => malaria.add(m));
      (row.other_risks || []).forEach((r) => otherRisks.add(r));
    });

    const recommended = new Set(vaccines);
    const caution = new Set();
    const contraindicated = new Set();

    if (pregnant || immunosuppressed) {
      Array.from(recommended).forEach((v) => {
        if (LIVE_VACCINES.has(v)) {
          contraindicated.add(v);
          recommended.delete(v);
        }
      });
    }

    if (eggAllergy) {
      if (recommended.has("Yellow Fever")) caution.add("Yellow Fever");
      if (recommended.has("Influenza")) caution.add("Influenza");
    }

    setTravelConsultation((prev) => ({
      ...prev,
      recommendedVaccines: Array.from(recommended).sort(),
      cautionVaccines: Array.from(caution).sort(),
      contraindicatedVaccines: Array.from(contraindicated).sort(),
      malariaRisks: Array.from(malaria).sort(),
      otherRisks: Array.from(otherRisks).sort(),
    }));
  }, [
    travelConsultation.countries,
    travelConsultation.eggAllergy,
    travelConsultation.pregnant,
    travelConsultation.immunosuppressed,
    setTravelConsultation,
  ]);

  // ------------------- Step 2: Medical Questions -------------------
  const questions = [
    {
      type: "multi",
      label: "Indicate if you have any of the following. Tick all that apply",
      options: [
        "Diabetes",
        "Asthma",
        "High blood pressure",
        "Cerebral disorder (e.g. epilepsy, stroke)",
        "Kidney problems",
        "Liver problems",
        "Sickle cell",
        "Porphyria",
        "Phenylketonuria",
        "Myasthenia gravis",
        "Thymus dysfunction",
        "Inflammatory bowel disease",
        "Other ongoing medical condition(s)",
        "No ongoing medical conditions",
      ],
    },
    {
      type: "yesno",
      label: "Are you currently taking any medication (over the counter or prescription)?",
      hasDetails: true,
    },
    {
      type: "yesno",
      label:
        "Are you taking any regular medication which thins your blood or prevents clotting (excluding aspirin 75mg)?",
      hasDetails: true,
    },
    { type: "yesno", label: "Do you have a bleeding disorder, including taking anticoagulants?", hasDetails: true },
    { type: "yesno", label: "Have you had a high fever or temperature in the last 24 hours?" },
    { type: "yesno", label: "Would you prefer to have an oral vaccination instead of an injection where available?" },
    {
      type: "yesno",
      label:
        "Have you been told by your doctor you have an intolerance to any sugars (e.g. galactose intolerance, Lapp lactase deficiency or glucose-galactose malabsorption)?",
      hasDetails: true,
    },
    {
      type: "yesno",
      label:
        "Have you ever suffered/do you currently suffer from depression, anxiety, panic attacks or any other psychiatric problems? Please answer yes even if the episode was mild or an isolated case.",
    },
    {
      type: "multi",
      label: "Confirm if you have received any of the following treatments. Tick all that apply.",
      options: [
        "Oral or parenteral antibiotics within the last 14 days",
        "Live vaccines in the last 4 weeks",
        "Operation in the last six months",
        "None of the above",
      ],
    },
    {
      type: "multi",
      label: "Indicate if you are suffering from any of the following gastrointestinal problems. Tick all that apply.",
      options: [
        "Constipation, abdominal pain, vomiting or any other digestive problems",
        "Diarrhoea after taking an antibiotic medicine",
        "None of the above",
      ],
    },
    {
      type: "yesno",
      label: "Have you received any blood products such as antibodies (immunoglobulins) in the last 3 months?",
      hasDetails: true,
    },
    {
      type: "yesno",
      label:
        "Do you have, or have you ever been diagnosed with, any neurological disorders (e.g. epilepsy, stroke, multiple sclerosis, Parkinson’s disease, or other nervous system conditions)?",
      hasDetails: true,
    },
    {
      type: "yesno",
      label: "Are there any other health/medical details you feel we should know?",
      hasDetails: true,
    },
  ];

  const handleAnswer = (label, value) => {
    setTravelConsultation((prev) => {
      const updated = {
        ...prev,
        medical: { ...(prev.medical || {}), [label]: value },
      };
      if (value === "No") delete updated.medical?.[`${label} details`];
      return updated;
    });
  };

  const toggleMulti = (label, option, checked) => {
    const current = travelConsultation.medical?.[label] || [];
    const next = checked
      ? Array.from(new Set([...current, option]))
      : current.filter((x) => x !== option);
    handleAnswer(label, next);
  };

  const continueHandler = () => {
    if (onContinue) onContinue();
    else navigate("/service/travel/patient");
  };

  // ---------------------- Vaccine List Renderer ----------------------
  const renderVaccineList = (vaccines) => (
    <ul className="bullets clickable">
      {vaccines.map((v) => (
        <li key={v}>
          <button
            type="button"
            className="vaccine-link"
            onClick={() => toggleVaccineInfo(v)}
          >
            {v}
          </button>
          {expandedVaccine === v && vaccineInfo[v + " vaccination"] && (
            <div className="vaccine-info">
              {Object.entries(vaccineInfo[v + " vaccination"]).map(([key, val]) => (
                <p key={key}>
                  <strong>{key}:</strong> {val}
                </p>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  // ---------------------- Render ----------------------
  return (
    <div className="consultation1">
      {step === 1 ? (
        <div className="page1">
          <h2 className="page-title1">Travel Vaccination Consultation</h2>

          <div className="card1">
            <div className="form-group1">
              <label className="label1">Destination countries</label>
              <Select
                isMulti
                options={countryOptions}
                value={(travelConsultation.countries || []).map((c) => ({
                  value: c,
                  label: c,
                }))}
                onChange={(vals) => handleChange("countries", vals.map((v) => v.value))}
                className="react-select"
              />
            </div>

            <CountryPreviewGrid
              countries={travelConsultation.countries || []}
              countryIdMap={countryIdMap}
            />

            <div className="form-row1">
              <div className="form-group1">
                <label className="label1">Departure date</label>
                <input
                  type="date"
                  value={travelConsultation.departureDate || ""}
                  onChange={(e) => handleChange("departureDate", e.target.value)}
                />
              </div>
              <div className="form-group1">
                <label className="label1">Return date</label>
                <input
                  type="date"
                  value={travelConsultation.returnDate || ""}
                  onChange={(e) => handleChange("returnDate", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group1">
              <label className="label1">Reason for travel</label>
              <select
                value={travelConsultation.reason || ""}
                onChange={(e) => handleChange("reason", e.target.value)}
              >
                <option value="">Select reason</option>
                <option value="Holiday">Holiday</option>
                <option value="Work">Work</option>
                <option value="Visiting family">Visiting family</option>
                <option value="Pilgrimage">Pilgrimage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* allergy/pregnancy/immunosuppression */}
            <div className="form-row1 checkboxes1">
              <label className="check1">
                <input
                  type="checkbox"
                  checked={!!travelConsultation.eggAllergy}
                  onChange={(e) => handleChange("eggAllergy", e.target.checked)}
                />
                Egg allergy
              </label>
              <label className="check1">
                <input
                  type="checkbox"
                  checked={!!travelConsultation.pregnant}
                  onChange={(e) => handleChange("pregnant", e.target.checked)}
                />
                Pregnant
              </label>
              <label className="check1">
                <input
                  type="checkbox"
                  checked={!!travelConsultation.immunosuppressed}
                  onChange={(e) => handleChange("immunosuppressed", e.target.checked)}
                />
                Immunosuppressed
              </label>
            </div>

            {/* ✅ Vaccines Section with Clickable Info */}
            <div className="cards-31">
              <div className="card1">
                <h3 className="card-title1">💉 Recommended Vaccines</h3>
                {travelConsultation.recommendedVaccines?.length
                  ? renderVaccineList(travelConsultation.recommendedVaccines)
                  : <p className="muted1">Select at least one country.</p>}
              </div>

              <div className="card1">
                <h3 className="card-title1">⚠️ Caution</h3>
                {travelConsultation.cautionVaccines?.length
                  ? renderVaccineList(travelConsultation.cautionVaccines)
                  : <p className="muted1">No cautions based on current answers.</p>}
              </div>

              <div className="card1">
                <h3 className="card-title1">⛔ Contraindicated</h3>
                {travelConsultation.contraindicatedVaccines?.length
                  ? renderVaccineList(travelConsultation.contraindicatedVaccines)
                  : <p className="muted1">None identified.</p>}
              </div>
            </div>

            {(travelConsultation.malariaRisks?.length ||
              travelConsultation.otherRisks?.length) && (
              <div className="card1">
                <h3 className="card-title1">🌡 Other Risks</h3>
                <div className="two-col1">
                  {travelConsultation.malariaRisks?.length ? (
                    <div>
                      <h4 className="sub1">Malaria</h4>
                      <ul className="bullets1">
                        {travelConsultation.malariaRisks.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {travelConsultation.otherRisks?.length ? (
                    <div>
                      <h4 className="sub1">General</h4>
                      <ul className="bullets1">
                        {travelConsultation.otherRisks.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div className="actions1">
              <button className="btn1 btn--primary1" onClick={() => setStep(2)}>
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        // ✅ Step 2 - Medical Questions restored
        <div className="page1">
          <h2 className="page-title1">Medical Questions</h2>

          {questions.map((q) => (
            <div key={q.label} className="form-card1">
              <p className="q-title1">{q.label}</p>

              {q.type === "multi" ? (
                <div className="grid-21">
                  {q.options.map((opt) => {
                    const checked =
                      (travelConsultation.medical?.[q.label] || []).includes(opt);
                    return (
                      <label key={opt} className="check1">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggleMulti(q.label, opt, e.target.checked)}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="yesno1">
                  <label className="radio1">
                    <input
                      type="radio"
                      name={q.label}
                      value="Yes"
                      checked={travelConsultation.medical?.[q.label] === "Yes"}
                      onChange={() => handleAnswer(q.label, "Yes")}
                    />
                    Yes
                  </label>
                  <label className="radio1">
                    <input
                      type="radio"
                      name={q.label}
                      value="No"
                      checked={travelConsultation.medical?.[q.label] === "No"}
                      onChange={() => handleAnswer(q.label, "No")}
                    />
                    No
                  </label>
                </div>
              )}

              {q.hasDetails &&
                travelConsultation.medical?.[q.label] === "Yes" && (
                  <div className="form-group1">
                    <label className="label1">Please provide details</label>
                    <textarea
                      value={
                        travelConsultation.medical?.[`${q.label} details`] || ""
                      }
                      onChange={(e) =>
                        handleAnswer(`${q.label} details`, e.target.value)
                      }
                    />
                  </div>
                )}
            </div>
          ))}

          <div className="actions between1">
            <button className="btn1" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn1 btn--primary1" onClick={continueHandler}>
              Continue to Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
