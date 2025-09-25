import React from "react";
import "./B12Template.css";

export default function B12Template({ data = {} }) {
  const safe = (v) => (v && String(v).trim() !== "" ? v : "\u2014");

  return (
    <div className="formdoc">
      <div className="formdoc__header">
        <img src="/Logo3.png" alt="CarePlus Logo" width={280} />
        <div className="formdoc__title">
          
          <div className="muted" style={{ fontSize: 12 }}>
            Administration form. Unique ID: {safe(data.uniqueId)}<br/>
            For use only with prescription ID: {safe(data.prescriptionId)}
          </div>
        </div>
      </div>

      <div className="formdoc__grid formdoc__grid--mt">
        <div className="formdoc__col">
          <div className="row"><div className="row__label">FIRST NAME / SURNAME:</div><div className="row__value"><span>{safe(data.fullName)}</span></div></div>
          <div className="row"><div className="row__label">ADDRESS:</div><div className="row__value"><span>{safe(data.address)}</span></div></div>
          <div className="row"><div className="row__label">TELEPHONE:</div><div className="row__value"><span>{safe(data.telephone)}</span></div></div>
          <div className="row"><div className="row__label">DATE OF BIRTH:</div><div className="row__value"><span>{safe(data.dob)}</span></div></div>
        </div>
        <div className="formdoc__col">
          <div className="row"><div className="row__label">GP NAME:</div><div className="row__value"><span>{safe(data.gpName)}</span></div></div>
          <div className="row"><div className="row__label">GP ADDRESS:</div><div className="row__value"><span>{safe(data.gpAddress)}</span></div></div>
          <div className="row"><div className="row__label">EMERGENCY CONTACT NAME:</div><div className="row__value"><span>{safe(data.emergencyContact)}</span></div></div>
          <div className="row"><div className="row__label">TELEPHONE:</div><div className="row__value"><span>{safe(data.emergencyPhone)}</span></div></div>
        </div>
      </div>

      <div className="formdoc__section">
        <div className="bold">Reasons for wanting B12 Injection:</div>
        <div className="formdoc__reason">{safe(data.reasonB12)}</div>
      </div>

      <div className="formdoc__consent">
        I consent to the terms and conditions of service. I have read and fully understand the VitaJab pre- administration
        leaflet which outlines the potential risks of a B12 injection. I give consent for the pharmacist or pharmacy
        technician named below to administer the named medicine prescribed by CarePlus Chemist via intramuscular
        injection into the deltoid muscle. I have raised any concerns to the pharmacist prior to administration and feel
        comfortable to proceed.
      </div>

      <div className="formdoc__siggrid">
        <div>
          <div className="label">SIGNATURE:</div>
          <div className="sigbox">
            {data.signaturePatient ? (
              <img src={data.signaturePatient} alt="Patient Signature" className="sigimg" />
            ) : (
              <div className="placeholder">No signature provided</div>
            )}
          </div>
        </div>
        <div>
          <div className="label">DATE:</div>
          <div className="datebox">{safe(data.dateSignedPatient)}</div>
        </div>
      </div>

      <div className="formdoc__grid formdoc__grid--mt">
        <div className="formdoc__col">
          <div className="row"><div className="row__label">PHARMACIST NAME:</div><div className="row__value"><span>{safe(data.pharmacistName)}</span></div></div>
          <div className="row"><div className="row__label">PHARMACIST GPHC:</div><div className="row__value"><span>{safe(data.pharmacistGPhc)}</span></div></div>
          <div className="row"><div className="row__label">PHARMACIST SIGNATURE:</div><div className="row__value row__value--sig">{data.pharmacistSignature ? <img src={data.pharmacistSignature} alt="Pharmacist Signature" className="sigimg" /> : <span className="placeholder">No signature</span>}</div></div>
          <div className="row"><div className="row__label">DATE:</div><div className="row__value"><span>{safe(data.datePharm)}</span></div></div>
          <div className="row"><div className="row__label">DRUG:</div><div className="row__value"><span>{safe(data.drug)}</span></div></div>
          <div className="row"><div className="row__label">INJECTION TYPE:</div><div className="row__value"><span> {safe(data.injectionType)}</span></div></div>
          <div className="row"><div className="row__label">ROUTE:</div><div className="row__value"><span> {safe(data.route)}</span></div></div>
          <div className="row"><div className="row__label">MANUFACTURER:</div><div className="row__value"><span>{safe(data.manufacturer)}</span></div></div>
          <div className="row"><div className="row__label">BATCH NUMBER</div><div className="row__value"><span>{safe(data.batchNumber)}</span></div></div>
          <div className="row"><div className="row__label">EXPIRY:</div><div className="row__value"><span>{safe(data.expiry)}</span></div></div>
        </div>
        <div className="formdoc__col">
          <div className="row"><div className="row__label">PHARMACY NAME:</div><div className="row__value"><span>{safe(data.pharmacyName)}</span></div></div>
          <div className="row"><div className="row__label">ADDRESS:</div><div className="row__value"><span>{safe(data.pharmacyAddress)}</span></div></div>
          <div className="row"><div className="row__label">ADVERSE REACTIONS:</div><div className="row__value"><span>{safe(data.adverseReactions)}</span></div></div>

        </div>
      </div>
    </div>
  );
}
