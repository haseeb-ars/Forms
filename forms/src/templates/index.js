import TravelTemplate from "./TravelTemplate.jsx";
import FluTemplate from "./FluTemplate.jsx";
import B12Template from "./B12Template.jsx";
import B12ReferralLetter from "./B12ReferralLetter.jsx";
import B12Prescription from "./B12Prescription.jsx";
import EarwaxTemplate from "../templates/EarwaxTemplate.jsx";
import EarwaxReferralLetter from "../templates/EarwaxReferralLetter.jsx";
import EarwaxConsent from "../templates/EarwaxConsent.jsx";
import EarwaxTerms from "../templates/EarwaxTerms.jsx";

const templates = {
  travel: TravelTemplate,
  flu: FluTemplate,
  b12: B12Template,
  b12_referral: B12ReferralLetter,
  b12_prescription: B12Prescription,
  earwax: EarwaxTemplate,
  earwax_referral: EarwaxReferralLetter,
  earwax_consent: EarwaxConsent,
  earwax_terms: EarwaxTerms,
};

export default templates;
