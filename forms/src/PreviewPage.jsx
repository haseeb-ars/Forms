import React, { useRef, useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import templates from "./templates";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import "./PreviewPage.css";
import { savePatientRow } from "./api";

export default function PreviewPage() {
  const { patient, pharm, currentUser } = useApp();
  const { id } = useParams();
  const previewRef = useRef();
  const initialTab = id === 'b12' ? 'admin' : id === 'earwax' ? 'ref' : 'single';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [savedOnce, setSavedOnce] = useState(false);

  // For b12 and earwax, render multiple documents; otherwise single template
  const isB12 = id === 'b12';
  const isEarwax = id === 'earwax';
  const Template = templates[id] || templates.b12;

  const b12Tabs = useMemo(() => ([
    { key: "admin", label: "Administration", Comp: templates.b12, pdfName: "b12-administration.pdf", xlsxName: "b12-administration.xlsx" },
    { key: "ref", label: "GP Letter", Comp: templates.b12_referral, pdfName: "b12-gp-letter.pdf", xlsxName: "b12-gp-letter.xlsx" },
    { key: "rx", label: "Prescription", Comp: templates.b12_prescription, pdfName: "b12-prescription.pdf", xlsxName: "b12-prescription.xlsx" },
  ]), []);
  const activeB12 = isB12 ? (b12Tabs.find(t => t.key === activeTab) || b12Tabs[0]) : null;

  const earwaxTabs = useMemo(() => ([
    { key: 'ref', label: 'GP Referral Letter', Comp: templates.earwax_referral, pdfName: 'earwax-gp-referral.pdf', xlsxName: 'earwax-gp-referral.xlsx' },
    { key: 'terms', label: 'Terms & Conditions', Comp: templates.earwax_terms, pdfName: 'earwax-terms.pdf', xlsxName: 'earwax-terms.xlsx' },
    { key: 'consent', label: 'Consent', Comp: templates.earwax_consent, pdfName: 'earwax-consent.pdf', xlsxName: 'earwax-consent.xlsx' },
  ]), []);
  const activeEarwax = isEarwax ? (earwaxTabs.find(t => t.key === activeTab) || earwaxTabs[0]) : null;

  // Template is guaranteed by fallback in templates map

  // Auto-save on first render
  useEffect(() => {
    if (savedOnce) return;
    const row = {
      tenant: (currentUser?.name || '').toUpperCase().includes('WILMSLOW') ? 'WRP' :
              (currentUser?.name || '').toUpperCase().includes('CAREPLUS') ? 'CPC' :
              (currentUser?.name || '').toUpperCase().includes('247') ? '247' : '',
      name: patient.fullName || "",
      dob: patient.dob || "",
      address: patient.address || "",
      contactNo: patient.telephone || "",
      email: patient.email || "",
      service: id,
      date: new Date().toISOString(),
    };
    // small debounce in case component mounts twice (StrictMode)
    const timer = setTimeout(()=>{
      savePatientRow(row).then(()=>setSavedOnce(true)).catch(()=>{});
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Download as PDF with desktop template layout
const downloadPDF = async () => {
  if (!previewRef.current) return;

  // Create a temporary container for PDF generation
  const tempContainer = document.createElement('div');
  tempContainer.className = 'pdf-generator';
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '800px'; // Desktop width
  tempContainer.style.background = '#fff';
  tempContainer.style.padding = '20px';
  
  // Clone the preview content
  const clonedContent = previewRef.current.cloneNode(true);
  
  // Add the cloned content to the temporary container
  tempContainer.appendChild(clonedContent);
  document.body.appendChild(tempContainer);
  
  try {
    // Generate PDF from the desktop-styled content
    const canvas = await html2canvas(tempContainer, { 
      scale: 2,
      width: 800,
      height: tempContainer.scrollHeight,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    let heightLeft = imgHeight * ratio;
    let position = 0;
    
    pdf.addImage(imgData, "PNG", 0, position, imgWidth * ratio, imgHeight * ratio);
    heightLeft -= pdfHeight;
    
    while (heightLeft > 0) {
      position = heightLeft - imgHeight * ratio;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;
    }
    
    const fname = isB12
      ? (activeB12?.pdfName || "form.pdf")
      : isEarwax
      ? (activeEarwax?.pdfName || "form.pdf")
      : "form.pdf";
    pdf.save(fname);
  } finally {
    // Clean up the temporary container
    document.body.removeChild(tempContainer);
  }
};

  // Download as Excel
  const downloadExcel = () => {
    const data = [{ ...patient, ...pharm }];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FormData");
    const fname = isB12
      ? (activeB12?.xlsxName || "form.xlsx")
      : isEarwax
      ? (activeEarwax?.xlsxName || "form.xlsx")
      : "form.xlsx";
    XLSX.writeFile(workbook, fname);
  };


  return (
    <div>
      <h2>Preview</h2>
      {(isB12 || isEarwax) && (
        <div className="tabs">
          {(isB12 ? b12Tabs : earwaxTabs).map(t => (
            <button
              key={t.key}
              className={`tab ${activeTab === t.key ? 'tab--active' : ''}`}
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
        <button className="btn btn--primary" onClick={downloadPDF}>
          Download as PDF
        </button>
        <button className="btn btn--primary" onClick={downloadExcel}>
          Download as Excel
        </button>
      </div>
    </div>
  );
}
