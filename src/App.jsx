import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');`;

const styles = `
  ${FONTS}

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f5f0e8;
    --bg-warm: #ede6d6;
    --surface: #faf7f2;
    --surface-2: #ede6d6;
    --border: rgba(180,120,60,0.15);
    --border-hover: rgba(180,120,60,0.3);
    --accent: #d94f2b;
    --accent-2: #e8793a;
    --accent-dim: rgba(217,79,43,0.1);
    --accent-glow: rgba(217,79,43,0.2);
    --text: #1e1208;
    --text-muted: #8a6a50;
    --text-dim: #c4a882;
    --success: #5a8a4a;
    --info: #3a6e9e;
    --purple: #7a5a9e;
    --font-display: 'Playfair Display', serif;
    --font-body: 'IBM Plex Sans', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 440px;
    grid-template-rows: auto 1fr auto;
    max-width: 1320px;
    margin: 0 auto;
    padding: 0 48px;
    gap: 0 64px;
  }

  .header {
    grid-column: 1 / -1;
    padding: 52px 0 44px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1.5px solid var(--border);
    margin-bottom: 64px;
  }

  .header-left h1 {
    font-family: var(--font-display);
    font-size: 3.4rem;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .header-left h1 em { font-style: italic; color: var(--accent); }

  .header-left p {
    font-size: 0.82rem;
    color: var(--text-muted);
    margin-top: 12px;
    font-weight: 300;
    letter-spacing: 0.03em;
  }

  .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }

  .header-badge {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-muted);
    border: 1px solid var(--border);
    padding: 6px 14px;
    border-radius: 100px;
    letter-spacing: 0.1em;
    background: var(--surface);
  }

  .header-badge-accent {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--accent);
    border: 1px solid var(--accent-dim);
    padding: 6px 14px;
    border-radius: 100px;
    letter-spacing: 0.1em;
    background: var(--accent-dim);
  }

  .left-col { grid-column: 1; grid-row: 2; padding-bottom: 60px; }
  .right-col {
    grid-column: 2; grid-row: 2; padding-bottom: 60px;
    position: sticky; top: 40px; height: fit-content;
  }

  .section { margin-bottom: 52px; }

  .section-label {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 22px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .input-grid.cols-1 { grid-template-columns: 1fr; }
  .input-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }

  .field { display: flex; flex-direction: column; gap: 8px; }

  .field label { font-size: 0.73rem; color: var(--text-muted); font-weight: 400; letter-spacing: 0.01em; }

  .num-input-wrap {
    display: flex;
    align-items: center;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .num-input-wrap:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }

  .num-input-wrap input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 1rem;
    padding: 12px 14px;
    width: 100%;
  }

  .num-input-unit {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--text-muted);
    padding: 0 14px 0 0;
    white-space: nowrap;
  }

  .slider-field { display: flex; flex-direction: column; gap: 10px; }

  .slider-top { display: flex; justify-content: space-between; align-items: center; }
  .slider-top label { font-size: 0.73rem; color: var(--text-muted); }

  .slider-value { font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent); font-weight: 500; }

  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    height: 2px;
    background: var(--surface-2);
    border-radius: 2px;
    outline: none;
    border: none;
  }

  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    box-shadow: 0 0 12px var(--accent-glow);
    transition: transform 0.15s;
    border: 3px solid var(--surface);
  }

  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }

  .slider-hint { font-size: 0.68rem; color: var(--text-dim); font-style: italic; }

  .slider-marks {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 0.6rem;
    color: var(--text-dim);
    padding: 0 2px;
  }

  .styled-select {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.83rem;
    padding: 12px 36px 12px 14px;
    outline: none;
    width: 100%;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a6a50' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }

  .styled-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .styled-select option { background: #faf7f2; color: #1e1208; }

  .sex-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
  }

  .sex-btn {
    padding: 12px;
    text-align: center;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--text-muted);
    transition: all 0.2s;
    border: none;
    background: transparent;
    font-family: var(--font-body);
  }

  .sex-btn.active { background: var(--accent-dim); color: var(--accent); font-weight: 500; }

  .info-box {
    background: var(--accent-dim);
    border: 1px solid rgba(217,79,43,0.2);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 0.75rem;
    color: var(--text-muted);
    line-height: 1.6;
    margin-top: 4px;
  }

  .info-box strong { color: var(--accent); font-weight: 500; }

  .cta {
    width: 100%;
    padding: 17px;
    background: var(--accent);
    color: #faf7f2;
    border: none;
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.03em;
    transition: all 0.2s;
    margin-top: 8px;
  }

  .cta:hover { background: var(--accent-2); transform: translateY(-2px); box-shadow: 0 10px 32px var(--accent-glow); }
  .cta:active { transform: translateY(0); }

  .results-empty {
    border: 1.5px dashed var(--border);
    border-radius: 16px;
    padding: 52px 32px;
    text-align: center;
    color: var(--text-muted);
    background: var(--surface);
  }

  .results-empty .big-icon { font-size: 2.8rem; margin-bottom: 18px; opacity: 0.4; }
  .results-empty p { font-size: 0.83rem; line-height: 1.7; font-weight: 300; max-width: 260px; margin: 0 auto; }

  .results-panel {
    border: 1.5px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    background: var(--surface);
    animation: fadeUp 0.4s ease;
    box-shadow: 0 4px 40px rgba(180,100,40,0.08);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .results-header {
    padding: 26px 28px 22px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(135deg, #fdf8f2 0%, #f5ede0 100%);
  }

  .results-header p {
    font-size: 0.67rem;
    color: var(--text-muted);
    font-family: var(--font-mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .tdee-main { display: flex; align-items: baseline; gap: 8px; }
  .tdee-number { font-family: var(--font-display); font-size: 3.8rem; color: var(--accent); line-height: 1; }
  .tdee-unit { font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted); }

  .bar-wrap { padding: 16px 28px; border-bottom: 1px solid var(--border); }
  .bar-track { display: flex; gap: 3px; width: 100%; height: 8px; border-radius: 4px; overflow: hidden; }
  .bar-seg { border-radius: 2px; transition: flex 0.6s cubic-bezier(0.34,1.56,0.64,1); }

  .breakdown { padding: 18px 28px; display: flex; flex-direction: column; gap: 11px; border-bottom: 1px solid var(--border); }
  .breakdown-row { display: flex; justify-content: space-between; align-items: center; }
  .breakdown-label { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: var(--text-muted); }
  .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .breakdown-val { font-family: var(--font-mono); font-size: 0.83rem; font-weight: 500; }

  .targets { padding: 18px 28px; display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid var(--border); }

  .target-row {
    background: var(--bg-warm);
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--border);
    transition: all 0.2s;
  }

  .target-row.active { border-width: 1.5px; }
  .target-left p:first-child { font-size: 0.78rem; font-weight: 500; margin-bottom: 2px; }
  .target-left p:last-child { font-size: 0.67rem; color: var(--text-muted); }
  .target-kcal { font-family: var(--font-mono); font-size: 0.95rem; font-weight: 500; }

  .macros { padding: 18px 28px; border-bottom: 1px solid var(--border); }
  .macros-title { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 14px; }
  .macros-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

  .macro-card {
    background: var(--bg-warm);
    border-radius: 10px;
    padding: 14px 10px;
    text-align: center;
    border: 1px solid var(--border);
  }

  .macro-val { font-family: var(--font-mono); font-size: 1.15rem; font-weight: 500; margin-bottom: 3px; }
  .macro-name { font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .macro-kcal { font-size: 0.6rem; color: var(--text-dim); font-family: var(--font-mono); margin-top: 3px; }

  .agua { padding: 16px 28px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .agua-label { font-size: 0.78rem; color: var(--text-muted); }
  .agua-val { font-family: var(--font-mono); font-size: 1rem; color: var(--info); font-weight: 500; }

  .note { padding: 14px 28px 22px; font-size: 0.7rem; color: var(--text-dim); line-height: 1.7; font-style: italic; }

  .footer {
    grid-column: 1 / -1;
    padding: 24px 0;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer p { font-size: 0.7rem; color: var(--text-dim); font-family: var(--font-mono); }

  @media (max-width: 920px) {
    .page { grid-template-columns: 1fr; padding: 0 20px; gap: 0; }
    .header { grid-column: 1; flex-direction: column; align-items: flex-start; gap: 16px; }
    .left-col, .right-col { grid-column: 1; grid-row: auto; }
    .right-col { position: static; margin-top: 32px; }
    .header-left h1 { font-size: 2.4rem; }
    .input-grid.cols-3 { grid-template-columns: 1fr 1fr; }
    .footer { grid-column: 1; flex-direction: column; gap: 8px; text-align: center; }
  }
`;

