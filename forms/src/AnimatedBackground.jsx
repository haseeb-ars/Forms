import React, { useEffect, useRef, useState } from "react";
import "./AnimatedBackground.css";

const HEALTHCARE_SYMBOLS = [
  { icon: "✚", name: "cross", type: "text" },
  { icon: "💊", name: "capsule", type: "text" },
  { icon: "🩺", name: "stethoscope", type: "text" },
  { icon: "🛡️", name: "shield", type: "text" },
  { icon: "🧪", name: "vial", type: "text" },
  { icon: "⚡", name: "pulse", type: "text" },
  { icon: "❤️", name: "heart", type: "text" },
];

export default function AnimatedBackground({ children }) {
  const canvasRef = useRef(null);
  const [effectMode, setEffectMode] = useState(() => {
    return localStorage.getItem("cph_bg_effect") || "full"; // "full" | "reduced" | "disabled"
  });

  useEffect(() => {
    localStorage.setItem("cph_bg_effect", effectMode);
  }, [effectMode]);

  useEffect(() => {
    if (effectMode === "disabled") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || effectMode === "reduced";

    // Handle resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse tracking & ripples
    const mouse = { x: -1000, y: -1000, active: false };
    const ripples = [];

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      // Spawn ripple on mouse move (throttled)
      if (!isReducedMotion && !isMobile && Math.random() < 0.15) {
        ripples.push({
          x: mouse.x,
          y: mouse.y,
          radius: 10,
          maxRadius: 140 + Math.random() * 60,
          opacity: 0.4,
          speed: 2.5 + Math.random() * 1.5,
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Particle class definition
    const particleCount = isMobile ? 18 : 42;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const symbolObj = HEALTHCARE_SYMBOLS[Math.floor(Math.random() * HEALTHCARE_SYMBOLS.length)];
      const depth = Math.random(); // 0 = background, 1 = foreground

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        vx: (Math.random() - 0.5) * (0.3 + depth * 0.4),
        vy: (Math.random() - 0.5) * (0.3 + depth * 0.4),
        size: depth > 0.6 ? 22 + Math.random() * 10 : depth > 0.3 ? 16 + Math.random() * 6 : 10 + Math.random() * 4,
        opacity: depth > 0.6 ? 0.22 : depth > 0.3 ? 0.14 : 0.08,
        depth: depth, // 0 to 1
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        symbol: symbolObj.icon,
      });
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render expanding ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity *= 0.96;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(22, 101, 52, ${r.opacity * 0.25})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (r.opacity < 0.01 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // Render & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Natural floating motion
        if (!isReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;

          // Wrap edges
          if (p.x < -30) p.x = width + 30;
          if (p.x > width + 30) p.x = -30;
          if (p.y < -30) p.y = height + 30;
          if (p.y > height + 30) p.y = -30;
        }

        // 2. Interactive Cursor Repulsion & Water Wave Physics
        if (mouse.active && !isReducedMotion && !isMobile) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            const angle = Math.atan2(dy, dx);
            const push = force * (1.5 + p.depth * 2);

            p.x += Math.cos(angle) * push;
            p.y += Math.sin(angle) * push;
            p.rotation += (Math.random() - 0.5) * 0.05 * force;
          }
        }

        // Render Symbol
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Blur background particles for depth
        if (p.depth < 0.3) {
          ctx.filter = "blur(3px)";
        }

        ctx.fillStyle = `rgba(22, 101, 52, ${p.opacity})`;
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [effectMode]);

  return (
    <div className="animated-bg-wrapper">
      <div className="gradient-mesh-bg" />

      {effectMode !== "disabled" && (
        <canvas ref={canvasRef} className="healthcare-bg-canvas" />
      )}

      {/* Background Effect Quick Selector */}
      <div className="bg-effects-controls">
        <button
          type="button"
          className="bg-effect-toggle-btn"
          title="Toggle Background Animations"
          onClick={() => {
            const modes = ["full", "reduced", "disabled"];
            const nextIdx = (modes.indexOf(effectMode) + 1) % modes.length;
            setEffectMode(modes[nextIdx]);
          }}
        >
          ✨ BG: <strong style={{ textTransform: "capitalize" }}>{effectMode}</strong>
        </button>
      </div>

      <div className="animated-bg-content">{children}</div>
    </div>
  );
}
