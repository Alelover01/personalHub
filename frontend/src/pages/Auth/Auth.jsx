import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; 

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "", profilePictureFile: null});
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const navigate = useNavigate();

  //Funzione di utilità per la validazione dell'email
  const validateEmail = (email) =>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

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
    const {name, value , files } = e.target;
    if (name === 'profilePicture'){
      setRegisterData({...registerData, profilePictureFile: files[0] });
    } else {
      let newEmailError = null;
      if (name === 'email'){
        if (value.trim() !== '' && !validateEmail(value)){
          newEmailError = 'Formato email non valido';
        }
        setEmailError(newEmailError);
      }
      setRegisterData({...registerData, [name]: value});
    }
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
        localStorage.setItem("token", data.token); 
        localStorage.setItem("username", data.user.username); 
        navigate("/home");
      } else {
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

    if (emailError){
      setError('Correggi l\'email prima di procedere con la registrazione.');
      return;
    }
    const formData = new FormData();
    formData.append('username', registerData.username);
    formData.append('email', registerData.email);
    formData.append('password', registerData.password);
    if (registerData.profilePictureFile){
      formData.append('profilePicture', registerData.profilePictureFile);
    }

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registrazione completata! Accesso in corso..."); // Notifica l'utente
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
  //Funzione per mostrare un anteprima dell'immagine profilo
  const getProfilePicturePreview = ()=>{
    if (registerData.profilePictureFile){
      return URL.createObjectURL(registerData.profilePictureFile);
    }
    return 'https://placehold.co/100x100/d6ccc2/4a4a4a?text=Foto';
  }
  return (
    <div className={`auth-layout`}>
      <div className={`container ${isRegister ? "active" : ""}`}>
        {/* Mostra l'errore, se presente */}
        {error && (
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, 
                backgroundColor: error.includes('successo')? '#d4edda':'#f8f7da', 
                color: error.includes('successo')? '#155724': '#721c24',
                padding: '10px', textAlign: 'center', zIndex: 10, 
                borderTopLeftRadius: '30px', borderTopRightRadius: '30px',
                fontWeight: 'bold'
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
            <label htmlFor="profilePictureInput" className="file-input-wrapper">
              <img 
              src={getProfilePicturePreview()}
              alt="Anteprima Profilo"
              className="profile-image-preview"
              title="Clicca per selezionare l\'immagine"
              ></img>
              <span style={{ fontSize: '14px', color: '#4a4a4a', fontWeight: '500'}}>
                {registerData.profilePictureFile ? registerData.profilePictureFile.name: 'Scegli Foto Profilo'}
              </span>
              <input type="file" id="profilePictureInput" name="profilePicture" accept="image/*" onChange={handleRegisterChange} style={{ display: 'none'}}></input>
            </label>
            <div className="input-box">
              <input type="text" name="username" placeholder="Username" required value={registerData.username} onChange={handleRegisterChange} />
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="input-box">
              <input type="email" name="email" placeholder="Email" required value={registerData.email} onChange={handleRegisterChange} style={{ borderColor: emailError ? '#dc3545' : 'initial'}} />
              <i className="fa-solid fa-envelope"></i>
              {emailError && <div className="email-error">{emailError}</div>}
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
            <p>Already have an account?</p>
            <button className="btn login-btn" type="button" onClick={handleToggleLogin}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
