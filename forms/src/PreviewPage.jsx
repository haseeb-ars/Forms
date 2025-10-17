// src/PreviewPage.jsx
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { useApp, AppContext } from "./AppContext.jsx";
import templates from "./templates";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import "./PreviewPage.css";
import { savePatientRow } from "./api";
import ReactDOMServer from "react-dom/server";

// 🧩 Template Imports
import TravelConsultationTemplate from "./templates/TravelConsultationTemplate.jsx";
import WeightlossConsultationTemplate from "./templates/WeightLossConsultationTemplate.jsx";
import PrescriptionTemplate from "./templates/PrescriptionTemplate.jsx";
import ConsultationTemplate from "./templates/ConsultationTemplate.jsx";

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
            xlsxName: "travel-form.xlsx",
          },
          {
            key: "consult",
            label: "Consultation",
            Comp: TravelConsultationTemplate,
            pdfName: "travel-consultation.pdf",
            xlsxName: "travel-consultation.xlsx",
          },
          {
            key: "rx",
            label: "Prescription",
            Comp: PrescriptionTemplate,
            pdfName: "travel-prescription.pdf",
            xlsxName: "travel-prescription.xlsx",
          },
        ];

      case "weightloss":
        return [
          {
            key: "form",
            label: "Form",
            Comp: Template,
            pdfName: "weightloss-form.pdf",
            xlsxName: "weightloss-form.xlsx",
          },
          {
            key: "consult",
            label: "Consultation",
            Comp: WeightlossConsultationTemplate,
            pdfName: "weightloss-consultation.pdf",
            xlsxName: "weightloss-consultation.xlsx",
          },
          {
            key: "rx",
            label: "Prescription",
            Comp: PrescriptionTemplate,
            pdfName: "weightloss-prescription.pdf",
            xlsxName: "weightloss-prescription.xlsx",
          },
        ];

      // ✅ Shared consultation template for Flu, Covid, B12, Earwax
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
            xlsxName: `${id}-form.xlsx`,
          },
          {
            key: "consult",
            label: "Consultation",
            Comp: ConsultationTemplate,
            pdfName: `${id}-consultation.pdf`,
            xlsxName: `${id}-consultation.xlsx`,
          },
          {
            key: "rx",
            label: "Prescription",
            Comp: PrescriptionTemplate,
            pdfName: `${id}-prescription.pdf`,
            xlsxName: `${id}-prescription.xlsx`,
          },
        ];

      default:
        return [
          {
            key: "form",
            label: "Form",
            Comp: Template,
            pdfName: `${id}-form.pdf`,
            xlsxName: `${id}-form.xlsx`,
          },
          {
            key: "rx",
            label: "Prescription",
            Comp: PrescriptionTemplate,
            pdfName: `${id}-prescription.pdf`,
            xlsxName: `${id}-prescription.xlsx`,
          },
        ];
    }
  }, [id, Template]);

  const activeTabDef =
    serviceTabs.find((t) => t.key === activeTab) || serviceTabs[0];

  // 🧾 Auto-save patient row
  useEffect(() => {
    if (savedOnce) return;
    const row = {
      tenant: (currentUser?.name || "").toUpperCase().includes("WILMSLOW")
        ? "WRP"
        : (currentUser?.name || "").toUpperCase().includes("CAREPLUS")
        ? "CPC"
        : (currentUser?.name || "").toUpperCase().includes("247")
        ? "247"
        : "",
      name: patient.fullName || "",
      dob: patient.dob || "",
      address: patient.address || "",
      contactNo: patient.telephone || "",
      email: patient.email || "",
      service: id,
      date: new Date().toISOString(),
    };
    const timer = setTimeout(() => {
      savePatientRow(row).then(() => setSavedOnce(true)).catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [savedOnce, currentUser, patient, id]);

  // 🔀 Select the correct consultation object
  const currentConsultation = useMemo(() => {
    switch (id) {
      case "travel":
        return travelConsultation;
      case "weightloss":
        return weightLossConsultation;
      case "flu":
        return fluConsultation;
      case "covid":
        return covidConsultation;
      case "b12":
        return b12Consultation;
      case "earwax":
        return earwaxConsultation;
      default:
        return {};
    }
  }, [
    id,
    travelConsultation,
    weightLossConsultation,
    fluConsultation,
    covidConsultation,
    b12Consultation,
    earwaxConsultation,
  ]);

  // 🧩 Merge all relevant data
  const getMergedData = useCallback(() => {
    const baseData = { ...patient, ...pharm, branch };
    const mergeAll = (consultation) => ({
      ...patient,
      ...pharm,
      ...consultation,
      ...branch,
    });

    switch (id) {
      case "travel":
        return mergeAll(travelConsultation);
      case "weightloss":
        return mergeAll(weightLossConsultation);
      case "flu":
        return mergeAll(fluConsultation);
      case "covid":
        return mergeAll(covidConsultation);
      case "b12":
        return mergeAll(b12Consultation);
      case "earwax":
        return mergeAll(earwaxConsultation);
      default:
        return baseData;
    }
  }, [
    id,
    patient,
    pharm,
    branch,
    travelConsultation,
    weightLossConsultation,
    fluConsultation,
    covidConsultation,
    b12Consultation,
    earwaxConsultation,
  ]);

  // 🧾 Generate PDF (ensures latest TravelConsultationTemplate)
  const generatePDF = useCallback(
    async (Comp, fileName, extraProps = {}) => {
      const tempContainer = document.createElement("div");
      tempContainer.className = "pdf-generator";
      Object.assign(tempContainer.style, {
        position: "absolute",
        left: "-9999px",
        top: "0",
        width: "900px",
        background: "#fff",
        padding: "24px",
        zIndex: "-1",
      });

      const mergedData = getMergedData();

      // ✅ Dynamic reload for Travel Consultation template
      let RenderComponent = Comp;
      if (id === "travel" && fileName.includes("consultation")) {
        try {
          const mod = await import(
            `./templates/TravelConsultationTemplate.jsx?update=${Date.now()}`
          );
          RenderComponent = mod.default;
          console.log("✅ Loaded latest TravelConsultationTemplate for PDF render");
        } catch (err) {
          console.warn("⚠️ Failed to dynamically reload TravelConsultationTemplate:", err);
        }
      }

      const htmlString = ReactDOMServer.renderToString(
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
          }}
        >
          <RenderComponent
            data={mergedData}
            consultation={currentConsultation}
            pharmacist={pharm}
            patientForm={patient}
            pharmacistForm={pharm}
            consultationData={currentConsultation}
            serviceId={id}
            serviceName={id.toUpperCase()}
            {...extraProps}
          />
        </AppContext.Provider>
      );

      tempContainer.innerHTML = htmlString;
      document.body.appendChild(tempContainer);
      await new Promise((r) => setTimeout(r, 300));

      try {
        const canvas = await html2canvas(tempContainer, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "pt", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const ratio = pdfWidth / canvas.width;
        const scaledHeight = canvas.height * ratio;
        let heightLeft = scaledHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
          position -= pdf.internal.pageSize.getHeight();
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }

        const safeName = patient.fullName
          ? patient.fullName.replace(/\s+/g, "_")
          : "form";
        pdf.save(`${safeName}-${fileName}`);
      } finally {
        document.body.removeChild(tempContainer);
      }
    },
    [
      getMergedData,
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
      currentConsultation,
      id,
    ]
  );

  // 📄 Download all PDFs
  const downloadPDFs = useCallback(async () => {
    for (const tab of serviceTabs) {
      await generatePDF(tab.Comp, tab.pdfName);
    }
  }, [serviceTabs, generatePDF]);

  // ✅ Detect ?autoDownload=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldAutoDownload = params.get("autoDownload") === "true";

    if (shouldAutoDownload && !autoDownloaded) {
      setTimeout(async () => {
        try {
          await downloadPDFs();
        } catch (err) {
          console.error("Auto PDF download failed:", err);
        } finally {
          setAutoDownloaded(true);
        }
      }, 800);
    }
  }, [location.search, autoDownloaded, downloadPDFs]);

  // 📊 Excel Export
  const downloadExcel = () => {
    const data = [getMergedData()];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FormData");

    const safeName = patient.fullName
      ? patient.fullName.replace(/\s+/g, "_")
      : "form";
    const fname = `${safeName}-${activeTabDef?.xlsxName || "form.xlsx"}`;
    XLSX.writeFile(workbook, fname);
  };

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
            data={getMergedData()}
            consultation={currentConsultation}
            pharmacist={pharm}
            patientForm={patient}
            pharmacistForm={pharm}
            consultationData={currentConsultation}
            serviceId={id}
            serviceName={id.toUpperCase()}
          />
        )}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <button className="btn btn--primary" onClick={downloadPDFs}>
          Download as PDF
        </button>
        <button className="btn btn--primary" onClick={downloadExcel}>
          Download as Excel
        </button>
      </div>
    </div>
  );
}
