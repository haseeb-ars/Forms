// src/MedicationRecommendationsPage.jsx
import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { services } from "./servicesConfig";
import { useApp } from "./AppContext.jsx";
import {
  getRecommendationsForService,
  isConsultationService
} from "./medicationsConfig";
import "./designSystem.css";
import "./MedicationRecommendationsPage.css";

export default function MedicationRecommendationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { medicationRecommendations, setMedicationRecommendations } = useApp();
  const service = services.find((s) => s.id === id);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("all");

  // Get grouped recommendations for this service
  const groupedProducts = useMemo(() => {
    return getRecommendationsForService(id, selectedCondition);
  }, [id, selectedCondition]);

  // Total available products count
  const allFilteredItems = useMemo(() => {
    const items = [];
    Object.entries(groupedProducts).forEach(([cat, prods]) => {
      prods.forEach((prod) => {
        const matchesSearch =
          !searchTerm ||
          prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prod.description.toLowerCase().includes(searchTerm.toLowerCase());
        if (matchesSearch) {
          items.push({ ...prod, category: cat });
        }
      });
    });
    return items;
  }, [groupedProducts, searchTerm]);

  // Group filtered items back by category
  const categorizedFiltered = useMemo(() => {
    const groups = {};
    allFilteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [allFilteredItems]);

  // Total selected items count
  const totalSelectedCount = useMemo(() => {
    return Object.values(medicationRecommendations || {}).filter(
      (m) => m && (m.alreadyTakes || m.recommended || m.patientAgreed || (m.notes && m.notes.trim()))
    ).length;
  }, [medicationRecommendations]);

  // If service is invalid or not clinical, redirect
  if (!service || !isConsultationService(id)) {
    return (
      <div className="med-rec-container">
        <div className="med-rec-empty">
          <h3>Invalid Service</h3>
          <p>This service does not require medication recommendations.</p>
          <button className="cph-btn cph-btn-primary" onClick={() => navigate("/")}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Update item field
  const updateProductStatus = (product, field, value) => {
    setMedicationRecommendations((prev) => {
      const existing = prev[product.id] || {
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        alreadyTakes: false,
        recommended: false,
        patientAgreed: false,
        notes: "",
      };

      const updated = {
        ...existing,
        name: product.name,
        category: product.category,
        image: product.image,
        [field]: value,
      };

      // Check if completely empty
      const hasAny =
        updated.alreadyTakes ||
        updated.recommended ||
        updated.patientAgreed ||
        (updated.notes && updated.notes.trim().length > 0);

      if (!hasAny) {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      }

      return {
        ...prev,
        [product.id]: updated,
      };
    });
  };

  const handleBack = () => {
    navigate(`/service/${id}/pharmacist`);
  };

  const handleContinue = () => {
    navigate({
      pathname: `/service/${id}/preview`,
      search: `?autoDownload=true`,
    });
  };

  const isWeightLoss = id === "weightloss" || id === "weightlossFollowup";
  const isTravel = id === "travel" || id === "travelFollowUp";
  const isPharmacyFirstOrPrivate = !isWeightLoss && !isTravel;

  return (
    <div className="med-rec-wrapper">
      {/* 🧭 Progress Indicator */}
      <div className="med-rec-progress">
        <div className="med-rec-step completed">
          <span className="step-num">✓</span>
          <span className="step-label">1. Patient Details</span>
        </div>
        <div className="med-rec-step-line completed"></div>
        <div className="med-rec-step completed">
          <span className="step-num">✓</span>
          <span className="step-label">2. Consultation Details</span>
        </div>
        <div className="med-rec-step-line active"></div>
        <div className="med-rec-step active">
          <span className="step-num">3</span>
          <span className="step-label">3. Medication Recommendations</span>
        </div>
        <div className="med-rec-step-line"></div>
        <div className="med-rec-step">
          <span className="step-num">4</span>
          <span className="step-label">4. Preview &amp; Submit</span>
        </div>
      </div>

      {/* 📋 Header */}
      <div className="med-rec-header">
        <div className="med-rec-header-titles">
          <div className="service-tag-badge" style={{ backgroundColor: service.color || "#0d9488" }}>
            {service.name}
          </div>
          <h2>Medication &amp; Supplement Recommendations</h2>
          <p className="med-rec-subtitle">
            Review relevant products and medications with your pharmacist. Select the items that apply to your consultation.
          </p>
        </div>

        <div className="med-rec-stats">
          <div className="stat-pill">
            <span className="stat-icon">💊</span>
            <span className="stat-count">{totalSelectedCount}</span>
            <span className="stat-text">Items Recorded</span>
          </div>
        </div>
      </div>

      {/* 🛡️ Clinical Safety Callout */}
      <div className="med-rec-clinical-notice">
        <div className="notice-icon">🛡️</div>
        <div className="notice-content">
          <strong>Clinical Safety &amp; Professional Judgment:</strong>
          <span>
            These suggestions are for pharmacist review. Always verify allergies, contraindications, drug interactions, pregnancy status, and existing medicines before recommending or supplying products.
          </span>
        </div>
      </div>

      {/* 🔍 Filters & Search */}
      <div className="med-rec-controls">
        <div className="med-rec-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search medications, supplements or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>

        {isPharmacyFirstOrPrivate && (
          <div className="condition-filter-bar">
            <span className="filter-label">Filter by Condition:</span>
            {[
              { id: "all", label: "All Conditions" },
              { id: "wellbeing", label: "General Wellbeing" },
              { id: "uti", label: "UTI" },
              { id: "sore_throat", label: "Sore Throat" },
              { id: "sinusitis", label: "Sinusitis" },
              { id: "shingles", label: "Shingles" },
            ].map((cond) => (
              <button
                key={cond.id}
                type="button"
                className={`condition-pill ${selectedCondition === cond.id ? "active" : ""}`}
                onClick={() => setSelectedCondition(cond.id)}
              >
                {cond.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 📦 Product Categories & Cards */}
      <div className="med-rec-content">
        {Object.keys(categorizedFiltered).length === 0 ? (
          <div className="med-rec-empty">
            <div className="empty-icon">🔍</div>
            <h3>No medications found</h3>
            <p>No products match your search criteria. Try a different term or clear filters.</p>
          </div>
        ) : (
          Object.entries(categorizedFiltered).map(([category, products]) => (
            <section key={category} className="med-category-section">
              <div className="med-category-header">
                <h3>{category}</h3>
                <span className="med-category-count">{products.length} {products.length === 1 ? "product" : "products"}</span>
              </div>

              <div className="med-cards-grid">
                {products.map((product) => {
                  const state = medicationRecommendations[product.id] || {
                    alreadyTakes: false,
                    recommended: false,
                    patientAgreed: false,
                    notes: "",
                  };

                  const isSelected =
                    state.alreadyTakes || state.recommended || state.patientAgreed || (state.notes && state.notes.trim().length > 0);

                  const publicUrl = process.env.PUBLIC_URL || "";
                  const imageSrc = product.image ? `${publicUrl}${product.image}` : null;

                  return (
                    <div
                      key={product.id}
                      className={`med-card ${isSelected ? "selected" : ""}`}
                    >
                      {/* Product Header & Image */}
                      <div className="med-card-top">
                        <div className="med-card-image-wrap">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={product.name}
                              className="med-product-image"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div className="med-card-img-placeholder" style={{ display: imageSrc ? "none" : "flex" }}>
                            <span>💊</span>
                          </div>
                        </div>

                        <div className="med-card-info">
                          <span className="med-card-cat-badge">{category}</span>
                          <h4 className="med-card-title">{product.name}</h4>
                          <p className="med-card-desc">{product.description}</p>
                        </div>
                      </div>

                      {/* Selection Status Toggles */}
                      <div className="med-card-statuses">
                        <label
                          className={`med-status-check takes ${state.alreadyTakes ? "checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={!!state.alreadyTakes}
                            onChange={(e) =>
                              updateProductStatus(product, "alreadyTakes", e.target.checked)
                            }
                          />
                          <span className="checkbox-custom"></span>
                          <div className="status-label-group">
                            <span className="status-title">Patient already takes this</span>
                            <span className="status-desc">Currently uses or self-administers</span>
                          </div>
                        </label>

                        <label
                          className={`med-status-check rec ${state.recommended ? "checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={!!state.recommended}
                            onChange={(e) =>
                              updateProductStatus(product, "recommended", e.target.checked)
                            }
                          />
                          <span className="checkbox-custom"></span>
                          <div className="status-label-group">
                            <span className="status-title">Recommended by pharmacist</span>
                            <span className="status-desc">Clinically indicated &amp; suggested</span>
                          </div>
                        </label>

                        <label
                          className={`med-status-check agreed ${state.patientAgreed ? "checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={!!state.patientAgreed}
                            onChange={(e) =>
                              updateProductStatus(product, "patientAgreed", e.target.checked)
                            }
                          />
                          <span className="checkbox-custom"></span>
                          <div className="status-label-group">
                            <span className="status-title">Patient agreed / taking</span>
                            <span className="status-desc">Confirmed to commence or purchase</span>
                          </div>
                        </label>
                      </div>

                      {/* Optional Notes */}
                      <div className="med-card-notes">
                        <input
                          type="text"
                          placeholder="Optional pharmacist clinical notes / rationale..."
                          value={state.notes || ""}
                          onChange={(e) =>
                            updateProductStatus(product, "notes", e.target.value)
                          }
                          className="med-notes-input"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* 🧭 Bottom Navigation Actions */}
      <div className="med-rec-bottom-bar">
        <button
          type="button"
          className="cph-btn cph-btn-outline"
          onClick={handleBack}
        >
          ← Back to Consultation Form
        </button>

        <div className="bottom-bar-right">
          <span className="selection-summary">
            {totalSelectedCount === 0
              ? "No items selected (optional)"
              : `${totalSelectedCount} item${totalSelectedCount === 1 ? "" : "s"} selected`}
          </span>
          <button
            type="button"
            className="cph-btn cph-btn-primary"
            onClick={handleContinue}
          >
            Continue to Preview →
          </button>
        </div>
      </div>
    </div>
  );
}
