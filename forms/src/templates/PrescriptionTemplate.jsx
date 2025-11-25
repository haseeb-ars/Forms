// src/templates/PrescriptionTemplate.jsx
import React from "react";
import "./B12Template.css";

// 🔹 Service-specific mappings for RX header fields (kept)
const prescriptionMappings = {
  b12: {
    title: "B12 Prescription",
    drug: (d) => d.drug || "-",
    quantity: (d) => d.quantity || "-",
    dose: (d) => d.dose || "-",
    prescriber: (d) => d.prescriberName || d.prescriber || "-",
    prescriberGPhC: (d) =>
      d.GPHCnumber ||
      d.prescriberGPhC ||
      d.gphcNumber ||
      d.pharmacistGPhC ||
      d.clinicianGPhC ||
      "-",
    prescriberType: (d) => d.prescriberType || d.clinicianType || "-",
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
      d.prescriberType || d.clinicianType || "Pharmacist Independent Prescriber",
  },

  weightlossFollowup: {
    title: "Weight Loss Follow-up Prescription",
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
      d.prescriberType || d.clinicianType || "Pharmacist Independent Prescriber",
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
      d.prescriberType || d.clinicianType || "Pharmacist Independent Prescriber",
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
      d.prescriberType || d.clinicianType || "Pharmacist Independent Prescriber",
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
        vaccines.push(
          ...d.malariaVaccines.map((v) => v.vaccine).filter(Boolean)
        );
      }
      if (vaccines.length === 0)
        return "Travel vaccines as per consultation form";
      return vaccines.join(", ");
    },
    quantity: () => "-",
    dose: () => "-",
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
      d.prescriberType || d.clinicianType || "Pharmacist Independent Prescriber",
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
      d.prescriberType || d.clinicianType || "Pharmacist Independent Prescriber",
  },

  privateprescription: {
    title: "Private Prescription",
    drug: (d) => d.drug || d.medication || "As prescribed",
    quantity: (d) => d.quantity || "—",
    dose: (d) => d.dosage || d.dose || "—",
    prescriber: (d) =>
      d.prescriberName || d.pharmacistName || d.prescriber || "—",
    prescriberGPhC: (d) =>
      d.GPHCnumber ||
      d.prescriberGPhC ||
      d.gphcNumber ||
      d.pharmacistGPhC ||
      "—",
    prescriberType: (d) => d.prescriberType || "Pharmacist Independent Prescriber",
  },
    followupprescription: {
    title: "Follow-up Prescription",
    drug: (d) => d.drug || d.medication || "As prescribed",
    quantity: (d) => d.quantity || "—",
    dose: (d) => d.dosage || d.dose || "—",
    prescriber: (d) =>
      d.prescriberName || d.pharmacistName || d.prescriber || "—",
    prescriberGPhC: (d) =>
      d.GPHCnumber ||
      d.prescriberGPhC ||
      d.gphcNumber ||
      d.pharmacistGPhC ||
      "—",
    prescriberType: (d) => d.prescriberType || "Pharmacist Independent Prescriber",
  },
};

