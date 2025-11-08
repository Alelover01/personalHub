import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; 

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleToggleRegister = () => {
    setError(null); 
    setIsRegister(true);
  };
  const handleToggleLogin = () => {
    setError(null); 
    setIsRegister(false);
  };
  
  // Gestore per i campi di Login
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Gestore per i campi di Registrazione
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        // Login riuscito: salva token e vai a /home
        localStorage.setItem("token", data.token); // Salva il token JWT
        localStorage.setItem("username", data.user.username); // Salva il nome utente
        navigate("/home");
      } else {
        // Login fallito: mostra l'errore dal backend
        setError(data.message || "Errore di login sconosciuto.");
      }
    } catch (err) {
      console.error("Errore di rete/server:", err);
      setError("Impossibile connettersi al server.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registrazione completata! Effettua il login."); // Notifica l'utente
        //Login Automatico
        localStorage.setItem("token", data.token); 
        localStorage.setItem("username", data.user.username);
        navigate("/home"); 
      } else {
        setError(data.message || "Errore di registrazione sconosciuto.");
      }
    } catch (err) {
      console.error("Errore di rete/server:", err);
      setError("Impossibile connettersi al server.");
    }
  };
  return (
    <div className={`auth-layout`}>
      <div className={`container ${isRegister ? "active" : ""}`}>
        {/* Mostra l'errore, se presente */}
        {error && (
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, 
                backgroundColor: '#f8d7da', color: '#721c24', 
                padding: '10px', textAlign: 'center', zIndex: 10, 
                borderTopLeftRadius: '30px', borderTopRightRadius: '30px'
            }}>
                {error}
            </div>
        )}
        {/* Login Form */}
        <div className="form-box login">
          <form onSubmit={handleLoginSubmit}>
            <h1>Login</h1>
            <div className="input-box">
              <input type="text" name="username" placeholder="Username" required value={loginData.username} onChange={handleLoginChange} />
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="input-box">
              <input type="password" name="password" placeholder="Password" required value={loginData.password} onChange={handleLoginChange} />
              <i className="fa-solid fa-lock"></i>
            </div>
            <div className="forgot-link">
              <a href="#">Forgot Password?</a>
            </div>
            <button type="submit" className="btn">Login</button>
            <p>or login with social platforms</p>
            <div className="social-icons">
              <a href="#"><i className="fa-brands fa-google"></i></a>
              <a href="#"><i className="fa-brands fa-facebook"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-github"></i></a>
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className="form-box register">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Register</h1>
            <div className="input-box">
              <input type="text" name="username" placeholder="Username" required value={registerData.username} onChange={handleRegisterChange} />
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="input-box">
              <input type="email" name="email" placeholder="Email" required value={registerData.email} onChange={handleRegisterChange} />
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="input-box">
              <input type="password" name="password" placeholder="Password" required value={registerData.password} onChange={handleRegisterChange} />
              <i className="fa-solid fa-lock"></i>
            </div>
            <button type="submit" className="btn">Register</button>
            <p>or register with social platforms</p>
            <div className="social-icons">
              <a href="#"><i className="fa-brands fa-google"></i></a>
              <a href="#"><i className="fa-brands fa-facebook"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-github"></i></a>
            </div>
          </form>
        </div>

        {/* Toggle Box */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button className="btn register-btn" type="button" onClick={handleToggleRegister}>Register</button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account</p>
            <button className="btn login-btn" type="button" onClick={handleToggleLogin}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
