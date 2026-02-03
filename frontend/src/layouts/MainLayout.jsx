import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function MainLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* Navbar on the left side */}
      <Navbar />
      
      {/* Main Content + Footer*/}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ flex: 1, padding: "20px" }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}