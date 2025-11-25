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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                    No patients found for tenant: {tenant}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
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
