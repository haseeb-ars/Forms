import React, { useEffect, useMemo, useState } from "react";
import { fetchPatients, downloadPatientsXlsx } from "./api";
import { useApp } from "./AppContext.jsx";
import "./PatientsPage.css";

export default function PatientsPage(){
  const { currentUser } = useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const tenant = useMemo(()=>{
    const n = (currentUser?.name || '').toUpperCase();
    if (n.includes('WILMSLOW')) return 'WRP';
    if (n.includes('CAREPLUS')) return 'CPC';
    if (n.includes('247')) return '247';
    return '';
  },[currentUser]);

  useEffect(()=>{
    fetchPatients(tenant).then(setRows).catch(()=>setError("Failed to load"))
      .finally(()=>setLoading(false));
  },[tenant]);

  const downloadPdf = () => {
    // quick path: use browser print to PDF
    window.print();
  };

  return (
    <div className="patients">
      <div className="patients__actions">
        <button className="btn" onClick={()=>downloadPatientsXlsx(tenant)}>Download Excel</button>
        <button className="btn" onClick={downloadPdf}>Print to PDF</button>
      </div>
      {loading ? <div>Loading…</div> : error ? <div>{error}</div> : (
        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>DOB</th>
                <th>Address</th>
                <th>Contact No</th>
                <th>Email</th>
                <th>Service</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id || `${r.name}-${r.created_at}`}>
                  <td>{r.name}</td>
                  <td>{r.dob ? String(r.dob).slice(0,10) : ""}</td>
                  <td>{r.address}</td>
                  <td>{r.contact_no || r.contactNo}</td>
                  <td>{r.email}</td>
                  <td>{r.service}</td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleString() : r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


