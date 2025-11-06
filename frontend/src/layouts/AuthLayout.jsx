import React from "react";
import "../styles/global.css";

export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(90deg, #edede9, #e3d5ca, #d6ccc2)",
      }}
    >
      {children}
    </div>
  );
}
