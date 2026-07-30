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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS healthy_living_signposting_log (
      id SERIAL PRIMARY KEY,
      submission_id INT,
      branch_id TEXT,
      branch_name TEXT,
      date DATE,
      staff_initials TEXT,
      nhs_number TEXT,
      clinical_location TEXT,
      non_clinical_location TEXT,
      lifestyle_advice TEXT,
      otc_advice TEXT,
      self_care TEXT,
      signposting TEXT,
      brief_description TEXT,
      gp_informed TEXT,
      recorded_in_pnr TEXT,
      outcome_summary TEXT,
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS healthy_living_signposting_log_audit (
      id SERIAL PRIMARY KEY,
      log_id INT,
      action TEXT,
      changed_by TEXT,
      branch_id TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      changes JSONB
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

/* ---------------------------------------
   GET Consultation History Chain for Patient & Service
   (Used by Follow-Up consultations to build full history chain)
------------------------------------------ */
app.get(["/api/consultations/history", "/api/form-submissions/history"], async (req, res) => {
  const { name, dob, service, tenant } = req.query;

  if (!name) {
    return res.status(400).json({ ok: false, error: "missing_patient_name" });
  }

  const cleanName = name.trim();
  const cleanService = (service || "").trim().toLowerCase();

  try {
    // Map service aliases to query patterns
    let serviceCondition = `LOWER(service) = LOWER($2)`;
    let serviceParam = cleanService;

    if (cleanService === "weightloss" || cleanService === "weightlossfollowup") {
      serviceCondition = `LOWER(service) IN ('weightloss', 'weightlossfollowup')`;
    } else if (cleanService === "travel" || cleanService === "travelfollowup") {
      serviceCondition = `LOWER(service) IN ('travel', 'travelfollowup')`;
    } else if (cleanService) {
      serviceCondition = `(LOWER(service) = LOWER($2) OR LOWER(service) LIKE LOWER($2) || '%')`;
    }

    const params = [cleanName];
    let queryStr = `
      SELECT *
      FROM form_submissions
      WHERE LOWER(TRIM(patient_name)) = LOWER(TRIM($1))
    `;

    if (cleanService) {
      params.push(serviceParam);
      queryStr += ` AND ${serviceCondition}`;
    }

    if (dob) {
      params.push(dob);
      queryStr += ` AND (dob = $${params.length} OR dob IS NULL)`;
    }

    if (tenant) {
      params.push(tenant);
      queryStr += ` AND (tenant = $${params.length} OR tenant IS NULL)`;
    }

    queryStr += ` ORDER BY created_at ASC`;

    const { rows } = await pool.query(queryStr, params);

    console.log(`📜 Consultation history lookup for "${cleanName}" (${cleanService}) -> ${rows.length} records found`);

    return res.json({ ok: true, rows });
  } catch (err) {
    console.error("💥 history lookup error", err);
    return res.status(500).json({ ok: false, error: "db_error" });
  }
});


/* ---------------------------------------
   HEALTHY LIVING SIGNPOSTING LOG API & AUDIT
------------------------------------------ */
app.post("/api/healthy-living-log", async (req, res) => {
  console.log("📥 /api/healthy-living-log called");
  try {
    const { branchId, branchName, createdBy, submissionId, entries } = req.body || {};

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ ok: false, error: "empty_entries" });
    }

    const savedRows = [];
    for (const item of entries) {
      const {
        id,
        date,
        staffInitials,
        nhsNumber,
        clinicalLocation,
        nonClinicalLocation,
        lifestyleAdvice,
        otcAdvice,
        selfCare,
        signposting,
        briefDescription,
        gpInformed,
        recordedInPnr,
        outcomeSummary,
      } = item;

      if (id) {
        // Update existing row
        const updateRes = await pool.query(
          `
          UPDATE healthy_living_signposting_log
          SET branch_id = $1,
              branch_name = $2,
              date = $3,
              staff_initials = $4,
              nhs_number = $5,
              clinical_location = $6,
              non_clinical_location = $7,
              lifestyle_advice = $8,
              otc_advice = $9,
              self_care = $10,
              signposting = $11,
              brief_description = $12,
              gp_informed = $13,
              recorded_in_pnr = $14,
              outcome_summary = $15,
              updated_at = NOW()
          WHERE id = $16
          RETURNING *
        `,
          [
            branchId || null,
            branchName || null,
            date ? new Date(date) : new Date(),
            staffInitials || null,
            nhsNumber || null,
            clinicalLocation || null,
            nonClinicalLocation || null,
            lifestyleAdvice || null,
            otcAdvice || null,
            selfCare || null,
            signposting || null,
            briefDescription || null,
            gpInformed || null,
            recordedInPnr || null,
            outcomeSummary || null,
            id,
          ]
        );
        const row = updateRes.rows[0];
        savedRows.push(row);

        // Audit entry
        await pool.query(
          `
          INSERT INTO healthy_living_signposting_log_audit
            (log_id, action, changed_by, branch_id, changes)
          VALUES ($1, 'UPDATE', $2, $3, $4)
        `,
          [row.id, createdBy || "system", branchId || null, JSON.stringify(item)]
        );
      } else {
        // Insert new row
        const insertRes = await pool.query(
          `
          INSERT INTO healthy_living_signposting_log (
            submission_id, branch_id, branch_name, date, staff_initials,
            nhs_number, clinical_location, non_clinical_location, lifestyle_advice,
            otc_advice, self_care, signposting, brief_description, gp_informed,
            recorded_in_pnr, outcome_summary, created_by
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
          RETURNING *
        `,
          [
            submissionId || null,
            branchId || null,
            branchName || null,
            date ? new Date(date) : new Date(),
            staffInitials || null,
            nhsNumber || null,
            clinicalLocation || null,
            nonClinicalLocation || null,
            lifestyleAdvice || null,
            otcAdvice || null,
            selfCare || null,
            signposting || null,
            briefDescription || null,
            gpInformed || null,
            recordedInPnr || null,
            outcomeSummary || null,
            createdBy || "system",
          ]
        );
        const row = insertRes.rows[0];
        savedRows.push(row);

        // Audit entry
        await pool.query(
          `
          INSERT INTO healthy_living_signposting_log_audit
            (log_id, action, changed_by, branch_id, changes)
          VALUES ($1, 'CREATE', $2, $3, $4)
        `,
          [row.id, createdBy || "system", branchId || null, JSON.stringify(item)]
        );
      }
    }

    res.json({ ok: true, rows: savedRows });
  } catch (err) {
    console.error("💥 healthy-living-log save error", err);
    res.status(500).json({ ok: false, error: "db_error" });
  }
});

app.get("/api/healthy-living-log", async (req, res) => {
  const { branchId } = req.query;
  try {
    const { rows } = await pool.query(
      `
      SELECT * FROM healthy_living_signposting_log
      WHERE ($1::text IS NULL OR branch_id = $1)
      ORDER BY date DESC, created_at DESC
      LIMIT 500
    `,
      [branchId || null]
    );
    res.json({ ok: true, rows });
  } catch (err) {
    console.error("💥 healthy-living-log select error", err);
    res.status(500).json({ ok: false, error: "db_error" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
