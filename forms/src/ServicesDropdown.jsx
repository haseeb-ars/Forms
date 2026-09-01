import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { services } from "./servicesConfig";
import "./ServicesDropdown.css";

const CATEGORIES = [
  {
    name: "⭐ Quick Access / Popular",
    ids: ["firstWrittenWarning", "sicknessReview", "staffFileNote", "weightloss", "travel", "healthyLivingLog", "employeeAppraisal"],
  },
  {
    name: "🩺 Clinical & Consultation Services",
    ids: [
      "travel",
      "weightloss",
      "perioddelay",
      "contraception",
      "privateprescription",
      "b12",
      "earwax",
      "flu",
      "covid",
      "mmr",
      "meningitis",
    ],
  },
  {
    name: "📝 Follow-Ups & Administration",
    ids: [
      "firstWrittenWarning",
      "sicknessReview",
      "staffFileNote",
      "employeeAppraisal",
      "healthyLivingLog",
      "weightlossFollowup",
      "travelFollowUp",
    ],
  },
];

const SERVICE_ICONS = {
  perioddelay: "🌸",
  b12: "💉",
  weightloss: "⚖️",
  weightlossFollowup: "📉",
  earwax: "👂",
  flu: "🛡️",
  covid: "🔬",
  travel: "✈️",
  travelFollowUp: "🧭",
  privateprescription: "💊",
  followupprescription: "📝",
  mmr: "💉",
  meningitis: "🧠",
  contraception: "🌸",
  employeeAppraisal: "👔",
  healthyLivingLog: "📋",
  staffFileNote: "📋",
  sicknessReview: "🤒",
  firstWrittenWarning: "⚠️",
};

export default function ServicesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectService = (serviceId) => {
    setIsOpen(false);
    setSearch("");
    if (serviceId === "employeeAppraisal") {
      navigate(`/service/employeeAppraisal/form`);
    } else if (serviceId === "healthyLivingLog") {
      navigate(`/service/healthyLivingLog/form`);
    } else if (serviceId === "staffFileNote") {
      navigate(`/service/staffFileNote/form`);
    } else if (serviceId === "sicknessReview") {
      navigate(`/service/sicknessReview/form`);
    } else if (serviceId === "firstWrittenWarning") {
      navigate(`/service/firstWrittenWarning/form`);
    } else {
      navigate(`/service/${serviceId}/patient`);
    }
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="services-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className={`services-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="trigger-icon">🩺</span>
        <span className="trigger-text">Services</span>
        <span className="trigger-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="services-dropdown-menu">
          <div className="dropdown-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="dropdown-search-input"
              placeholder="Search services (e.g. Travel, Weight Loss)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="dropdown-scroll-area">
            {search.trim() ? (
              <div className="dropdown-category-block">
                <div className="category-header">Search Results ({filteredServices.length})</div>
                {filteredServices.length === 0 ? (
                  <div className="no-services-found">No matching services found</div>
                ) : (
                  filteredServices.map((s) => (
                    <div
                      key={s.id}
                      className="service-menu-item"
                      onClick={() => handleSelectService(s.id)}
                    >
                      <span className="item-icon">{SERVICE_ICONS[s.id] || "📋"}</span>
                      <span className="item-name">{s.name}</span>
                      <span className="item-arrow">→</span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              CATEGORIES.map((cat) => {
                const categoryServices = services.filter((s) =>
                  cat.ids.includes(s.id)
                );
                if (categoryServices.length === 0) return null;

                return (
                  <div key={cat.name} className="dropdown-category-block">
                    <div className="category-header">{cat.name}</div>
                    {categoryServices.map((s) => (
                      <div
                        key={s.id}
                        className="service-menu-item"
                        onClick={() => handleSelectService(s.id)}
                      >
                        <span className="item-icon">{SERVICE_ICONS[s.id] || "📋"}</span>
                        <span className="item-name">{s.name}</span>
                        <span className="item-arrow">→</span>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
