import "./Row.css";
export function Row({ label, value, signature }){
  return (
    <div className="row">
      <div className="row__label">{label}</div>
      <div className={`row__value ${signature ? "row__value--sig" : ""}`}>
        {signature ? (
          signature ? <img src={signature} alt="signature" className="row__sigimg" /> : null
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );
}