export default function App() {
  const [sexo, setSexo] = useState("hombre");
  const [peso, setPeso] = useState(75);
  const [altura, setAltura] = useState(175);
  const [edad, setEdad] = useState(22);
  const [grasa, setGrasa] = useState("");
  const [diasFuerza, setDiasFuerza] = useState(5);
  const [duracion, setDuracion] = useState(60);
  const [intensidad, setIntensidad] = useState("moderada");
  const [cardio, setCardio] = useState("ninguno");
  const [pasos, setPasos] = useState(7000);
  const [trabajo, setTrabajo] = useState("sedentario");
  const [objetivo, setObjetivo] = useState("deficit");
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    let bmr;
    if (grasa && Number(grasa) > 0) {
      const masaMagra = peso * (1 - Number(grasa) / 100);
      bmr = 370 + 21.6 * masaMagra;
    } else {
      bmr = sexo === "hombre"
        ? 10 * peso + 6.25 * altura - 5 * edad + 5
        : 10 * peso + 6.25 * altura - 5 * edad - 161;
    }

    const metFuerza = { ligera: 3.5, moderada: 5.0, intensa: 6.5, muy_intensa: 8.0 }[intensidad];
    const eatDia = ((metFuerza * peso * 3.5) / 200) * duracion * diasFuerza / 7;
    const cardioKcal = { ninguno: 0, poco: 300, moderado: 900, bastante: 2000, mucho: 3250 }[cardio] / 7;
    const neat = pasos * (peso * 0.00055) + { sedentario: 0, ligero: 200, moderado: 400, activo: 700, muy_activo: 1000 }[trabajo];
    const tef = bmr * 0.1;
    const tdee = bmr + eatDia + cardioKcal + neat + tef;

    const mantenimiento = Math.round(tdee);
    const deficit_mod = Math.round(tdee - 300);
    const deficit_agr = Math.round(tdee - 500);
    const superavit = Math.round(tdee + 250);
    const superavit_agr = Math.round(tdee + 500);

    let proteinG, fatG, carbG, kcalObj;
    if (objetivo === "deficit") {
      kcalObj = deficit_mod;
      proteinG = Math.round(peso * 2.2);
    } else if (objetivo === "deficit_agresivo") {
      kcalObj = deficit_agr;
      proteinG = Math.round(peso * 2.4);
    } else if (objetivo === "mantenimiento") {
      kcalObj = mantenimiento;
      proteinG = Math.round(peso * 1.8);
    } else if (objetivo === "superavit") {
      kcalObj = superavit;
      proteinG = Math.round(peso * 2.0);
    } else {
      kcalObj = superavit_agr;
      proteinG = Math.round(peso * 2.0);
    }

    fatG = Math.round((kcalObj * 0.28) / 9);
    carbG = Math.round((kcalObj - proteinG * 4 - fatG * 9) / 4);

    const horasEjDia = (duracion / 60 * diasFuerza) / 7;
    const agua = Math.round((peso * 35 + horasEjDia * 500) / 100) / 10;

    setResultado({
      bmr: Math.round(bmr),
      eat: Math.round(eatDia + cardioKcal),
      neat: Math.round(neat),
      tef: Math.round(tef),
      tdee: mantenimiento,
      deficit_mod, deficit_agr, superavit, superavit_agr,
      kcalObj, proteinG, fatG, carbG, agua,
      usandoKatch: grasa && Number(grasa) > 0,
    });
  };

  const total = resultado ? resultado.bmr + resultado.eat + resultado.neat + resultado.tef : 1;

  const objetivoLabel = {
    deficit: "déficit moderado",
    deficit_agresivo: "déficit agresivo",
    mantenimiento: "mantenimiento",
    superavit: "superávit ligero",
    superavit_agresivo: "superávit agresivo",
  }[objetivo];

  const targets = resultado ? [
    { label: "Déficit agresivo", desc: "−500 kcal/día", val: resultado.deficit_agr, color: "#d94f2b" },
    { label: "Déficit moderado", desc: "−300 kcal/día", val: resultado.deficit_mod, color: "#e8793a" },
    { label: "Mantenimiento", desc: "Sin cambios de peso", val: resultado.tdee, color: "#8a6a50" },
    { label: "Superávit ligero", desc: "+250 kcal/día", val: resultado.superavit, color: "#3a6e9e" },
    { label: "Superávit agresivo", desc: "+500 kcal/día", val: resultado.superavit_agr, color: "#5a8a4a" },
  ] : [];

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <header className="header">
          <div className="header-left">
            <h1>Gasto <em>calórico</em> total</h1>
            <p>Mifflin-St Jeor · Katch-McArdle · MET compendium · evidencia actualizada</p>
          </div>
          <div className="header-right">
            <span className="header-badge">TDEE CALCULATOR v2.0</span>
            <span className="header-badge-accent">Basado en evidencia científica</span>
          </div>
        </header>

        <main className="left-col">

          <div className="section">
            <div className="section-label">01 · Datos biométricos</div>
            <div className="input-grid cols-1" style={{marginBottom:16}}>
              <div className="field">
                <label>Sexo biológico</label>
                <div className="sex-toggle">
                  <button className={`sex-btn ${sexo === "hombre" ? "active" : ""}`} onClick={() => setSexo("hombre")}>Hombre</button>
                  <button className={`sex-btn ${sexo === "mujer" ? "active" : ""}`} onClick={() => setSexo("mujer")}>Mujer</button>
                </div>
              </div>
            </div>
            <div className="input-grid cols-3" style={{marginBottom:16}}>
              {[
                { label: "Peso", val: peso, set: setPeso, min: 40, max: 200, unit: "kg" },
                { label: "Altura", val: altura, set: setAltura, min: 140, max: 220, unit: "cm" },
                { label: "Edad", val: edad, set: setEdad, min: 15, max: 80, unit: "años" },
              ].map(({ label, val, set, min, max, unit }) => (
                <div className="field" key={label}>
                  <label>{label}</label>
                  <div className="num-input-wrap">
                    <input type="number" value={val} min={min} max={max} onChange={e => set(Number(e.target.value))} />
                    <span className="num-input-unit">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="field">
              <label>% Grasa corporal <span style={{color:"var(--text-dim)"}}>— opcional, mejora la precisión</span></label>
              <div className="num-input-wrap">
                <input type="number" value={grasa} min={3} max={60} placeholder="Ej: 18" onChange={e => setGrasa(e.target.value)} />
                <span className="num-input-unit">%</span>
              </div>
            </div>
            {grasa && Number(grasa) > 0 && (
              <div className="info-box" style={{marginTop:10}}>
                <strong>Katch-McArdle activo</strong> — con tu % de grasa usamos una fórmula más precisa basada en tu masa magra real.
              </div>
            )}
          </div>

          <div className="section">
            <div className="section-label">02 · Entrenamiento de fuerza</div>
            <div style={{display:"flex", flexDirection:"column", gap:22}}>
              <div className="slider-field">
                <div className="slider-top">
                  <label>Días por semana</label>
                  <span className="slider-value">{diasFuerza} {diasFuerza === 1 ? "día" : "días"}</span>
                </div>
                <input type="range" min={1} max={7} value={diasFuerza} onChange={e => setDiasFuerza(Number(e.target.value))} />
                <div className="slider-marks">{[1,2,3,4,5,6,7].map(d => <span key={d}>{d}</span>)}</div>
              </div>
              <div className="slider-field">
                <div className="slider-top">
                  <label>Duración por sesión</label>
                  <span className="slider-value">{duracion} min</span>
                </div>
                <input type="range" min={20} max={180} step={5} value={duracion} onChange={e => setDuracion(Number(e.target.value))} />
                <div className="slider-marks"><span>20 min</span><span>60 min</span><span>120 min</span><span>180 min</span></div>
              </div>
              <div className="field">
                <label>Intensidad percibida</label>
                <select className="styled-select" value={intensidad} onChange={e => setIntensidad(e.target.value)}>
                  <option value="ligera">Ligera — pocas series, descansos largos, sin mucho esfuerzo</option>
                  <option value="moderada">Moderada — trabajo consistente, algo de fatiga al final</option>
                  <option value="intensa">Intensa — mucho volumen, cerca del fallo frecuentemente</option>
                  <option value="muy_intensa">Muy intensa — powerlifting / CrossFit, esfuerzo máximo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-label">03 · Cardio adicional</div>
            <div className="field">
              <label>¿Haces cardio además de la fuerza?</label>
              <select className="styled-select" value={cardio} onChange={e => setCardio(e.target.value)}>
                <option value="ninguno">No, solo fuerza</option>
                <option value="poco">Poco — 1-2 sesiones suaves por semana</option>
                <option value="moderado">Moderado — 3 sesiones por semana</option>
                <option value="bastante">Bastante — 4 sesiones o sesiones largas</option>
                <option value="mucho">Mucho — 5+ sesiones, cardio de alto volumen</option>
              </select>
            </div>
          </div>

          <div className="section">
            <div className="section-label">04 · Actividad diaria (NEAT)</div>
            <div style={{display:"flex", flexDirection:"column", gap:22}}>
              <div className="slider-field">
                <div className="slider-top">
                  <label>Pasos diarios promedio</label>
                  <span className="slider-value">{pasos.toLocaleString()}</span>
                </div>
                <input type="range" min={1000} max={30000} step={500} value={pasos} onChange={e => setPasos(Number(e.target.value))} />
                <div className="slider-marks"><span>1k</span><span>5k</span><span>10k</span><span>20k</span><span>30k</span></div>
                <span className="slider-hint">Sin contar el entrenamiento — solo movimiento cotidiano</span>
              </div>
              <div className="field">
                <label>Tipo de trabajo o actividad laboral</label>
                <select className="styled-select" value={trabajo} onChange={e => setTrabajo(e.target.value)}>
                  <option value="sedentario">Sedentario — oficina, estudio, sentado casi todo el día</option>
                  <option value="ligero">Ligero — de pie a ratos, algo de movimiento</option>
                  <option value="moderado">Moderado — de pie varias horas, algo de carga física</option>
                  <option value="activo">Activo — trabajo físico, mucho movimiento continuo</option>
                  <option value="muy_activo">Muy activo — trabajo físico muy exigente (construcción, etc.)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-label">05 · Objetivo</div>
            <div className="field">
              <label>¿Cuál es tu meta actual?</label>
              <select className="styled-select" value={objetivo} onChange={e => setObjetivo(e.target.value)}>
                <option value="deficit_agresivo">Pérdida de grasa agresiva — déficit de 500 kcal</option>
                <option value="deficit">Pérdida de grasa moderada — déficit de 300 kcal ✓ recomendado</option>
                <option value="mantenimiento">Mantenimiento — sin cambios de peso</option>
                <option value="superavit">Volumen limpio — superávit de 250 kcal</option>
                <option value="superavit_agresivo">Volumen agresivo — superávit de 500 kcal</option>
              </select>
            </div>
          </div>

          <button className="cta" onClick={calcular}>Calcular mi gasto calórico total</button>
        </main>

        <aside className="right-col">
          {!resultado ? (
            <div className="results-empty">
              <div className="big-icon">🔥</div>
              <p>Completa tus datos y pulsa calcular para ver tu gasto calórico desglosado, objetivos y distribución de macros.</p>
            </div>
          ) : (
            <div className="results-panel">
              <div className="results-header">
                <p>Gasto total diario · {resultado.usandoKatch ? "Katch-McArdle" : "Mifflin-St Jeor"}</p>
                <div className="tdee-main">
                  <span className="tdee-number">{resultado.tdee.toLocaleString()}</span>
                  <span className="tdee-unit">kcal/día</span>
                </div>
              </div>

              <div className="bar-wrap">
                <div className="bar-track">
                  {[
                    { val: resultado.bmr, color: "#c4a882" },
                    { val: resultado.eat, color: "#3a6e9e" },
                    { val: resultado.neat, color: "#e8793a" },
                    { val: resultado.tef, color: "#7a5a9e" },
                  ].map((s, i) => (
                    <div key={i} className="bar-seg" style={{ flex: s.val / total, background: s.color }} />
                  ))}
                </div>
              </div>

              <div className="breakdown">
                {[
                  { label: "Metabolismo basal (BMR)", val: resultado.bmr, color: "#c4a882" },
                  { label: "Gasto por entreno (EAT)", val: resultado.eat, color: "#3a6e9e" },
                  { label: "Actividad diaria (NEAT)", val: resultado.neat, color: "#e8793a" },
                  { label: "Efecto térmico alimentos", val: resultado.tef, color: "#7a5a9e" },
                ].map(row => (
                  <div className="breakdown-row" key={row.label}>
                    <div className="breakdown-label">
                      <div className="dot" style={{background: row.color}} />
                      {row.label}
                    </div>
                    <span className="breakdown-val" style={{color: row.color}}>+{row.val.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="targets">
                {targets.map(t => (
                  <div className={`target-row ${resultado.kcalObj === t.val ? "active" : ""}`} key={t.label}
                    style={resultado.kcalObj === t.val ? {borderColor: t.color} : {}}>
                    <div className="target-left">
                      <p style={{color: t.color}}>{t.label}{resultado.kcalObj === t.val ? " ← tu objetivo" : ""}</p>
                      <p>{t.desc}</p>
                    </div>
                    <span className="target-kcal" style={{color: t.color}}>{t.val.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="macros">
                <div className="macros-title">Macros recomendados para {objetivoLabel}</div>
                <div className="macros-grid">
                  {[
                    { name: "Proteína", val: resultado.proteinG, color: "#d94f2b", kcal: resultado.proteinG * 4 },
                    { name: "Grasa", val: resultado.fatG, color: "#e8793a", kcal: resultado.fatG * 9 },
                    { name: "Carbohidrato", val: resultado.carbG, color: "#3a6e9e", kcal: resultado.carbG * 4 },
                  ].map(m => (
                    <div className="macro-card" key={m.name}>
                      <div className="macro-val" style={{color: m.color}}>{m.val}g</div>
                      <div className="macro-name">{m.name}</div>
                      <div className="macro-kcal">{m.kcal} kcal</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="agua">
                <span className="agua-label">💧 Agua recomendada al día</span>
                <span className="agua-val">{resultado.agua} L</span>
              </div>

              <p className="note">
                Estimación con margen ±10–15%. Pésate en las mismas condiciones y ajusta cada 2–3 semanas según evolución real del peso.
              </p>
            </div>
          )}
        </aside>

        <footer className="footer">
          <p>Mifflin-St Jeor (1990) · Katch-McArdle · Ainsworth MET Compendium</p>
          <p>No sustituye consulta con dietista-nutricionista colegiado</p>
        </footer>
      </div>
    </>
  );
}