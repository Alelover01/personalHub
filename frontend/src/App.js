import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

// Pagina di autenticazione unificata (Login + Register)
import Auth from "./pages/Auth/Auth";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

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
        {/* --- Autenticazione (Login + Register) --- */}
        <Route
          path="/"
          element={
            <AuthLayout>
              <Auth />
            </AuthLayout>
          }
        />
        <Route
          path="/auth"
          element={
            <AuthLayout>
              <Auth />
            </AuthLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          }
        />

        <Route
          path="/reset-password"
          element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          }
        />

        {/* --- Pagine principali con Navbar e Footer --- */}
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
