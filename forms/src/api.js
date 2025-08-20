const API_BASE = process.env.REACT_APP_API_BASE || (typeof window !== 'undefined' ? (window.__API_BASE__ || "http://localhost:4000") : "http://localhost:4000");

export async function savePatientRow(row){
  const res = await fetch(`${API_BASE}/api/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error('Failed to save');
  return res.json();
}

export function downloadPatientsXlsx(tenant){
  const t = encodeURIComponent(tenant || '');
  window.location.href = `${API_BASE}/api/patients.xlsx?tenant=${t}`;
}

export async function fetchPatients(tenant){
  const t = encodeURIComponent(tenant || '');
  const res = await fetch(`${API_BASE}/api/patients?tenant=${t}`);
  if (!res.ok) throw new Error('Failed to fetch');
  const json = await res.json();
  return json.rows || [];
}


