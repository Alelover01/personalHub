import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import WakeUpBackend from './components/WakeUpBackend';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Books from './pages/Books';
import Series from './pages/Series';
import Travel from './pages/Travel';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <>
      <WakeUpBackend />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
        <Route path="/series" element={<ProtectedRoute><Series /></ProtectedRoute>} />
        <Route path="/travel" element={<ProtectedRoute><Travel /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;