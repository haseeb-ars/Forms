import json
import re

# Comprehensive keyword list
VACCINE_KEYWORDS = [
    # Routine
    "Polio", "DTP", "Diphtheria", "Tetanus", "Pertussis",
    "MMR", "Measles", "Mumps", "Rubella",
    "Varicella", "Chickenpox", "Influenza", "Flu", "Shingles", "HPV",
    "Pneumococcal", "Meningococcal",
    # Travel-specific
    "Yellow Fever", "Hepatitis A", "Hepatitis B", "Typhoid", "Cholera",
    "Rabies", "Japanese Encephalitis", "JE", "Tick-borne Encephalitis", "TBE",
    "Meningitis", "Meningitis ACWY", "BCG",
    # COVID
    "COVID"
]

# Normalisation map (maps CDC wording → clean names)
NORMALISE = {
    "Measles-Mumps-Rubella (MMR)": "MMR",
    "Flu (influenza)": "Influenza",
    "Chickenpox (Varicella)": "Varicella",
    "Diphtheria-Tetanus-Pertussis": "DTP",
    "COVID-19 vaccine": "COVID-19",
    "Polio Vaccination for International Travelers": "Polio",
    "Meningococcal ACWY": "Meningitis ACWY",
    "Japanese Encephalitis (JE)": "Japanese Encephalitis",
    "Tick-borne Encephalitis (TBE)": "Tick-borne Encephalitis"
}

def clean_vaccines(vaccine_list):
    cleaned = []
    for item in vaccine_list:
        item_lower = item.lower()
        # Normalise known phrases
        for k, v in NORMALISE.items():
            if k.lower() in item_lower:
                cleaned.append(v)
                break
        else:
            # Check keywords
            for kw in VACCINE_KEYWORDS:
                if kw.lower() in item_lower:
                    cleaned.append(kw)
                    break
    return sorted(set(cleaned))

def clean_other_risks(risks):
    cleaned = []
    for r in risks:
        r = re.sub(r"\s*[-–].*$", "", r)  # strip trailing " - CDC Yellow Book"
        if len(r.split()) <= 4:  # crude filter: keep short disease names
            cleaned.append(r.strip())
    return sorted(set(cleaned))

def main():
    with open("cdc_travel_risks.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    cleaned_data = {}
    for country, info in data.items():
        vaccines = clean_vaccines(info.get("vaccines", []))
        malaria = info.get("malaria", [])
        risks = clean_other_risks(info.get("other_risks", []))

        cleaned_data[country] = {
            "source_url": info.get("source_url"),
            "vaccines": vaccines,
            "malaria": malaria,
            "other_risks": risks
        }

    with open("cdc_travel_risks_clean.json", "w", encoding="utf-8") as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)

    print(f"Cleaned data written to cdc_travel_risks_clean.json ({len(cleaned_data)} countries).")

if __name__ == "__main__":
    main()
