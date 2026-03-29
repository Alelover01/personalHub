import { createContext, useContext, useState, useEffect, Children } from "react";

const AuthContext = createContext()

export const AuthProvider = ({Children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=> {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    },[]);

    const login = (userData,token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return(
        <AuthContext.Provider value={{ user, login, logout, loading}}>
            {Children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext)