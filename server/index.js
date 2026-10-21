// server/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import pkg from "pg";
import XLSX from "xlsx";
import nodemailer from "nodemailer";
import { CONSUMABLES_CATALOGUE, CATALOGUE_MAP } from "./consumablesCatalogue.js";

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS consumables_orders (
      id SERIAL PRIMARY KEY,
      order_ref TEXT UNIQUE NOT NULL,
      idempotency_key TEXT UNIQUE,
      branch_id TEXT,
      branch_name TEXT,
      staff_name TEXT,
      staff_email TEXT,
      staff_phone TEXT,
      delivery_address TEXT,
      notes TEXT,
      items JSONB NOT NULL,
      subtotal NUMERIC(10,2) NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      email_recipients JSONB NOT NULL,
      email_status TEXT NOT NULL,
      email_error TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
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

/* ---------------------------------------
   CONSUMABLES ORDERING API & EMAIL SYSTEM
------------------------------------------ */

// Helper to build nodemailer transporter
function getEmailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: If no SMTP credentials, use stream/json transport so email generation is verified & logged
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

// Generate professional HTML email for consumables order notification
function buildConsumablesOrderEmailHtml({ orderRef, createdAt, staffName, staffEmail, staffPhone, branchName, branchId, deliveryAddress, notes, items, subtotal, total }) {
  const itemsHtml = items.map((it) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #0d9488;">${it.sku}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">
        <strong>${it.name}</strong><br/>
        <span style="font-size: 12px; color: #64748b;">${it.packQuantity || ""} (${it.size || ""})</span>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #0f172a;">${it.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">£${Number(it.unitPrice).toFixed(2)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">£${Number(it.lineTotal).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CarePlus Health - Consumables Order ${orderRef}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 24px 30px; color: #ffffff;">
            <table width="100%">
              <tr>
                <td>
                  <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">CarePlus Health</h1>
                  <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Consumables & Packaging Order Notification</p>
                </td>
                <td style="text-align: right;">
                  <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; letter-spacing: 0.05em;">${orderRef}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Order Info Summary -->
        <tr>
          <td style="padding: 24px 30px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
            <table width="100%" style="font-size: 13px; line-height: 1.6;">
              <tr>
                <td width="50%" style="vertical-align: top;">
                  <strong style="color: #475569; text-transform: uppercase; font-size: 11px;">Order Date & Time:</strong><br/>
                  <span style="color: #0f172a; font-weight: 600;">${new Date(createdAt).toLocaleString("en-GB")}</span><br/><br/>
                  <strong style="color: #475569; text-transform: uppercase; font-size: 11px;">Ordered By (Staff):</strong><br/>
                  <span style="color: #0f172a; font-weight: 600;">${staffName || "Staff Member"}</span><br/>
                  <span style="color: #64748b;">${staffEmail || ""} ${staffPhone ? "• " + staffPhone : ""}</span>
                </td>
                <td width="50%" style="vertical-align: top;">
                  <strong style="color: #475569; text-transform: uppercase; font-size: 11px;">Branch / Practice:</strong><br/>
                  <span style="color: #0f172a; font-weight: 600;">${branchName || "CarePlus Health"}</span> ${branchId ? `(${branchId})` : ""}<br/><br/>
                  <strong style="color: #475569; text-transform: uppercase; font-size: 11px;">Delivery Address:</strong><br/>
                  <span style="color: #0f172a;">${deliveryAddress || "Standard Branch Address"}</span>
                </td>
              </tr>
              ${notes ? `
              <tr>
                <td colspan="2" style="padding-top: 14px; border-top: 1px dashed #cbd5e1;">
                  <strong style="color: #475569; text-transform: uppercase; font-size: 11px;">Special Instructions / Delivery Notes:</strong><br/>
                  <span style="color: #0f172a; font-style: italic;">${notes}</span>
                </td>
              </tr>
              ` : ""}
            </table>
          </td>
        </tr>

        <!-- Order Items Table -->
        <tr>
          <td style="padding: 24px 30px;">
            <h3 style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em;">Order Items</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1;">SKU</th>
                  <th style="padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1;">Product & Pack</th>
                  <th style="padding: 8px 12px; text-align: center; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1;">Qty</th>
                  <th style="padding: 8px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1;">Unit Price</th>
                  <th style="padding: 8px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #cbd5e1;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="padding: 12px; text-align: right; font-weight: 600; color: #64748b; border-top: 2px solid #cbd5e1;">Subtotal:</td>
                  <td style="padding: 12px; text-align: right; font-weight: 700; font-size: 14px; color: #0f172a; border-top: 2px solid #cbd5e1;">£${Number(subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="4" style="padding: 6px 12px 14px; text-align: right; font-weight: 800; font-size: 15px; color: #0d9488;">Total (GBP):</td>
                  <td style="padding: 6px 12px 14px; text-align: right; font-weight: 800; font-size: 18px; color: #0d9488;">£${Number(total).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 18px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            This is an automated order notification from CarePlus Health Forms Consumables Ordering System.<br/>
            Order Reference: <strong>${orderRef}</strong>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Plain text alternative
function buildConsumablesOrderEmailText({ orderRef, createdAt, staffName, staffEmail, staffPhone, branchName, branchId, deliveryAddress, notes, items, subtotal, total }) {
  const itemLines = items
    .map((it) => `• [${it.sku}] ${it.name} (${it.packQuantity}) - Qty: ${it.quantity} x £${Number(it.unitPrice).toFixed(2)} = £${Number(it.lineTotal).toFixed(2)}`)
    .join("\n");

  return `
CAREPLUS HEALTH - CONSUMABLES ORDER NOTIFICATION
Order Reference: ${orderRef}
Date: ${new Date(createdAt).toLocaleString("en-GB")}

STAFF & BRANCH DETAILS:
• Staff Member: ${staffName || "Staff Member"}
• Contact: ${staffEmail || ""} ${staffPhone ? "• " + staffPhone : ""}
• Branch: ${branchName || "CarePlus Health"} (${branchId || "N/A"})
• Delivery Address: ${deliveryAddress || "Standard Branch Address"}
${notes ? `• Special Instructions: ${notes}\n` : ""}
ORDERED ITEMS:
${itemLines}

----------------------------------------------
Subtotal: £${Number(subtotal).toFixed(2)}
Order Total: £${Number(total).toFixed(2)} GBP
----------------------------------------------
`;
}

// Send email notification to configured recipients
async function sendConsumablesOrderNotification(order) {
  const email1 = (process.env.CONSUMABLES_ORDER_EMAIL_1 || "").trim();
  const email2 = (process.env.CONSUMABLES_ORDER_EMAIL_2 || "").trim();

  if (!email1 || !email2) {
    throw new Error(
      "Both CONSUMABLES_ORDER_EMAIL_1 and CONSUMABLES_ORDER_EMAIL_2 must be configured on the server."
    );
  }

  const recipients = [email1, email2];
  const transporter = getEmailTransporter();
  const htmlContent = buildConsumablesOrderEmailHtml(order);
  const textContent = buildConsumablesOrderEmailText(order);

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"CarePlus Health Consumables" <orders@careplushealth.co.uk>',
    to: recipients,
    subject: `New Consumables Order: ${order.orderRef} - ${order.branchName || "CarePlus Health"} (£${Number(order.total).toFixed(2)})`,
    text: textContent,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✉️ Consumables order email sent to [${recipients.join(", ")}]:`, info.messageId || "Dispatched successfully");
  return { recipients, info };
}

/* 1. GET Catalogue Endpoint */
app.get("/api/consumables/catalogue", (req, res) => {
  res.json({
    ok: true,
    catalogue: CONSUMABLES_CATALOGUE,
    minimumOrderValue: 75.0,
  });
});

/* 2. GET Orders Endpoint */
app.get("/api/consumables/orders", async (req, res) => {
  const { branchId } = req.query;
  const cleanBranchId = branchId && branchId !== "all" && branchId.trim() !== "" ? branchId.trim() : null;
  try {
    const { rows } = await pool.query(
      `
      SELECT * FROM consumables_orders
      WHERE ($1::text IS NULL OR branch_id = $1)
      ORDER BY created_at DESC
      LIMIT 100
    `,
      [cleanBranchId]
    );
    res.json({ ok: true, rows });
  } catch (err) {
    console.error("💥 consumables orders select error", err);
    res.status(500).json({ ok: false, error: "db_error" });
  }
});

/* 3. POST Order Submission Endpoint with strict £75.00 minimum */
app.post("/api/consumables/order", async (req, res) => {
  console.log("📥 /api/consumables/order received request");
  try {
    const {
      idempotencyKey,
      branchId,
      branchName,
      staffName,
      staffEmail,
      staffPhone,
      deliveryAddress,
      notes,
      items,
    } = req.body || {};

    // 1. Idempotency Check: Prevent duplicate orders
    if (idempotencyKey) {
      const existing = await pool.query(
        "SELECT * FROM consumables_orders WHERE idempotency_key = $1",
        [idempotencyKey]
      );
      if (existing.rows.length > 0) {
        console.log("⚠️ Duplicate order detected for idempotencyKey:", idempotencyKey);
        return res.json({
          ok: true,
          order: existing.rows[0],
          isDuplicate: true,
          message: "Order already processed.",
        });
      }
    }

    // 2. Validate Items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "empty_basket",
        message: "Your basket is empty. Please add items before placing an order.",
      });
    }

    // 3. Recalculate prices & line totals server-side using trusted catalogue
    const validatedItems = [];
    let serverSubtotal = 0;

    for (const item of items) {
      const sku = item.sku || item.id;
      const product = CATALOGUE_MAP.get(sku);

      if (!product) {
        return res.status(400).json({
          ok: false,
          error: "invalid_product_sku",
          message: `Product with SKU "${sku}" is invalid or does not exist in the catalogue.`,
        });
      }

      const qty = parseInt(item.quantity, 10);
      if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({
          ok: false,
          error: "invalid_quantity",
          message: `Invalid quantity (${item.quantity}) for product "${product.name}". Must be 1 or greater.`,
        });
      }

      const unitPrice = product.price;
      const lineTotal = Number((unitPrice * qty).toFixed(2));
      serverSubtotal = Number((serverSubtotal + lineTotal).toFixed(2));

      validatedItems.push({
        sku: product.sku,
        name: product.name,
        category: product.category,
        size: product.size,
        packQuantity: product.packQuantity,
        quantity: qty,
        unitPrice,
        lineTotal,
      });
    }

    // 4. Strict Minimum Order Value Rule: Must be strictly greater than £75.00
    // £74.99 -> blocked
    // £75.00 -> blocked
    // £75.01 -> allowed
    if (serverSubtotal <= 75.00) {
      const needed = (75.01 - serverSubtotal).toFixed(2);
      return res.status(400).json({
        ok: false,
        error: "minimum_order_not_met",
        subtotal: serverSubtotal,
        message: `Minimum order value not met. Basket subtotal (£${serverSubtotal.toFixed(2)}) must strictly exceed £75.00 before you can place your order. Please add at least £${needed} more to your basket.`,
      });
    }

    // 5. Verify email recipients configuration
    const email1 = (process.env.CONSUMABLES_ORDER_EMAIL_1 || "").trim();
    const email2 = (process.env.CONSUMABLES_ORDER_EMAIL_2 || "").trim();

    if (!email1 || !email2) {
      return res.status(500).json({
        ok: false,
        error: "email_recipients_not_configured",
        message: "Order blocked: Both CONSUMABLES_ORDER_EMAIL_1 and CONSUMABLES_ORDER_EMAIL_2 must be configured on the server before placing orders.",
      });
    }

    const recipients = [email1, email2];

    // 6. Generate Unique Order Reference
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderRef = `CPH-ORD-${datePart}-${randomSuffix}`;
    const createdAt = new Date().toISOString();

    const orderPayload = {
      orderRef,
      createdAt,
      branchId: branchId || null,
      branchName: branchName || "CarePlus Health",
      staffName: staffName || "Staff Member",
      staffEmail: staffEmail || null,
      staffPhone: staffPhone || null,
      deliveryAddress: deliveryAddress || null,
      notes: notes || null,
      items: validatedItems,
      subtotal: serverSubtotal,
      total: serverSubtotal,
    };

    // 7. Dispatch Email Notifications
    let emailStatus = "sent";
    let emailError = null;

    try {
      await sendConsumablesOrderNotification(orderPayload);
    } catch (mailErr) {
      console.error("💥 Email notification delivery failure:", mailErr);
      emailStatus = "failed";
      emailError = mailErr.message || "Failed to dispatch notification email";
    }

    // 8. Durable DB Persistence: Never lose the order even if email fails
    const { rows } = await pool.query(
      `
      INSERT INTO consumables_orders (
        order_ref, idempotency_key, branch_id, branch_name, staff_name,
        staff_email, staff_phone, delivery_address, notes, items,
        subtotal, total, email_recipients, email_status, email_error
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *
    `,
      [
        orderRef,
        idempotencyKey || null,
        orderPayload.branchId,
        orderPayload.branchName,
        orderPayload.staffName,
        orderPayload.staffEmail,
        orderPayload.staffPhone,
        orderPayload.deliveryAddress,
        orderPayload.notes,
        JSON.stringify(validatedItems),
        serverSubtotal,
        serverSubtotal,
        JSON.stringify(recipients),
        emailStatus,
        emailError,
      ]
    );

    const savedOrder = rows[0];
    console.log(`✅ Consumables order created: id=${savedOrder.id}, ref=${orderRef}, emailStatus=${emailStatus}`);

    return res.json({
      ok: true,
      order: savedOrder,
      orderRef,
      emailStatus,
      emailError,
      message:
        emailStatus === "sent"
          ? `Order ${orderRef} placed successfully and notifications sent to ${recipients.join(" and ")}.`
          : `Order ${orderRef} recorded successfully in the system. However, email notification delivery encountered an issue (${emailError}). You can retry notification from your orders list.`,
    });
  } catch (err) {
    console.error("💥 consumables order error", err);
    return res.status(500).json({ ok: false, error: "server_error", message: err.message });
  }
});

/* 4. POST Retry Email Notification */
app.post("/api/consumables/orders/:id/retry-email", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM consumables_orders WHERE id = $1 OR order_ref = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "order_not_found" });
    }

    const orderRow = rows[0];
    const orderPayload = {
      orderRef: orderRow.order_ref,
      createdAt: orderRow.created_at,
      branchId: orderRow.branch_id,
      branchName: orderRow.branch_name,
      staffName: orderRow.staff_name,
      staffEmail: orderRow.staff_email,
      staffPhone: orderRow.staff_phone,
      deliveryAddress: orderRow.delivery_address,
      notes: orderRow.notes,
      items: typeof orderRow.items === "string" ? JSON.parse(orderRow.items) : orderRow.items,
      subtotal: Number(orderRow.subtotal),
      total: Number(orderRow.total),
    };

    try {
      await sendConsumablesOrderNotification(orderPayload);
      await pool.query(
        "UPDATE consumables_orders SET email_status = 'sent', email_error = NULL WHERE id = $1",
        [orderRow.id]
      );
      return res.json({ ok: true, emailStatus: "sent", message: "Email notification resent successfully." });
    } catch (mailErr) {
      await pool.query(
        "UPDATE consumables_orders SET email_status = 'failed', email_error = $1 WHERE id = $2",
        [mailErr.message, orderRow.id]
      );
      return res.status(500).json({ ok: false, emailStatus: "failed", error: mailErr.message });
    }
  } catch (err) {
    console.error("💥 retry email error", err);
    res.status(500).json({ ok: false, error: "server_error", message: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
