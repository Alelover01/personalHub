import React, { useState } from "react";
import "./Auth.css"; // Importa il CSS corretto

export default function Auth() {
  const [isActive, setIsActive] = useState(false);

  const toggleForm = () => setIsActive(!isActive);

  return (
    <div className="auth-layout">
      <div className={`container ${isActive ? "active" : ""}`}>
        {/* === BLOBBY BACKGROUND === */}
        <div className="toggle-box"></div>

        {/* === LOGIN FORM === */}
        <div className="form-box login">
          <h1>Accedi</h1>
          <p>Accedi al tuo account personale</p>

          <div className="input-box">
            <input type="email" placeholder="Email" />
            <i className="bx bx-envelope"></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" />
            <i className="bx bx-lock-alt"></i>
          </div>

          <div className="forgot-link">
            <a href="#">Hai dimenticato la password?</a>
          </div>

          <button className="btn">Login</button>

          <p>Oppure accedi con</p>
          <div className="social-icons">
            <a href="#"><i className="fa-brands fa-google"></i></a>
            <a href="#"><i className="fa-brands fa-facebook"></i></a>
            <a href="#"><i className="fa-brands fa-instagram"></i></a>
            <a href="#"><i className="fa-brands fa-github"></i></a>
          </div>
        </div>

        {/* === REGISTER FORM === */}
        <div className="form-box register">
          <h1>Registrati</h1>
          <p>Crea un nuovo account per iniziare</p>

          <div className="input-box">
            <input type="text" placeholder="Nome completo" />
            <i className="bx bx-user"></i>
          </div>
          <div className="input-box">
            <input type="email" placeholder="Email" />
            <i className="bx bx-envelope"></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" />
            <i className="bx bx-lock-alt"></i>
          </div>

          <button className="btn">Registrati</button>

          <p>Oppure registrati con</p>
          <div className="social-icons">
            <a href="#"><i className="fa-brands fa-google"></i></a>
            <a href="#"><i className="fa-brands fa-facebook"></i></a>
            <a href="#"><i className="fa-brands fa-instagram"></i></a>
            <a href="#"><i className="fa-brands fa-github"></i></a>
          </div>
        </div>

        {/* === TOGGLE PANELS === */}
        <div className="toggle-panel toggle-left">
          <h1>Bentornato!</h1>
          <p>Hai già un account? Accedi per continuare.</p>
          <button className="btn" onClick={toggleForm}>
            Login
          </button>
        </div>

        <div className="toggle-panel toggle-right">
          <h1>Ciao, nuovo utente!</h1>
          <p>Non hai ancora un account? Registrati subito!</p>
          <button className="btn" onClick={toggleForm}>
            Registrati
          </button>
        </div>
      </div>
    </div>
  );
}