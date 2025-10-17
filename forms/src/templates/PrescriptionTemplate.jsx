import React from "react";
import "./B12Template.css";

// 🔹 Service-specific mappings for prescription fields
const prescriptionMappings = {
  b12: {
    title: "Vitamin B12 Prescription",
    drug: (d) => d.drug || "Hydroxocobalamin 1000mcg/1ml ampoule",
    quantity: (d) => d.quantity || "One ampoule",
    dose: (d) => d.dose || "1000mcg (1ml) IM injection",
    prescriber: (d) =>
      d.prescriberName || d.prescriber || "Mr James Pendlebury",
    prescriberGPhC: (d) =>
      d.GPHCnumber ||
      d.prescriberGPhC ||
      d.gphcNumber ||
      d.pharmacistGPhC ||
      d.clinicianGPhC ||
      "2211954",
    prescriberType: (d) =>
      d.prescriberType ||
      d.clinicianType ||
      "Pharmacist Independent Prescriber",
  },

  weightloss: {
    title: "Weight Loss Prescription",
    drug: (d) =>
      d.medication === "Other"
        ? d.otherMedication || "Other Medication"
        : d.medication || "Semaglutide / Tirzepatide",
    quantity: (d) => d.quantity || "As prescribed",
    dose: (d) => d.dosage || "—",
    prescriber: (d) =>
      d.prescriberName || d.prescriber || d.clinicianName || "—",
    prescriberGPhC: (d) =>
      d.GPHCnumber ||
      d.prescriberGPhC ||
      d.gphcNumber ||
      d.pharmacistGPhC ||
      d.clinicianGPhC ||
      "—",
    prescriberType: (d) =>
      d.prescriberType ||
      d.clinicianType ||
      "Pharmacist Independent Prescriber",
  },

  flu: {
    title: "Flu Vaccine Prescription",
    drug: (d) => d.vaccineBrand || "Influenza vaccine",
    quantity: () => "1 dose",
    dose: () => "0.5ml IM injection",
    prescriber: (d) =>
      d.prescriberName || d.prescriber || d.clinicianName || "—",
    prescriberGPhC: (d) =>
      d.GPHCnumber ||
      d.prescriberGPhC ||
      d.gphcNumber ||
      d.pharmacistGPhC ||
      d.clinicianGPhC ||
      "—",
    prescriberType: (d) =>
      d.prescriberType ||
      d.clinicianType ||
      "Pharmacist Independent Prescriber",
  },

  covid: {
    title: "COVID-19 Vaccine Prescription",
    drug: (d) => d.vaccineBrand || "COVID-19 Vaccine",
    quantity: () => "1 dose",
    dose: (d) => `Dose ${d.doseNumber || "-"}`,
    prescriber: (d) =>
      d.prescriberName || d.prescriber || d.clinicianName || "—",
    prescriberGPhC: (d) =>
      d.GPHCnumber ||
      d.prescriberGPhC ||
      d.gphcNumber ||
      d.pharmacistGPhC ||
      d.clinicianGPhC ||
      "—",
    prescriberType: (d) =>
      d.prescriberType ||
      d.clinicianType ||
      "Pharmacist Independent Prescriber",
  },

  travel: {
    title: "Travel Vaccination Prescription",
    drug: (d) => {
      let vaccines = [];

      if (Array.isArray(d.vaccines) && d.vaccines.length > 0) {
        vaccines = d.vaccines.map((v) => v.vaccine).filter(Boolean);
      }

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

      if (vaccines.length === 0)
        return "Travel vaccines as per consultation form";

      return vaccines.join(", ");
    },
    quantity: (d) => "-",
    dose: (d) => "-",
    prescriber: (d) =>
      d.prescriber ||
      d.Prescriber ||
      d.prescriberName ||
      d.pharmacistName ||
      d.clinicianName ||
      "-",
    prescriberGPhC: (d) =>
      d.prescriberGPhC ||
      d.GPHCnumber ||
      d.gphcNumber ||
      d.pharmacistGPhC ||
      d.clinicianGPhC ||
      "-",
    prescriberType: (d) =>
      d.prescriberType ||
      d.clinicianType ||
      "Pharmacist Independent Prescriber",
  },

  earwax: {
    title: "Earwax Removal Prescription",
    drug: (d) =>
      d.medication ||
      d.earMedication ||
      "Earwax removal drops or treatment as indicated",
    quantity: (d) => d.quantity || "As required",
    dose: (d) => d.dose || d.dosage || "Use as directed",
    prescriber: (d) =>
      d.prescriberName || d.prescriber || d.clinicianName || "—",
    prescriberGPhC: (d) =>
      d.GPHCnumber ||
      d.prescriberGPhC ||
      d.gphcNumber ||
      d.pharmacistGPhC ||
      d.clinicianGPhC ||
      "—",
    prescriberType: (d) =>
      d.prescriberType ||
      d.clinicianType ||
      "Pharmacist Independent Prescriber",
  },
};

