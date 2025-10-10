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

export default function PreviewPage() {
  const {
    patient,
    pharm,
    currentUser,
    branch,
    travelConsultation,
    weightLossConsultation,
  } = useApp();

  const { id } = useParams();
  const location = useLocation(); // 🧭 detect query params
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
          { key: "form", label: "Form", Comp: Template, pdfName: "travel-form.pdf", xlsxName: "travel-form.xlsx" },
          { key: "consult", label: "Consultation", Comp: TravelConsultationTemplate, pdfName: "travel-consultation.pdf", xlsxName: "travel-consultation.xlsx" },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: "travel-prescription.pdf", xlsxName: "travel-prescription.xlsx" },
        ];

      case "weightloss":
        return [
          { key: "form", label: "Form", Comp: Template, pdfName: "weightloss-form.pdf", xlsxName: "weightloss-form.xlsx" },
          { key: "consult", label: "Consultation", Comp: WeightlossConsultationTemplate, pdfName: "weightloss-consultation.pdf", xlsxName: "weightloss-consultation.xlsx" },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: "weightloss-prescription.pdf", xlsxName: "weightloss-prescription.xlsx" },
        ];

      default:
        return [
          { key: "form", label: "Form", Comp: Template, pdfName: `${id}-form.pdf`, xlsxName: `${id}-form.xlsx` },
          { key: "rx", label: "Prescription", Comp: PrescriptionTemplate, pdfName: `${id}-prescription.pdf`, xlsxName: `${id}-prescription.xlsx` },
        ];
    }
  }, [id, Template]);

  const activeTabDef = serviceTabs.find((t) => t.key === activeTab) || serviceTabs[0];

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

  // 🧩 Merge all relevant data
  const getMergedData = useCallback(() => {
    const baseData = { ...patient, ...pharm };
    switch (id) {
      case "travel":
        return { ...baseData, ...travelConsultation, consultation: travelConsultation, branch };
      case "weightloss":
        return { ...baseData, ...weightLossConsultation, consultation: weightLossConsultation, branch };
      default:
        return { ...baseData, branch };
    }
  }, [id, patient, pharm, branch, travelConsultation, weightLossConsultation]);

  // 🧾 Generate PDF function
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
      const htmlString = ReactDOMServer.renderToString(
        <AppContext.Provider
          value={{
            patient,
            pharm,
            currentUser,
            branch,
            travelConsultation,
            weightLossConsultation,
          }}
        >
          <Comp
            data={mergedData}
            consultation={id === "weightloss" ? weightLossConsultation : travelConsultation}
            serviceId={id}
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

        const safeName = patient.fullName ? patient.fullName.replace(/\s+/g, "_") : "form";
        pdf.save(`${safeName}-${fileName}`);
      } finally {
        document.body.removeChild(tempContainer);
      }
    },
    [getMergedData, patient, pharm, currentUser, branch, travelConsultation, weightLossConsultation, id]
  );

  // 📄 Download all PDFs
  const downloadPDFs = useCallback(async () => {
    for (const tab of serviceTabs) {
      await generatePDF(tab.Comp, tab.pdfName);
    }
  }, [serviceTabs, generatePDF]);

  // ✅ Detect ?autoDownload=true and run only once
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
      }, 800); // short delay to allow rendering
    }
  }, [location.search, autoDownloaded, downloadPDFs]);

  // 📊 Excel Export
  const downloadExcel = () => {
    const data = [getMergedData()];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FormData");

    const safeName = patient.fullName ? patient.fullName.replace(/\s+/g, "_") : "form";
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
            consultation={id === "weightloss" ? weightLossConsultation : travelConsultation}
            serviceId={id}
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
