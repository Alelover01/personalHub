import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Auth.css"; 
import '../../styles/global.css';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Password aggiornata! Ora puoi effettuare il login.");
        setTimeout(() => navigate("/auth"), 1500);
      } else {
        setStatus(data.message || "Impossibile aggiornare la password.");
      }
    } catch {
      setStatus("Errore di rete. Riprova.");
    }
  };

  if (!token) {
    return <p>Token mancante o link non valido.</p>;
  }

  return (
    <div className="auth-layout">
      <div className="container active">
        <div className="form-box">
          <form onSubmit={handleSubmit}>
            <h1>Reset Password</h1>
            <div className="input-box">
              <input
                type="password"
                placeholder="Nuova password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <i className="fa-solid fa-lock"></i>
            </div>
            <button type="submit" className="btn">Aggiorna password</button>
            {status && <p style={{ marginTop: 10 }}>{status}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
