import time
import json
import re
import sys
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

BASE = "https://wwwnc.cdc.gov"
DEST_LIST_URL = "https://wwwnc.cdc.gov/travel/destinations/list/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; TravelRiskBuilder/1.0; +https://example.com)"
}

def get_soup(url):
    for _ in range(3):
        r = requests.get(url, headers=HEADERS, timeout=20)
        if r.status_code == 200:
            return BeautifulSoup(r.text, "html.parser")
        time.sleep(1.5)
    r.raise_for_status()

def get_destination_links():
    soup = get_soup(DEST_LIST_URL)
    links = []
    for a in soup.select("a"):
        href = a.get("href") or ""
        if href.startswith("/travel/destinations/traveler/") and "study-abroad" not in href:
            links.append(urljoin(BASE, href))
    links = sorted(set(links))
    return links

def clean_text(s):
    return re.sub(r"\s+", " ", s).strip()

def extract_section_text(soup, header_texts):
    results = []
    headers = soup.select("h2, h3")
    for h in headers:
        t = clean_text(h.get_text(" ")).lower()
        if any(ht.lower() in t for ht in header_texts):
            for sib in h.find_all_next():
                if sib.name in ["h2", "h3"] and sib != h:
                    break
                if sib.name in ["ul", "ol"]:
                    for li in sib.select("li"):
                        txt = clean_text(li.get_text(" "))
                        if txt:
                            results.append(txt)
                elif sib.name == "p":
                    txt = clean_text(sib.get_text(" "))
                    if txt:
                        results.append(txt)
    return results

def parse_country(url):
    soup = get_soup(url)
    title_el = soup.select_one("h1")
    if title_el:
        country = clean_text(title_el.get_text(" "))
    else:
        country = url.rstrip("/").split("/")[-1].replace("-", " ").title()

    vaccines = extract_section_text(soup, ["vaccines", "vaccinations", "recommended vaccines"])
    malaria  = extract_section_text(soup, ["malaria"])
    other    = extract_section_text(soup, ["diseases", "health risks", "other health risks", "infections", "avoid bug bites"])

    def uniq(seq):
        seen = set()
        out = []
        for x in seq:
            if x not in seen:
                seen.add(x)
                out.append(x)
        return out

    data = {
        "source_url": url,
        "vaccines": uniq(vaccines),
        "malaria": uniq(malaria),
        "other_risks": uniq(other),
    }
    return country, data

def main(out_path="cdc_travel_risks.json", delay=1.0, max_countries=None):
    links = get_destination_links()
    if max_countries:
        links = links[:int(max_countries)]
    out = {}
    for i, url in enumerate(links, 1):
        try:
            country, data = parse_country(url)
            out[country] = data
            print(f"[{i}/{len(links)}] {country}")
        except Exception as e:
            print(f"ERROR parsing {url}: {e}", file=sys.stderr)
        time.sleep(delay)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {out_path} with {len(out)} countries.")

if __name__ == "__main__":
    out_path = sys.argv[1] if len(sys.argv) > 1 else "cdc_travel_risks.json"
    delay = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
    max_countries = int(sys.argv[3]) if len(sys.argv) > 3 else None
    main(out_path, delay, max_countries)
