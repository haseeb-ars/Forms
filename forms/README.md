# CDC Travelers' Health → Country Risk JSON (Starter Pack)

This pack contains a one-off scraper to build a destination → risks JSON file from CDC Travelers' Health country pages.

**Why CDC?** Content on CDC websites is generally in the public domain (unless otherwise noted), so you can reproduce it with attribution.

## Files
- `cdc_travel_scraper.py` — Python script using `requests` + `beautifulsoup4`.
- `example_output.json` — Small sample to show the target shape.

## How to run

1. Install dependencies:
   ```bash
   python -m venv .venv && . .venv/bin/activate
   pip install requests beautifulsoup4
   ```

2. Run the scraper:
   ```bash
   python cdc_travel_scraper.py
   ```
   This writes `cdc_travel_risks.json` in the current directory.

Optional arguments:
```bash
# custom output, faster delay (0.5s between requests)
python cdc_travel_scraper.py my_output.json 0.5

# test first 10 countries quickly
python cdc_travel_scraper.py sample.json 0.5 10
```

## Output structure (example)
```json
{
  "India": {
    "source_url": "https://wwwnc.cdc.gov/travel/destinations/traveler/none/india",
    "vaccines": ["Hepatitis A ...", "Typhoid ..."],
    "malaria": ["Risk in many areas ..."],
    "other_risks": ["Dengue ...", "Japanese Encephalitis ..."]
  }
}
```

## Notes & caveats
- CDC pages vary slightly; the scraper uses heuristics. Review and tune selectors if needed.
- Be polite: keep a delay (default 1.0s). Do not hammer the site.
- Keep an attribution note in your app (e.g., “Risk information adapted from CDC Travelers’ Health”).

## License & attribution
- CDC content is generally public domain: https://www.cdc.gov/other/agencymaterials.html
- If you combine with other sources, check their license/terms first.
