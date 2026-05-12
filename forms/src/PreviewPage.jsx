// src/PreviewPage.jsx
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { useApp, AppContext } from "./AppContext.jsx";
import templates from "./templates";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./PreviewPage.css";
import { savePatientRow, saveFullSubmission } from "./api";


// 🧩 Template Imports
import TravelConsultationTemplate from "./templates/TravelConsultationTemplate.jsx";
import WeightlossConsultationTemplate from "./templates/WeightLossConsultationTemplate.jsx";
import PrescriptionTemplate from "./templates/PrescriptionTemplate.jsx";
import ConsultationTemplate from "./templates/ConsultationTemplate.jsx";
import PrivatePrescriptionConsultationTemplate from "./templates/PrivatePrescriptionConsultationTemplate.jsx";
import PrivatePrescriptionTemplate from "./templates/PrivatePrescriptionTemplate.jsx";
import MMRTemplate from "./templates/MMRTemplate.jsx";
import MeningitisTemplate from "./templates/MeningitisTemplate.jsx";
import ContraceptionTemplate from "./templates/ContraceptionTemplate.jsx";
import ContraceptionConsultationTemplate from "./templates/ContraceptionConsultationTemplate.jsx";
import ACWYCertificateTemplate from "./templates/ACWYCertificateTemplate.jsx";


/* -------------------------------
   Date helpers
---------------------------------- */

function formatDate(value) {
  if (!value) return "—";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.split("-").map((v) => v.trim());
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
}

function deepFormatDates(input) {
  if (Array.isArray(input)) return input.map((i) => deepFormatDates(i));
  if (input && typeof input === "object") {
    const out = {};
    for (const [k, v] of Object.entries(input)) {
      const lower = k.toLowerCase();
      const looksLikeDateKey =
        lower === "dob" ||
        lower.includes("date") ||
        lower.includes("expiry") ||
        lower.includes("expire") ||
        /^exp(ir(y|ation)?)?$/.test(lower);
      out[k] =
        looksLikeDateKey && (typeof v === "string" || v instanceof Date)
          ? formatDate(v)
          : deepFormatDates(v);
    }
    return out;
  }
  return input;
}

const formatSlices = (patient, pharm, consultation, branch) => ({
  patientF: deepFormatDates(patient),
  pharmF: deepFormatDates(pharm),
  consultF: deepFormatDates(consultation),
  branchF: deepFormatDates(branch),
});

/* -------------------------------
   Query helpers (robust autodownload)
---------------------------------- */
function parseQueryFromLocation(locationObj) {
  const search = locationObj?.search || "";
  const hash = locationObj?.hash || "";
  let qs = search;
  if (!qs && hash.includes("?")) {
    qs = hash.slice(hash.indexOf("?"));
  }
  return new URLSearchParams(qs);
}

function isAutoDownloadOn(params) {
  const valA = params.get("autoDownload");
  const valB = params.get("autodownload");
  const val = (valA ?? valB ?? "").toString().toLowerCase();
  return val === "true" || val === "1" || val === "yes";
}

/* -------------------------------
   Component
---------------------------------- */

