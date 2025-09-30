import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useApp, AppContext } from "./AppContext.jsx";
import templates from "./templates";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import "./PreviewPage.css";
import { savePatientRow } from "./api";
import ReactDOMServer from "react-dom/server";

export default function PreviewPage() {
  // pull everything needed from context (include branch so templates using it won't crash)
  const { patient, pharm, currentUser, branch } = useApp();
  const { id } = useParams();
  const previewRef = useRef();
  const initialTab = id === "b12" ? "admin" : id === "earwax" ? "ref" : "single";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [savedOnce, setSavedOnce] = useState(false);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  const isB12 = id === "b12";
  const isEarwax = id === "earwax";
  const Template = templates[id] || templates.b12;

  const b12Tabs = useMemo(
    () => [
      { key: "admin", label: "Administration", Comp: templates.b12, pdfName: "b12-administration.pdf", xlsxName: "b12-administration.xlsx" },
      { key: "ref", label: "GP Letter", Comp: templates.b12_referral, pdfName: "b12-gp-letter.pdf", xlsxName: "b12-gp-letter.xlsx" },
      { key: "rx", label: "Prescription", Comp: templates.b12_prescription, pdfName: "b12-prescription.pdf", xlsxName: "b12-prescription.xlsx" },
    ],
    []
  );

  const earwaxTabs = useMemo(
    () => [
      { key: "ref", label: "GP Referral Letter", Comp: templates.earwax_referral, pdfName: "earwax-gp-referral.pdf", xlsxName: "earwax-gp-referral.xlsx" },
      { key: "terms", label: "Terms & Conditions", Comp: templates.earwax_terms, pdfName: "earwax-terms.pdf", xlsxName: "earwax-terms.xlsx" },
      { key: "consent", label: "Consent", Comp: templates.earwax_consent, pdfName: "earwax-consent.pdf", xlsxName: "earwax-consent.xlsx" },
    ],
    []
  );

  const activeB12 = isB12 ? b12Tabs.find((t) => t.key === activeTab) : null;
  const activeEarwax = isEarwax ? earwaxTabs.find((t) => t.key === activeTab) : null;

  // Save patient row once
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate a single PDF (stable via useCallback)
  const generatePDF = useCallback(
    async (Comp, fileName) => {
      const tempContainer = document.createElement("div");
      tempContainer.className = "pdf-generator";
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.background = "#fff";
      tempContainer.style.padding = "20px";

      const htmlString = ReactDOMServer.renderToString(
        <AppContext.Provider value={{ patient, pharm, currentUser, branch }}>
          <Comp data={{ ...patient, ...pharm }} />
        </AppContext.Provider>
      );
      tempContainer.innerHTML = htmlString;
      document.body.appendChild(tempContainer);

      try {
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "pt", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = pdfWidth / canvas.width;
        const scaledHeight = canvas.height * ratio;

        let heightLeft = scaledHeight;
        let position = 0;

        // First page
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;

        // Add gentle padding around page breaks
        const pagePaddingTop = 30;
        const pagePaddingBottom = 30;

        while (heightLeft > 0) {
          position = -(scaledHeight - heightLeft) + pagePaddingTop;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
          heightLeft -= pdfHeight - (pagePaddingTop + pagePaddingBottom);
        }

        const safeName = patient.fullName ? patient.fullName.replace(/\s+/g, "_") : "form";
        pdf.save(`${safeName}-${fileName}`);
      } finally {
        document.body.removeChild(tempContainer);
      }
    },
    [patient, pharm, currentUser, branch]
  );

  // Download all PDFs (stable and depends on generatePDF)
  const downloadPDFs = useCallback(
    async () => {
      if (isB12) {
        for (const tab of b12Tabs) {
          await generatePDF(tab.Comp, tab.pdfName);
        }
      } else if (isEarwax) {
        for (const tab of earwaxTabs) {
          await generatePDF(tab.Comp, tab.pdfName);
        }
      } else {
        await generatePDF(Template, "form.pdf");
      }
    },
    [isB12, isEarwax, b12Tabs, earwaxTabs, Template, generatePDF]
  );

  // Auto-download all PDFs once
  useEffect(() => {
    if (!autoDownloaded) {
      const timer = setTimeout(() => {
        downloadPDFs();
        setAutoDownloaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownloaded, downloadPDFs]);

  const downloadExcel = () => {
    const data = [{ ...patient, ...pharm }];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FormData");

    const safeName = patient.fullName ? patient.fullName.replace(/\s+/g, "_") : "form";
    const fname = isB12
      ? `${safeName}-${activeB12?.xlsxName || "form.xlsx"}`
      : isEarwax
      ? `${safeName}-${activeEarwax?.xlsxName || "form.xlsx"}`
      : `${safeName}-form.xlsx`;

    XLSX.writeFile(workbook, fname);
  };

  return (
    <div>
      <h2>Preview</h2>
      {(isB12 || isEarwax) && (
        <div className="tabs">
          {(isB12 ? b12Tabs : earwaxTabs).map((t) => (
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
      )}

      <div ref={previewRef} style={{ padding: "20px", background: "#fff" }}>
        {isB12 ? (
          activeB12 && <activeB12.Comp data={{ ...patient, ...pharm }} />
        ) : isEarwax ? (
          activeEarwax && <activeEarwax.Comp data={{ ...patient, ...pharm }} />
        ) : (
          <Template data={{ ...patient, ...pharm }} />
        )}
      </div>

      <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
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