// 🔧 Normalise ALL possible medication/vaccine sources to one array
function normaliseItems(data, serviceId) {
  const items = [];
  const asArray = (x) => (Array.isArray(x) ? x : []);

  const pushItem = (src) => {
    items.push({
      name: src.name || src.vaccine || src.drug || "-",
      strength: src.strength || "",
      dosage: src.dosage || src.dose || "",
      quantity: src.quantity || "",
      batchNumber: src.batchNumber || src.batch || "",
      expiry: src.expiry || src.dateExpiry || "",
      dateGiven: src.dateGiven || src.datePharm || "",
      // 🔹 new fields for display
      brand: src.brand || src.vaccineBrand || "",
      indication: src.indication || src.reason || "",
    });
  };

  // 1) Repeaters
  asArray(data.prescribedDrugs).forEach(pushItem); // MedicationRepeater in "drug" mode
  asArray(data.vaccines).forEach(pushItem);        // Vaccine/MedicationRepeater in "vaccine" mode
  asArray(data.malariaVaccines).forEach(pushItem); // VaccineRepeater (malaria)

  // 2) Service-specific singles

  // B12 (single fields)
  if (
    serviceId === "b12" &&
    (data.drug || data.dose || data.quantity || data.batchNumber || data.expiry || data.datePharm)
  ) {
    pushItem({
      drug: data.drug,
      dose: data.dose,
      quantity: data.quantity,
      batchNumber: data.batchNumber,
      expiry: data.expiry,
      datePharm: data.datePharm,
    });
  }

  // Flu (single fields)
  if (
    serviceId === "flu" &&
    (data.vaccineBrand || data.batchNumber || data.dateGiven)
  ) {
    pushItem({
      name: data.vaccineBrand || "Influenza vaccine",
      vaccineBrand: data.vaccineBrand,
      dose: "0.5ml IM injection",
      quantity: "1",
      batchNumber: data.batchNumber,
      expiry: "",
      dateGiven: data.dateGiven,
    });
  }

  // Covid (single fields)
  if (
    serviceId === "covid" &&
    (data.vaccineBrand || data.batchNumber || data.dateGiven || data.dateExpiry)
  ) {
    pushItem({
      name: data.vaccineBrand || "COVID-19 vaccine",
      vaccineBrand: data.vaccineBrand,
      dose: data.doseNumber ? `Dose ${data.doseNumber}` : "",
      quantity: "1",
      batchNumber: data.batchNumber,
      expiry: data.dateExpiry,
      dateGiven: data.dateGiven,
    });
  }

  // Weightloss (single fields)
  if (
    serviceId === "weightloss" &&
    (data.medication || data.otherMedication || data.dosage || data.batchNumber || data.startDate)
  ) {
    pushItem({
      name:
        data.medication === "Other"
          ? data.otherMedication || "Other Medication"
          : data.medication,
      dose: data.dosage,
      quantity: data.quantity,
      batchNumber: data.batchNumber,
      expiry: "",
      datePharm: data.startDate,
    });
  }

  return items;
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

export default function PrescriptionTemplate({ data = {}, serviceId }) {
  const safe = (v) => (v && String(v).trim() !== "" ? v : "—");
  const map = prescriptionMappings[serviceId] || prescriptionMappings.b12;

  const consultationDate =
    data.consultationDate || data.datePharm || data.date || new Date().toLocaleDateString();

  const showGenericHeader = serviceId !== "travel";

  const items = normaliseItems(data, serviceId);
  const hasItems = items.length > 0;

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

      {/* ✅ Unified prescription items table */}
      {hasItems && (
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
                <th style={{ padding: "6px" }}>Drug / Vaccine</th>
                <th style={{ padding: "6px" }}>Strength</th>
                <th style={{ padding: "6px" }}>Dosage</th>
                <th style={{ padding: "6px" }}>Quantity</th>
                <th style={{ padding: "6px" }}>Batch No</th>
                <th style={{ padding: "6px" }}>Expiry</th>
                <th style={{ padding: "6px" }}>Date Given</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <React.Fragment key={i}>
                  {/* main row (unchanged fields) */}
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "6px" }}>{safe(it.name)}</td>
                    <td style={{ padding: "6px" }}>{safe(it.strength)}</td>
                    <td style={{ padding: "6px" }}>{safe(it.dosage)}</td>
                    <td style={{ padding: "6px" }}>{safe(it.quantity)}</td>
                    <td style={{ padding: "6px" }}>{safe(it.batchNumber)}</td>
                    <td style={{ padding: "6px" }}>{safe(it.expiry)}</td>
                    <td style={{ padding: "6px" }}>{safe(it.dateGiven)}</td>
                  </tr>

                  {/* second line with Brand + Indication */}
                  {(it.brand || it.indication) && (
                    <tr className="sub-row">
                      <td
                        colSpan={7}
                        style={{
                          padding: "4px 6px 6px",
                          fontSize: "11px",
                          background: "#f9fafb",
                        }}
                      >
                        {it.brand && (
                          <span>
                            <strong>Brand:</strong> {safe(it.brand)}
                          </span>
                        )}
                        {it.indication && (
                          <span style={{ marginLeft: "1.5rem" }}>
                            <strong>Indication:</strong> {safe(it.indication)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
              <img src={data.prescriberSignature} alt="Signature" className="sigimg" />
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
