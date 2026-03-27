import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');`;

const styles = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f5f0e8; --bg-warm: #ede6d6; --surface: #faf7f2; --surface-2: #ede6d6;
    --border: rgba(180,120,60,0.15); --border-strong: rgba(180,120,60,0.3);
    --accent: #d94f2b; --accent-2: #e8793a;
    --accent-dim: rgba(217,79,43,0.1); --accent-glow: rgba(217,79,43,0.2);
    --text: #1e1208; --text-muted: #8a6a50; --text-dim: #c4a882;
    --green: #5a8a4a; --green-dim: rgba(90,138,74,0.1);
    --blue: #3a6e9e; --blue-dim: rgba(58,110,158,0.1);
    --yellow: #c8860a; --yellow-dim: rgba(200,134,10,0.1);
    --purple: #7a5a9e;
    --font-display: 'Playfair Display', serif;
    --font-body: 'IBM Plex Sans', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
    --r: 10px; --r-lg: 16px;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; -webkit-font-smoothing: antialiased; }

  .page {
    display: grid; grid-template-columns: 1fr 460px;
    grid-template-rows: auto 1fr auto;
    max-width: 1360px; margin: 0 auto; padding: 0 48px; gap: 0 64px; min-height: 100vh;
  }

  /* ── Header ── */
  .header { grid-column: 1/-1; padding: 52px 0 44px; display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 1.5px solid var(--border); margin-bottom: 64px; }
  .header-left h1 { font-family: var(--font-display); font-size: 3.4rem; line-height: 1; letter-spacing: -0.02em; }
  .header-left h1 em { font-style: italic; color: var(--accent); }
  .header-left p { font-size: 0.82rem; color: var(--text-muted); margin-top: 12px; font-weight: 300; letter-spacing: 0.03em; }
  .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
  .badge { font-family: var(--font-mono); font-size: 0.65rem; padding: 6px 14px; border-radius: 100px; letter-spacing: 0.1em; }
  .badge-neutral { color: var(--text-muted); border: 1px solid var(--border); background: var(--surface); }
  .badge-accent { color: var(--accent); border: 1px solid var(--accent-dim); background: var(--accent-dim); }

  /* ── Columns ── */
  .left-col { grid-column: 1; grid-row: 2; padding-bottom: 60px; }
  .right-col {
    grid-column: 2; grid-row: 2; padding-bottom: 60px;
    position: sticky; top: 32px; height: fit-content;
    max-height: calc(100vh - 64px); overflow-y: auto;
  }
  .right-col::-webkit-scrollbar { width: 3px; }
  .right-col::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── Sections ── */
  .section { margin-bottom: 52px; }
  .section-label {
    font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.18em;
    color: var(--text-muted); text-transform: uppercase; margin-bottom: 22px;
    display: flex; align-items: center; gap: 10px;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* ── Form elements ── */
  .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .input-grid.cols-1 { grid-template-columns: 1fr; }
  .input-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .field { display: flex; flex-direction: column; gap: 8px; }
  .field > label { font-size: 0.73rem; color: var(--text-muted); font-weight: 400; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .num-input-wrap { display: flex; align-items: center; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); overflow: hidden; transition: border-color .2s, box-shadow .2s; }
  .num-input-wrap:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .num-input-wrap input { flex: 1; background: transparent; border: none; outline: none; color: var(--text); font-family: var(--font-mono); font-size: 1rem; padding: 12px 14px; width: 100%; }
  .num-input-unit { font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-muted); padding: 0 14px 0 0; white-space: nowrap; }
  .styled-select {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r);
    color: var(--text); font-family: var(--font-body); font-size: 0.83rem;
    padding: 12px 36px 12px 14px; outline: none; width: 100%; cursor: pointer;
    transition: border-color .2s, box-shadow .2s; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a6a50' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
  }
  .styled-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .styled-select option { background: #faf7f2; color: #1e1208; }
  .sex-toggle { display: grid; grid-template-columns: 1fr 1fr; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); overflow: hidden; }
  .sex-btn { padding: 12px; text-align: center; cursor: pointer; font-size: 0.8rem; color: var(--text-muted); transition: all .2s; border: none; background: transparent; font-family: var(--font-body); }
  .sex-btn.active { background: var(--accent-dim); color: var(--accent); font-weight: 500; }
  .info-box { background: var(--accent-dim); border: 1px solid rgba(217,79,43,.2); border-radius: var(--r); padding: 12px 16px; font-size: 0.75rem; color: var(--text-muted); line-height: 1.6; margin-top: 4px; }
  .info-box strong { color: var(--accent); font-weight: 500; }
  .cta { width: 100%; padding: 17px; background: var(--accent); color: #faf7f2; border: none; border-radius: 12px; font-family: var(--font-body); font-size: 0.9rem; font-weight: 500; cursor: pointer; letter-spacing: .03em; transition: all .2s; margin-top: 8px; }
  .cta:hover { background: var(--accent-2); transform: translateY(-2px); box-shadow: 0 10px 32px var(--accent-glow); }
  .cta:active { transform: translateY(0); }

  /* ── Slider ── */
  .slider-field { display: flex; flex-direction: column; gap: 10px; }
  .slider-top { display: flex; justify-content: space-between; align-items: center; }
  .slider-top label { font-size: .73rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
  .slider-value { font-family: var(--font-mono); font-size: .85rem; color: var(--accent); font-weight: 500; }
  .slider-wrap { position: relative; padding-bottom: 18px; }
  input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; border: none; cursor: pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--accent); cursor: pointer; box-shadow: 0 0 10px var(--accent-glow); transition: transform .15s; border: 3px solid var(--surface); }
  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
  .slider-mark { position: absolute; bottom: 0; transform: translateX(-50%); font-family: var(--font-mono); font-size: .58rem; color: var(--text-dim); white-space: nowrap; }
  .slider-hint { font-size: .68rem; color: var(--text-dim); font-style: italic; }

  /* ── Tooltip ── */
  .tip-wrap { position: relative; display: inline-flex; align-items: center; }
  .tip-icon { width: 15px; height: 15px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border); font-size: .6rem; color: var(--text-muted); cursor: help; display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-mono); flex-shrink: 0; transition: all .15s; }
  .tip-icon:hover { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
  .tip-box { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: #2a1a0e; color: #f0e6d6; font-family: var(--font-body); font-size: .72rem; line-height: 1.55; padding: 10px 14px; border-radius: 8px; width: 230px; z-index: 200; pointer-events: none; opacity: 0; transition: opacity .15s; box-shadow: 0 8px 24px rgba(0,0,0,.35); }
  .tip-wrap:hover .tip-box { opacity: 1; }

  /* ── Results panel ── */
  .results-empty { border: 1.5px dashed var(--border); border-radius: var(--r-lg); padding: 52px 32px; text-align: center; color: var(--text-muted); background: var(--surface); }
  .results-empty .big-icon { font-size: 2.8rem; margin-bottom: 18px; opacity: .4; }
  .results-empty p { font-size: .83rem; line-height: 1.7; font-weight: 300; max-width: 260px; margin: 0 auto; }
  .results-panel { border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; background: var(--surface); animation: fadeUp .4s ease; box-shadow: 0 4px 40px rgba(180,100,40,.08); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Results header ── */
  .results-header { padding: 24px 28px 20px; border-bottom: 1px solid var(--border); background: linear-gradient(135deg, #fdf8f2 0%, #f5ede0 100%); }
  .results-header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .res-label { font-size: .67rem; color: var(--text-muted); font-family: var(--font-mono); letter-spacing: .12em; text-transform: uppercase; margin-bottom: 6px; }
  .tdee-main { display: flex; align-items: baseline; gap: 8px; }
  .tdee-number { font-family: var(--font-display); font-size: 3.6rem; color: var(--accent); line-height: 1; }
  .tdee-unit { font-family: var(--font-mono); font-size: .78rem; color: var(--text-muted); }
  .health-pill { display: flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 100px; font-size: .67rem; font-family: var(--font-mono); border: 1px solid transparent; white-space: nowrap; }
  .imc-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
  .imc-lbl { font-size: .72rem; color: var(--text-muted); font-family: var(--font-mono); display: flex; align-items: center; gap: 5px; }
  .imc-val { font-family: var(--font-mono); font-size: .85rem; font-weight: 500; }
  .imc-cat { font-size: .67rem; padding: 2px 8px; border-radius: 100px; font-family: var(--font-mono); }
  .health-msg { font-size: .68rem; color: var(--text-muted); margin-top: 8px; line-height: 1.55; font-style: italic; }

  /* ── Tabs ── */
  .tabs { display: flex; border-bottom: 1px solid var(--border); }
  .tab-btn { flex: 1; padding: 10px 4px; text-align: center; cursor: pointer; font-size: .65rem; font-family: var(--font-mono); color: var(--text-muted); border: none; background: transparent; border-bottom: 2px solid transparent; transition: all .2s; letter-spacing: .06em; text-transform: uppercase; }
  .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--accent-dim); }
  .tab-content { display: none; }
  .tab-content.active { display: block; }

  /* ── Panel sections ── */
  .psec { padding: 16px 28px; border-bottom: 1px solid var(--border); }
  .psec:last-child { border-bottom: none; }
  .psec-title { font-family: var(--font-mono); font-size: .6rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }

  /* ── Bar ── */
  .bar-wrap { padding: 14px 28px; border-bottom: 1px solid var(--border); }
  .bar-track { display: flex; gap: 3px; width: 100%; height: 8px; border-radius: 4px; overflow: hidden; }
  .bar-seg { border-radius: 2px; transition: flex .6s cubic-bezier(.34,1.56,.64,1); }

  /* ── Breakdown ── */
  .breakdown { padding: 16px 28px; display: flex; flex-direction: column; gap: 10px; border-bottom: 1px solid var(--border); }
  .brow { display: flex; justify-content: space-between; align-items: center; }
  .brow-lbl { display: flex; align-items: center; gap: 8px; font-size: .78rem; color: var(--text-muted); }
  .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .brow-val { font-family: var(--font-mono); font-size: .83rem; font-weight: 500; }

  /* ── Targets ── */
  .targets { padding: 16px 28px; display: flex; flex-direction: column; gap: 7px; }
  .target-row { background: var(--bg-warm); border-radius: var(--r); padding: 11px 14px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); transition: all .2s; }
  .target-row.active { border-width: 1.5px; }
  .target-left p:first-child { font-size: .77rem; font-weight: 500; margin-bottom: 1px; }
  .target-left p:last-child { font-size: .66rem; color: var(--text-muted); }
  .target-kcal { font-family: var(--font-mono); font-size: .93rem; font-weight: 500; }

  /* ── Macros ── */
  .macros-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .macro-card { background: var(--bg-warm); border-radius: var(--r); padding: 12px 8px; text-align: center; border: 1px solid var(--border); }
  .macro-val { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 500; margin-bottom: 2px; }
  .macro-name { font-size: .6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; }
  .macro-kcal { font-size: .58rem; color: var(--text-dim); font-family: var(--font-mono); margin-top: 2px; }

  /* ── Meal plan ── */
  .meal-sel { display: flex; gap: 6px; margin-bottom: 12px; }
  .meal-btn { padding: 4px 12px; border-radius: 6px; font-size: .68rem; font-family: var(--font-mono); cursor: pointer; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); transition: all .2s; }
  .meal-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent-dim); }
  .meal-grid { display: flex; flex-direction: column; gap: 7px; }
  .meal-row { background: var(--bg-warm); border-radius: var(--r); padding: 10px 12px; border: 1px solid var(--border); }
  .meal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .meal-name { font-size: .78rem; font-weight: 500; }
  .meal-kcal { font-family: var(--font-mono); font-size: .78rem; color: var(--accent); }
  .meal-macros { font-size: .65rem; color: var(--text-muted); font-family: var(--font-mono); }

  /* ── Extra rows ── */
  .xrow { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; }
  .xrow + .xrow { border-top: 1px solid var(--border); }
  .xrow-lbl { font-size: .78rem; color: var(--text-muted); }
  .xrow-val { font-family: var(--font-mono); font-size: .9rem; font-weight: 500; }

  /* ── Donut ── */
  .donut-wrap { display: flex; align-items: center; gap: 20px; }
  .donut-legend { display: flex; flex-direction: column; gap: 9px; }
  .dleg { display: flex; align-items: center; gap: 8px; font-size: .75rem; color: var(--text-muted); }
  .dleg-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
  .dleg-val { font-family: var(--font-mono); font-size: .8rem; font-weight: 500; margin-left: auto; padding-left: 12px; }

  /* ── Recomp card ── */
  .recomp-card { border-radius: var(--r); padding: 12px 14px; font-size: .75rem; line-height: 1.6; border: 1px solid; }
  .recomp-card strong { display: block; margin-bottom: 5px; font-size: .78rem; }

  /* ── Proyección ── */
  .proy-card { background: var(--bg-warm); border-radius: var(--r); padding: 14px 16px; border: 1px solid var(--border); margin-bottom: 10px; }
  .proy-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
  .proy-row + .proy-row { border-top: 1px solid var(--border); }
  .proy-lbl { font-size: .75rem; color: var(--text-muted); }
  .proy-val { font-family: var(--font-mono); font-size: .85rem; font-weight: 500; }

  /* ── Save btn ── */
  .save-btn { width: 100%; padding: 11px; background: var(--surface); color: var(--text-muted); border: 1.5px solid var(--border); border-radius: var(--r); font-family: var(--font-body); font-size: .8rem; cursor: pointer; transition: all .2s; }
  .save-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .save-btn.saved { border-color: var(--green); color: var(--green); background: var(--green-dim); }

  /* ── Compare ── */
  .compare-toggle { display: flex; align-items: center; gap: 10px; margin-top: 28px; margin-bottom: 14px; }
  .tog-switch { position: relative; width: 36px; height: 20px; flex-shrink: 0; }
  .tog-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .tog-slider { position: absolute; cursor: pointer; inset: 0; background: var(--surface-2); border-radius: 20px; transition: .3s; border: 1px solid var(--border); }
  .tog-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background: var(--text-muted); border-radius: 50%; transition: .3s; }
  .tog-switch input:checked + .tog-slider { background: var(--accent-dim); border-color: var(--accent); }
  .tog-switch input:checked + .tog-slider:before { transform: translateX(16px); background: var(--accent); }
  .tog-lbl { font-size: .75rem; color: var(--text-muted); font-family: var(--font-mono); cursor: pointer; }
  .compare-form { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); padding: 16px; margin-bottom: 4px; }
  .compare-form-title { font-family: var(--font-mono); font-size: .6rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }
  .compare-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ccard { background: var(--bg-warm); border-radius: var(--r); padding: 14px; border: 1px solid var(--border); }
  .ccard.active { border-color: var(--accent); background: var(--accent-dim); }
  .ccard-lbl { font-family: var(--font-mono); font-size: .58rem; color: var(--text-muted); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 6px; }
  .ccard.active .ccard-lbl { color: var(--accent); }
  .ccard-tdee { font-family: var(--font-display); font-size: 1.9rem; color: var(--accent); line-height: 1; margin-bottom: 3px; }
  .ccard-detail { font-size: .68rem; color: var(--text-muted); }
  .compare-diff { text-align: center; padding: 10px 0; font-family: var(--font-mono); font-size: .75rem; color: var(--text-muted); }
  .compare-diff span { font-size: .95rem; font-weight: 500; }

  /* ── Historial ── */
  .historial { grid-column: 1/-1; padding: 40px 0 60px; border-top: 1px solid var(--border); }
  .hist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .hist-title { font-family: var(--font-display); font-size: 1.5rem; }
  .hist-title em { font-style: italic; color: var(--accent); }
  .hist-clear { font-family: var(--font-mono); font-size: .68rem; color: var(--text-muted); background: none; border: 1px solid var(--border); border-radius: 6px; padding: 5px 12px; cursor: pointer; transition: all .2s; }
  .hist-clear:hover { color: var(--accent); border-color: var(--accent-dim); }
  .hist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
  .hist-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 16px; }
  .hist-date { font-family: var(--font-mono); font-size: .6rem; color: var(--text-dim); margin-bottom: 8px; }
  .hist-tdee { font-family: var(--font-display); font-size: 1.7rem; color: var(--accent); line-height: 1; margin-bottom: 3px; }
  .hist-sub { font-size: .7rem; color: var(--text-muted); margin-bottom: 1px; }
  .hist-empty { font-size: .83rem; color: var(--text-dim); font-style: italic; }

  /* ── Note & Footer ── */
  .note { padding: 12px 28px 20px; font-size: .7rem; color: var(--text-dim); line-height: 1.7; font-style: italic; }
  .footer { grid-column: 1/-1; padding: 24px 0; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .footer p { font-size: .7rem; color: var(--text-dim); font-family: var(--font-mono); }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .page { grid-template-columns: 1fr; padding: 0 20px; gap: 0; }
    .header { grid-column: 1; flex-direction: column; align-items: flex-start; gap: 16px; }
    .left-col, .right-col, .historial, .footer { grid-column: 1; grid-row: auto; }
    .right-col { position: static; max-height: none; overflow-y: visible; margin-top: 32px; }
    .header-left h1 { font-size: 2.4rem; }
    .input-grid.cols-3 { grid-template-columns: 1fr 1fr; }
    .footer { flex-direction: column; gap: 8px; text-align: center; }
    .compare-cards { grid-template-columns: 1fr; }
  }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TIPS = {
  bmr: "Metabolismo Basal: calorías que tu cuerpo gasta para mantenerse vivo en reposo absoluto. Respirar, temperatura corporal, función orgánica.",
  eat: "Exercise Activity Thermogenesis: calorías quemadas durante el ejercicio planificado (pesas, cardio).",
  neat: "Non-Exercise Activity Thermogenesis: calorías quemadas en todo lo que no es ejercicio. Caminar, gesticular, levantarte de la silla. Muy variable entre personas.",
  tef: "Thermic Effect of Food: energía que gasta tu cuerpo digiriendo alimentos. Equivale a ~10% de tu ingesta calórica total.",
  rir: "Repeticiones en Reserva: cuántas reps quedan antes del fallo muscular. RIR 0 = fallo total. RIR 3 = trabajo moderado.",
  imc: "Índice de Masa Corporal: relación peso/altura². Orientativo — no distingue músculo de grasa. Un atleta puede tener IMC de 'sobrepeso'.",
  katch: "Fórmula de Katch-McArdle: más precisa que Mifflin-St Jeor porque usa la masa magra real en lugar de estimarla por sexo, peso y altura.",
};

