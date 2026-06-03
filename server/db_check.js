// server/db_check.js
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_JHFOXf6hM0jx@ep-purple-recipe-abo50w9z-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    const { rows } = await pool.query(
      `SELECT id, service, tenant, patient_name, created_at,
              (pharmacist_data->>'originalPatient') IS NOT NULL as has_original_patient
       FROM form_submissions
       WHERE service IN ('travelFollowUp', 'weightlossFollowup')
       ORDER BY id DESC
       LIMIT 15`
    );
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await pool.end();
  }
}

main();
