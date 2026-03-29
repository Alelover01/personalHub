import { useEffect, useState } from "react";
import api from '../api/axios';

const WakeUpBackend = () => {
    const [awake, setAwake] = useState(false);

    useEffect(()=>{
        const wake = async () =>{
            try{
                await api.get('/health');
                setAwake(true);
            }catch(err){ setTimeout(wake,5000);}
        };
        wake();
    },[]);

    if (awake) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom:'20px',
            right:'20px',
            background:'#1a1a2e',
            color:'#a78bfa',
            padding:'12px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            zIndex: 9999,
            border:'1px solid #a78bfa',
        }}>
            Connessione al server...
        </div>
    );
};

export default WakeUpBackend;