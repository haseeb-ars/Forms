import React from 'react';

export default function ACWYCertificateTemplate({ data = {}, isPDF = false }) {
  const safe = (v) => (v && String(v).trim() !== "" ? v : "—");

  return (
    <div className="cert-root" style={isPDF ? { padding: 0, display: 'block' } : {}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');

        .cert-root {
          font-family: 'EB Garamond', Georgia, serif;
          display: flex;
          justify-content: center;
          padding: 16px 0 24px;
          background: #fff;
        }

        .cert-paper {
          background: #f0ede8;
          width: 680px;
          position: relative;
          padding: 60px 40px 75px; /* Increased to 60px to fill space */
          border: 1px solid #c8b898;
          min-height: 920px; /* Added min-height to ensure it fills the page */
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .cert-watermark {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.11;
        }

        .cert-content {
          position: relative;
          z-index: 1;
        }

        .cert-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 10px; /* Reduced from 14 */
        }

        .cert-stamp {
          width: 100px; /* Reduced from 110 */
          height: 100px;
          position: relative;
          flex-shrink: 0;
        }

        .stamp-ring-outer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid #6b5a3a;
          box-shadow: 0 0 0 1px #c9b98a, 0 0 0 3px #6b5a3a, inset 0 0 0 2px #c9b98a;
        }

        .stamp-core {
          position: absolute;
          inset: 12px;
          border-radius: 50%;
          background: linear-gradient(145deg, #7a6040, #4a3010);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #c9b98a;
          gap: 0;
        }

        .stamp-top-text {
          font-size: 5px;
          color: #e8d8a0;
          letter-spacing: 1px;
          text-transform: uppercase;
          line-height: 1.1;
        }

        .stamp-certified-text {
          font-size: 11px;
          color: #f5e8b0;
          font-weight: 600;
          letter-spacing: 0.5px;
          line-height: 1;
          margin: 1px 0;
        }

        .stamp-ribbon {
          background: linear-gradient(90deg, #4a3010, #7a6040, #4a3010);
          color: #f5e8b0;
          font-size: 4px;
          letter-spacing: 0.5px;
          padding: 1px 4px;
          text-align: center;
          text-transform: uppercase;
          border-top: 0.5px solid #c9b98a;
          border-bottom: 0.5px solid #c9b98a;
          width: 100%;
        }

        .cert-arabic-title {
          font-family: 'Amiri', serif;
          font-size: 44px; /* Reduced from 52 */
          color: #2a200e;
          line-height: 1;
          direction: rtl;
          text-align: right;
          flex: 1;
          padding-left: 16px;
        }

        .cert-subtitle-band {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1.2px solid #9a8a6a;
          border-bottom: 1.2px solid #9a8a6a;
          padding: 3px 0;
          margin-bottom: 10px; /* Reduced from 14 */
          gap: 12px;
        }

        .sub-en {
          font-size: 8.5px;
          color: #5a4a2a;
          letter-spacing: 0.2px;
        }

        .sub-ar {
          font-family: 'Amiri', serif;
          font-size: 9.5px;
          color: #5a4a2a;
          direction: rtl;
        }

        .cert-main-title {
          text-align: center;
          margin-bottom: 12px; /* Reduced from 16 */
        }

        .main-title-en {
          font-size: 14.5px; /* Reduced from 16 */
          font-weight: 600;
          color: #1a120a;
          line-height: 1.2;
          margin-bottom: 3px;
        }

        .main-title-ar {
          font-family: 'Amiri', serif;
          font-size: 12.5px;
          color: #1a120a;
          direction: rtl;
          line-height: 1.5;
        }

        .field-group {
          margin-bottom: 8px; /* Reduced from 12 */
        }

        .field-label-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 1px;
        }

        .lbl-en {
          font-size: 11px; /* Reduced from 12 */
          color: #3a2e1e;
        }

        .lbl-ar {
          font-family: 'Amiri', serif;
          font-size: 11.5px;
          color: #3a2e1e;
          direction: rtl;
        }

        .field-input-box {
          width: 100%;
          border-bottom: 1px solid #9a8a6a;
          font-size: 13px;
          color: #1a120a;
          padding: 2px 2px;
          min-height: 20px;
          display: flex;
          align-items: center;
        }

        .two-col {
          display: flex;
          gap: 20px;
          margin-bottom: 8px;
        }

        .two-col .field-group {
          flex: 1;
          margin-bottom: 0;
        }

        .para-en {
          font-size: 11px;
          color: #2a200e;
          line-height: 1.4;
          margin-bottom: 2px;
        }

        .para-ar {
          font-family: 'Amiri', serif;
          font-size: 11.5px;
          color: #2a200e;
          direction: rtl;
          text-align: right;
          line-height: 1.5;
          margin-bottom: 6px;
        }

        .divider-line {
          border: none;
          border-top: 1px solid #c8b898;
          margin: 8px 0;
        }

        .sig-container {
          min-height: 40px; /* Reduced from 60 */
          border-bottom: 1px solid #9a8a6a;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 16px;
          color: #1a120a;
          padding-left: 10px;
          font-style: italic;
        }

        .block-caps-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1px;
          margin-bottom: 6px;
        }

        .block-caps-note {
          font-size: 7.5px;
          color: #7a6a4a;
          letter-spacing: 0.4px;
        }

        .block-caps-note-ar {
          font-family: 'Amiri', serif;
          font-size: 8.5px;
          color: #7a6a4a;
          direction: rtl;
        }

        .stamp-box {
          border: 1px solid #9a8a6a;
          padding: 10px 14px 8px;
          margin-bottom: 0;
        }

        .stamp-box-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 3px;
        }

        .stamp-box-inner {
          min-height: 60px; /* Reduced from 70 */
          margin-bottom: 3px;
          font-size: 11.5px;
          color: #1a120a;
          white-space: pre-wrap;
          line-height: 1.3;
        }

        .vax-date-row {
          border-top: 1px solid #9a8a6a;
          padding-top: 4px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .footer-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px; /* Reduced from 12 */
          border-top: 1px solid #c8b898;
          padding-top: 6px;
        }

        .footer-code-text {
          font-size: 8px;
          color: #8a7a5a;
        }

        .pfizer-row {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .pfizer-produced {
          font-size: 8px;
          color: #8a7a5a;
          font-style: italic;
        }

        .pfizer-name {
          font-size: 14px;
          font-weight: 700;
          color: #003087;
        }

        .side-effects-section {
          display: flex;
          gap: 16px;
          border-top: 1px solid #c8b898;
          padding-top: 6px;
          margin-top: 6px;
        }

        .side-effects-en {
          flex: 1;
          font-size: 7.5px;
          color: #5a4a2a;
          line-height: 1.4;
        }

        .side-effects-ar {
          flex: 1;
          font-family: 'Amiri', serif;
          font-size: 8.5px;
          color: #5a4a2a;
          direction: rtl;
          text-align: right;
          line-height: 1.4;
        }
      `}</style>

      <div className="cert-paper">
        <svg className="cert-watermark" viewBox="0 0 680 1000" preserveAspectRatio="xMidYMid slice">
          <g stroke="#7a6a4a" fill="none">
            <circle cx="340" cy="480" r="60"/><circle cx="340" cy="480" r="110"/>
            <circle cx="340" cy="480" r="160"/><circle cx="340" cy="480" r="210"/>
            <circle cx="340" cy="480" r="260"/><circle cx="340" cy="480" r="310"/>
            <circle cx="340" cy="480" r="360"/><circle cx="340" cy="480" r="410"/>
            <line x1="340" y1="70" x2="340" y2="890" strokeWidth="0.4"/>
            <line x1="0" y1="480" x2="680" y2="480" strokeWidth="0.4"/>
            <line x1="100" y1="140" x2="580" y2="820" strokeWidth="0.3"/>
            <line x1="580" y1="140" x2="100" y2="820" strokeWidth="0.3"/>
            <line x1="0" y1="200" x2="680" y2="760" strokeWidth="0.3"/>
            <line x1="680" y1="200" x2="0" y2="760" strokeWidth="0.3"/>
            <line x1="200" y1="70" x2="480" y2="890" strokeWidth="0.3"/>
            <line x1="480" y1="70" x2="200" y2="890" strokeWidth="0.3"/>
            <circle cx="60" cy="80" r="30"/><circle cx="60" cy="80" r="50"/><circle cx="60" cy="80" r="70"/>
            <circle cx="620" cy="80" r="30"/><circle cx="620" cy="80" r="50"/><circle cx="620" cy="80" r="70"/>
            <circle cx="60" cy="920" r="30"/><circle cx="60" cy="920" r="50"/><circle cx="60" cy="920" r="70"/>
            <circle cx="620" cy="920" r="30"/><circle cx="620" cy="920" r="50"/><circle cx="620" cy="920" r="70"/>
          </g>
        </svg>

        <div className="cert-content">
          <div className="cert-header">
            <div className="cert-stamp">
              <div className="stamp-ring-outer"></div>
              <div className="stamp-core">
                <div className="stamp-top-text">CERTIFICATE OF</div>
                <div className="stamp-certified-text">CERTIFIED</div>
                <div className="stamp-ribbon">ACWY VACCINATION</div>
              </div>
            </div>
            <div className="cert-arabic-title">شهادة</div>
          </div>

          <div className="cert-subtitle-band">
            <span className="sub-en">CERTIFICATE OF CERTIFIED ACWY VACCINATION</span>
            <span className="sub-ar">[شهادة مُعتمدة للتحصين بلقاح ACWY]</span>
          </div>

          <div className="cert-main-title">
            <div className="main-title-en">
              Certificate of Immunisation against Meningococcal Meningitis A, C, W<sub>135</sub> and Y
            </div>
            <div className="main-title-ar">
              شهادة تحصين من التهاب السحايا بالمكورات السحانية A و C و W<sub>135</sub> و Y
            </div>
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <span className="lbl-en">This Patient (Name):</span>
              <span className="lbl-ar">:هذا المريض (الاسم)</span>
            </div>
            <div className="field-input-box">{safe(data.fullName || `${data.firstName || ''} ${data.surname || ''}`)}</div>
          </div>

          <div className="para-en">
            has been vaccinated against Meningococcal Meningitis A, C, W<sub>135</sub> and Y using a Meningococcal ACWY conjugate vaccine
          </div>
          <div className="para-ar">
            تم تلقيحه ضد التهاب السحايا بالمكورات السحانية A و C و W<sub>135</sub> و Y<br/>
            باستخدام لقاح مُقتّرن للمكورات السحانية ACWY
          </div>

          <hr className="divider-line"/>

          <div className="two-col">
            <div className="field-group">
              <div className="field-label-row">
                <span className="lbl-en">Date of Birth:</span>
              </div>
              <div className="field-input-box">{safe(data.dob)}</div>
              <div style={{textAlign:'right', marginTop:'3px'}}>
                <span className="lbl-ar">:تاريخ الميلاد</span>
              </div>
            </div>
            <div className="field-group">
              <div className="field-label-row">
                <span className="lbl-en">Passport Number:</span>
              </div>
              <div className="field-input-box">{safe(data.passportNumber)}</div>
              <div style={{textAlign:'right', marginTop:'3px'}}>
                <span className="lbl-ar">:رقم جواز السفر</span>
              </div>
            </div>
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <span className="lbl-en">Doctor/Nurse/Pharmacist Signature</span>
              <span className="lbl-ar">توقيع الطبيب/الممرض/الصيدلي</span>
            </div>
            <div className="sig-container">
              {safe(data.prescriberName || data.pharmacistName)}
            </div>
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <span className="lbl-en">Doctor/Nurse/Pharmacist</span>
              <span className="lbl-ar">الطبيب/الممرض/الصيدلي</span>
            </div>
            <div className="field-input-box">{safe(data.prescriberName || data.pharmacistName)}</div>
            <div className="block-caps-row">
              <span className="block-caps-note">BLOCK CAPITALS PLEASE</span>
              <span className="block-caps-note-ar">يُرجى الكتابة بخط واضح</span>
            </div>
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <span className="lbl-en">Manufacturer/Batch No:</span>
              <span className="lbl-ar">:المُصنّع/رقم التشغيلة</span>
            </div>
            <div className="field-input-box">{safe(`${data.vaccineBrand || ''} ${data.batchNumber || ''}`)}</div>
          </div>

          <div className="stamp-box">
            <div className="stamp-box-header">
              <span className="lbl-en" style={{fontStyle:'italic'}}>Official Stamp of the Administering Centre</span>
              <span className="lbl-ar">الختم الرسمي للمركز الذي أعطى التلقيح</span>
            </div>
            <div className="stamp-box-inner">
              {(() => {
                const name = (data.pharmacyNameField || data.pharmacyName || data.branch?.pharmacyName || "").trim();
                const nameLower = name.toLowerCase();
                let address = data.pharmacyAddress || data.branch?.pharmacyAddress || "";

                // Robust mapping fallback
                if (nameLower.includes("wilmslow")) {
                  address = "480 Wilmslow Rd, Withington, Manchester M20 3BG";
                } else if (nameLower.includes("careplus") || nameLower.includes("care plus")) {
                  address = "34 Shakespeare St, Southport PR8 5AB";
                } else if (nameLower.includes("247")) {
                  address = "15 Stuart Rd, Waterloo, Liverpool L22 4QR";
                }

                return (
                  <>
                    {safe(name)}
                    {address && `\n${address}`}
                    {data.prescriberGPhC && `\nGPhC: ${data.prescriberGPhC}`}
                  </>
                );
              })()}
            </div>
            <div className="vax-date-row">
              <div style={{flex:1}}>
                <span className="lbl-en">Date of Vaccination</span>
                <div className="field-input-box" style={{width:'60%', marginTop:'3px'}}>{safe(data.dateGiven || data.consultationDate)}</div>
              </div>
              <span className="lbl-ar">تاريخ التلقيح</span>
            </div>
          </div>

          <div className="footer-bar">
            <span className="footer-code-text">PP-UNP-GBR-4134 &nbsp; March 2023</span>
            <div className="pfizer-row">
              <span className="pfizer-produced">Produced and funded by</span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#003087" strokeWidth="1.5"/>
                <path d="M6 14V7h4c1.5 0 2.5 0.8 2.5 2.2s-1 2.2-2.5 2.2H8V14H6z" fill="#003087"/>
              </svg>
              <span className="pfizer-name">Pfizer</span>
            </div>
          </div>

          <div className="side-effects-section">
            <div className="side-effects-en">
              <strong>Reporting side effects:</strong> if you get any side effects, talk to your doctor,
              pharmacist or nurse. This includes any possible side effects not listed in the
              package leaflet. You can also report side effects directly via the Yellow Card
              Scheme at www.mhra.gov.uk/yellow-card
            </div>
            <div className="side-effects-ar">
              <strong>الإبلاغ عن الآثار الجانبية:</strong> إذا أُصبت بأية آثار جانبية، تحدث إلى طبيبك
              أو الصيدلي أو الممرض. يشمل هذا أية آثار جانبية محتملة غير مذكورة في
              النشرة المرفقة بالعبوة، ويمكنك أيضًا الإبلاغ عن الآثار الجانبية مباشرة من
              خلال مخطط البطاقة الصفراء على www.mhra.gov.uk/yellow-card
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
