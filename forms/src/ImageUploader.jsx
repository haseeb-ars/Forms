import React, { useRef } from "react";

export default function ImageUploader({ value, onChange, label, accept = "image/*" }){
  const inputRef = useRef(null);
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange?.(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clear = () => onChange?.("");

  return (
    <div>
      {label && <div className="label" style={{ marginBottom: 6 }}>{label}</div>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input ref={inputRef} type="file" accept={accept} onChange={onFile} />
        <button type="button" className="btn" onClick={clear}>Clear</button>
      </div>
      {value ? (
        <div style={{ marginTop: 8 }}>
          <img src={value} alt="uploaded" style={{ maxWidth: 240, border: '1px solid #ccc' }} />
        </div>
      ) : null}
    </div>
  );
}


