// src/pdfGenerator.js
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AppContext } from "./AppContext.jsx";

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

export const formatSlices = (patient, pharm, consultation, branch) => ({
  patientF: deepFormatDates(patient),
  pharmF: deepFormatDates(pharm),
  consultF: deepFormatDates(consultation),
  branchF: deepFormatDates(branch),
});

/* -------------------------------
   Wait for images
---------------------------------- */

export async function waitForImages(container) {
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
}

/* -------------------------------
   Core PDF generator
---------------------------------- */

export async function generatePDFFromData({
  Comp,
  fileName,
  patient,
  pharm,
  consultation,
  branch,
  currentUser,
  serviceId,
  serviceName,
  extraContext = {},
}) {
  return new Promise(async (resolve) => {
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

    const { patientF, pharmF, consultF, branchF } = formatSlices(
      patient || {},
      pharm || {},
      consultation || {},
      branch || {}
    );

    const mergedData = {
      ...patientF,
      ...pharmF,
      ...consultF,
      ...branchF,
    };

    root.render(
      <AppContext.Provider
        value={{
          patient,
          pharm,
          consultation,
          branch,
          currentUser,
          ...extraContext,
        }}
      >
        <Comp
          data={mergedData}
          patientForm={patientF}
          pharmacistForm={pharmF}
          consultationData={consultF}
          pharmacist={pharmF}
          consultation={consultF}
          serviceId={serviceId}
          serviceName={serviceName}
        />
      </AppContext.Provider>
    );

    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => setTimeout(r, 150));
    await waitForImages(host);

    try {
      const canvas = await html2canvas(host, {
        scale: 1.25,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.72);
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

      const safeName =
        patient && patient.fullName
          ? patient.fullName.replace(/\s+/g, "_")
          : "patient";

      pdf.save(`${safeName}-${fileName}`);
      resolve();
    } finally {
      try {
        root.unmount();
      } catch {}
      document.body.removeChild(host);
    }
  });
}

/* -------------------------------
   Use DB submission row
---------------------------------- */

export async function downloadPDFsFromSubmission(submission, serviceTabs) {
  // Handle both shapes: live object and DB row
  const patient = submission.patient || submission.patient_data || {};
  const pharm =
    submission.pharm ||
    submission.pharmacist_data ||
    submission.pharmacist ||
    {};
  const consultation =
    submission.consultation || submission.consultation_data || {};
  const branch = submission.branch || submission.branch_data || {};
  const meta = submission.extra_meta || submission.meta || {};

  const serviceId = submission.service;
  const serviceName = (submission.service || "").toUpperCase();
  const currentUser = meta.currentUserName || "";

  for (const tab of serviceTabs) {
    await generatePDFFromData({
      Comp: tab.Comp,
      fileName: tab.pdfName,
      patient,
      pharm,
      consultation,
      branch,
      currentUser,
      serviceId,
      serviceName,
    });
  }
}
