import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const { Pool } = pkg;

const app = express();

// Configure CORS to allow specific origins
const allowed = [
  "http://localhost:3000",
  "http://localhost:4000", 
  "https://haseeb-ars.github.io",
  "https://haseeb-ars.github.io/Forms",
  "https://forms.careplushealth.co.uk" // ✅ add this
];

app.use(cors({ origin: allowed }));
app.use(express.json({ limit: '5mb' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
});

async function ensureSchema(){
  // Enable uuid function
  await pool.query('create extension if not exists pgcrypto');
  const tables = ['patients_wrp','patients_cpc','patients_247'];
  for (const t of tables){
    await pool.query(`
      create table if not exists ${t} (
        id uuid primary key default gen_random_uuid(),
        name text,
        dob date,
        address text,
        contact_no text,
        email text,
        service text,
        created_at timestamptz default now(),
        upsert_key text
      );
    `);
    await pool.query(`alter table ${t} add column if not exists upsert_key text`);
    await pool.query(`create unique index if not exists ${t}_upsert_key_idx on ${t}(upsert_key)`);
  }
}

function tableForTenant(tenant){
  switch ((tenant || '').toUpperCase()){
    case 'WRP': return 'patients_wrp';
    case 'CPC': return 'patients_cpc';
    case '247': return 'patients_247';
    default: return null;
  }
}

ensureSchema().catch(console.error);

app.get('/health', (req,res)=>res.json({ ok:true }));

app.post('/api/patients', async (req, res) => {
  const { tenant, name, dob, address, contactNo, email, service, date } = req.body || {};
  const table = tableForTenant(tenant);
  if (!table) return res.status(400).json({ ok:false, error:'bad_tenant' });
  try {
    const key = [tenant||'', (name||'').trim().toUpperCase(), dob||'', service||''].join('|');
    const { rows } = await pool.query(
      `insert into ${table}(name, dob, address, contact_no, email, service, created_at, upsert_key)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (upsert_key) do update set upsert_key = excluded.upsert_key
       returning *`,
      [name || null, dob || null, address || null, contactNo || null, email || null, service || null, date ? new Date(date) : new Date(), key]
    );
    res.json({ ok: true, row: rows[0], deduped: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'db_error' });
  }
});

app.get('/api/patients', async (req, res) => {
  const table = tableForTenant(req.query.tenant);
  if (!table) return res.status(400).json({ ok:false, error:'bad_tenant' });
  try {
    const { rows } = await pool.query(`select * from ${table} order by created_at desc limit 1000`);
    res.json({ ok: true, rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'db_error' });
  }
});

app.get('/api/patients.xlsx', async (req, res) => {
  const table = tableForTenant(req.query.tenant);
  if (!table) return res.status(400).json({ ok:false, error:'bad_tenant' });
  try {
    const { rows } = await pool.query(`select name, dob, address, contact_no as "contactNo", email, service, created_at as "date" from ${table} order by created_at desc`);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patients');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="patients.xlsx"');
    res.send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'export_error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, ()=>{
  console.log(`Server listening on http://localhost:${port}`);
});