export default function PrescriptionTemplate({ data = {}, serviceId }) {
  const safe = (v) => (v && String(v).trim() !== "" ? v : "—");

  const map = prescriptionMappings[serviceId] || prescriptionMappings.b12;

  const consultationDate =
    data.consultationDate ||
    data.datePharm ||
    data.date ||
    new Date().toLocaleDateString();

  const showGenericHeader = serviceId !== "travel";

  const allVaccines = [
    ...(Array.isArray(data.vaccines) ? data.vaccines : []),
    ...(Array.isArray(data.malariaVaccines) ? data.malariaVaccines : []),
  ];

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
      <section className="formdoc__section" style={{ maxWidth: 520 }}>
        <Row label="FULL NAME" value={data.fullName} />
        <Row label="ADDRESS" value={data.address} />
        <Row label="DATE OF BIRTH" value={data.dob} />
        {data.surgery && <Row label="SURGERY NAME" value={data.surgery} />}
      </section>

      {/* Prescription details 
      <section className="formdoc__section" style={{ maxWidth: 520 }}>
        <Row label="DRUG" value={map.drug(data)} />
        <Row label="QUANTITY" value={map.quantity(data)} />
        <Row label="DOSE" value={map.dose(data)} />
      </section>*/}

      {/* ✅ Vaccine table if vaccines exist */}
      {allVaccines.length > 0 && (
        <section className="formdoc__section" style={{ maxWidth: 700 }}>
          <h3 style={{ marginBottom: "8px" }}>Prescription Details</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              marginTop: "6px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f3f4f6",
                  textAlign: "left",
                  borderBottom: "2px solid #ccc",
                }}
              >
                <th style={{ padding: "6px" }}>Drug</th>
                <th style={{ padding: "6px" }}>Batch No</th>
                <th style={{ padding: "6px" }}>Date Given</th>
                <th style={{ padding: "6px" }}>Expiry</th>
                <th style={{ padding: "6px" }}>Dosage</th>
                <th style={{ padding: "6px" }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {allVaccines.map((v, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "6px" }}>{safe(v.vaccine)}</td>
                  <td style={{ padding: "6px" }}>{safe(v.batch)}</td>
                  <td style={{ padding: "6px" }}>{safe(v.dateGiven)}</td>
                  <td style={{ padding: "6px" }}>{safe(v.expiry)}</td>
                  <td style={{ padding: "6px" }}>{safe(v.dosage)}</td>
                  <td style={{ padding: "6px" }}>{safe(v.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Prescriber details */}
      <section className="formdoc__section" style={{ maxWidth: 520 }}>
        <Row label="PRESCRIBER" value={map.prescriber(data)} />
        <Row label="PRESCRIBER TYPE" value={map.prescriberType(data)} />
        <Row label="GPhC" value={map.prescriberGPhC(data)} />

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

        <Row label="DATE" value={consultationDate} />
      </section>

      {/* Consent */}
      <div
        className="formdoc__consent"
        style={{ maxWidth: 520, marginLeft: 0, marginTop: 10 }}
      >
        This prescription is valid only when used with the corresponding
        consultation and administration forms in a certified pharmacy
        consultation room under the supervision of a pharmacist or prescriber.
      </div>
    </div>
  );
}

// 🔹 Helper row renderer
function Row({ label, value }) {
  const safeValue = value && String(value).trim() !== "" ? value : "—";
  return (
    <div className="row">
      <div className="row__label">{label}:</div>
      <div className="row__value">{safeValue}</div>
    </div>
  );
}
