import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";

// Import delle pagine
import Home from "./pages/Home/Home";
import TravelPlans from "./pages/TravelPlans/TravelPlans";
import FinancialBalance from "./pages/Financial-Balance/Financial-Balance";
import Books from "./pages/Books/Books";
import TVSeries from "./pages/TV-Series/TV-Series";
import Manhwa from "./pages/Manhwa/Manhwa";
import ShoppingList from "./pages/Shopping-List/Shopping-List";
import Games from "./pages/Games/Games";
import Sites from "./pages/Sites/Sites";
import Anime from "./pages/Anime/Anime";



export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/travel-plans" element={<TravelPlans />} />
          <Route path="/financial-balance" element={<FinancialBalance />} />
          <Route path="/books" element={<Books />} />
          <Route path="/tv-series" element={<TVSeries />} />
          <Route path="/manhwa" element={<Manhwa />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/games" element={<Games />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/anime" element={<Anime />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}
