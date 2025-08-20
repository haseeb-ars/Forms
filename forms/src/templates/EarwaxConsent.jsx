import React from "react";
import "./EarwaxForms.css";

export default function EarwaxConsent({ data = {} }) {
  const val = (v) => (v ?? "");
  const yn = (v) => (v === "Yes" ? "Yes" : v === "No" ? "No" : "");

  return (
    <div className="earwaxdoc">
      <div className="earwaxdoc__header earwaxdoc__header--center">
        <img src="/Logo3.png" alt="CarePlus Logo" className="earwaxdoc__logo" />
      </div>
      <h1 className="earwaxdoc__title">Micro Suction Wax Removal Consent</h1>
      <h3>16 years +</h3>

      <div className="earwaxdoc__paragraphs">
        <p>
          The purpose of micro suction is to safely remove any wax or foreign bodies present within the ear canal. To
          ensure this process is safely carried out it is important that the clinician is made aware of anything which may
          have a bearing on the procedure.
        </p>
        <p>
          To make the procedure more comfortable and effective, it's essential to soften the wax beforehand. We recommend
          using olive oil in your ear two to three times a day for at least five days before your appointment. Apply
          enough oil until it overflows and leave it in for at least five minutes. This will make the wax easier to
          remove.
        </p>
        <p>Please confirm that you will do this</p>
      </div>

      <h3 className="earwaxdoc__subtitle">
        Please answer these questions regarding your hearing health, ticking the relevant box:
      </h3>

      <div className="earwaxdoc__qa">
        <div className="earwaxdoc__q"><span>Do you suffer from any condition that causes balance problems or vertigo attacks?</span><strong>{yn(data.qBalanceIssues)}</strong></div>
        <div className="earwaxdoc__q"><span>Have you had a vertigo (Rotational Dizziness) attack within the last 30 days?</span><strong>{yn(data.qRecentVertigo)}</strong></div>
        <div className="earwaxdoc__q"><span>Have you suffered from any pain in your ears within the last 30 days?</span><strong>{yn(data.qEarPain)}</strong></div>
        <div className="earwaxdoc__q"><span>Do you have a perforated ear drum?</span><strong>{yn(data.qPerforated)}</strong></div>
        <div className="earwaxdoc__q earwaxdoc__q--sub"><span>If "Yes", which ear?</span><strong>{val(data.qPerforatedEar)}</strong> &nbsp; <span>How long ago?</span> <strong>{val(data.qPerforatedYears)} Year(s) {val(data.qPerforatedMonths)} Month(s)</strong></div>
        <div className="earwaxdoc__q"><span>Have you tried to remove the wax yourself?</span><strong>{yn(data.qTriedYourself)}</strong></div>
        <div className="earwaxdoc__q"><span>Have you had any previous operations on your ears, nose or throat?</span><strong>{yn(data.qPreviousOperations)}</strong></div>
        <div className="earwaxdoc__q earwaxdoc__q--sub"><span>If "Yes", which ear?</span><strong>{val(data.qOperationEar)}</strong> &nbsp; <span>How long ago?</span> <strong>{val(data.qOperationYears)} Year(s) {val(data.qOperationMonths)} Month(s)</strong></div>
        <div className="earwaxdoc__q"><span>Are you currently under an ENT Consultant or receiving treatment regarding your ears?</span><strong>{yn(data.qUnderENT)}</strong></div>
        <div className="earwaxdoc__q"><span>Are you using anticoagulants (Blood thinning medication), e.g. Warfarin?</span><strong>{yn(data.qAnticoagulants)}</strong></div>
        <div className="earwaxdoc__q"><span>Are you aware of any reason as to why you should not proceed with micro suction?</span><strong>{yn(data.qAnyReason)}</strong></div>
        <div className="earwaxdoc__q"><span>Have you had wax removed from your ears previously?</span><strong>{yn(data.qWaxRemovedBefore)}</strong></div>
        <div className="earwaxdoc__q"><span>Do you use cotton buds?</span><strong>{yn(data.qCottonBuds)}</strong></div>
      </div>

      <h3 className="earwaxdoc__subtitle">We are governed by these terms and conditions</h3>
      <div className="earwaxdoc__paragraphs">
        <p>
          Wax removal via micro suction is considered safer than other methods. Complications of ear wax removal with
          micro suction are uncommon; however possible complications, side-effects and material risks inherent in the
          procedure include but are not limited to: incomplete removal of ear wax requiring a return visit (for severely
          impacted wax), minor bleeding, discomfort, ringing in the ear (tinnitus), perforation of the ear drum and
          hearing loss and/or bleeding.
        </p>
        <p>
          To ensure the risk of complication is minimal, it is essential that accurate past medical history is supplied
          to our clinicians. In addition, it is important that the patient remains relatively still during the procedure
          as sudden movement may significantly increase the risk of ear drum perforation, permanent hearing loss and/or
          bleeding. The CE marked suction unit is to remove fluids from the airway or respiratory support system and
          infectious materials from wounds and has been adapted for aural micro suction. The suction unit is being used
          off label. By agreeing to these terms and conditions you agree that images or videos of the wax removal maybe
          used for marketing purposes.
        </p>
        <p>
          By agreeing to these terms and conditions you accept that you have read and understand the possible
          complications that may occur and agree that Clear Clinics, or any of its employees, cannot be held responsible
          for them.
        </p>
      </div>

      <div className="earwaxdoc__details">
        <div><strong>Name:</strong> {val(data.fullName)}</div>
        <div><strong>DOB:</strong> {val(data.dob)}</div>
        <div><strong>Signature:</strong> {data.signaturePatient ? (<img src={data.signaturePatient} alt="Patient Signature" className="earwaxdoc__sigimg" />) : (<span>____________________________</span>)}</div>
        <div><strong>Address:</strong> {val(data.address)}</div>
        <div><strong>Post Code:</strong> {val(data.postcode)}</div>
      </div>
    </div>
  );
}


