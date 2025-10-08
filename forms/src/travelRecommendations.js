// travelRecommendations.js
import risksData from "./cdc_travel_risks_clean.json";

// live vaccines (avoid in pregnancy/immunosuppression)
const LIVE_VACCINES = new Set([
  "Yellow Fever",
  "MMR",
  "Varicella",
  "Typhoid (Oral)",
  "Cholera (Oral)"
]);

function normalize(v) {
  const s = v.toLowerCase();
  if (s.includes("covid")) return "COVID-19";
  if (s.includes("typhoid") && !s.includes("oral") && !s.includes("inject")) return "Typhoid";
  if (s.includes("cholera") && !s.includes("oral")) return "Cholera";
  return v;
}

export function buildRecommendations(selectedCountries, { eggAllergy, pregnant, immunosuppressed }) {
  const vaccines = new Set();
  const risks = new Set();

  selectedCountries.forEach((c) => {
    const row = risksData[c];
    if (!row) return;
    (row.vaccines || []).forEach(v => vaccines.add(normalize(v)));
    (row.other_risks || []).forEach(r => risks.add(r));
  });

  const rec = [];
  const caution = [];
  const contra = [];

  Array.from(vaccines).forEach((v) => {
    if ((pregnant || immunosuppressed) && LIVE_VACCINES.has(v)) {
      contra.push(v);
      return;
    }
    if (eggAllergy && (v === "Yellow Fever" || v === "Influenza")) {
      caution.push(v);
      return;
    }
    rec.push(v);
  });

  const uniqSort = (arr) => Array.from(new Set(arr)).sort();
  return {
    recommendedVaccines: uniqSort(rec),
    cautionVaccines:     uniqSort(caution),
    contraindicatedVaccines: uniqSort(contra),
    otherRisks:          uniqSort(Array.from(risks))
  };
}
