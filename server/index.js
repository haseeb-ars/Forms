// server/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import pkg from "pg";
import XLSX from "xlsx";

const { Pool } = pkg;

const app = express();

/* ---------------------------------------
   CORS
------------------------------------------ */
const allowed = [
  "http://localhost:3000",
  "http://localhost:4000",
  "https://haseeb-ars.github.io",
  "https://haseeb-ars.github.io/Forms",
  "https://forms.careplushealth.co.uk",
];

app.use(cors({ origin: allowed }));
app.use(express.json({ limit: "5mb" }));

console.log("DB_URL", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

/* ---------------------------------------
   SCHEMA: Ensure tables exist
------------------------------------------ */
async function ensureSchema() {
  const tables = ["patients_wrp", "patients_cpc", "patients_247"];

  for (const t of tables) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${t} (
        id BIGSERIAL PRIMARY KEY,
        name TEXT,
        dob DATE,
        address TEXT,
        contact_no TEXT,
        email TEXT,
        service TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        upsert_key TEXT UNIQUE
      );
    `);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id SERIAL PRIMARY KEY,
      service TEXT NOT NULL,
      tenant TEXT,
      patient_name TEXT,
      dob DATE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      patient_data JSONB NOT NULL,
      pharmacist_data JSONB NOT NULL,
      consultation_data JSONB NOT NULL,
      branch_data JSONB,
      extra_meta JSONB
    );
  `);
}

ensureSchema().catch((err) => console.error("ensureSchema error", err));

/* ---------------------------------------
   Helper: map tenant → correct table
------------------------------------------ */
function tableForTenant(tenant) {
  switch ((tenant || "").toUpperCase()) {
    case "WRP":
      return "patients_wrp";
    case "CPC":
      return "patients_cpc";
    case "247":
      return "patients_247";
    default:
      return null;
  }
}

/* ---------------------------------------
   Health check
------------------------------------------ */
app.get("/health", (req, res) => res.json({ ok: true }));

/* ---------------------------------------
   PATIENT ROW INSERT (existing)
------------------------------------------ */
app.post("/api/patients", async (req, res) => {
  const { tenant, name, dob, address, contactNo, email, service, date } =
    req.body || {};

  const table = tableForTenant(tenant);
  if (!table) return res.status(400).json({ ok: false, error: "bad_tenant" });

  try {
    const key = [
      tenant || "",
      (name || "").trim().toUpperCase(),
      dob || "",
      service || "",
    ].join("|");

    const { rows } = await pool.query(
      `
      INSERT INTO ${table}
        (name, dob, address, contact_no, email, service, created_at, upsert_key)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (upsert_key)
      DO UPDATE SET upsert_key = EXCLUDED.upsert_key
      RETURNING *
    `,
      [
        name || null,
        dob || null,
        address || null,
        contactNo || null,
        email || null,
        service || null,
        date ? new Date(date) : new Date(),
        key,
      ]
    );

    res.json({ ok: true, row: rows[0] });
  } catch (err) {
    console.error("insert error", err);
    res.status(500).json({ ok: false, error: "db_error" });
  }
});

/* ---------------------------------------
   Patients list + export
------------------------------------------ */
app.get("/api/patients", async (req, res) => {
  const table = tableForTenant(req.query.tenant);
  if (!table) return res.status(400).json({ ok: false, error: "bad_tenant" });

  try {
    const { rows } = await pool.query(
      `SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 1000`
    );
    res.json({ ok: true, rows });
  } catch (err) {
    console.error("select error", err);
    res.status(500).json({ ok: false, error: "db_error" });
  }
});

app.get("/api/patients.xlsx", async (req, res) => {
  const table = tableForTenant(req.query.tenant);
  if (!table) return res.status(400).json({ ok: false, error: "bad_tenant" });

  try {
    const { rows } = await pool.query(`
      SELECT
        name,
        dob,
        address,
        contact_no AS "contactNo",
        email,
        service,
        created_at AS "date"
      FROM ${table}
      ORDER BY created_at DESC
    `);

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="patients.xlsx"'
    );
    res.send(buffer);
  } catch (err) {
    console.error("export error", err);
    res.status(500).json({ ok: false, error: "export_error" });
  }
});

/* ---------------------------------------
   FULL FORM SUBMISSION (save snapshot)
------------------------------------------ */
app.post("/api/form-submissions", async (req, res) => {
  console.log("📥 /api/form-submissions called");
  console.log("Body:", JSON.stringify(req.body, null, 2));

  try {
    const { tenant, service, patient, pharm, consultation, branch, extraMeta } =
      req.body || {};

    if (!service || !patient) {
      return res.status(400).json({
        ok: false,
        error: "missing_service_or_patient",
      });
    }

    const patientName =
      patient.fullName || patient.name || patient.patient_name || null;

    const dob = patient.dob || null;

    const { rows } = await pool.query(
      `
      INSERT INTO form_submissions
        (service, tenant, patient_name, dob,
         patient_data, pharmacist_data, consultation_data, branch_data, extra_meta)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `,
      [
        service,
        tenant || null,
        patientName,
        dob,
        JSON.stringify(patient),
        JSON.stringify(pharm),
        JSON.stringify(consultation),
        JSON.stringify(branch),
        JSON.stringify(extraMeta || {}),
      ]
    );

    console.log("✅ Saved form_submission id:", rows[0].id);

    res.json({ ok: true, row: rows[0] });
  } catch (err) {
    console.error("💥 form-submissions insert error", err);
    res.status(500).json({ ok: false, error: "db_error" });
  }
});

/* ---------------------------------------
   GET submission by name/service/tenant
   (used by PatientsPage Download Forms)
------------------------------------------ */
app.get("/api/form-submissions/by-name", async (req, res) => {
  const { name, service, tenant } = req.query;

  if (!name || !service) {
    return res.status(400).json({
      ok: false,
      error: "missing_name_or_service",
    });
  }

  // normalise name for matching
  const cleanName = name.trim();

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM form_submissions
      WHERE LOWER(patient_name) = LOWER($1)
        AND service = $2
        AND (tenant = $3 OR $3 IS NULL OR tenant IS NULL)
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [cleanName, service, tenant || null]
    );

    console.log(
      "🔎 by-name lookup",
      { name: cleanName, service, tenant },
      "→ rows:",
      rows.length
    );

    if (rows.length === 0) {
      return res.json({ ok: false, row: null });
    }

    return res.json({ ok: true, row: rows[0] });
  } catch (err) {
    console.error("💥 lookup error", err);
    return res.status(500).json({
      ok: false,
      error: "db_error",
    });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
