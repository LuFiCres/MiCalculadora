import { useState, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');`;

const styles = `
  ${FONTS}

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0a;
    --surface: #111111;
    --surface-2: #1a1a1a;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.14);
    --accent: #b8f55a;
    --accent-dim: rgba(184,245,90,0.12);
    --accent-glow: rgba(184,245,90,0.25);
    --text: #f0f0f0;
    --text-muted: #6a6a6a;
    --text-dim: #3a3a3a;
    --danger: #ff6b6b;
    --warning: #ffd166;
    --info: #74c0fc;
    --purple: #c77dff;
    --font-display: 'DM Serif Display', serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'DM Mono', monospace;
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
    grid-template-columns: 1fr 420px;
    grid-template-rows: auto 1fr auto;
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 40px;
    gap: 0 60px;
  }

  /* Header */
  .header {
    grid-column: 1 / -1;
    padding: 48px 0 40px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    margin-bottom: 60px;
  }

  .header-left h1 {
    font-family: var(--font-display);
    font-size: 3.2rem;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .header-left h1 em {
    font-style: italic;
    color: var(--accent);
  }

  .header-left p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 10px;
    font-weight: 300;
    letter-spacing: 0.02em;
  }

  .header-badge {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-muted);
    border: 1px solid var(--border);
    padding: 6px 12px;
    border-radius: 100px;
    letter-spacing: 0.08em;
  }

  /* Left column */
  .left-col {
    grid-column: 1;
    grid-row: 2;
    padding-bottom: 60px;
  }

  /* Right col - results */
  .right-col {
    grid-column: 2;
    grid-row: 2;
    padding-bottom: 60px;
    position: sticky;
    top: 40px;
    height: fit-content;
  }

  /* Section */
  .section {
    margin-bottom: 48px;
  }

  .section-label {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* Input grid */
  .input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .input-grid.cols-1 { grid-template-columns: 1fr; }
  .input-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }

  /* Field */
  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field label {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  /* Number input */
  .num-input-wrap {
    display: flex;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s;
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
    font-weight: 400;
    padding: 12px 14px;
    width: 100%;
  }

  .num-input-unit {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-muted);
    padding: 0 14px 0 0;
    white-space: nowrap;
  }

  /* Slider field */
  .slider-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .slider-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .slider-top label {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .slider-value {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--accent);
    font-weight: 500;
  }

  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    height: 2px;
    background: var(--surface-2);
    border-radius: 2px;
    outline: none;
  }

  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    box-shadow: 0 0 10px var(--accent-glow);
    transition: transform 0.15s;
  }

  input[type=range]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .slider-hint {
    font-size: 0.7rem;
    color: var(--text-dim);
    font-style: italic;
  }

  /* Select */
  .styled-select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.85rem;
    padding: 12px 14px;
    outline: none;
    width: 100%;
    cursor: pointer;
    transition: border-color 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236a6a6a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }

  .styled-select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }

  .styled-select option { background: #1a1a1a; }

  /* Sex toggle */
  .sex-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--surface);
    border: 1px solid var(--border);
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

  .sex-btn.active {
    background: var(--accent-dim);
    color: var(--accent);
    font-weight: 500;
  }

  /* CTA */
  .cta {
    width: 100%;
    padding: 16px;
    background: var(--accent);
    color: #0a0a0a;
    border: none;
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: all 0.2s;
    margin-top: 8px;
    position: relative;
    overflow: hidden;
  }

  .cta:hover {
    background: #cbff73;
    transform: translateY(-1px);
    box-shadow: 0 8px 30px var(--accent-glow);
  }

  .cta:active { transform: translateY(0); }

  /* Results panel */
  .results-empty {
    border: 1px dashed var(--border);
    border-radius: 16px;
    padding: 48px 32px;
    text-align: center;
    color: var(--text-muted);
  }

  .results-empty .big-icon {
    font-size: 2.5rem;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  .results-empty p {
    font-size: 0.85rem;
    line-height: 1.6;
    font-weight: 300;
  }

  .results-panel {
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    animation: fadeUp 0.4s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .results-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }

  .results-header p {
    font-size: 0.7rem;
    color: var(--text-muted);
    font-family: var(--font-mono);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .tdee-main {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .tdee-number {
    font-family: var(--font-display);
    font-size: 3.5rem;
    color: var(--accent);
    line-height: 1;
  }

  .tdee-unit {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  /* Breakdown */
  .breakdown {
    padding: 20px 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border-bottom: 1px solid var(--border);
  }

  .breakdown-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .breakdown-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .breakdown-val {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: 500;
  }

  /* Bar chart visual */
  .bar-chart {
    padding: 20px 28px;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 3px;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    align-items: stretch;
  }

  .bar-seg {
    border-radius: 2px;
    transition: flex 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* Targets */
  .targets {
    padding: 20px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .target-row {
    background: var(--surface-2);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .target-left p:first-child {
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .target-left p:last-child {
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  .target-kcal {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 500;
  }

  /* Macros */
  .macros {
    padding: 20px 28px;
    border-top: 1px solid var(--border);
  }

  .macros-title {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .macros-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }

  .macro-card {
    background: var(--surface-2);
    border-radius: 10px;
    padding: 12px;
    text-align: center;
  }

  .macro-card .macro-val {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .macro-card .macro-name {
    font-size: 0.65rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* Note */
  .note {
    padding: 16px 28px 24px;
    font-size: 0.72rem;
    color: var(--text-muted);
    line-height: 1.6;
    font-style: italic;
  }

  /* Footer */
  .footer {
    grid-column: 1 / -1;
    padding: 24px 0;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer p {
    font-size: 0.72rem;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }

  @media (max-width: 900px) {
    .page {
      grid-template-columns: 1fr;
      padding: 0 20px;
    }
    .header { grid-column: 1; }
    .left-col, .right-col { grid-column: 1; grid-row: auto; }
    .right-col { position: static; }
    .header-left h1 { font-size: 2.2rem; }
    .input-grid.cols-3 { grid-template-columns: 1fr 1fr; }
    .footer { grid-column: 1; }
  }
`;

export default function App() {
  const [sexo, setSexo] = useState("hombre");
  const [peso, setPeso] = useState(75);
  const [altura, setAltura] = useState(175);
  const [edad, setEdad] = useState(22);
  const [diasFuerza, setDiasFuerza] = useState(5);
  const [duracion, setDuracion] = useState(60);
  const [intensidad, setIntensidad] = useState("moderada");
  const [cardio, setCardio] = useState("ninguno");
  const [pasos, setPasos] = useState(7000);
  const [trabajo, setTrabajo] = useState("sedentario");
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const bmr = sexo === "hombre"
      ? 10 * peso + 6.25 * altura - 5 * edad + 5
      : 10 * peso + 6.25 * altura - 5 * edad - 161;

    const metFuerza = { ligera: 3.5, moderada: 5.0, intensa: 6.5 }[intensidad];
    const eatDia = ((metFuerza * peso * 3.5) / 200) * duracion * diasFuerza / 7;

    const cardioKcal = { ninguno: 0, poco: 150 * 2, moderado: 300 * 3, bastante: 500 * 4 }[cardio] / 7;

    const neat = pasos * (peso * 0.00055) + { sedentario: 0, ligero: 200, moderado: 400, activo: 700 }[trabajo];
    const tef = bmr * 0.1;
    const tdee = bmr + eatDia + cardioKcal + neat + tef;

    const deficit = Math.round(tdee - 300);
    const mantenimiento = Math.round(tdee);

    // Macros for deficit (protein high for muscle preservation)
    const proteinG = Math.round(peso * 2.0);
    const fatG = Math.round((deficit * 0.27) / 9);
    const carbG = Math.round((deficit - proteinG * 4 - fatG * 9) / 4);

    setResultado({
      bmr: Math.round(bmr),
      eat: Math.round(eatDia + cardioKcal),
      neat: Math.round(neat),
      tef: Math.round(tef),
      tdee: mantenimiento,
      deficit,
      superavit: Math.round(tdee + 250),
      proteinG, fatG, carbG,
    });
  };

  const total = resultado ? resultado.bmr + resultado.eat + resultado.neat + resultado.tef : 1;

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>Gasto <em>calórico</em> total</h1>
            <p>Basado en Mifflin-St Jeor · Evidencia científica actualizada</p>
          </div>
          <span className="header-badge">TDEE CALCULATOR v1.0</span>
        </header>

        {/* Left */}
        <main className="left-col">

          {/* Datos básicos */}
          <div className="section">
            <div className="section-label">01 · Datos biométricos</div>
            <div className="input-grid cols-1" style={{marginBottom: 16}}>
              <div className="field">
                <label>Sexo biológico</label>
                <div className="sex-toggle">
                  <button className={`sex-btn ${sexo === "hombre" ? "active" : ""}`} onClick={() => setSexo("hombre")}>Hombre</button>
                  <button className={`sex-btn ${sexo === "mujer" ? "active" : ""}`} onClick={() => setSexo("mujer")}>Mujer</button>
                </div>
              </div>
            </div>
            <div className="input-grid cols-3">
              {[
                { label: "Peso", val: peso, set: setPeso, min: 40, max: 150, unit: "kg" },
                { label: "Altura", val: altura, set: setAltura, min: 140, max: 210, unit: "cm" },
                { label: "Edad", val: edad, set: setEdad, min: 15, max: 70, unit: "años" },
              ].map(({ label, val, set, min, max, unit }) => (
                <div className="field" key={label}>
                  <label>{label}</label>
                  <div className="num-input-wrap">
                    <input
                      type="number"
                      value={val}
                      min={min}
                      max={max}
                      onChange={e => set(Number(e.target.value))}
                    />
                    <span className="num-input-unit">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fuerza */}
          <div className="section">
            <div className="section-label">02 · Entrenamiento de fuerza</div>
            <div style={{display:"flex", flexDirection:"column", gap:20}}>
              <div className="slider-field">
                <div className="slider-top">
                  <label>Días por semana</label>
                  <span className="slider-value">{diasFuerza} días</span>
                </div>
                <input type="range" min={1} max={7} value={diasFuerza} onChange={e => setDiasFuerza(Number(e.target.value))} />
              </div>
              <div className="slider-field">
                <div className="slider-top">
                  <label>Duración por sesión</label>
                  <span className="slider-value">{duracion} min</span>
                </div>
                <input type="range" min={20} max={120} step={5} value={duracion} onChange={e => setDuracion(Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Intensidad percibida</label>
                <select className="styled-select" value={intensidad} onChange={e => setIntensidad(e.target.value)}>
                  <option value="ligera">Ligera — pocas series, descansos largos</option>
                  <option value="moderada">Moderada — trabajo consistente, algo de fatiga</option>
                  <option value="intensa">Intensa — mucho volumen, cerca del fallo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cardio */}
          <div className="section">
            <div className="section-label">03 · Cardio adicional</div>
            <div className="field">
              <label>¿Haces cardio además de la fuerza?</label>
              <select className="styled-select" value={cardio} onChange={e => setCardio(e.target.value)}>
                <option value="ninguno">No, solo fuerza</option>
                <option value="poco">Poco — 1-2 sesiones suaves por semana</option>
                <option value="moderado">Moderado — 3 sesiones por semana</option>
                <option value="bastante">Bastante — 4+ sesiones o sesiones largas</option>
              </select>
            </div>
          </div>

          {/* NEAT */}
          <div className="section">
            <div className="section-label">04 · Actividad diaria (NEAT)</div>
            <div style={{display:"flex", flexDirection:"column", gap:20}}>
              <div className="slider-field">
                <div className="slider-top">
                  <label>Pasos diarios promedio</label>
                  <span className="slider-value">{pasos.toLocaleString()}</span>
                </div>
                <input type="range" min={1000} max={20000} step={500} value={pasos} onChange={e => setPasos(Number(e.target.value))} />
                <span className="slider-hint">Sin contar el entrenamiento — solo movimiento cotidiano</span>
              </div>
              <div className="field">
                <label>Tipo de trabajo o actividad laboral</label>
                <select className="styled-select" value={trabajo} onChange={e => setTrabajo(e.target.value)}>
                  <option value="sedentario">Sedentario — oficina, estudio, sentado la mayoría</option>
                  <option value="ligero">Ligero — de pie a ratos, algo de movimiento</option>
                  <option value="moderado">Moderado — de pie varias horas, algo de carga</option>
                  <option value="activo">Activo — trabajo físico, mucho movimiento</option>
                </select>
              </div>
            </div>
          </div>

          <button className="cta" onClick={calcular}>
            Calcular mi gasto calórico total
          </button>
        </main>

        {/* Right - Results */}
        <aside className="right-col">
          {!resultado ? (
            <div className="results-empty">
              <div className="big-icon">⚡</div>
              <p>Completa tus datos y pulsa calcular para ver tu gasto calórico desglosado y los objetivos recomendados.</p>
            </div>
          ) : (
            <div className="results-panel">
              <div className="results-header">
                <p>Gasto total diario estimado</p>
                <div className="tdee-main">
                  <span className="tdee-number">{resultado.tdee.toLocaleString()}</span>
                  <span className="tdee-unit">kcal/día</span>
                </div>
              </div>

              {/* Bar visual */}
              <div className="bar-chart" style={{padding:"16px 28px", height:"auto", display:"flex", gap:3, flexDirection:"row"}}>
                <div style={{display:"flex", gap:3, width:"100%", height:8, borderRadius:4, overflow:"hidden"}}>
                  {[
                    { val: resultado.bmr, color: "var(--text-muted)" },
                    { val: resultado.eat, color: "var(--info)" },
                    { val: resultado.neat, color: "var(--warning)" },
                    { val: resultado.tef, color: "var(--purple)" },
                  ].map((s, i) => (
                    <div key={i} className="bar-seg" style={{
                      flex: s.val / total,
                      background: s.color,
                      borderRadius: 2,
                    }} />
                  ))}
                </div>
              </div>

              <div className="breakdown">
                {[
                  { label: "Metabolismo basal (BMR)", val: resultado.bmr, color: "var(--text-muted)" },
                  { label: "Gasto por entreno (EAT)", val: resultado.eat, color: "var(--info)" },
                  { label: "Actividad diaria (NEAT)", val: resultado.neat, color: "var(--warning)" },
                  { label: "Efecto térmico alimentos", val: resultado.tef, color: "var(--purple)" },
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
                {[
                  { label: "Déficit moderado", desc: "Pérdida de grasa sin perder músculo", val: resultado.deficit, color: "var(--accent)" },
                  { label: "Mantenimiento", desc: "Peso estable sin cambios", val: resultado.tdee, color: "var(--text)" },
                  { label: "Superávit ligero", desc: "Ganancia muscular con mínima grasa", val: resultado.superavit, color: "var(--info)" },
                ].map(t => (
                  <div className="target-row" key={t.label}>
                    <div className="target-left">
                      <p style={{color: t.color}}>{t.label}</p>
                      <p>{t.desc}</p>
                    </div>
                    <span className="target-kcal" style={{color: t.color}}>{t.val.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="macros">
                <div className="macros-title">Distribución macro recomendada (déficit)</div>
                <div className="macros-grid">
                  {[
                    { name: "Proteína", val: resultado.proteinG, unit: "g", color: "var(--accent)" },
                    { name: "Grasa", val: resultado.fatG, unit: "g", color: "var(--warning)" },
                    { name: "Carbohidrato", val: resultado.carbG, unit: "g", color: "var(--info)" },
                  ].map(m => (
                    <div className="macro-card" key={m.name}>
                      <div className="macro-val" style={{color: m.color}}>{m.val}{m.unit}</div>
                      <div className="macro-name">{m.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="note">
                Estimación con margen ±10–15%. Ajusta cada 2–3 semanas según evolución real del peso. La proteína alta protege la masa muscular en déficit.
              </p>
            </div>
          )}
        </aside>

        <footer className="footer">
          <p>Basado en Mifflin-St Jeor (1990) · MET compendium · evidencia actualizada</p>
          <p>No sustituye consulta con dietista-nutricionista colegiado</p>
        </footer>
      </div>
    </>
  );
}