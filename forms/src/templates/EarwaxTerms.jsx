import React from "react";
import "./EarwaxForms.css";

export default function EarwaxTerms({ data = {} }) {
  return (
    <div className="earwaxdoc earwaxdoc--terms">
      <div className="earwaxdoc__header earwaxdoc__header--center">
        <img src="/Logo3.png" alt="CarePlus Logo" className="earwaxdoc__logo" />
      </div>
      <h2 className="earwaxdoc__title" style={{ textAlign: "center", textDecoration: "underline" }}>
        Terms and Conditions (Patient Must Read This)
      </h2>

      <div className="earwaxdoc__paragraphs">
        <p>
          Microsuction Earwax Removal is a suction that gently vacuums the earwax with the assistance of an Endoscope.
          Low-pressure irrigation may be used to soften the earwax and to assist microsuction. Manual ENT tools can be
          used to gently pry out earwax or foreign objects.
        </p>
        <p>
          Complications of ear wax removal with micro suction, low-pressure irrigation and manual tools are uncommon;
          however possible complications, side-effects and material risks inherent in the procedure include but are not
          limited to: incomplete removal of ear wax requiring a return visit (for severely impacted wax), minor bleeding,
          discomfort, ringing in the ear (tinnitus), perforation of the eardrum and hearing loss.
        </p>
        <p>
          To ensure the risk of complication is minimal, it is essential that accurate past medical history is supplied
          to our clinicians. In addition, it is important that the patient remains relatively still during the procedure
          as sudden movement may significantly increase the risk of ear drum perforation, permanent hearing loss and/or
          bleeding.
        </p>
        <p>
          The CE marked suction unit is to remove fluids from the airway or respiratory support system and infectious
          materials from wounds and has been adapted for aural micro suction. The suction unit is being used off label.
          By agreeing to these terms and conditions you agree that images or videos of the wax removal maybe be used for
          marketing purposes.
        </p>
        <p>
          By agreeing to these terms and conditions you accept that you have read and understand the possible complications
          that may occur and agree that the clinic, or any of its employees, cannot be held responsible for them.
        </p>
        <p>
          I have read and understood the terms and conditions above and am willing to be bound by them.
        </p>
      </div>
    </div>
  );
}


