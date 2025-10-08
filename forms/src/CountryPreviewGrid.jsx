import React from "react";
import COUNTRY_ID_MAP from "./countryIdMap";
import "./CountryPreviewGrid.css";

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[’'´]/g, "") // remove apostrophes
    .replace(/&/g, " and ")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-()]/g, "") // keep () for islands if present
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CountryPreviewGrid({ countries = [] }) {
  if (!countries.length) return null;

  // Dynamic class based on count
  const count = countries.length;
  const gridClass =
    count === 1 ? "one" : count === 2 ? "two" : count === 3 ? "three" : "four";

  return (
    <div className={`country-grid country-grid--${gridClass}`}>
      {countries.map((name) => {
        const id = COUNTRY_ID_MAP[name];
        const slug = slugify(name) || "travel";
        const src = id
          ? `https://travelhealthpro.org.uk/country/${id}/${slug}`
          : `about:blank`;

        return (
          <div className="country-card" key={name}>
            <div className="country-card__title">{name}</div>
            {id ? (
              <iframe
                className="country-card__frame"
                title={name}
                src={src}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="country-card__missing">
                ID not found for “{name}”. Re-run the ID builder script.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
