import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; 
import '../../styles/global.css';
/**
 * Auth Component
 * Handles both Login and Registration flows with form validation,
 * profile picture upload preview, and automatic login after registration.
 */
export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "", profilePictureFile: null});
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const navigate = useNavigate();

  /**
   * Utility function to validate email format
   * @param {string} email - The email string to validate
   * @returns {boolean} true if valid, false otherwise
   */
  const validateEmail = (email) =>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  /** Toggle to Registration form */
  const handleToggleRegister = () => {
    setError(null); 
    setIsRegister(true);
  };
  /** Toggle to Login form */
  const handleToggleLogin = () => {
    setError(null); 
    setIsRegister(false);
  };
  /** Handle input changes for Login form*/
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };
  /** Handle input changes for Registration form*/
  const handleRegisterChange = (e) => {
    const {name, value , files } = e.target;
    if (name === 'profilePicture'){
      setRegisterData({...registerData, profilePictureFile: files[0] });
    } else {
      let newEmailError = null;
      if (name === 'email'){
        if (value.trim() !== '' && !validateEmail(value)){
          newEmailError = 'Invalid email format';
        }
        setEmailError(newEmailError);
      }
      setRegisterData({...registerData, [name]: value});
    }
  };
  /**
   * Handle Login form submission
   * Sends credentials to backend and stores JWT token in localStorage
   */
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
        setError(data.message || "Unknown login error.");
      }
    } catch (err) {
      console.error("Network/Server error:", err);
      setError("Unable to connect to the server.");
    }
  };
  /**
   * Handle Registration form submission
   * Validates email, upload profile picture and logs in automatically
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (emailError){
      setError('Please fix the email before proceeding with registration.');
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
        alert("Registration completed! Logging in...");
        localStorage.setItem("token", data.token); 
        localStorage.setItem("username", data.user.username);
        navigate("/home"); 
      } else {
        setError(data.message || "Unknown registation error.");
      }
    } catch (err) {
      console.error("Network/Server error:", err);
      setError("Unable to connect to the server.");
    }
  };
  /**
   * Returns preview URL for profile picture
   * @returns {string} URL for preview image
   */
  const getProfilePicturePreview = ()=>{
    if (registerData.profilePictureFile){
      return URL.createObjectURL(registerData.profilePictureFile);
    }
    return 'https://placehold.co/100x100/d6ccc2/4a4a4a?text=Foto';
  }
  return (
    <div className={`auth-layout`}>
      <div className={`container ${isRegister ? "active" : ""}`}>
        {/* Error banner */}
        {error && (
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, 
                backgroundColor: error.includes('success')? '#d4edda':'#f8f7da', 
                color: error.includes('success')? '#155724': '#721c24',
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
              alt="Profile Preview"
              className="profile-image-preview"
              title="Click to select an image"
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

        {/* Toggle Box: switches between Login and Register */}
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