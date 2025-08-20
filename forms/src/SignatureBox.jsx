import "./SignatureBox.css";
import React, { useEffect, useRef } from "react";

export default function SignatureBox ({ value, onChange, height = 160 }){
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = "#111827";
    if (value){ const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, canvas.width/ratio, height); img.src = value; }
    else { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle = "#fff"; ctx.fillRect(0,0,canvas.width,canvas.height); }
  }, [value, height]);
  const getPos = (e) => { const r = canvasRef.current.getBoundingClientRect(); const p = (e.touches? e.touches[0]: e); return { x: p.clientX - r.left, y: p.clientY - r.top }; };
  const begin = (e) => { drawing.current = true; last.current = getPos(e); };
  const end = () => { if(!drawing.current) return; drawing.current=false; const url = canvasRef.current.toDataURL("image/png"); onChange?.(url); };
  const move = (e) => { if(!drawing.current) return; const ctx = canvasRef.current.getContext("2d"); const {x,y} = getPos(e); ctx.beginPath(); ctx.moveTo(last.current.x,last.current.y); ctx.lineTo(x,y); ctx.stroke(); last.current={x,y}; };
  const clear = () => onChange?.("");
  return (
    <div>
      <div className="sig__frame">
        <canvas
          ref={canvasRef}
          className="sig__canvas"
          style={{ height: `${height}px` }}
          onMouseDown={begin} onMouseUp={end} onMouseLeave={end} onMouseMove={move}
          onTouchStart={(e)=>{e.preventDefault();begin(e);}}
          onTouchEnd={(e)=>{e.preventDefault();end(e);}}
          onTouchMove={(e)=>{e.preventDefault();move(e);}}
        />
      </div>
      <div className="sig__actions">
        <button type="button" onClick={clear} className="btn">Clear</button>
      </div>
    </div>
  );
}