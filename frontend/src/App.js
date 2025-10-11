import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home/";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Aggiungeremo qui le altre pagine */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
