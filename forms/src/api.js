// src/api.js
console.log("API_BASE =", process.env.REACT_APP_API_BASE);

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (typeof window !== "undefined"
    ? window.__API_BASE__ || "http://localhost:4000"
    : "http://localhost:4000");

/* ---------------------------------------
   Save basic patient row
------------------------------------------ */
/* ---------------------------------------
   Save basic patient row (with retries)
------------------------------------------ */
export async function savePatientRow(row, retries = 3) {
  console.log(`[API] Starting savePatientRow (retries left: ${retries})`, row);

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`${API_BASE}/api/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      console.log("[API] savePatientRow success:", data);
      return data;
    } catch (err) {
      console.error(`[API] savePatientRow attempt ${i + 1} failed:`, err);
      if (i === retries) throw err;
      const delay = Math.pow(2, i) * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/* ---------------------------------------
   Export Excel
------------------------------------------ */
export function downloadPatientsXlsx(tenant) {
  const t = encodeURIComponent(tenant || "");
  window.location.href = `${API_BASE}/api/patients.xlsx?tenant=${t}`;
}

/* ---------------------------------------
   Fetch patients for tenant
------------------------------------------ */
export async function fetchPatients(tenant) {
  const t = encodeURIComponent(tenant || "");
  const res = await fetch(`${API_BASE}/api/patients?tenant=${t}`);

  if (!res.ok) throw new Error("Failed to fetch patients");

  const json = await res.json();
  return json.rows || [];
}

/* ---------------------------------------
   Save full form submission (with retries)
------------------------------------------ */
export async function saveFullSubmission(payload, retries = 3) {
  console.log(`[API] Starting saveFullSubmission (retries left: ${retries})`, payload);
  
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`${API_BASE}/api/form-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      console.log("[API] saveFullSubmission success:", data);
      return data;
    } catch (err) {
      console.error(`[API] saveFullSubmission attempt ${i + 1} failed:`, err);
      if (i === retries) throw err;
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

/* ---------------------------------------
   Fetch saved submission by Name + DOB + Service + Tenant
   Uses GET /api/form-submissions/by-name
------------------------------------------ */
export async function fetchSubmissionByName({ name, dob, service, tenant }) {
  // Normalise DOB to YYYY-MM-DD (what Postgres DATE expects)
  const safeDob =
    dob && typeof dob === "string" ? dob.slice(0, 10) : dob || "";

  const params = new URLSearchParams({
    name: name || "",
    service: service || "",
  });

  if (tenant) params.set("tenant", tenant);
  if (safeDob) params.set("dob", safeDob);

  const res = await fetch(
    `${API_BASE}/api/form-submissions/by-name?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch submission");
  }

  return res.json(); // { ok: boolean, row: {...} | null }
}
