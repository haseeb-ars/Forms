import React from "react";
import "./B12Template.css";

// 🔹 Service-specific mappings for prescription fields
const prescriptionMappings = {
  b12: {
    title: "Vitamin B12 Prescription",
    drug: (d) => d.drug || "Hydroxocobalamin 1000mcg/1ml ampoule",
    quantity: (d) => d.quantity || "One ampoule",
    dose: (d) => d.dose || "1000mcg (1ml) IM injection",
    prescriber: (d) => d.prescriber || "Mr James Pendlebury",
    prescriberGPhC: (d) => d.prescriberGPhC || "2211954",
  },
  weightloss: {
    title: "Weight Loss Prescription",
    drug: (d) => d.medication || "Semaglutide / Tirzepatide",
    quantity: (d) => d.quantity || "As prescribed",
    dose: (d) => d.dosage || "-",
    prescriber: (d) => d.prescriber || "-",
    prescriberGPhC: (d) => d.prescriberGPhC || "-",
  },
  flu: {
    title: "Flu Vaccine Prescription",
    drug: (d) => d.vaccineBrand || "Influenza vaccine",
    quantity: () => "1 dose",
    dose: () => "0.5ml IM injection",
    prescriber: (d) => d.prescriber || "-",
    prescriberGPhC: (d) => d.prescriberGPhC || "-",
  },
  covid: {
    title: "COVID-19 Vaccine Prescription",
    drug: (d) => d.vaccineBrand || "COVID-19 Vaccine",
    quantity: () => "1 dose",
    dose: (d) => `Dose ${d.doseNumber || "-"}`,
    prescriber: (d) => d.prescriber || "-",
    prescriberGPhC: (d) => d.prescriberGPhC || "-",
  },
  travel: {
    title: "Travel Vaccination Prescription",
    drug: (d) => {
      let vaccines = [];

      // Regular vaccines
      if (Array.isArray(d.vaccines) && d.vaccines.length > 0) {
        vaccines = d.vaccines.map((v) => v.vaccine).filter(Boolean);
      }

      // Malaria vaccines (if given)
      if (
        d.malariaGiven === "Yes" &&
        Array.isArray(d.malariaVaccines) &&
        d.malariaVaccines.length > 0
      ) {
        const malariaNames = d.malariaVaccines
          .map((v) => v.vaccine)
          .filter(Boolean);
        vaccines.push(...malariaNames);
      }

      if (vaccines.length === 0) {
        return "Travel vaccines as per consultation form";
      }

      return vaccines.join(", ");
    },
    quantity: (d) => "-",
    dose: (d) => "-",
    prescriber: (d) =>
      d.prescriber ||
      d.Prescriber ||
      d.prescriberName ||
      d.pharmacistName ||
      "-",
    prescriberGPhC: (d) =>
      d.prescriberGPhC || d.GPHCNumber || d.gphcNumber || "-",
  },
};

export default function PrescriptionTemplate({ data = {}, serviceId }) {
  const safe = (v) => (v && String(v).trim() !== "" ? v : "—");

  // Pick mapping or fallback to generic
  const map = prescriptionMappings[serviceId] || {
    title: "Private Prescription",
  };

  // 🔹 Determine heading and style
  const showGenericHeader = serviceId !== "travel";

  return (
    <div className="formdoc" style={{ pageBreakInside: "avoid" }}>
      {/* Header */}
      <div className="formdoc__header" style={{ alignItems: "flex-start" }}>
        <img
          src="/Logo3.png"
          alt="CarePlus Logo"
          width={220}
          style={{ marginBottom: 10 }}
        />
      </div>

      {/* Title */}
      <h1
        style={{
          textAlign: "center",
          color: "#0077aa",
          fontSize: "20px",
          marginBottom: "20px",
        }}
      >
        {map.title}
      </h1>

      {showGenericHeader && (
        <div
          style={{
            textAlign: "center",
            fontSize: "14px",
            marginBottom: "15px",
            color: "#333",
          }}
        >
          Private Prescription. Unique ID: {safe(data.uniqueId)} <br />
          For use only with administration form ID: {safe(data.prescriptionId)}
        </div>
      )}

      {/* Patient details */}
      <section
        className="formdoc__section"
        style={{ textAlign: "left", maxWidth: 520 }}
      >
        <div className="row">
          <div className="row__label">FULL NAME:</div>
          <div className="row__value">
            <span>{safe(data.fullName)}</span>
          </div>
        </div>
        <div className="row">
          <div className="row__label">ADDRESS:</div>
          <div className="row__value">
            <span>{safe(data.address)}</span>
          </div>
        </div>
        <div className="row">
          <div className="row__label">DATE OF BIRTH:</div>
          <div className="row__value">
            <span>{safe(data.dob)}</span>
          </div>
        </div>
      </section>

      {/* Prescription details */}
      <section
        className="formdoc__section"
        style={{ textAlign: "left", maxWidth: 520 }}
      >
        <div className="row">
          <div className="row__label">DRUG:</div>
          <div className="row__value">
            <span>{map.drug ? map.drug(data) : "—"}</span>
          </div>
        </div>
        <div className="row">
          <div className="row__label">QUANTITY:</div>
          <div className="row__value">
            <span>{map.quantity ? map.quantity(data) : "—"}</span>
          </div>
        </div>
        <div className="row">
          <div className="row__label">DOSE:</div>
          <div className="row__value">
            <span>{map.dose ? map.dose(data) : "—"}</span>
          </div>
        </div>
      </section>

      {/* Prescriber details */}
      <section
        className="formdoc__section"
        style={{ textAlign: "left", maxWidth: 520 }}
      >
        <div className="row">
          <div className="row__label">PRESCRIBER:</div>
          <div className="row__value">
            <span>{map.prescriber ? map.prescriber(data) : "—"}</span>
          </div>
        </div>
        <div className="row">
          <div className="row__label">GPhC:</div>
          <div className="row__value">
            <span>{map.prescriberGPhC ? map.prescriberGPhC(data) : "—"}</span>
          </div>
        </div>

        <div className="row">
          <div className="row__label">SIGNATURE:</div>
          <div className="row__value row__value--sig">
            {data.prescriberSignature ? (
              <img
                src={data.prescriberSignature}
                alt="Signature"
                className="sigimg"
              />
            ) : (
              <span className="placeholder">No signature</span>
            )}
          </div>
        </div>

        <div className="row">
          <div className="row__label">DATE:</div>
          <div className="row__value">
            <span>{safe(data.datePharm)}</span>
          </div>
        </div>
      </section>

      {/* Consent notice */}
      <div
        className="formdoc__consent"
        style={{ maxWidth: 520, marginLeft: 0, marginTop: 10 }}
      >
        This prescription is valid only when used with the corresponding
        administration form in a certified pharmacy consultation room under the
        supervision of a pharmacist or prescriber.
      </div>
    </div>
  );
}