const MEAL_PLANS = {
  3: [
    { name: "Desayuno", emoji: "☕", pct: 0.30 },
    { name: "Almuerzo", emoji: "🍽️", pct: 0.40 },
    { name: "Cena",     emoji: "🌙", pct: 0.30 },
  ],
  4: [
    { name: "Desayuno",  emoji: "☕", pct: 0.25 },
    { name: "Almuerzo",  emoji: "🍽️", pct: 0.35 },
    { name: "Merienda",  emoji: "🍎", pct: 0.15 },
    { name: "Cena",      emoji: "🌙", pct: 0.25 },
  ],
  5: [
    { name: "Desayuno",      emoji: "☕", pct: 0.20 },
    { name: "Media mañana",  emoji: "🍎", pct: 0.12 },
    { name: "Almuerzo",      emoji: "🍽️", pct: 0.35 },
    { name: "Merienda",      emoji: "🫐", pct: 0.13 },
    { name: "Cena",          emoji: "🌙", pct: 0.20 },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function markPos(val, min, max) {
  const pct = (val - min) / (max - min);
  return `calc(${pct * 100}% - ${9 * (2 * pct - 1)}px)`;
}

function imcInfo(v) {
  if (v < 18.5) return { label: "Bajo peso",  color: "#3a6e9e", bg: "rgba(58,110,158,.1)" };
  if (v < 25)   return { label: "Normal",      color: "#5a8a4a", bg: "rgba(90,138,74,.1)"  };
  if (v < 30)   return { label: "Sobrepeso",   color: "#c8860a", bg: "rgba(200,134,10,.1)" };
  return               { label: "Obesidad",    color: "#d94f2b", bg: "rgba(217,79,43,.1)"  };
}

function getCategory(direction, delta) {
  if (direction === "mantenimiento") return { label: "Mantenimiento", color: "#8a6a50" };
  if (direction === "deficit") {
    if (delta <= 50)  return { label: "Mínimo",              color: "#5a8a4a", prot: 1.6 };
    if (delta <= 150) return { label: "Ligero",              color: "#7a9a4a", prot: 1.8 };
    if (delta <= 250) return { label: "Ligero / Moderado",   color: "#a08a30", prot: 2.0 };
    if (delta <= 350) return { label: "Moderado",            color: "#c8860a", prot: 2.2 };
    if (delta <= 450) return { label: "Moderado / Agresivo", color: "#d47020", prot: 2.3 };
    if (delta <= 550) return { label: "Agresivo",            color: "#d94f2b", prot: 2.4 };
    return                   { label: "Muy agresivo ⚠",     color: "#b03020", prot: 2.5 };
  }
  // superavit
  if (delta <= 50)  return { label: "Mínimo",              color: "#5a8a4a", prot: 1.6 };
  if (delta <= 150) return { label: "Ligero",              color: "#4a8a6a", prot: 1.8 };
  if (delta <= 250) return { label: "Ligero / Moderado",   color: "#3a7a8a", prot: 1.9 };
  if (delta <= 350) return { label: "Moderado",            color: "#3a6e9e", prot: 2.0 };
  if (delta <= 450) return { label: "Moderado / Agresivo", color: "#5a5a9e", prot: 2.0 };
  return                   { label: "Agresivo",            color: "#7a5a9e", prot: 2.0 };
}

function healthStatus(r) {
  const pPerKg = r.proteinG / r.peso;
  const deficit = r.mantenimiento - r.kcalObj;
  if (r.kcalObj < r.bmr * 0.85) return { label: "⚠ Riesgo", color: "#d94f2b", bg: "rgba(217,79,43,.1)", msg: "Ingesta por debajo del 85% del BMR. Riesgo serio de pérdida muscular y carencias nutricionales." };
  if (deficit > 500)             return { label: "⚠ Agresivo", color: "#c8860a", bg: "rgba(200,134,10,.1)", msg: "Déficit elevado. Asegura proteína alta y considera una semana de mantenimiento cada 6-8 semanas." };
  if (pPerKg < 1.6 && deficit > 0) return { label: "⚠ Proteína baja", color: "#c8860a", bg: "rgba(200,134,10,.1)", msg: "Con déficit calórico la proteína debería ser ≥1.6 g/kg para preservar masa muscular." };
  if (deficit <= 0)              return { label: "✓ Óptimo", color: "#5a8a4a", bg: "rgba(90,138,74,.1)", msg: "Plan equilibrado. Monitorea el peso cada semana en las mismas condiciones." };
  return                               { label: "✓ Correcto", color: "#5a8a4a", bg: "rgba(90,138,74,.1)", msg: "Plan sostenible. Ajusta cada 2-3 semanas según evolución real del peso." };
}

function recompViability(bf, sexo, dias, intensidad) {
  if (!bf || Number(bf) <= 0) return null;
  const bfN = Number(bf);
  const highBf = sexo === "hombre" ? bfN > 20 : bfN > 27;
  const goodTraining = dias >= 3 && ["moderada","intensa","muy_intensa"].includes(intensidad);
  if (highBf && goodTraining) return { viable: true, msg: "Con tu % de grasa y frecuencia de entreno, la recomposición corporal es viable. Mantén un déficit mínimo (~150-200 kcal) y proteína muy alta (2.2+ g/kg)." };
  if (!goodTraining) return { viable: false, msg: "Para recomposición necesitas ≥3 días/semana de fuerza de calidad. Aumenta la frecuencia o la intensidad primero." };
  return { viable: false, msg: "Con tu % de grasa actual, un déficit moderado + proteína alta dará resultados más rápidos que intentar recomp." };
}

function calcTDEE({ sexo, peso, altura, edad, grasa, diasFuerza, duracion, intensidad, cardio, pasos, trabajo }) {
  let bmr;
  if (grasa && Number(grasa) > 0) {
    const lean = peso * (1 - Number(grasa) / 100);
    bmr = 370 + 21.6 * lean;
  } else {
    bmr = sexo === "hombre"
      ? 10 * peso + 6.25 * altura - 5 * edad + 5
      : 10 * peso + 6.25 * altura - 5 * edad - 161;
  }
  const met = { ligera: 3.5, moderada: 5.0, intensa: 6.5, muy_intensa: 8.0 }[intensidad];
  const eat = ((met * peso * 3.5) / 200) * duracion * diasFuerza / 7
    + { ninguno: 0, poco: 300, moderado: 900, bastante: 2000, mucho: 3250 }[cardio] / 7;
  const neat = pasos * (peso * 0.00055) + { sedentario: 0, ligero: 200, moderado: 400, activo: 700, muy_activo: 1000 }[trabajo];
  const tef = bmr * 0.1;
  return { bmr: Math.round(bmr), eat: Math.round(eat), neat: Math.round(neat), tef: Math.round(tef), tdee: Math.round(bmr + eat + neat + tef) };
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Tip({ text }) {
  return (
    <span className="tip-wrap">
      <span className="tip-icon">i</span>
      <span className="tip-box">{text}</span>
    </span>
  );
}

function Slider({ label, value, onChange, min, max, step = 1, unit = "", marks = [], hint, tip }) {
  const pct = (value - min) / (max - min);
  const grad = `linear-gradient(to right, var(--accent) ${pct * 100}%, var(--surface-2) ${pct * 100}%)`;
  const display = unit === "pasos" ? value.toLocaleString() : `${value} ${unit}`;
  return (
    <div className="slider-field">
      <div className="slider-top">
        <label>{label}{tip && <Tip text={tip} />}</label>
        <span className="slider-value">{display}</span>
      </div>
      <div className="slider-wrap">
        <input type="range" min={min} max={max} step={step} value={value}
          style={{ background: grad }} onChange={e => onChange(Number(e.target.value))} />
        {marks.map(m => (
          <span key={m.val} className="slider-mark" style={{ left: markPos(m.val, min, max) }}>{m.label}</span>
        ))}
      </div>
      {hint && <span className="slider-hint">{hint}</span>}
    </div>
  );
}

function DonutChart({ leanKg, fatKg }) {
  const r = 52, cx = 70, cy = 70, sw = 22;
  const circ = 2 * Math.PI * r;
  const total = leanKg + fatKg;
  const fatDash  = (fatKg  / total) * circ;
  const leanDash = (leanKg / total) * circ;
  const fatDeg   = (fatKg  / total) * 360;
  return (
    <div className="donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8793a" strokeWidth={sw}
          strokeDasharray={`${fatDash} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`} style={{transition:"stroke-dasharray .6s"}} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d94f2b" strokeWidth={sw}
          strokeDasharray={`${leanDash} ${circ}`}
          transform={`rotate(${-90 + fatDeg} ${cx} ${cy})`} style={{transition:"stroke-dasharray .6s"}} />
        <text x={cx} y={cy - 5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-muted)">TOTAL</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontFamily="var(--font-display)" fontSize="15" fill="var(--text)">{total.toFixed(1)}kg</text>
      </svg>
      <div className="donut-legend">
        {[
          { label: "Masa magra", val: `${leanKg.toFixed(1)} kg`, color: "#d94f2b" },
          { label: "Masa grasa", val: `${fatKg.toFixed(1)} kg`,  color: "#e8793a" },
          { label: "% Grasa",    val: `${((fatKg/total)*100).toFixed(1)}%`, color: "var(--text-muted)" },
        ].map(item => (
          <div className="dleg" key={item.label}>
            <div className="dleg-dot" style={{ background: item.color }} />
            <span>{item.label}</span>
            <span className="dleg-val" style={{ color: item.color }}>{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MealPlan({ kcal, proteinG, fatG, carbG }) {
  const [n, setN] = useState(4);
  return (
    <div>
      <div className="meal-sel">
        {[3,4,5].map(v => (
          <button key={v} className={`meal-btn ${n === v ? "active" : ""}`} onClick={() => setN(v)}>{v} comidas</button>
        ))}
      </div>
      <div className="meal-grid">
        {MEAL_PLANS[n].map(m => {
          const mk = Math.round(kcal * m.pct);
          const mp = Math.round(proteinG * m.pct);
          const mf = Math.round(fatG * m.pct);
          const mc = Math.round(carbG * m.pct);
          return (
            <div className="meal-row" key={m.name}>
              <div className="meal-top">
                <span className="meal-name">{m.emoji} {m.name}</span>
                <span className="meal-kcal">{mk} kcal</span>
              </div>
              <div className="meal-macros">P {mp}g · G {mf}g · C {mc}g</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {

  // ── Form state
  const [sexo,       setSexo]       = useState("hombre");
  const [peso,       setPeso]       = useState(75);
  const [altura,     setAltura]     = useState(175);
  const [edad,       setEdad]       = useState(22);
  const [grasa,      setGrasa]      = useState("");
  const [diasF,      setDiasF]      = useState(5);
  const [duracion,   setDuracion]   = useState(60);
  const [intensidad, setIntensidad] = useState("moderada");
  const [cardio,     setCardio]     = useState("ninguno");
  const [pasos,      setPasos]      = useState(7000);
  const [trabajo,    setTrabajo]    = useState("sedentario");
  const [direction,    setDirection]    = useState("deficit");
  const [customDelta,  setCustomDelta]  = useState(300);
  const [pesoObj,    setPesoObj]    = useState("");

  // ── Compare state (Scenario B)
  const [compareOn,  setCompareOn]  = useState(false);
  const [bDias,      setBDias]      = useState(5);
  const [bDuracion,  setBDuracion]  = useState(60);
  const [bCardio,    setBCardio]    = useState("ninguno");
  const [bPasos,     setBPasos]     = useState(7000);

  // ── UI state
  const [resultado,  setResultado]  = useState(null);
  const [tab,        setTab]        = useState(0);
  const [saved,      setSaved]      = useState(false);

  // ── Historial (localStorage)
  const [historial, setHistorial] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tdee_hist") || "[]"); }
    catch { return []; }
  });

  // ── Calculate
  const calcular = () => {
    const params = { sexo, peso, altura, edad, grasa, diasFuerza: diasF, duracion, intensidad, cardio, pasos, trabajo };
    const base = calcTDEE(params);

    const mant    = base.tdee;
    const def_mod = mant - 300;
    const def_agr = mant - 500;
    const sup_lig = mant + 250;
    const sup_agr = mant + 500;

    const cat = getCategory(direction, customDelta);
    let kcalObj, proteinG;
    if (direction === "mantenimiento") {
      kcalObj   = mant;
      proteinG  = Math.round(peso * 1.8);
    } else if (direction === "deficit") {
      kcalObj   = mant - customDelta;
      proteinG  = Math.round(peso * cat.prot);
    } else {
      kcalObj   = mant + customDelta;
      proteinG  = Math.round(peso * cat.prot);
    }

    const fatG  = Math.round((kcalObj * 0.28) / 9);
    const carbG = Math.round((kcalObj - proteinG * 4 - fatG * 9) / 4);

    const horasEj = (duracion / 60 * diasF) / 7;
    const agua    = Math.round((peso * 35 + horasEj * 500) / 100) / 10;
    const fibra   = sexo === "hombre" ? 38 : 25;
    const imc     = +(peso / ((altura / 100) ** 2)).toFixed(1);

    setResultado({ ...base, mantenimiento: mant, def_mod, def_agr, sup_lig, sup_agr, kcalObj, proteinG, fatG, carbG, agua, fibra, imc, peso, sexo, direction, customDelta, usandoKatch: !!(grasa && Number(grasa) > 0) });
    setSaved(false);
    setTab(0);
  };

  const calcB = () => {
    if (!resultado) return null;
    return calcTDEE({ sexo, peso, altura, edad, grasa, diasFuerza: bDias, duracion: bDuracion, intensidad, cardio: bCardio, pasos: bPasos, trabajo });
  };

  const guardar = () => {
    if (!resultado) return;
    const entry = {
      date: new Date().toLocaleDateString("es-ES", { day:"2-digit", month:"short", year:"numeric" }),
      tdee: resultado.mantenimiento,
      kcalObj: resultado.kcalObj,
      peso: resultado.peso,
      imc: resultado.imc,
      objetivo: resultado.direction === "mantenimiento" ? "Mantenimiento" : `${resultado.direction === "deficit" ? "−" : "+"}${resultado.customDelta} kcal · ${getCategory(resultado.direction, resultado.customDelta).label}`,
    };
    const next = [entry, ...historial].slice(0, 12);
    setHistorial(next);
    try { localStorage.setItem("tdee_hist", JSON.stringify(next)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const limpiarHistorial = () => {
    setHistorial([]);
    try { localStorage.removeItem("tdee_hist"); } catch {}
  };

  // ── Derived values
  const total   = resultado ? resultado.bmr + resultado.eat + resultado.neat + resultado.tef : 1;
  const bResult = compareOn && resultado ? calcB() : null;
  const health  = resultado ? healthStatus(resultado) : null;
  const recomp  = recompViability(grasa, sexo, diasF, intensidad);

  const getProyeccion = () => {
    if (!resultado) return null;
    const def = resultado.mantenimiento - resultado.kcalObj;
    if (def <= 0) return null;
    const kgSem = (def * 7) / 7700;
    const semanas = (pesoObj && Number(pesoObj) > 0 && Number(pesoObj) < resultado.peso)
      ? Math.round((resultado.peso - Number(pesoObj)) / kgSem) : null;
    return { kgSem: kgSem.toFixed(2), semanas };
  };
  const proy = getProyeccion();

  const currentCat = getCategory(direction, customDelta);

  const targets = resultado ? [
    { label: "Déficit agresivo",   desc: "−500 kcal/día",  val: resultado.def_agr,      color: "#d94f2b" },
    { label: "Déficit moderado",   desc: "−300 kcal/día",  val: resultado.def_mod,      color: "#e8793a" },
    { label: "Mantenimiento",      desc: "Sin cambios",    val: resultado.mantenimiento, color: "#8a6a50" },
    { label: "Superávit ligero",   desc: "+250 kcal/día",  val: resultado.sup_lig,      color: "#3a6e9e" },
    { label: "Superávit agresivo", desc: "+500 kcal/día",  val: resultado.sup_agr,      color: "#5a8a4a" },
    ...([resultado.def_agr, resultado.def_mod, resultado.mantenimiento, resultado.sup_lig, resultado.sup_agr].includes(resultado.kcalObj) ? [] : [{
      label: `${resultado.direction === "deficit" ? "Déficit" : resultado.direction === "superavit" ? "Superávit" : ""} personalizado`,
      desc:  `${resultado.direction === "deficit" ? "−" : "+"}${resultado.customDelta} kcal/día · ${getCategory(resultado.direction, resultado.customDelta).label}`,
      val:   resultado.kcalObj,
      color: getCategory(resultado.direction, resultado.customDelta).color,
    }]),
  ] : [];

  const objLabel = resultado
    ? resultado.direction === "mantenimiento"
      ? "Mantenimiento"
      : `${resultado.direction === "deficit" ? "Déficit" : "Superávit"} ${resultado.customDelta} kcal · ${getCategory(resultado.direction, resultado.customDelta).label}`
    : "";

  const numField = (label, val, set, min, max, unit) => (
    <div className="field" key={label}>
      <label>{label}</label>
      <div className="num-input-wrap">
        <input type="number" value={val} min={min} max={max}
          onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) set(v); }} />
        <span className="num-input-unit">{unit}</span>
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="page">

        {/* ── HEADER ── */}
        <header className="header">
          <div className="header-left">
            <h1>Gasto <em>calórico</em> total</h1>
            <p>Mifflin-St Jeor · Katch-McArdle · MET compendium · evidencia actualizada</p>
          </div>
          <div className="header-right">
            <span className="badge badge-neutral">TDEE CALCULATOR v3.0</span>
            <span className="badge badge-accent">Basado en evidencia científica</span>
          </div>
        </header>

        {/* ── LEFT COL ── */}
        <main className="left-col">

          {/* 01 */}
          <div className="section">
            <div className="section-label">01 · Datos biométricos</div>
            <div className="input-grid cols-1" style={{marginBottom:16}}>
              <div className="field">
                <label>Sexo biológico</label>
                <div className="sex-toggle">
                  <button className={`sex-btn ${sexo==="hombre"?"active":""}`} onClick={()=>setSexo("hombre")}>Hombre</button>
                  <button className={`sex-btn ${sexo==="mujer"?"active":""}`}  onClick={()=>setSexo("mujer")}>Mujer</button>
                </div>
              </div>
            </div>
            <div className="input-grid cols-3" style={{marginBottom:16}}>
              {numField("Peso",   peso,   setPeso,   40,  200, "kg")}
              {numField("Altura", altura, setAltura, 140, 220, "cm")}
              {numField("Edad",   edad,   setEdad,   15,  80,  "años")}
            </div>
            <div className="field">
              <label>% Grasa corporal <span style={{color:"var(--text-dim)"}}>— opcional, mejora la precisión</span> <Tip text={TIPS.katch} /></label>
              <div className="num-input-wrap">
                <input type="number" value={grasa} min={3} max={60} placeholder="Ej: 18"
                  onChange={e => setGrasa(e.target.value)} />
                <span className="num-input-unit">%</span>
              </div>
            </div>
            {grasa && Number(grasa) > 0 && (
              <div className="info-box" style={{marginTop:10}}>
                <strong>Katch-McArdle activo</strong> — fórmula basada en tu masa magra real. Más precisa que Mifflin-St Jeor.
              </div>
            )}
          </div>

          {/* 02 */}
          <div className="section">
            <div className="section-label">02 · Entrenamiento de fuerza</div>
            <div style={{display:"flex",flexDirection:"column",gap:28}}>
              <Slider label="Días por semana" value={diasF} onChange={setDiasF} min={1} max={7} unit="días"
                marks={[1,2,3,4,5,6,7].map(d=>({val:d,label:String(d)}))} />
              <Slider label="Duración por sesión" value={duracion} onChange={setDuracion} min={20} max={180} step={5} unit="min"
                marks={[20,45,60,90,120,150,180].map(d=>({val:d,label:d+"'"}))} />
              <div className="field">
                <label>Intensidad percibida <Tip text={TIPS.rir} /></label>
                <select className="styled-select" value={intensidad} onChange={e=>setIntensidad(e.target.value)}>
                  <option value="ligera">Ligera — 3-4 series/ejercicio, RIR 4+, descansos 3 min</option>
                  <option value="moderada">Moderada — 4-5 series, RIR 2-3, descansos 90-120 s</option>
                  <option value="intensa">Intensa — 5+ series, RIR 0-1, descansos cortos, alto volumen</option>
                  <option value="muy_intensa">Muy intensa — powerlifting / CrossFit / HIIT con pesas</option>
                </select>
              </div>
            </div>
          </div>

          {/* 03 */}
          <div className="section">
            <div className="section-label">03 · Cardio adicional</div>
            <div className="field">
              <label>¿Haces cardio además de la fuerza?</label>
              <select className="styled-select" value={cardio} onChange={e=>setCardio(e.target.value)}>
                <option value="ninguno">Ninguno — solo entreno de fuerza</option>
                <option value="poco">Poco — 1-2 sesiones/semana de 20-30 min (paseo rápido, bici suave)</option>
                <option value="moderado">Moderado — 3 sesiones/semana de 30-45 min (carrera, elíptica)</option>
                <option value="bastante">Bastante — 4 sesiones/semana de 45-60 min o sesiones largas</option>
                <option value="mucho">Mucho — 5+ sesiones/semana o más de 60 min (running, ciclismo)</option>
              </select>
            </div>
          </div>

          {/* 04 */}
          <div className="section">
            <div className="section-label">04 · Actividad diaria (NEAT) <Tip text={TIPS.neat} /></div>
            <div style={{display:"flex",flexDirection:"column",gap:28}}>
              <Slider label="Pasos diarios promedio" value={pasos} onChange={setPasos}
                min={1000} max={30000} step={500} unit="pasos"
                marks={[1000,5000,10000,15000,20000,25000,30000].map(d=>({val:d,label:(d/1000)+"k"}))}
                hint="Sin contar el entrenamiento — solo movimiento cotidiano" />
              <div className="field">
                <label>Tipo de trabajo o actividad laboral</label>
                <select className="styled-select" value={trabajo} onChange={e=>setTrabajo(e.target.value)}>
                  <option value="sedentario">Sedentario — oficina, estudio, sentado 6+ h al día</option>
                  <option value="ligero">Ligero — sentado 4-6 h, de pie el resto (dependiente, recepcionista)</option>
                  <option value="moderado">Moderado — de pie 6+ h, desplazamientos continuos (camarero, enfermero)</option>
                  <option value="activo">Activo — trabajo físico intenso, cargas moderadas (almacén, fontanero)</option>
                  <option value="muy_activo">Muy activo — esfuerzo físico todo el día (construcción, mudanzas)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 05 */}
          <div className="section">
            <div className="section-label">05 · Objetivo calórico</div>
            <div style={{display:"flex",flexDirection:"column",gap:20}}>

              {/* Direction selector */}
              <div className="field">
                <label>Dirección del objetivo</label>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:"var(--r)", overflow:"hidden"}}>
                  {[
                    {val:"deficit",       label:"Pérdida de grasa"},
                    {val:"mantenimiento", label:"Mantenimiento"},
                    {val:"superavit",     label:"Ganancia muscular"},
                  ].map(opt => (
                    <button key={opt.val}
                      className={`sex-btn ${direction===opt.val?"active":""}`}
                      style={{fontSize:".72rem", padding:"13px 6px", lineHeight:1.3}}
                      onClick={() => { setDirection(opt.val); if(opt.val==="mantenimiento") setCustomDelta(0); else if(customDelta===0) setCustomDelta(300); }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delta slider — only when not maintenance */}
              {direction !== "mantenimiento" && (
                <div style={{background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:"var(--r)", padding:"16px"}}>

                  {/* Quick presets */}
                  <div style={{display:"flex", gap:6, marginBottom:14, flexWrap:"wrap"}}>
                    <span style={{fontSize:".68rem", color:"var(--text-muted)", alignSelf:"center", marginRight:2}}>Presets:</span>
                    {(direction === "deficit"
                      ? [{v:100,l:"Mínimo"},{v:200,l:"Ligero"},{v:300,l:"Moderado"},{v:400,l:"Mod/Agresivo"},{v:500,l:"Agresivo"},{v:600,l:"Muy agresivo"}]
                      : [{v:100,l:"Mínimo"},{v:150,l:"Ligero"},{v:250,l:"Moderado"},{v:350,l:"Mod/Agresivo"},{v:500,l:"Agresivo"}]
                    ).map(p => (
                      <button key={p.v}
                        onClick={() => setCustomDelta(p.v)}
                        style={{
                          padding:"3px 10px", borderRadius:6, fontSize:".66rem",
                          fontFamily:"var(--font-mono)", cursor:"pointer", border:"1px solid",
                          background: customDelta===p.v ? "var(--accent-dim)" : "transparent",
                          color:       customDelta===p.v ? "var(--accent)" : "var(--text-muted)",
                          borderColor: customDelta===p.v ? "var(--accent-dim)" : "var(--border)",
                          transition:"all .15s",
                        }}>
                        {p.l}
                      </button>
                    ))}
                  </div>

                  {/* Slider */}
                  <Slider
                    label={direction === "deficit" ? "Déficit calórico" : "Superávit calórico"}
                    value={customDelta} onChange={setCustomDelta}
                    min={50} max={700} step={25} unit="kcal"
                    marks={direction === "deficit"
                      ? [{val:50,label:"50"},{val:200,label:"200"},{val:300,label:"300"},{val:500,label:"500"},{val:700,label:"700"}]
                      : [{val:50,label:"50"},{val:150,label:"150"},{val:300,label:"300"},{val:500,label:"500"},{val:700,label:"700"}]
                    }
                  />

                  {/* Category badge */}
                  <div style={{display:"flex", alignItems:"center", gap:10, marginTop:14, paddingTop:12, borderTop:"1px solid var(--border)"}}>
                    <span style={{fontSize:".72rem", color:"var(--text-muted)"}}>Categoría automática:</span>
                    <span style={{
                      fontFamily:"var(--font-mono)", fontSize:".72rem", fontWeight:500,
                      padding:"3px 12px", borderRadius:100,
                      color: currentCat.color,
                      background: currentCat.color + "18",
                      border: `1px solid ${currentCat.color}44`,
                    }}>
                      {currentCat.label}
                    </span>
                  </div>

                  {/* Protein note */}
                  <p style={{fontSize:".68rem", color:"var(--text-dim)", fontStyle:"italic", marginTop:8, lineHeight:1.55}}>
                    Proteína recomendada para este nivel: <strong style={{color:"var(--accent)", fontStyle:"normal"}}>{currentCat.prot} g/kg</strong>
                  </p>
                </div>
              )}

              {/* Peso objetivo */}
              {direction === "deficit" && (
                <div className="field">
                  <label>Peso objetivo <span style={{color:"var(--text-dim)"}}>— para calcular tiempo estimado</span></label>
                  <div className="num-input-wrap">
                    <input type="number" value={pesoObj} min={30} max={peso}
                      placeholder={`Ej: ${Math.round(peso * 0.9)}`}
                      onChange={e => setPesoObj(e.target.value)} />
                    <span className="num-input-unit">kg</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="cta" onClick={calcular}>Calcular mi gasto calórico total</button>

          {/* Compare toggle */}
          {resultado && (
            <>
              <div className="compare-toggle">
                <label className="tog-switch">
                  <input type="checkbox" checked={compareOn} onChange={e=>setCompareOn(e.target.checked)} />
                  <span className="tog-slider" />
                </label>
                <span className="tog-lbl" onClick={()=>setCompareOn(v=>!v)}>Comparar escenario B</span>
              </div>
              {compareOn && (
                <div className="compare-form">
                  <div className="compare-form-title">Escenario B — modifica los parámetros clave</div>
                  <div style={{display:"flex",flexDirection:"column",gap:22}}>
                    <Slider label="Días de fuerza" value={bDias} onChange={setBDias} min={1} max={7} unit="días"
                      marks={[1,2,3,4,5,6,7].map(d=>({val:d,label:String(d)}))} />
                    <Slider label="Duración/sesión" value={bDuracion} onChange={setBDuracion} min={20} max={180} step={5} unit="min"
                      marks={[20,60,120,180].map(d=>({val:d,label:d+"'"}))} />
                    <Slider label="Pasos diarios" value={bPasos} onChange={setBPasos} min={1000} max={30000} step={500} unit="pasos"
                      marks={[1000,5000,10000,20000,30000].map(d=>({val:d,label:(d/1000)+"k"}))} />
                    <div className="field">
                      <label>Cardio</label>
                      <select className="styled-select" value={bCardio} onChange={e=>setBCardio(e.target.value)}>
                        <option value="ninguno">Ninguno</option>
                        <option value="poco">Poco — 1-2 sesiones suaves/semana</option>
                        <option value="moderado">Moderado — 3 sesiones/semana</option>
                        <option value="bastante">Bastante — 4 sesiones/semana</option>
                        <option value="mucho">Mucho — 5+ sesiones/semana</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* ── RIGHT COL ── */}
        <aside className="right-col">
          {!resultado ? (
            <div className="results-empty">
              <div className="big-icon">🔥</div>
              <p>Completa tus datos y pulsa calcular para ver el desglose completo, macros, composición corporal y proyecciones.</p>
            </div>
          ) : (
            <div className="results-panel">

              {/* Header */}
              <div className="results-header">
                <div className="results-header-top">
                  <div>
                    <p className="res-label">Mantenimiento · {resultado.usandoKatch ? "Katch-McArdle" : "Mifflin-St Jeor"}</p>
                    <div className="tdee-main">
                      <span className="tdee-number">{resultado.mantenimiento.toLocaleString()}</span>
                      <span className="tdee-unit">kcal/día</span>
                    </div>
                  </div>
                  {health && (
                    <div className="health-pill" style={{color:health.color, background:health.bg, borderColor:health.color+"44"}}>
                      {health.label}
                    </div>
                  )}
                </div>
                {health && <p className="health-msg">{health.msg}</p>}
                <div className="imc-row">
                  <span className="imc-lbl">IMC <Tip text={TIPS.imc} /></span>
                  <span className="imc-val" style={{color:imcInfo(resultado.imc).color}}>{resultado.imc}</span>
                  <span className="imc-cat" style={{color:imcInfo(resultado.imc).color, background:imcInfo(resultado.imc).bg}}>
                    {imcInfo(resultado.imc).label}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs">
                {["Resultados","Nutrición","Composición","Proyección"].map((t,i) => (
                  <button key={t} className={`tab-btn ${tab===i?"active":""}`} onClick={()=>setTab(i)}>{t}</button>
                ))}
              </div>

              {/* TAB 0: Resultados */}
              <div className={`tab-content ${tab===0?"active":""}`}>
                <div className="bar-wrap">
                  <div className="bar-track">
                    {[{v:resultado.bmr,c:"#c4a882"},{v:resultado.eat,c:"#3a6e9e"},{v:resultado.neat,c:"#e8793a"},{v:resultado.tef,c:"#7a5a9e"}]
                      .map((s,i) => <div key={i} className="bar-seg" style={{flex:s.v/total, background:s.c}} />)}
                  </div>
                </div>
                <div className="breakdown">
                  {[
                    {label:"Metabolismo basal (BMR)", key:"bmr",  color:"#c4a882", tip:TIPS.bmr},
                    {label:"Gasto por entreno (EAT)", key:"eat",  color:"#3a6e9e", tip:TIPS.eat},
                    {label:"Actividad diaria (NEAT)", key:"neat", color:"#e8793a", tip:TIPS.neat},
                    {label:"Efecto térmico alimentos",key:"tef",  color:"#7a5a9e", tip:TIPS.tef},
                  ].map(row => (
                    <div className="brow" key={row.key}>
                      <div className="brow-lbl">
                        <div className="dot" style={{background:row.color}} />
                        {row.label}
                        <Tip text={row.tip} />
                      </div>
                      <span className="brow-val" style={{color:row.color}}>+{resultado[row.key].toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="targets">
                  {targets.map(t => (
                    <div key={t.label} className={`target-row ${resultado.kcalObj===t.val?"active":""}`}
                      style={resultado.kcalObj===t.val?{borderColor:t.color}:{}}>
                      <div className="target-left">
                        <p style={{color:t.color}}>{t.label}{resultado.kcalObj===t.val?" ←":""}</p>
                        <p>{t.desc}</p>
                      </div>
                      <span className="target-kcal" style={{color:t.color}}>{t.val.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Compare results */}
                {compareOn && bResult && (
                  <div className="psec">
                    <div className="psec-title">Comparación A vs B</div>
                    <div className="compare-cards">
                      <div className="ccard">
                        <div className="ccard-lbl">Escenario A (actual)</div>
                        <div className="ccard-tdee">{resultado.mantenimiento.toLocaleString()}</div>
                        <div className="ccard-detail">kcal/día</div>
                      </div>
                      <div className="ccard active">
                        <div className="ccard-lbl">Escenario B</div>
                        <div className="ccard-tdee">{bResult.tdee.toLocaleString()}</div>
                        <div className="ccard-detail">kcal/día</div>
                      </div>
                    </div>
                    <div className="compare-diff">
                      Diferencia: <span style={{color: bResult.tdee > resultado.mantenimiento ? "#5a8a4a" : "#d94f2b"}}>
                        {bResult.tdee > resultado.mantenimiento ? "+" : ""}{(bResult.tdee - resultado.mantenimiento).toLocaleString()} kcal/día
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* TAB 1: Nutrición */}
              <div className={`tab-content ${tab===1?"active":""}`}>
                <div className="psec">
                  <div className="psec-title">Macros recomendados · {objLabel}</div>
                  <div className="macros-grid">
                    {[
                      {name:"Proteína",     val:resultado.proteinG, color:"#d94f2b", kcal:resultado.proteinG*4},
                      {name:"Grasa",        val:resultado.fatG,     color:"#e8793a", kcal:resultado.fatG*9},
                      {name:"Carbohidrato", val:resultado.carbG,    color:"#3a6e9e", kcal:resultado.carbG*4},
                    ].map(m => (
                      <div className="macro-card" key={m.name}>
                        <div className="macro-val" style={{color:m.color}}>{m.val}g</div>
                        <div className="macro-name">{m.name}</div>
                        <div className="macro-kcal">{m.kcal} kcal</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="psec">
                  <div className="psec-title">Distribución por comidas</div>
                  <MealPlan kcal={resultado.kcalObj} proteinG={resultado.proteinG} fatG={resultado.fatG} carbG={resultado.carbG} />
                </div>
                <div className="psec">
                  <div className="psec-title">Otros objetivos diarios</div>
                  <div className="xrow"><span className="xrow-lbl">💧 Agua recomendada</span><span className="xrow-val" style={{color:"#3a6e9e"}}>{resultado.agua} L</span></div>
                  <div className="xrow"><span className="xrow-lbl">🌾 Fibra mínima diaria</span><span className="xrow-val" style={{color:"#5a8a4a"}}>{resultado.fibra} g</span></div>
                  <div className="xrow"><span className="xrow-lbl">🎯 Objetivo calórico</span><span className="xrow-val" style={{color:"var(--accent)"}}>{resultado.kcalObj.toLocaleString()} kcal</span></div>
                </div>
              </div>

              {/* TAB 2: Composición */}
              <div className={`tab-content ${tab===2?"active":""}`}>
                {grasa && Number(grasa) > 0 ? (
                  <>
                    <div className="psec">
                      <div className="psec-title">Composición corporal estimada</div>
                      <DonutChart
                        fatKg={+(resultado.peso * Number(grasa) / 100).toFixed(1)}
                        leanKg={+(resultado.peso * (1 - Number(grasa) / 100)).toFixed(1)}
                      />
                    </div>
                    <div className="psec">
                      <div className="psec-title">Viabilidad de recomposición corporal</div>
                      {recomp && (
                        <div className="recomp-card" style={{
                          color: recomp.viable ? "#5a8a4a" : "#8a6a50",
                          background: recomp.viable ? "rgba(90,138,74,.08)" : "var(--bg-warm)",
                          borderColor: recomp.viable ? "rgba(90,138,74,.3)" : "var(--border)",
                        }}>
                          <strong>{recomp.viable ? "✓ Recomp viable" : "⊘ Recomp no óptima"}</strong>
                          {recomp.msg}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="psec">
                    <div style={{padding:"28px 0", textAlign:"center"}}>
                      <div style={{fontSize:"2rem", marginBottom:12, opacity:.3}}>📊</div>
                      <p style={{fontSize:".83rem", color:"var(--text-muted)", lineHeight:1.7}}>
                        Introduce tu % de grasa corporal en el formulario para ver la composición corporal y la viabilidad de recomposición.
                      </p>
                    </div>
                  </div>
                )}
                <div className="psec">
                  <div className="psec-title">IMC detallado</div>
                  <div className="proy-card">
                    {[
                      {l:"Valor IMC", v:resultado.imc, c:imcInfo(resultado.imc).color},
                      {l:"Categoría", v:imcInfo(resultado.imc).label, c:"var(--text)"},
                      {l:"Rango normal", v:"18.5 – 24.9", c:"var(--text-muted)"},
                    ].map(r => (
                      <div className="proy-row" key={r.l}>
                        <span className="proy-lbl">{r.l}</span>
                        <span className="proy-val" style={{color:r.c}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{fontSize:".68rem", color:"var(--text-dim)", fontStyle:"italic", lineHeight:1.6, marginTop:8}}>
                    El IMC no distingue músculo de grasa. Un atleta puede tener IMC de "sobrepeso" siendo completamente sano.
                  </p>
                </div>
              </div>

              {/* TAB 3: Proyección */}
              <div className={`tab-content ${tab===3?"active":""}`}>
                {proy ? (
                  <div className="psec">
                    <div className="psec-title">Estimación de progreso</div>
                    <div className="proy-card">
                      <div className="proy-row"><span className="proy-lbl">Ritmo semanal</span><span className="proy-val" style={{color:"var(--accent)"}}>{proy.kgSem} kg/sem</span></div>
                      <div className="proy-row"><span className="proy-lbl">Estimación mensual</span><span className="proy-val">{(Number(proy.kgSem)*4.33).toFixed(1)} kg/mes</span></div>
                      {proy.semanas && <>
                        <div className="proy-row"><span className="proy-lbl">Peso objetivo</span><span className="proy-val">{pesoObj} kg</span></div>
                        <div className="proy-row"><span className="proy-lbl">Tiempo estimado</span><span className="proy-val" style={{color:"var(--accent)"}}>{proy.semanas} semanas</span></div>
                        <div className="proy-row"><span className="proy-lbl">Equivale a</span><span className="proy-val">{(proy.semanas/4.33).toFixed(1)} meses</span></div>
                      </>}
                    </div>
                    {!pesoObj && <p style={{fontSize:".72rem", color:"var(--text-muted)", fontStyle:"italic", marginTop:6}}>Introduce un peso objetivo en el formulario para ver el tiempo estimado.</p>}
                  </div>
                ) : (
                  <div className="psec">
                    <div style={{padding:"16px 0", textAlign:"center"}}>
                      <p style={{fontSize:".83rem", color:"var(--text-muted)", lineHeight:1.6}}>La proyección está disponible cuando el objetivo es déficit calórico.</p>
                    </div>
                  </div>
                )}
                <div className="psec">
                  <div className="psec-title">Guardar en historial</div>
                  <button className={`save-btn ${saved?"saved":""}`} onClick={guardar}>
                    {saved ? "✓ Guardado correctamente" : "Guardar este cálculo"}
                  </button>
                  <p style={{fontSize:".68rem", color:"var(--text-dim)", marginTop:8, lineHeight:1.6, fontStyle:"italic"}}>
                    Guarda periódicamente para ver cómo evoluciona tu TDEE al perder o ganar peso con el tiempo.
                  </p>
                </div>
              </div>

              <p className="note">
                Estimación con margen ±10–15%. Ajusta cada 2-3 semanas según evolución real del peso. No sustituye consulta con dietista-nutricionista colegiado.
              </p>
            </div>
          )}
        </aside>

        {/* ── HISTORIAL ── */}
        <div className="historial">
          <div className="hist-header">
            <h2 className="hist-title">Historial de <em>cálculos</em></h2>
            {historial.length > 0 && <button className="hist-clear" onClick={limpiarHistorial}>Limpiar historial</button>}
          </div>
          {historial.length === 0 ? (
            <p className="hist-empty">Aún no hay cálculos guardados. Usa el botón "Guardar este cálculo" en la pestaña Proyección.</p>
          ) : (
            <div className="hist-grid">
              {historial.map((h, i) => (
                <div className="hist-card" key={i}>
                  <div className="hist-date">{h.date}</div>
                  <div className="hist-tdee">{h.tdee.toLocaleString()}</div>
                  <div className="hist-sub" style={{marginBottom:4}}>kcal/día mantenimiento</div>
                  <div className="hist-sub">Objetivo: {h.kcalObj.toLocaleString()} kcal</div>
                  <div className="hist-sub">Peso: {h.peso} kg · IMC: {h.imc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <p>Mifflin-St Jeor (1990) · Katch-McArdle · Ainsworth MET Compendium · IoM Dietary Reference Intakes</p>
          <p>No sustituye consulta con dietista-nutricionista colegiado</p>
        </footer>

      </div>
    </>
  );
}