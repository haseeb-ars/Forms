import React from "react";
import "./B12Template.css";

export default function B12Prescription({ data = {} }){
  const safe = (v) => (v && String(v).trim() !== "" ? v : "\u2014");

  return (
    <div className="formdoc" style={{ pageBreakInside: 'avoid' }}>
      <div className="formdoc__header">
        <img src="/Logo3.png" alt="CarePlus Logo" width={280} />
        <div className="formdoc__title">
          <div className="bold" style={{ fontSize: 14 }}>Private Prescription. Unique ID: {safe(data.uniqueId)}</div>
          <div className="muted" style={{ fontSize: 12 }}>For use only with administration form ID: {safe(data.prescriptionId)}</div>
        </div>
      </div>

      <div className="formdoc__section" style={{ textAlign: 'left', maxWidth: 520 }}>
        <div className="row"><div className="row__label">FIRST NAME / SURNAME:</div><div className="row__value"><span>{safe(data.fullName)}</span></div></div>
        <div className="row"><div className="row__label">ADDRESS:</div><div className="row__value"><span>{safe(data.address)}</span></div></div>
        <div className="row"><div className="row__label">DATE OF BIRTH:</div><div className="row__value"><span>{safe(data.dob)}</span></div></div>
      </div>

      <div className="formdoc__section" style={{ textAlign: 'left', maxWidth: 520 }}>
        <div className="row"><div className="row__label">DRUG:</div><div className="row__value"><span>{safe(data.drug) || "Hydroxocobalamin 1000mcg/1ml ampoule"}</span></div></div>
        <div className="row"><div className="row__label">QUANTITY:</div><div className="row__value"><span>{safe(data.quantity) || "One ampoule"}</span></div></div>
        <div className="row"><div className="row__label">DOSE:</div><div className="row__value"><span>{safe(data.dose) || "1000mcg (1ml) to be administered intramuscularly into the deltoid muscle"}</span></div></div>
      </div>

      <div className="formdoc__section" style={{ textAlign: 'left', maxWidth: 520 }}>
        <div className="row"><div className="row__label">PRESCRIBER:</div><div className="row__value"><span>{safe(data.prescriber) || "Mr James Pendlebury"}</span></div></div>
        <div className="row"><div className="row__label">GPhC:</div><div className="row__value"><span>{safe(data.prescriberGPhC) || "2211954"}</span></div></div>
        <div className="row"><div className="row__label">SIGNATURE:</div><div className="row__value row__value--sig">{data.pharmacistSignature ? <img src={data.pharmacistSignature} alt="Signature" className="sigimg" /> : <span className="placeholder">No signature</span>}</div></div>
        <div className="row"><div className="row__label">DATE:</div><div className="row__value"><span>{safe(data.datePharm)}</span></div></div>
      </div>

      <div className="formdoc__consent" style={{ maxWidth: 520, marginLeft: 0 }}>
        This prescription is only valid when used in conjunction with the matching administration form, in a VitaJab certified pharmacy consultation room and when under the control of a pharmacist or non-pharmacist vaccinator that has declared their competence to provide the service by completing the VitaJab Declaration of Competence process.
      </div>
    </div>
  );
}


