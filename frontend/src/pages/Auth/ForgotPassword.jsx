import React, {useState} from "react";
import "./Auth.css"; 
import '../../styles/global.css';

export default function ForgotPassword(){
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null);

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setStatus(null);
        try{
            const res = await fetch('auth/forgot-password',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email})
            });
            const data = await res.json();
            setStatus(data.message || 'Se l\'email esiste, riceverai un link di reset.');
        } catch{
            setStatus('Errore di rete. Riprova');
        }
    };
    return (
        <div className="auth-layout">
            <div className="container active">
                <div className="form-box">
                    <form onSubmit={handleSubmit}>
                        <h1>Forgot Password</h1>
                        <div className="input-box">
                            <input type="email" placeholder="Email" required value={email} onChange={setEmail(e.target.value)} />
                            <i className="fa-solid fa-envelope"></i>
                        </div>
                        <button type="submit" className="btn">Invia link reset</button>
                        {status && <p style={{marginTop: 10}}>{status}</p>}
                    </form>
                </div>
            </div>
        </div>
    )
}