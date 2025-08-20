import React from "react";
import "./B12Template.css";

export default function B12ReferralLetter({ data = {} }){
  const safe = (v) => (v && String(v).trim() !== "" ? v : "\u2014");

  return (
    <div className="formdoc" style={{ pageBreakInside: 'avoid' }}>
      <div className="formdoc__header">
        <img src="/Logo3.png" alt="CarePlus Logo" width={280} />
        <div className="formdoc__title">
          <div className="bold" style={{ fontSize: 14 }}>GP referral letter. Unique ID: {safe(data.uniqueId)}</div>
        </div>
      </div>

      <div className="formdoc__section" style={{ marginTop: 16 }}>
        <p>Dear Sir or Madam,</p>
        <p>We have sent you this notification letter for purposes of updating and maintaining your patient's medical records.</p>
        <p>Your patient detailed below has received a 1mg IM injection of Hydroxocobalamin, on a private basis.</p>
        <p>They have passed a robust medical screen designed by a multi-disciplinary team of healthcare professionals to ensure this was safe and appropriate for them. A member of our prescribing team has verified this information and produced a private prescription for them. An accredited person at the pharmacy detailed below has administered the injection in line with this prescription on behalf of VitaJab.</p>
        <p>Best Regards,</p>
        <p>Care Plus Chemist</p>
      </div>

      <div className="formdoc__section" style={{ textAlign: 'center' }}>
        <div className="row"><div className="row__label">FIRST NAME / SURNAME:</div><div className="row__value"><span>{safe(data.fullName)}</span></div></div>
        <div className="row"><div className="row__label">ADDRESS:</div><div className="row__value"><span>{safe(data.address)}</span></div></div>
        <div className="row"><div className="row__label">TELEPHONE:</div><div className="row__value"><span>{safe(data.telephone)}</span></div></div>
        <div className="row"><div className="row__label">DATE OF BIRTH:</div><div className="row__value"><span>{safe(data.dob)}</span></div></div>
      </div>

      <div className="formdoc__section" style={{ textAlign: 'center' }}>
        <div className="row"><div className="row__label">GP NAME</div><div className="row__value"><span>{safe(data.gpName)}</span></div></div>
        <div className="row"><div className="row__label">GP ADDRESS:</div><div className="row__value"><span>{safe(data.gpAddress)}</span></div></div>
      </div>

      <div className="formdoc__section" style={{ textAlign: 'center' }}>
        <div className="row"><div className="row__label">PHARMACY NAME:</div><div className="row__value"><span>{safe(data.pharmacyName)}</span></div></div>
        <div className="row"><div className="row__label">ADDRESS:</div><div className="row__value"><span>{safe(data.pharmacyAddress)}</span></div></div>
      </div>

      <div className="formdoc__section" style={{ textAlign: 'center' }}>
        <div className="row"><div className="row__label">DATE:</div><div className="row__value"><span>{safe(data.datePharm)}</span></div></div>
        <div className="row"><div className="row__label">DRUG:</div><div className="row__value"><span>{safe(data.drug)}</span></div></div>
        <div className="row"><div className="row__label">DOSAGE:</div><div className="row__value"><span>{safe(data.dose) || "1000mcg"}</span></div></div>
        <div className="row"><div className="row__label">ROUTE:</div><div className="row__value"><span>{safe(data.route) || "I.M"}</span></div></div>
      </div>
    </div>
  );
}


