import React from "react";
import "./AnimatedBackground.css";

export default function AnimatedBackground({ children }) {
  return (
    <div className="animated-bg-wrapper">
      <div className="healthcare-static-bg" />
      <div className="animated-bg-content">{children}</div>
    </div>
  );
}
