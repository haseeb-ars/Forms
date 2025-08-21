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
    if (!tenant) {
      setError(`No tenant found for user: ${currentUser?.name || 'Not logged in'}`);
      setLoading(false);
      return;
    }
    
    console.log('Fetching patients for tenant:', tenant);
    fetchPatients(tenant)
      .then(data => {
        console.log('Patients data received:', data);
        setRows(data);
      })
      .catch(err => {
        console.error('Error fetching patients:', err);
        setError(`Failed to load: ${err.message || 'Unknown error'}`);
      })
      .finally(() => setLoading(false));
  },[tenant, currentUser]);

  const downloadPdf = () => {
    // quick path: use browser print to PDF
    window.print();
  };

  return (
    <div className="patients">
      <div className="patients__actions">
        <button className="btn" onClick={()=>downloadPatientsXlsx(tenant)} disabled={!tenant}>Download Excel</button>
        <button className="btn" onClick={downloadPdf}>Print to PDF</button>
      </div>
      
    
      
      {loading ? <div>Loading…</div> : error ? (
        <div style={{ color: 'red', padding: '1rem', background: '#fee', borderRadius: '0.25rem' }}>
          {error}
        </div>
      ) : (
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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No patients found for tenant: {tenant}
                  </td>
                </tr>
              ) : (
                rows.map(r => (
                  <tr key={r.id || `${r.name}-${r.created_at}`}>
                    <td>{r.name}</td>
                    <td>{r.dob ? String(r.dob).slice(0,10) : ""}</td>
                    <td>{r.address}</td>
                    <td>{r.contact_no || r.contactNo}</td>
                    <td>{r.email}</td>
                    <td>{r.service}</td>
                    <td>{r.created_at ? new Date(r.created_at).toLocaleString() : r.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


