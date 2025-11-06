import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // il CSS che ti do sotto

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleToggleRegister = () => setIsRegister(true);
  const handleToggleLogin = () => setIsRegister(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // simulazione login -> salva stato e vai a /home
    localStorage.setItem("loggedIn", "true");
    navigate("/home");
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // qui puoi aggiungere validazione / API
    // dopo registrazione magari vai al login o direttamente /home
    localStorage.setItem("loggedIn", "true");
    navigate("/home");
  };

  return (
    <div className={`auth-layout`}>
      <div className={`container ${isRegister ? "active" : ""}`}>
        {/* Login Form */}
        <div className="form-box login">
          <form onSubmit={handleLoginSubmit}>
            <h1>Login</h1>
            <div className="input-box">
              <input type="text" placeholder="Username" required />
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="input-box">
              <input type="password" placeholder="Password" required />
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
              <input type="text" placeholder="Username" required />
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="input-box">
              <input type="email" placeholder="Email" required />
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="input-box">
              <input type="password" placeholder="Password" required />
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
