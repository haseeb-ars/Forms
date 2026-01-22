// HolidaysPage.jsx
import React from "react";
import "./HolidaysPage.css";

export default function HolidaysPage() {
  return (
    <div className="holidays-page">
      <iframe
        src="https://holidaytracker.careplushealth.co.uk/"
        title="CarePlus Holiday Tracker"
        className="holidays-iframe"
        frameBorder="0"
        allow="fullscreen"
      />
    </div>
  );
}
