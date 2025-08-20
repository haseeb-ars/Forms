import React from "react";
import "./EarwaxForms.css";

export default function EarwaxReferralLetter({ data = {} }) {
  const safe = (v) => (v && String(v).trim() !== "" ? v : "\u2014");

  return (
    <div className="earwaxdoc">
      <div className="earwaxdoc__header">
        <img src="/Logo3.png" alt="CarePlus Logo" className="earwaxdoc__logo" />
      </div>

      <div className="earwaxdoc__meta">
        <div>
          <div><strong>Date:</strong> {safe(data.appointmentDate)}</div>
          <div style={{ marginTop: 16 }}><strong>GP address</strong></div>
          <div className="earwaxdoc__block">{safe(data.gpAddress)}</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div><strong>Name of pharmacist/earwax removal clinician</strong></div>
          <div className="earwaxdoc__block">{safe(data.clinicianName)}</div>
          <div style={{ marginTop: 8 }}><strong>Clinic address</strong></div>
          <div className="earwaxdoc__block">{safe(data.clinicAddress)}</div>
        </div>
      </div>

      <div className="earwaxdoc__salutation">Dear Dr {safe(data.gpName)},</div>

      <div className="earwaxdoc__body">
        <p>
          I am requesting an urgent referral to ENT for our mutual client <strong>{safe(data.fullName)}</strong> of {safe(data.address)}, DOB {safe(data.dob)}.
          Otoscopic examination revealed a potential for a cholesteatoma; it does seem to be causing no overt harm to this patient however I would strongly recommend a referral to ENT so this matter can be further investigated for the patient&apos;s wellbeing.
        </p>
      </div>

      <div className="earwaxdoc__image">
        <div>INSERT PICTURE TAKEN FROM YOUR ENDOSCOPE/EAR CAMERA HERE</div>
        {data.entImage ? (
          <img src={data.entImage} alt="Endoscope" className="earwaxdoc__photo" />
        ) : (
          <div className="earwaxdoc__placeholder" />
        )}
      </div>

      <div className="earwaxdoc__signature">
        <div>E signature</div>
        {data.pharmacistSignature ? (
          <img src={data.pharmacistSignature} alt="Signature" className="earwaxdoc__sigimg" />
        ) : (
          <div className="earwaxdoc__sigplaceholder">No signature provided</div>
        )}
      </div>

      <div className="earwaxdoc__closing">
        <p>Kind Regards</p>
        <p>Clinicians name: {safe(data.clinicianName)}</p>
        <p>company name: {safe(data.companyName || "Care Plus Chemist")}</p>
      </div>
    </div>
  );
}


