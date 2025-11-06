import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function MainLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar sempre visibile */}
      <Navbar />

      {/* Contenuto principale */}
      <main style={{ flex: 1, padding: "20px" }}>{children}</main>

      {/* Footer sempre visibile */}
      <Footer />
    </div>
  );
}