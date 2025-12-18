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
  // Support BrowserRouter (location.search) and HashRouter (? in hash)
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
  const valB = params.get("autodownload"); // allow lowercase
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
    privatePrescriptionConsultation,
    weightLossFollowupConsultation,
  } = useApp();

  const { id } = useParams();
  const location = useLocation();
  const previewRef = useRef();
  const [activeTab, setActiveTab] = useState("form");
  const [savedOnce, setSavedOnce] = useState(false);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  const Template = templates[id] || templates.b12;

  // 🧭 Define service-specific tabs
  const serviceTabs = useMemo(() => {
    switch (id) {
      case "travel":
        return [
          {
            key: "form",
            label: "Form",
            Comp: Template,
            pdfName: "travel-form.pdf",
          },
          {
            key: "consult",
            label: "Consultation",
            Comp: TravelConsultationTemplate,
            pdfName: "travel-consultation.pdf",
          },
          {
            key: "rx",
            label: "Prescription",
            Comp: PrescriptionTemplate,
            pdfName: "travel-prescription.pdf",
          },
        ];
      case "weightloss":
        return [
          {
            key: "form",
            label: "Form",
            Comp: Template,
            pdfName: "weightloss-form.pdf",
          },
          {
            key: "consult",
            label: "Consultation",
            Comp: WeightlossConsultationTemplate,
            pdfName: "weightloss-consultation.pdf",
          },
          {
            key: "rx",
            label: "Prescription",
            Comp: PrescriptionTemplate,
            pdfName: "weightloss-prescription.pdf",
          },
        ];
      case "weightlossFollowup":
        return [
          {
            key: "form",
            label: "Form",
            Comp: Template,
            pdfName: "weightloss-followup-form.pdf",
          },
          {
            key: "consult",
            label: "Consultation",
            Comp: ConsultationTemplate,
            pdfName: "weightloss-followup-consultation.pdf",
          },
          {
            key: "rx",
            label: "Prescription",
            Comp: PrescriptionTemplate,
            pdfName: "weightloss-followup-prescription.pdf",
          },
        ];
      case "flu":
      case "covid":
      case "b12":
      case "earwax":
        return [
          {
            key: "form",
            label: "Form",
            Comp: Template,
            pdfName: `${id}-form.pdf`,
          },
          {
            key: "consult",
            label: "Consultation",
            Comp: ConsultationTemplate,
            pdfName: `${id}-consultation.pdf`,
          },
          {
            key: "rx",
            label: "Prescription",
            Comp: PrescriptionTemplate,
            pdfName: `${id}-prescription.pdf`,
          },
        ];
      case "privateprescription":
        return [
          {
            key: "form",
            label: "Form",
            Comp: PrivatePrescriptionTemplate,
            pdfName: "privateprescription-form.pdf",
          },
          {
            key: "consult",
            label: "Consultation",
            Comp: PrivatePrescriptionConsultationTemplate,
            pdfName: "privateprescription-consultation.pdf",
          },
          {
            key: "rx",
            label: "Prescription",
            Comp: PrescriptionTemplate,
            pdfName: "privateprescription-prescription.pdf",
          },
        ];
      case "mmr":
  return [
    {
      key: "form",
      label: "Form",
      Comp: MMRTemplate,
      pdfName: "mmr-form.pdf",
    },
    {
      key: "consult",
      label: "Consultation",
      Comp: ConsultationTemplate,
      pdfName: "mmr-consultation.pdf",
    },
    {
      key: "rx",
      label: "Prescription",
      Comp: PrescriptionTemplate,
      pdfName: "mmr-prescription.pdf",
    },
  ];


      default:
        return [
          {
            key: "form",
            label: "Form",
            Comp: Template,
            pdfName: `${id}-form.pdf`,
          },
          {
            key: "rx",
            label: "Prescription",
            Comp: PrescriptionTemplate,
            pdfName: `${id}-prescription.pdf`,
          },
        ];
        case "followupprescription":
  return [
    {
      key: "rx",
      label: "Prescription",
      Comp: PrescriptionTemplate,
      pdfName: "follow-up-prescription.pdf",
    },
  ];
    }
  }, [id, Template]);

  const activeTabDef =
    serviceTabs.find((t) => t.key === activeTab) || serviceTabs[0];

  // 🔀 Select correct consultation data
  const currentConsultation = useMemo(() => {
    switch (id) {
      case "travel":
        return travelConsultation;
      case "weightloss":
        return weightLossConsultation;
      case "weightlossFollowup":
        return weightLossFollowupConsultation;
      case "flu":
        return fluConsultation;
      case "covid":
        return covidConsultation;
      case "b12":
        return b12Consultation;
      case "earwax":
        return earwaxConsultation;
      case "privateprescription":
        return privatePrescriptionConsultation;
          case "mmr":
  return mmrConsultation;
      default:

        return {};
    }
  }, [
    id,
    travelConsultation,
    weightLossConsultation,
    weightLossFollowupConsultation,
    fluConsultation,
    covidConsultation,
    b12Consultation,
    earwaxConsultation,
    mmrConsultation,
    privatePrescriptionConsultation,
  ]);

  // 🧩 Merge all relevant data + FORMAT DATES
  const getMergedData = useCallback(() => {
    const safePatient = {
      ...patient,
      gpName: patient.gpName || "",
      gpAddress: patient.gpAddress || "",
    };
    const baseData = { ...safePatient, ...pharm, branch };
    const mergeAll = (consultation) =>
      deepFormatDates({ ...safePatient, ...pharm, ...consultation, ...branch });

    switch (id) {
      case "travel":
        return mergeAll(travelConsultation);
      case "weightloss":
        return mergeAll(weightLossConsultation);
      case "weightlossFollowup":
        return mergeAll(weightLossFollowupConsultation);
      case "flu":
        return mergeAll(fluConsultation);
      case "covid":
        return mergeAll(covidConsultation);
      case "b12":
        return mergeAll(b12Consultation);
      case "earwax":
        return mergeAll(earwaxConsultation);
      case "privateprescription":
        return mergeAll(privatePrescriptionConsultation);
        case "mmr":
  return mergeAll(mmrConsultation);

      default:
        return deepFormatDates(baseData);
    }
  }, [
    id,
    patient,
    pharm,
    branch,
    travelConsultation,
    weightLossConsultation,
    weightLossFollowupConsultation,
    fluConsultation,
    covidConsultation,
    b12Consultation,
    earwaxConsultation,
    mmrConsultation,

    privatePrescriptionConsultation,
  ]);

  // 🧾 Auto-save to backend sheet/db + full submission
  useEffect(() => {
    if (savedOnce) return;

    const tenant =
      (currentUser?.name || "").toUpperCase().includes("WILMSLOW")
        ? "WRP"
        : (currentUser?.name || "").toUpperCase().includes("CAREPLUS")
        ? "CPC"
        : (currentUser?.name || "").toUpperCase().includes("247")
        ? "247"
        : "";

    const row = {
      tenant,
      name: patient.fullName || "",
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
        // 👈 renamed from `meta` to `extraMeta` to match server
        currentUserName: currentUser?.name || "",
        createdAt: new Date().toISOString(),
      },
      // helpful top-level fields for quick filtering (server also derives these from `patient`)
      patient_name: patient.fullName || "",
      dob: patient.dob || null,
      email: patient.email || "",
    };

    const timer = setTimeout(() => {
      (async () => {
        try {
          await Promise.all([
            savePatientRow(row),
            saveFullSubmission(fullPayload),
          ]);
          setSavedOnce(true);
        } catch (e) {
          console.error("autosave error", e);
        }
      })();
    }, 200);

    return () => clearTimeout(timer);
  }, [
    savedOnce,
    currentUser,
    patient,
    id,
    pharm,
    branch,
    currentConsultation,
  ]);

  // 🛠 helper: wait for images (signatures/logos) to load
  const waitForImages = async (container) => {
    const imgs = container.querySelectorAll("img");
    const tasks = [];
    imgs.forEach((img) => {
      if (!img.complete) {
        tasks.push(
          new Promise((res) => {
            img.addEventListener("load", res, { once: true });
            img.addEventListener("error", res, { once: true });
          })
        );
      }
    });
    if (tasks.length) await Promise.all(tasks);
  };

  /** 🧾 Generate PDF (compressed) **/
  const generatePDF = useCallback(
    async (Comp, fileName, extraProps = {}) => {
      const host = document.createElement("div");
      Object.assign(host.style, {
        position: "absolute",
        left: "-99999px",
        top: "0",
        width: "900px",
        background: "#fff",
        padding: "24px",
        zIndex: "-1",
      });
      document.body.appendChild(host);

      const root = createRoot(host);
      const mergedData = getMergedData();
      const { patientF, pharmF, consultF } = formatSlices(
        patient,
        pharm,
        currentConsultation,
        branch
      );

      root.render(
        <AppContext.Provider
          value={{
            patient,
            pharm,
            currentUser,
            branch,
            travelConsultation,
            weightLossConsultation,
            fluConsultation,
            covidConsultation,
            b12Consultation,
            earwaxConsultation,
            mmrConsultation,
            privatePrescriptionConsultation,
            weightLossFollowupConsultation,
          }}
        >
          <Comp
            data={mergedData}
            consultation={consultF}
            pharmacist={pharmF}
            patientForm={patientF}
            pharmacistForm={pharmF}
            consultationData={consultF}
            serviceId={id}
            serviceName={id.toUpperCase()}
            {...extraProps}
          />
        </AppContext.Provider>
      );

      // Let React flush DOM + fonts/images load
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 150));
      await waitForImages(host);

      try {
        // Smaller capture scale keeps layout but reduces file size
        const canvas = await html2canvas(host, {
          scale: 1.25,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        // JPEG with quality ~0.72 saves a lot of space
        const imgData = canvas.toDataURL("image/jpeg", 0.72);

        // Enable PDF stream compression
        const pdf = new jsPDF({
          orientation: "p",
          unit: "pt",
          format: "a4",
          compress: true,
        });

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

        const safeName = patient.fullName
          ? patient.fullName.replace(/\s+/g, "_")
          : "form";
        pdf.save(`${safeName}-${fileName}`);
      } finally {
        try {
          root.unmount();
        } catch {}
        document.body.removeChild(host);
      }
    },
    [
      getMergedData,
      patient,
      pharm,
      branch,
      currentUser,
      currentConsultation,
      travelConsultation,
      weightLossConsultation,
      fluConsultation,
      covidConsultation,
      b12Consultation,
      earwaxConsultation,
      mmrConsultation,

      privatePrescriptionConsultation,
      weightLossFollowupConsultation,
      id,
    ]
  );

  // 📄 Download all PDFs (current service's tabs)
  const downloadPDFs = useCallback(async () => {
    for (const tab of serviceTabs) {
      await generatePDF(tab.Comp, tab.pdfName, { serviceId: id });
    }
  }, [serviceTabs, generatePDF, id]);

  // ✅ Auto-download feature (robust)
  useEffect(() => {
    const params = parseQueryFromLocation(location);
    const shouldAuto = isAutoDownloadOn(params);

    if (shouldAuto && !autoDownloaded) {
      const timer = setTimeout(async () => {
        try {
          await downloadPDFs();
        } catch (err) {
          console.error("Auto PDF download failed:", err);
        } finally {
          setAutoDownloaded(true);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [location, autoDownloaded, downloadPDFs]);

  const getMergedDataMemo = useCallback(
    () => getMergedData(),
    [getMergedData]
  );
  const formatted = useMemo(
    () => formatSlices(patient, pharm, currentConsultation, branch),
    [patient, pharm, currentConsultation, branch]
  );

  // 🖥️ Render
  return (
    <div>
      <h2>Preview</h2>

      <div className="tabs">
        {serviceTabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key ? "tab--active" : ""}`}
            onClick={() => setActiveTab(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div ref={previewRef} style={{ padding: "20px", background: "#fff" }}>
        {activeTabDef && (
          <activeTabDef.Comp
            data={getMergedDataMemo()}
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

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <button className="btn btn--primary" onClick={downloadPDFs}>
          Download as PDF
        </button>
      </div>
    </div>
  );
}
