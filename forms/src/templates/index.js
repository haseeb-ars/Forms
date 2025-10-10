import TravelTemplate from "./TravelTemplate.jsx";
import FluTemplate from "./FluTemplate.jsx";
import B12Template from "./B12Template.jsx";
import B12ReferralLetter from "./B12ReferralLetter.jsx";
import B12Prescription from "./B12Prescription.jsx";
import EarwaxTemplate from "./EarwaxTemplate.jsx";
import EarwaxReferralLetter from "./EarwaxReferralLetter.jsx";
import EarwaxConsent from "./EarwaxConsent.jsx";
import EarwaxTerms from "./EarwaxTerms.jsx";
import WeightlossTemplate from "./WeightlossTemplate.jsx";
import CovidTemplate from "./CovidTemplate.jsx";
import WeightlossConsultationTemplate from "./WeightLossConsultationTemplate.jsx"; // ✅ new import

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
  weightloss: WeightlossTemplate,
  covid: CovidTemplate,
  weightloss_consultation: WeightlossConsultationTemplate, // ✅ new template export
};

export default templates;
