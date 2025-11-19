import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { consultationQuestions } from "./consultationQuestions";
import { useApp } from "./AppContext";
import "./ConsultationPage.css";

export default function ConsultationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    setEarwaxConsultation,
    setCovidConsultation,
    setB12Consultation,
    setFluConsultation,
    setPrivatePrescriptionConsultation,
    setWeightLossFollowupConsultation,
  } = useApp();

  const [answers, setAnswers] = useState({});
  const questions = consultationQuestions[id] || [];

  // ✅ Update answers safely
  const handleChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleExtraChange = (qid, text) => {
    setAnswers((prev) => ({ ...prev, [`${qid}_extra`]: text }));
  };

  // ✅ Save to context depending on service type
  const handleSubmit = (e) => {
    e.preventDefault();

    switch (id) {
      case "earwax":
        setEarwaxConsultation(answers);
        break;
      case "covid":
        setCovidConsultation(answers);
        break;
      case "b12":
        setB12Consultation(answers);
        break;
      case "flu":
        setFluConsultation(answers);
        break;
      case "privateprescription":
        setPrivatePrescriptionConsultation(answers);
        break;
        case "weightlossFollowup":
        setWeightLossFollowupConsultation(answers);
        break;
      default:
        break;
    }

    // ✅ Navigation logic
    if (id === "privateprescription") {
      // 🟩 Go to pharmacist form next
      navigate(`/service/${id}/pharmacist`);
    } else {
      // 🟦 All other services go back to patient form as usual
      navigate(`/service/${id}/patient`);
    }
  };

  return (
    <form className="consultation-form" onSubmit={handleSubmit}>
      <h1 className="consultation-title">{id.toUpperCase()} Consultation</h1>

      {questions.map((q) => (
        <div key={q.id} className="question-card">
          <label className="question-text">{q.text}</label>

          {/* ✅ Yes/No Questions */}
          {q.type === "yesno" ? (
            <>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name={q.id}
                    value="Yes"
                    checked={answers[q.id] === "Yes"}
                    onChange={() => handleChange(q.id, "Yes")}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name={q.id}
                    value="No"
                    checked={answers[q.id] === "No"}
                    onChange={() => handleChange(q.id, "No")}
                  />
                  <span>No</span>
                </label>
              </div>

              {/* 🟦 Show extra textbox if answered Yes */}
              {answers[q.id] === "Yes" && (
                <textarea
                  className="input textarea extra-info"
                  value={answers[`${q.id}_extra`] || ""}
                  onChange={(e) => handleExtraChange(q.id, e.target.value)}
                  placeholder="Please provide more information..."
                />
              )}
            </>
          ) : q.type === "checkbox" ? (
            <>
              <div className="checkbox-group">
                {q.options.map((option) => (
                  <label key={option} className="checkbox-option">
                    <input
                      type="checkbox"
                      name={q.id}
                      value={option}
                      checked={answers[q.id]?.includes(option) || false}
                      onChange={(e) => {
                        const selected = answers[q.id] || [];
                        if (e.target.checked) {
                          handleChange(q.id, [...selected, option]);
                        } else {
                          handleChange(
                            q.id,
                            selected.filter((o) => o !== option)
                          );
                        }
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            // ✅ Default Text Input
            <textarea
              className="input textarea"
              value={answers[q.id] || ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder="Enter details..."
            />
          )}
        </div>
      ))}

      <button type="submit" className="btn btn--primary continue-btn">
        {id === "privateprescription" ? "Continue to Pharmacist Form" : "Continue"}
      </button>
    </form>
  );
}
