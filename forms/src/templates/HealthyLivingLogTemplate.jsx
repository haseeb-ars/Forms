import React from "react";
import { useApp } from "../AppContext.jsx";
import "./HealthyLivingLogTemplate.css";

const SVGVerticalHeader = ({ title, width = 36, height = 135 }) => {
  const yPos = Math.round(width / 2) + 3;
  return (
    <th className="th-vertical" style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px`, height: `${height}px` }}>
      <svg width={width} height={height} className="header-svg">
        <text
          x="-125"
          y={yPos}
          transform="rotate(-90)"
          textAnchor="start"
          className="svg-vertical-text"
        >
          {title}
        </text>
      </svg>
    </th>
  );
};

export default function HealthyLivingLogTemplate({ data = {} }) {
  const { branch, currentUser, healthyLivingLogConsultation } = useApp();

  // Extract entries from props data or context
  const entries =
    data.entries ||
    data.consultationData?.entries ||
    healthyLivingLogConsultation?.entries ||
    [];

  // Ensure at least 10 rows are rendered to preserve exact original grid proportions
  const displayRows = [...entries];
  while (displayRows.length < 10) {
    displayRows.push({
      date: "",
      staffInitials: "",
      nhsNumber: "",
      clinicalLocation: false,
      nonClinicalLocation: false,
      lifestyleAdvice: false,
      otcAdvice: false,
      selfCare: false,
      signposting: false,
      briefDescription: "",
      gpInformed: false,
      recordedInPnr: false,
      outcomeSummary: "",
    });
  }

  const rawBranch =
    branch?.pharmacyName ||
    data.pharmacyName ||
    currentUser?.name ||
    "CarePlus Health Pharmacy";

  const branchName = rawBranch.toUpperCase();

  return (
    <div className="healthy-log-document fixed-landscape-layout">
      {/* Header section with Centered Title & CarePlus Logo + Dynamic Branch */}
      <div className="healthy-doc-header">
        <div className="header-title-container">
          <h1 className="healthy-doc-title">
            Intervention / Healthy Living Advice / Signposting Log
          </h1>
        </div>
        <div className="header-branding-container">
          <img
            src="/Logo3.png"
            alt="CarePlus Health Logo"
            className="careplus-logo"
          />
          <div className="branch-name-display">{branchName}</div>
        </div>
      </div>

      {/* Main Form Table with Fixed Width & Fixed Layout */}
      <table className="healthy-grid-table">
        <colgroup>
          <col style={{ width: "36px" }} />
          <col style={{ width: "36px" }} />
          <col style={{ width: "42px" }} />
          <col style={{ width: "36px" }} />
          <col style={{ width: "36px" }} />
          <col style={{ width: "36px" }} />
          <col style={{ width: "36px" }} />
          <col style={{ width: "36px" }} />
          <col style={{ width: "36px" }} />
          <col style={{ width: "500px" }} />
          <col style={{ width: "36px" }} />
          <col style={{ width: "36px" }} />
          <col style={{ width: "156px" }} />
        </colgroup>
        <thead>
          <tr>
            <SVGVerticalHeader title="Date" width={36} height={135} />
            <SVGVerticalHeader title="Staff Initials" width={36} height={135} />
            <SVGVerticalHeader title="NHS Number" width={42} height={135} />
            <SVGVerticalHeader title="Clinical Location" width={36} height={135} />
            <SVGVerticalHeader title="Non-Clinical Location" width={36} height={135} />
            <SVGVerticalHeader title="Lifestyle Advice" width={36} height={135} />
            <SVGVerticalHeader title="OTC Advice" width={36} height={135} />
            <SVGVerticalHeader title="Self-Care" width={36} height={135} />
            <SVGVerticalHeader title="Signposting" width={36} height={135} />

            {/* Central Wide Column with Guidance Text */}
            <th className="th-horizontal col-description" style={{ width: "500px", minWidth: "500px", maxWidth: "500px", height: "135px" }}>
              <div className="desc-header-title">Brief Description:</div>
              <div className="desc-header-guidance">
                Things to Record: Advice given / Signposted to whom / Brief Description of Event / Lifestyle advice Given / OTC item recommended, etc. This List is not Exhaustive.
              </div>
              <div className="desc-header-example">
                Technical rescue group High Risk Infectious Patient discharged from hospital; respiratory disease and cardiovascular disease.
              </div>
            </th>

            <SVGVerticalHeader title="GP Informed" width={36} height={135} />
            <SVGVerticalHeader title="Recorded in PNR" width={36} height={135} />
            <SVGVerticalHeader title="Outcome / Summary" width={156} height={135} />
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, idx) => (
            <tr key={idx} className="grid-row">
              <td className="cell-center col-date">{row.date || ""}</td>
              <td className="cell-center col-staff">{row.staffInitials || ""}</td>
              <td className="cell-center col-nhs">{row.nhsNumber || ""}</td>
              <td className="cell-center col-clin">
                {row.clinicalLocation ? "✓" : row.clinicalLocationText || ""}
              </td>
              <td className="cell-center col-nonclin">
                {row.nonClinicalLocation ? "✓" : row.nonClinicalLocationText || ""}
              </td>
              <td className="cell-center col-lifestyle">
                {row.lifestyleAdvice ? "✓" : row.lifestyleAdviceText || ""}
              </td>
              <td className="cell-center col-otc">
                {row.otcAdvice ? "✓" : row.otcAdviceText || ""}
              </td>
              <td className="cell-center col-selfcare">
                {row.selfCare ? "✓" : row.selfCareText || ""}
              </td>
              <td className="cell-center col-signpost">
                {row.signposting ? "✓" : row.signpostingText || ""}
              </td>
              <td className="cell-left cell-desc col-description">{row.briefDescription || ""}</td>
              <td className="cell-center col-gp">
                {row.gpInformed ? "✓" : row.gpInformedText || ""}
              </td>
              <td className="cell-center col-pnr">
                {row.recordedInPnr ? "✓" : row.recordedInPnrText || ""}
              </td>
              <td className="cell-left col-outcome">{row.outcomeSummary || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
