import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPatients, fetchSubmissionByName } from "./api";
import { useApp } from "./AppContext";
import "./PatientsPage.css"; // Reuse table styling

export default function FollowupWeightLossSearch() {
    const navigate = useNavigate();
    const { currentUser, setWeightLossFollowupOriginalData, setPatient } = useApp();

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchName, setSearchName] = useState("");
    const [searchDob, setSearchDob] = useState("");
    const [searchEmail, setSearchEmail] = useState("");

    const tenant = useMemo(() => {
        const n = (currentUser?.name || "").toUpperCase();
        if (n.includes("WILMSLOW")) return "WRP";
        if (n.includes("CAREPLUS")) return "CPC";
        if (n.includes("247")) return "247";
        return "";
    }, [currentUser]);

    useEffect(() => {
        if (!tenant) {
            setError("No tenant found for user.");
            setLoading(false);
            return;
        }

        fetchPatients(tenant)
            .then((data) => {
                // Only keep weightloss
                const weightLossPatients = data.filter((r) => r.service === "weightloss");
                setPatients(weightLossPatients);
            })
            .catch((err) => setError(`Failed to load patients: ${err.message}`))
            .finally(() => setLoading(false));
    }, [tenant]);

    const filteredPatients = useMemo(() => {
        return patients.filter((p) => {
            if (searchName && !(p.name || "").toLowerCase().includes(searchName.toLowerCase())) return false;
            if (searchDob && !p.dob?.includes(searchDob)) return false;
            if (searchEmail && !(p.email || "").toLowerCase().includes(searchEmail.toLowerCase())) return false;
            return true;
        });
    }, [patients, searchName, searchDob, searchEmail]);

    const handleSelectPatient = async (row) => {
        try {
            setLoading(true);
            const result = await fetchSubmissionByName({
                name: row.name,
                dob: row.dob,
                service: "weightloss",
                tenant,
            });

            if (!result.ok || !result.row) {
                alert("Could not load original weight loss consultation for this patient.");
                setLoading(false);
                return;
            }

            const { patient_data, consultation_data, pharmacist_data } = result.row;

            // Seed context
            setWeightLossFollowupOriginalData({
                patient_data,
                consultation_data,
                pharmacist_data,
            });

            // Keep superficial patient details so standard preview checks still see it
            setPatient(patient_data || {});

            // Navigate straight to Pharmacist Form (bypass consultation)
            navigate(`/service/weightlossFollowup/pharmacist`);

        } catch (err) {
            console.error(err);
            alert("Error loading patient data: " + err.message);
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("en-GB");
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="patients-page patients" style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Search Previous Weight Loss Consultation</h2>
            <p style={{ marginBottom: 20, color: '#6b7280' }}>Select an existing weight loss patient to register their follow-up formulation.</p>

            {error && <div className="error-message">{error}</div>}

            <div className="patients__filters">
                <div className="patients__filter-group">
                    <label>Search Name</label>
                    <input
                        type="text"
                        className="patients__filter-input"
                        placeholder="John Doe..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>
                <div className="patients__filter-group">
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        className="patients__filter-input"
                        value={searchDob}
                        onChange={(e) => setSearchDob(e.target.value)}
                    />
                </div>
                <div className="patients__filter-group">
                    <label>Email</label>
                    <input
                        type="text"
                        className="patients__filter-input"
                        placeholder="email@..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <p>Loading weight loss patients...</p>
            ) : (
                <div className="tablewrap">
                    <table className="table patients-table">
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>DOB</th>
                                <th>Email</th>
                                <th>Orig. Consultation Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                        No previous weight loss patients found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 500, color: '#111827' }}>{p.name}</td>
                                        <td>{formatDate(p.dob)}</td>
                                        <td>{p.email || "—"}</td>
                                        <td>{formatDate(p.created_at || p.date)}</td>
                                        <td>
                                            <button
                                                className="btn btn--primary"
                                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                                onClick={() => handleSelectPatient(p)}
                                            >
                                                Select & Continue
                                            </button>
                                        </td>
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
