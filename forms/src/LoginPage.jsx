import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import "./LoginPage.css";

export default function LoginPage(){
  const { login } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onSubmit = (e) => {
    e.preventDefault();
    const res = login(username.trim(), password);
    if (res.ok){
      nav(from, { replace: true });
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        
        <h1 className="login-title">Sign in</h1>
        <p className="login-sub">Access to service forms is restricted</p>
        <form onSubmit={onSubmit} className="login-form">
          <label className="login-label">Username
            <input className="login-input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. admin" autoComplete="username" />
          </label>
          <label className="login-label">Password
            <input className="login-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </label>
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" type="submit">Login</button>
        </form>
        
      </div>
    </div>
  );
}
