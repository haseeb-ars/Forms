// src/PatientsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchPatients,
  downloadPatientsXlsx,
  fetchSubmissionByName,
} from "./api";
import { useApp } from "./AppContext.jsx";
import "./PatientsPage.css";

import { downloadPDFsFromSubmission } from "./pdfGenerator.js";
import templates from "./templates";

export default function PatientsPage() {
  const { currentUser } = useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Filter states
  const [searchName, setSearchName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedService, setSelectedService] = useState("");

  /* ----------------------------------------
     Determine tenant
  ----------------------------------------- */
  const tenant = useMemo(() => {
    const n = (currentUser?.name || "").toUpperCase();
    if (n.includes("WILMSLOW")) return "WRP";
    if (n.includes("CAREPLUS")) return "CPC";
    if (n.includes("247")) return "247";
    return "";
  }, [currentUser]);

  /* ----------------------------------------
     Load basic patients table
  ----------------------------------------- */
  useEffect(() => {
    if (!tenant) {
      setError(
        `No tenant found for user: ${currentUser?.name || "Not logged in"}`
      );
      setLoading(false);
      return;
    }

    fetchPatients(tenant)
      .then((data) => setRows(data))
      .catch((err) => setError(`Failed to load: ${err.message}`))
      .finally(() => setLoading(false));
  }, [tenant, currentUser]);

  /* ----------------------------------------
     Filter Logic
  ----------------------------------------- */
  // Auto-extract unique services from the loaded rows
  const uniqueServices = useMemo(() => {
    const services = new Set(rows.map((r) => r.service).filter(Boolean));
    return Array.from(services).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // 1. Name Match
      if (searchName) {
        const nameMatch = (r.name || "").toLowerCase().includes(searchName.toLowerCase());
        if (!nameMatch) return false;
      }

      // 2. Service Match
      if (selectedService && r.service !== selectedService) {
        return false;
      }

      // 3. Date Match
      if (fromDate || toDate) {
        // use created_at (backend) or date (fallback)
        const rowDateStr = r.created_at || r.date;
        if (!rowDateStr) return false;

        const rowDate = new Date(rowDateStr);
        rowDate.setHours(0, 0, 0, 0); // normalize time

        if (fromDate) {
          const fDate = new Date(fromDate);
          fDate.setHours(0, 0, 0, 0);
          if (rowDate < fDate) return false;
        }

        if (toDate) {
          const tDate = new Date(toDate);
          tDate.setHours(0, 0, 0, 0);
          if (rowDate > tDate) return false;
        }
      }

      return true;
    });
  }, [rows, searchName, selectedService, fromDate, toDate]);

  const handleClearFilters = () => {
    setSearchName("");
    setFromDate("");
    setToDate("");
    setSelectedService("");
  };

  /* ----------------------------------------
     PDF Download for each patient row
  ----------------------------------------- */
  const handleDownloadForms = async (row) => {
    try {
      // Look up the saved snapshot in form_submissions
      const result = await fetchSubmissionByName({
        name: row.name,
        dob: row.dob,
        service: row.service,
        tenant,
      });

      if (!result.ok || !result.row) {
        alert("No saved submission for this patient.");
        return;
      }

      const submission = result.row;

      /* ------------------------------
         Match templates to service
         (mirrors PreviewPage)
      ------------------------------- */
      let serviceTabs = [];

      switch (submission.service) {
        case "travel":
          serviceTabs = [
            {
              key: "form",
              Comp: templates.travel,
              pdfName: "travel-form.pdf",
            },
            {
              key: "consult",
              Comp: templates.travelConsultation,
              pdfName: "travel-consultation.pdf",
            },
            {
              key: "rx",
              Comp: templates.prescription,
              pdfName: "travel-prescription.pdf",
            },
          ];
          break;

        case "weightloss":
          serviceTabs = [
            {
              key: "form",
              Comp: templates.weightloss,
              pdfName: "weightloss-form.pdf",
            },
            {
              key: "consult",
              Comp: templates.weightlossConsultation,
              pdfName: "weightloss-consultation.pdf",
            },
            {
              key: "rx",
              Comp: templates.prescription,
              pdfName: "weightloss-prescription.pdf",
            },
          ];
          break;

        case "weightlossFollowup":
          serviceTabs = [
            {
              key: "form",
              Comp: templates.weightlossFollowup,
              pdfName: "weightloss-followup-form.pdf",
            },
            {
              key: "consult",
              Comp: templates.consultation,
              pdfName: "weightloss-followup-consultation.pdf",
            },
            {
              key: "rx",
              Comp: templates.prescription,
              pdfName: "weightloss-followup-prescription.pdf",
            },
          ];
          break;

        case "mmr":
          serviceTabs = [
            { key: "form", Comp: templates.mmr, pdfName: "mmr-form.pdf" },
            { key: "consult", Comp: templates.consultation, pdfName: "mmr-consultation.pdf" },
            { key: "rx", Comp: templates.prescription, pdfName: "mmr-prescription.pdf" },
          ];
          break;


        case "flu":
        case "covid":
        case "b12":
        case "earwax": {
          const formTemplate = templates[submission.service];
          if (!formTemplate) {
            alert(`No templates found for service: ${submission.service}`);
            return;
          }
          serviceTabs = [
            {
              key: "form",
              Comp: formTemplate,
              pdfName: `${submission.service}-form.pdf`,
            },
            {
              key: "consult",
              Comp: templates.consultation,
              pdfName: `${submission.service}-consultation.pdf`,
            },
            {
              key: "rx",
              Comp: templates.prescription,
              pdfName: `${submission.service}-prescription.pdf`,
            },
          ];
          break;
        }

        case "privateprescription":
          serviceTabs = [
            {
              key: "form",
              Comp: templates.privatePrescriptionForm,
              pdfName: "privateprescription-form.pdf",
            },
            {
              key: "consult",
              Comp: templates.privatePrescriptionConsultation,
              pdfName: "privateprescription-consultation.pdf",
            },
            {
              key: "rx",
              Comp: templates.prescription,
              pdfName: "privateprescription-prescription.pdf",
            },
          ];
          break;

        /* ✅ NEW: follow-up prescription service
           Only generates a Prescription PDF using PrescriptionTemplate */
        case "followupprescription":
          serviceTabs = [
            {
              key: "rx",
              Comp: templates.prescription,
              pdfName: "followupprescription-prescription.pdf",
            },
          ];
          break;

        default: {
          const formTemplate = templates[submission.service];
          if (!formTemplate) {
            alert(`No templates found for service: ${submission.service}`);
            return;
          }
          serviceTabs = [
            {
              key: "form",
              Comp: formTemplate,
              pdfName: `${submission.service}-form.pdf`,
            },
          ];
        }
      }

      /* ------------------------------
         Generate PDFs (all tabs)
      ------------------------------- */
      await downloadPDFsFromSubmission(submission, serviceTabs);
    } catch (err) {
      console.error(err);
      alert("Could not download forms.");
    }
  };

  /* ----------------------------------------
     Render
  ----------------------------------------- */
  return (
    <div className="patients">
      <div className="patients__actions">
        <button
          className="btn"
          onClick={() => downloadPatientsXlsx(tenant)}
          disabled={!tenant}
        >
          Download Excel
        </button>
      </div>

      <div className="patients__filters">
        <div className="patients__filter-group">
          <label>Search by Name</label>
          <input
            type="text"
            className="patients__filter-input"
            placeholder="e.g. John"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="patients__filter-group">
          <label>From Date</label>
          <input
            type="date"
            className="patients__filter-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="patients__filter-group">
          <label>To Date</label>
          <input
            type="date"
            className="patients__filter-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="patients__filter-group">
          <label>Service</label>
          <select
            className="patients__filter-input"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">All Services</option>
            {uniqueServices.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>
        </div>
        <button className="patients__filter-clear" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div style={{ color: "red", padding: "1rem", background: "#fee" }}>
          {error}
        </div>
      ) : (
        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>DOB</th>
                <th>Address</th>
                <th>Contact No</th>
                <th>Email</th>
                <th>Service</th>
                <th>Date</th>
                <th>Forms</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                    No matching patients found{rows.length !== 0 ? " for the selected filters." : ` for tenant: ${tenant}`}
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.dob ? String(r.dob).slice(0, 10) : ""}</td>
                    <td>{r.address}</td>
                    <td>{r.contact_no || r.contactNo}</td>
                    <td>{r.email}</td>
                    <td>{r.service}</td>
                    <td>
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString()
                        : r.date}
                    </td>
                    <td>
                      <button
                        className="btn btn--small"
                        onClick={() => handleDownloadForms(r)}
                      >
                        Download Forms
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