export default function PreviewPage() {
  const {
    patient,
    pharm,
    currentUser,
    branch,
    travelConsultation,
    weightLossConsultation,
    earwaxConsultation,
    covidConsultation,
    b12Consultation,
    fluConsultation,
    mmrConsultation,
    meningitisConsultation,
    perioddelayConsultation,
    privatePrescriptionConsultation,
    weightLossFollowupConsultation,
    contraceptionConsultation,
    travelFollowUpOriginalData,
    weightLossFollowupOriginalData,
  } = useApp();

  const { id } = useParams();
  const location = useLocation();
  const previewRef = useRef();
  const [activeTab, setActiveTab] = useState("form");
  const [savedOnce, setSavedOnce] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "success" | "error"
  const [saveError, setSaveError] = useState("");
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  const Template = templates[id] || templates.b12;

  const serviceTabs = useMemo(() => {
    switch (id) {
      case "travel":
        return [
          { key: "form", label: "Form", Comp: Template, pdfName: "travel-form.pdf" },
          { key: "consult", label: "Consultation", Comp: TravelConsultationTemplate, pdfName: "travel-consultation.pdf" },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: "travel-prescription.pdf" },
        ];
      case "travelFollowUp":
        return [
          { key: "form", label: "Original Form", Comp: templates.travel, pdfName: "travel-follow-up-form.pdf" },
          { key: "consult", label: "Original Consultation", Comp: templates.travelConsultation, pdfName: "travel-follow-up-consultation.pdf" },
          { key: "rx", label: "Travel Follow Up Prescription", Comp: templates.travelFollowUp, pdfName: "travel-follow-up-prescription.pdf" },
        ];
      case "weightloss":
        return [
          { key: "form", label: "Form", Comp: Template, pdfName: "weightloss-form.pdf" },
          { key: "consult", label: "Consultation", Comp: WeightlossConsultationTemplate, pdfName: "weightloss-consultation.pdf" },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: "weightloss-prescription.pdf" },
        ];
      case "weightlossFollowup":
        return [
          { key: "form", label: "Original Form", Comp: templates.weightloss, pdfName: "weightloss-followup-form.pdf" },
          { key: "consult", label: "Original Consultation", Comp: templates.weightlossConsultation, pdfName: "weightloss-followup-consultation.pdf" },
          { key: "rx", label: "Weight Loss Follow Up Prescription", Comp: templates.weightlossFollowup, pdfName: "weightloss-followup-prescription.pdf" },
        ];
      case "flu":
      case "covid":
      case "b12":
      case "earwax":
        return [
          { key: "form", label: "Form", Comp: Template, pdfName: `${id}-form.pdf` },
          { key: "consult", label: "Consultation", Comp: ConsultationTemplate, pdfName: `${id}-consultation.pdf` },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: `${id}-prescription.pdf` },
        ];
      case "privateprescription":
        return [
          { key: "form", label: "Form", Comp: PrivatePrescriptionTemplate, pdfName: "privateprescription-form.pdf" },
          { key: "consult", label: "Consultation", Comp: PrivatePrescriptionConsultationTemplate, pdfName: "privateprescription-consultation.pdf" },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: "privateprescription-prescription.pdf" },
        ];
      case "perioddelay":
        return [
          { key: "form", label: "Form", Comp: Template, pdfName: "perioddelay-form.pdf" },
          { key: "consult", label: "Consultation", Comp: ConsultationTemplate, pdfName: "perioddelay-consultation.pdf" },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: "perioddelay-prescription.pdf" },
        ];
      case "mmr":
        return [
          { key: "form", label: "Form", Comp: MMRTemplate, pdfName: "mmr-form.pdf" },
          { key: "consult", label: "Consultation", Comp: ConsultationTemplate, pdfName: "mmr-consultation.pdf" },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: "mmr-prescription.pdf" },
        ];
      case "meningitis":
        return [
          { key: "form", label: "Form", Comp: MeningitisTemplate, pdfName: "meningitis-form.pdf" },
          { key: "consult", label: "Consultation", Comp: ConsultationTemplate, pdfName: "meningitis-consultation.pdf" },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: "meningitis-prescription.pdf" },
          { key: "acwy-cert", label: "ACWY Certificate", Comp: ACWYCertificateTemplate, pdfName: "acwy-certificate.pdf" },
        ];
      case "contraception":
        return [
          { key: "form", label: "Form", Comp: ContraceptionTemplate, pdfName: "contraception-form.pdf" },
          { key: "consult", label: "Consultation", Comp: ContraceptionConsultationTemplate, pdfName: "contraception-consultation.pdf" },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: "contraception-prescription.pdf" },
        ];
      case "followupprescription":
        return [
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: "follow-up-prescription.pdf" },
        ];
      default:
        return [
          { key: "form", label: "Form", Comp: Template, pdfName: `${id}-form.pdf` },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: `${id}-prescription.pdf` },
        ];
    }
  }, [id, Template]);

  const activeTabDef = serviceTabs.find((t) => t.key === activeTab) || serviceTabs[0];

  const currentConsultation = useMemo(() => {
    switch (id) {
      case "travel": return travelConsultation;
      case "weightloss": return weightLossConsultation;
      case "weightlossFollowup": return weightLossFollowupConsultation;
      case "flu": return fluConsultation;
      case "covid": return covidConsultation;
      case "b12": return b12Consultation;
      case "earwax": return earwaxConsultation;
      case "privateprescription": return privatePrescriptionConsultation;
      case "mmr": return mmrConsultation;
      case "meningitis": return meningitisConsultation;
      case "perioddelay": return perioddelayConsultation;
      case "contraception": return contraceptionConsultation;
      case "travelFollowUp": return travelFollowUpOriginalData?.consultation_data || {};
      default: return {};
    }
  }, [
    id, travelConsultation, weightLossConsultation, weightLossFollowupConsultation,
    fluConsultation, covidConsultation, b12Consultation, earwaxConsultation,
    mmrConsultation, meningitisConsultation, perioddelayConsultation,
    privatePrescriptionConsultation, contraceptionConsultation, travelFollowUpOriginalData?.consultation_data,
  ]);

  const getMergedData = useCallback(() => {
    const safePatient = { ...patient, gpName: patient.gpName || "", gpAddress: patient.gpAddress || "" };
    const mergeAll = (consult) => deepFormatDates({ ...safePatient, ...pharm, ...consult, ...branch });

    switch (id) {
      case "travel": return mergeAll(travelConsultation);
      case "weightloss": return mergeAll(weightLossConsultation);
      case "weightlossFollowup": return mergeAll(weightLossFollowupConsultation);
      case "flu": return mergeAll(fluConsultation);
      case "covid": return mergeAll(covidConsultation);
      case "b12": return mergeAll(b12Consultation);
      case "earwax": return mergeAll(earwaxConsultation);
      case "privateprescription": return mergeAll(privatePrescriptionConsultation);
      case "mmr": return mergeAll(mmrConsultation);
      case "meningitis": return mergeAll(meningitisConsultation);
      case "perioddelay": return mergeAll(perioddelayConsultation);
      case "contraception": return mergeAll(contraceptionConsultation);
      case "travelFollowUp": {
        const pData = travelFollowUpOriginalData?.patient_data || {};
        const rxData = travelFollowUpOriginalData?.pharmacist_data || {};
        const cData = travelFollowUpOriginalData?.consultation_data || {};
        return deepFormatDates({ ...pData, ...cData, ...rxData, ...pharm, original_consultation_id: pData.id, branch });
      }
      default: return deepFormatDates({ ...safePatient, ...pharm, ...branch });
    }
  }, [
    id, patient, pharm, branch, travelConsultation, weightLossConsultation,
    weightLossFollowupConsultation, fluConsultation, covidConsultation,
    b12Consultation, earwaxConsultation, mmrConsultation, meningitisConsultation,
    perioddelayConsultation, privatePrescriptionConsultation, contraceptionConsultation,
    travelFollowUpOriginalData,
  ]);

  const performSave = useCallback(async () => {
    if (saveStatus === "saving" || saveStatus === "success") return;
    setSaveStatus("saving");
    setSaveError("");

    const tenant = (currentUser?.name || "").toUpperCase().includes("WILMSLOW") ? "WRP"
      : (currentUser?.name || "").toUpperCase().includes("CAREPLUS") ? "CPC"
      : (currentUser?.name || "").toUpperCase().includes("247") ? "247" : "";

    const fullName = patient.fullName || [patient.firstName, patient.surname].filter(Boolean).join(" ") || "";
    
    // 🛡️ Defensive Check: Prevent empty payloads
    if (!patient.fullName && !(patient.firstName && patient.surname)) {
      setSaveStatus("error");
      setSaveError("Patient name is missing. Cannot save consultation.");
      return;
    }

    const row = {
      tenant,
      name: fullName,
      dob: patient.dob || "",
      address: patient.address || "",
      contactNo: patient.telephone || "",
      email: patient.email || "",
      service: id,
      date: new Date().toISOString(),
    };

    const fullPayload = {
      tenant,
      service: id,
      patient,
      pharm,
      consultation: currentConsultation || {},
      branch,
      extraMeta: {
        currentUserName: currentUser?.name || "",
        createdAt: new Date().toISOString(),
      },
      patient_name: fullName,
      dob: patient.dob || null,
      email: patient.email || "",
    };

    console.log("[PreviewPage] Starting save sequence...", { service: id, patient: fullName });
    try {
      // 1. Save Patient Row
      await savePatientRow(row);
      console.log("[PreviewPage] Patient row saved.");

      // 2. Save Full Submission
      const submissionResult = await saveFullSubmission(fullPayload);
      console.log("[PreviewPage] Full submission saved.", submissionResult);

      // 3. 🔍 Verification Step: Confirm the record exists
      console.log("[PreviewPage] Verifying save...");
      // The server response usually includes the row/id. If not, we could re-fetch.
      if (submissionResult && (submissionResult.ok || submissionResult.id)) {
        console.log("[PreviewPage] Save verified successfully.");
        setSaveStatus("success");
        setSavedOnce(true);
      } else {
        throw new Error("Save completed but verification failed (no record ID returned).");
      }
    } catch (err) {
      console.error("[PreviewPage] Save failed during execution or verification:", err);
      setSaveStatus("error");
      setSaveError(err.message || "Failed to persist consultation.");
    }
  }, [saveStatus, currentUser, patient, id, pharm, branch, currentConsultation]);

  useEffect(() => {
    if (savedOnce || saveStatus !== "idle") return;
    const timer = setTimeout(() => performSave(), 600);
    return () => clearTimeout(timer);
  }, [savedOnce, saveStatus, performSave]);

  // 🛡️ Navigation Protection: Warn user if leaving during save
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  const waitForImages = async (container) => {
    const imgs = container.querySelectorAll("img");
    const tasks = Array.from(imgs).filter(img => !img.complete).map(img => 
      new Promise(res => {
        img.addEventListener("load", res, { once: true });
        img.addEventListener("error", res, { once: true });
      })
    );
    if (tasks.length) await Promise.all(tasks);
  };

  const generatePDF = useCallback(async (Comp, fileName, extraProps = {}) => {
    const isACWY = fileName.includes("acwy-certificate");
    const host = document.createElement("div");
    Object.assign(host.style, {
      position: "absolute", left: "-99999px", top: "0",
      width: isACWY ? "680px" : "900px",
      background: "#fff", padding: isACWY ? "0" : "24px", zIndex: "-1",
    });
    document.body.appendChild(host);

    const root = createRoot(host);
    const mergedData = getMergedData();
    const { patientF, pharmF, consultF } = formatSlices(patient, pharm, currentConsultation, branch);

    root.render(
      <AppContext.Provider value={{
        patient, pharm, currentUser, branch, travelConsultation, weightLossConsultation,
        fluConsultation, covidConsultation, b12Consultation, earwaxConsultation, mmrConsultation,
        meningitisConsultation, perioddelayConsultation, privatePrescriptionConsultation,
        contraceptionConsultation, weightLossFollowupConsultation, travelFollowUpOriginalData, weightLossFollowupOriginalData,
      }}>
        <Comp
          data={mergedData} consultation={consultF} pharmacist={pharmF}
          patientForm={patientF} pharmacistForm={pharmF} consultationData={consultF}
          serviceId={id} serviceName={id.toUpperCase()} isPDF={isACWY} {...extraProps}
        />
      </AppContext.Provider>
    );

    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => setTimeout(r, 200));
    await waitForImages(host);

    try {
      const canvas = await html2canvas(host, { scale: isACWY ? 2.5 : 1.25, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/jpeg", isACWY ? 1.0 : 0.72);
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4", compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = pdfWidth / canvas.width;
      const scaledHeight = canvas.height * ratio;

      let heightLeft = scaledHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
      }
      const pName = patient.fullName || [patient.firstName, patient.surname].filter(Boolean).join(" ");
      const safeName = pName ? pName.replace(/\s+/g, "_") : "form";
      pdf.save(`${safeName}-${fileName}`);
    } finally {
      try { root.unmount(); } catch { }
      document.body.removeChild(host);
    }
  }, [getMergedData, patient, pharm, branch, currentUser, currentConsultation, id, travelConsultation, weightLossConsultation, fluConsultation, covidConsultation, b12Consultation, earwaxConsultation, mmrConsultation, meningitisConsultation, perioddelayConsultation, privatePrescriptionConsultation, contraceptionConsultation, weightLossFollowupConsultation, travelFollowUpOriginalData, weightLossFollowupOriginalData]);

  const downloadPDFs = useCallback(async () => {
    for (const tab of serviceTabs) {
      await generatePDF(tab.Comp, tab.pdfName, { serviceId: id });
    }
  }, [serviceTabs, generatePDF, id]);

  useEffect(() => {
    const params = parseQueryFromLocation(location);
    if (isAutoDownloadOn(params) && !autoDownloaded) {
      const timer = setTimeout(async () => {
        try { await downloadPDFs(); } catch (err) { console.error("Auto PDF failed:", err); }
        finally { setAutoDownloaded(true); }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location, autoDownloaded, downloadPDFs]);

  const formatted = useMemo(() => formatSlices(patient, pharm, currentConsultation, branch), [patient, pharm, currentConsultation, branch]);

  return (
    <div className="preview-page">
      <div className="preview-header">
        <h2>Consultation Preview</h2>
        
        <div className={`save-badge save-badge--${saveStatus}`}>
          {saveStatus === "saving" && "⏳ Saving consultation..."}
          {saveStatus === "success" && "✅ Consultation saved to database"}
          {saveStatus === "error" && (
            <div className="save-error-content">
              <span>❌ Save Failed: {saveError}</span>
              <button className="btn btn--small" onClick={performSave}>Retry Save</button>
            </div>
          )}
        </div>
      </div>

      <div className="tabs">
        {serviceTabs.map((t) => (
          <button key={t.key} className={`tab ${activeTab === t.key ? "tab--active" : ""}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div ref={previewRef} className="preview-container">
        {activeTabDef && (
          <activeTabDef.Comp
            data={getMergedData()}
            consultation={formatted.consultF}
            pharmacist={formatted.pharmF}
            patientForm={formatted.patientF}
            pharmacistForm={formatted.pharmF}
            consultationData={formatted.consultF}
            serviceId={id}
            serviceName={id.toUpperCase()}
          />
        )}
      </div>

      <div className="preview-actions">
        <button 
          className="btn btn--primary" 
          onClick={downloadPDFs}
          disabled={saveStatus === "saving"}
        >
          {saveStatus === "saving" ? "Please wait..." : "Download as PDF"}
        </button>

        {saveStatus === "error" && (
          <p className="error-text">Please ensure the consultation is saved before leaving this page.</p>
        )}
      </div>
    </div>
  );
}
