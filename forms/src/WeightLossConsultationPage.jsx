import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext";
import "./WeightLossConsultationPage.css";

export default function WeightLossConsultationPage() {
  const navigate = useNavigate();
  const { weightLossConsultation, setWeightLossConsultation } = useApp();
  const [step, setStep] = useState(1);

  // --- Unit selectors ---
  const [heightUnit, setHeightUnit] = useState("feet"); // "feet" | "cm"
  const [weightUnit, setWeightUnit] = useState("stones"); // "stones" | "kg"
  const [waistUnit, setWaistUnit] = useState("cm"); // "cm" | "inch"

  // --- Handlers ---
  const handleChange = useCallback(
    (field, value) => {
      setWeightLossConsultation((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setWeightLossConsultation]
  );

  const handleCheckbox = (field, option, checked) => {
    const current = weightLossConsultation[field] || [];
    const updated = checked
      ? [...current, option]
      : current.filter((o) => o !== option);
    handleChange(field, updated);
  };

  const continueHandler = () => {
    navigate("/service/weightloss/patient");
  };

  // --- BMI calculation ---
  useEffect(() => {
    let heightM = 0;
    let weightKg = 0;

    // Height conversion
    if (heightUnit === "feet") {
      const feet = parseFloat(weightLossConsultation.heightFeet) || 0;
      const inches = parseFloat(weightLossConsultation.heightInches) || 0;
      heightM = (feet * 12 + inches) * 0.0254;
    } else if (heightUnit === "cm") {
      const cm = parseFloat(weightLossConsultation.heightCm) || 0;
      heightM = cm / 100;
    }

    // Weight conversion
    if (weightUnit === "stones") {
      const stones = parseFloat(weightLossConsultation.weightStones) || 0;
      const pounds = parseFloat(weightLossConsultation.weightPounds) || 0;
      weightKg = stones * 6.35029 + pounds * 0.453592;
    } else if (weightUnit === "kg") {
      weightKg = parseFloat(weightLossConsultation.weightKg) || 0;
    }

    if (heightM > 0 && weightKg > 0) {
      const bmiValue = (weightKg / (heightM * heightM)).toFixed(1);
      handleChange("bmi", bmiValue);
    } else {
      handleChange("bmi", "");
    }
  }, [
    weightLossConsultation.heightFeet,
    weightLossConsultation.heightInches,
    weightLossConsultation.heightCm,
    weightLossConsultation.weightStones,
    weightLossConsultation.weightPounds,
    weightLossConsultation.weightKg,
    heightUnit,
    weightUnit,
    handleChange,
  ]);

  const questions = [
    {
      text: "Have you been told that you have dyslipidaemia (high cholesterol)?",
      key: "cholesterol",
      hasDetails: true,
    },
    {
      text: "Have you been told that you suffer from sleep apnoea?",
      key: "sleepApnoea",
      hasDetails: true,
    },
    {
      text: "Are you taking medication for blood pressure?",
      key: "bpMeds",
      hasDetails: true,
    },
    {
      text: "Do you have diabetes?",
      key: "diabetes",
      hasDetails: true,
    },
    {
      text: "Do you have any allergies?",
      key: "allergies",
      hasDetails: true,
    },
    {
      text: "Do you have any eating disorders, or have you had one in the past?",
      key: "eatingDisorder",
      hasDetails: true,
    },
    {
      text: "Have you been told by your doctor that you have an intolerance to lactose?",
      key: "lactoseIntolerance",
      hasDetails: true,
    },
  ];

  return (
    <div className="weight-consultation">
      {step === 1 ? (
        <div className="weight-page">
          <h2 className="weight-page-title">Medical Screening</h2>

          <div className="weight-card">
            {questions.map((q, i) => (
              <div key={q.key} className="weight-question">
                <p className="weight-label">
                  {i + 1}. {q.text}
                </p>
                <div className="weight-radio-group">
                  <label className="weight-radio">
                    <input
                      type="radio"
                      name={q.key}
                      value="Yes"
                      checked={weightLossConsultation[q.key] === "Yes"}
                      onChange={() => handleChange(q.key, "Yes")}
                    />
                    Yes
                  </label>
                  <label className="weight-radio">
                    <input
                      type="radio"
                      name={q.key}
                      value="No"
                      checked={weightLossConsultation[q.key] === "No"}
                      onChange={() => handleChange(q.key, "No")}
                    />
                    No
                  </label>
                </div>

                {q.hasDetails && weightLossConsultation[q.key] === "Yes" && (
                  <div className="weight-form-group">
                    <label className="weight-label">Please provide details</label>
                    <textarea
                      value={weightLossConsultation[`${q.key}Details`] || ""}
                      onChange={(e) =>
                        handleChange(`${q.key}Details`, e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="weight-question">
              <p className="weight-label">
                8. Do you have any of the following liver problems?
              </p>
              <div className="weight-checkboxes">
                {[
                  "Liver impairment (not working properly)",
                  "Cholestasis (problems with bile flow)",
                  "None of the above",
                ].map((opt) => (
                  <label key={opt} className="weight-check">
                    <input
                      type="checkbox"
                      checked={
                        weightLossConsultation.liverProblems?.includes(opt) ||
                        false
                      }
                      onChange={(e) =>
                        handleCheckbox("liverProblems", opt, e.target.checked)
                      }
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="weight-question">
              <p className="weight-label">9. Do you have kidney problems?</p>
              <div className="weight-radio-group">
                <label className="weight-radio">
                  <input
                    type="radio"
                    name="kidney"
                    value="Yes"
                    checked={weightLossConsultation.kidney === "Yes"}
                    onChange={() => handleChange("kidney", "Yes")}
                  />
                  Yes
                </label>
                <label className="weight-radio">
                  <input
                    type="radio"
                    name="kidney"
                    value="No"
                    checked={weightLossConsultation.kidney === "No"}
                    onChange={() => handleChange("kidney", "No")}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="weight-question">
              <p className="weight-label">
                10. Do you have any of the following mental health conditions?
              </p>
              <div className="weight-checkboxes">
                {[
                  "Current or past history of bipolar disorder",
                  "Current or past history of depression",
                  "None of the above",
                ].map((opt) => (
                  <label key={opt} className="weight-check">
                    <input
                      type="checkbox"
                      checked={
                        weightLossConsultation.mentalHealth?.includes(opt) ||
                        false
                      }
                      onChange={(e) =>
                        handleCheckbox("mentalHealth", opt, e.target.checked)
                      }
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="weight-question">
              <p className="weight-label">
                11. Do you have any heart or circulation problems?
              </p>
              <div className="weight-radio-group">
                <label className="weight-radio">
                  <input
                    type="radio"
                    name="heart"
                    value="Yes"
                    checked={weightLossConsultation.heart === "Yes"}
                    onChange={() => handleChange("heart", "Yes")}
                  />
                  Yes
                </label>
                <label className="weight-radio">
                  <input
                    type="radio"
                    name="heart"
                    value="No"
                    checked={weightLossConsultation.heart === "No"}
                    onChange={() => handleChange("heart", "No")}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="weight-actions">
              <button
                className="weight-btn weight-btn--primary"
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="weight-page">
          <h2 className="weight-page-title">Measurements & Questions</h2>

          <div className="weight-card">
            {/* Height Section */}
            <div className="weight-form-group">
              <label className="weight-label">Height</label>
              {heightUnit === "feet" ? (
                <div className="weight-grid-2">
                  <input
                    type="number"
                    placeholder="Feet"
                    value={weightLossConsultation.heightFeet || ""}
                    onChange={(e) => handleChange("heightFeet", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Inches"
                    value={weightLossConsultation.heightInches || ""}
                    onChange={(e) => handleChange("heightInches", e.target.value)}
                  />
                </div>
              ) : (
                <input
                  type="number"
                  placeholder="Height in cm"
                  value={weightLossConsultation.heightCm || ""}
                  onChange={(e) => handleChange("heightCm", e.target.value)}
                />
              )}
              <select
                value={heightUnit}
                onChange={(e) => setHeightUnit(e.target.value)}
              >
                <option value="feet">Feet & Inches</option>
                <option value="cm">Centimeters</option>
              </select>
            </div>

            {/* Weight Section */}
            <div className="weight-form-group">
              <label className="weight-label">Weight</label>
              {weightUnit === "stones" ? (
                <div className="weight-grid-2">
                  <input
                    type="number"
                    placeholder="Stones"
                    value={weightLossConsultation.weightStones || ""}
                    onChange={(e) => handleChange("weightStones", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Pounds"
                    value={weightLossConsultation.weightPounds || ""}
                    onChange={(e) => handleChange("weightPounds", e.target.value)}
                  />
                </div>
              ) : (
                <input
                  type="number"
                  placeholder="Weight in kg"
                  value={weightLossConsultation.weightKg || ""}
                  onChange={(e) => handleChange("weightKg", e.target.value)}
                />
              )}
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value)}
              >
                <option value="stones">Stones & Pounds</option>
                <option value="kg">Kilograms</option>
              </select>
            </div>

            {/* Target Weight Section */}
            <div className="weight-form-group">
              <label className="weight-label">Target Weight</label>
              {weightUnit === "stones" ? (
                <div className="weight-grid-2">
                  <input
                    type="number"
                    placeholder="Target Stones"
                    value={weightLossConsultation.targetWeightStones || ""}
                    onChange={(e) =>
                      handleChange("targetWeightStones", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Target Pounds"
                    value={weightLossConsultation.targetWeightPounds || ""}
                    onChange={(e) =>
                      handleChange("targetWeightPounds", e.target.value)
                    }
                  />
                </div>
              ) : (
                <input
                  type="number"
                  placeholder="Target Weight in kg"
                  value={weightLossConsultation.targetWeightKg || ""}
                  onChange={(e) => handleChange("targetWeightKg", e.target.value)}
                />
              )}
            </div>

            {/* Lifestyle Section */}
            <div className="weight-form-group">
              <label className="weight-label">Lifestyle</label>
              <textarea
                placeholder="Describe your daily lifestyle, diet, and exercise habits"
                value={weightLossConsultation.lifestyle || ""}
                onChange={(e) => handleChange("lifestyle", e.target.value)}
              />
            </div>

            {/* Contraception Checkbox */}
            <div className="weight-form-group">
              <label className="weight-check">
                <input
                  type="checkbox"
                  checked={!!weightLossConsultation.onContraception}
                  onChange={(e) =>
                    handleChange("onContraception", e.target.checked)
                  }
                />
                Currently taking contraception pills
              </label>
            </div>

            {/* Waist Section */}
            <div className="weight-form-group">
              <label className="weight-label">Waist</label>
              <input
                type="number"
                placeholder={
                  waistUnit === "cm" ? "Waist in cm" : "Waist in inches"
                }
                value={weightLossConsultation.waist || ""}
                onChange={(e) => handleChange("waist", e.target.value)}
              />
              <select
                value={waistUnit}
                onChange={(e) => setWaistUnit(e.target.value)}
              >
                <option value="cm">Cm</option>
                <option value="inch">Inches</option>
              </select>
            </div>

            {/* Blood Pressure */}
            <div className="weight-grid-2">
              <div className="weight-form-group">
                <label className="weight-label">
                  Blood Pressure (Systolic)
                </label>
                <input
                  type="number"
                  value={weightLossConsultation.bpSystolic || ""}
                  onChange={(e) => handleChange("bpSystolic", e.target.value)}
                />
              </div>

              <div className="weight-form-group">
                <label className="weight-label">
                  Blood Pressure (Diastolic)
                </label>
                <input
                  type="number"
                  value={weightLossConsultation.bpDiastolic || ""}
                  onChange={(e) => handleChange("bpDiastolic", e.target.value)}
                />
              </div>
            </div>

            {/* BMI */}
            <div className="weight-form-group">
              <label className="weight-label">BMI (calculated)</label>
              <input type="text" value={weightLossConsultation.bmi || "-"} disabled />
            </div>

            <div className="weight-actions between">
              <button className="weight-btn" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="weight-btn weight-btn--primary"
                onClick={continueHandler}
              >
                Continue to Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
