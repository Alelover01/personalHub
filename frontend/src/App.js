import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

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
            <Route path="/Home" element={<Home />} />
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
      <Footer />
    </BrowserRouter>
  );
}
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

// Pagine di autenticazione
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Pagine principali
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
      <Routes>
        {/* --- Autenticazione --- */}
        <Route
          path="/"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />

        {/* --- Layout principale --- */}
        <Route
          path="/home"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/travel-plans"
          element={
            <MainLayout>
              <TravelPlans />
            </MainLayout>
          }
        />
        <Route
          path="/financial-balance"
          element={
            <MainLayout>
              <FinancialBalance />
            </MainLayout>
          }
        />
        <Route
          path="/books"
          element={
            <MainLayout>
              <Books />
            </MainLayout>
          }
        />
        <Route
          path="/tv-series"
          element={
            <MainLayout>
              <TVSeries />
            </MainLayout>
          }
        />
        <Route
          path="/manhwa"
          element={
            <MainLayout>
              <Manhwa />
            </MainLayout>
          }
        />
        <Route
          path="/shopping-list"
          element={
            <MainLayout>
              <ShoppingList />
            </MainLayout>
          }
        />
        <Route
          path="/games"
          element={
            <MainLayout>
              <Games />
            </MainLayout>
          }
        />
        <Route
          path="/sites"
          element={
            <MainLayout>
              <Sites />
            </MainLayout>
          }
        />
        <Route
          path="/anime"
          element={
            <MainLayout>
              <Anime />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
