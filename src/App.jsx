import { useState, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');`;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TIPS = {
  bmr: "Metabolismo Basal: calorías que tu cuerpo gasta para mantenerse vivo en reposo absoluto.",
  eat: "Exercise Activity Thermogenesis: calorías quemadas durante el ejercicio planificado.",
  neat: "Non-Exercise Activity Thermogenesis: calorías quemadas en todo lo que no es ejercicio planificado.",
  tef: "Thermic Effect of Food: energía que gasta tu cuerpo digiriendo alimentos (~10% de la ingesta).",
  rir: "Repeticiones en Reserva: cuántas reps quedan antes del fallo. RIR 0 = fallo total.",
  imc: "Índice de Masa Corporal: relación peso/altura². No distingue músculo de grasa.",
  katch: "Fórmula de Katch-McArdle: más precisa porque usa la masa magra real.",
};

const MEAL_PLANS = {
  3: [{name:"Desayuno",emoji:"☕",pct:.30},{name:"Almuerzo",emoji:"🍽️",pct:.40},{name:"Cena",emoji:"🌙",pct:.30}],
  4: [{name:"Desayuno",emoji:"☕",pct:.25},{name:"Almuerzo",emoji:"🍽️",pct:.35},{name:"Merienda",emoji:"🍎",pct:.15},{name:"Cena",emoji:"🌙",pct:.25}],
  5: [{name:"Desayuno",emoji:"☕",pct:.20},{name:"Media mañana",emoji:"🍎",pct:.12},{name:"Almuerzo",emoji:"🍽️",pct:.35},{name:"Merienda",emoji:"🫐",pct:.13},{name:"Cena",emoji:"🌙",pct:.20}],
};

const FORM_KEY  = "tdee_form_v1";
const HIST_KEY  = "tdee_hist";
const PLAN_KEY  = "tdee_macro_plan_v1";
const CAL_KEY   = "tdee_calendar_v1";

const MONTHS    = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WEEKDAYS  = ["L","M","X","J","V","S","D"];

const CATS = [
  {key:"training", icon:"💪", name:"Entrenamiento", desc:"¿Has entrenado hoy?",         color:"#d94f2b", bg:"rgba(217,79,43,.12)"},
  {key:"diet",     icon:"🥗", name:"Dieta",         desc:"¿Has cumplido tu plan nutricional?", color:"#5a8a4a", bg:"rgba(90,138,74,.12)"},
  {key:"sleep",    icon:"😴", name:"Sueño",         desc:"¿Has dormido 7-9 horas?",     color:"#3a6e9e", bg:"rgba(58,110,158,.12)"},
];

const DEFAULT_FORM = {
  sexo:"hombre", peso:75, altura:175, edad:22, grasa:"",
  diasF:5, duracion:60, rir:"1-2", series:"3", descanso:"90-120",
  cardio:"ninguno", pasos:7000, trabajo:"sedentario",
  direction:"deficit", customDelta:300, pesoObj:"",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f5f0e8; --bg-warm: #ede6d6; --surface: #faf7f2; --surface-2: #ede6d6;
    --border: rgba(180,120,60,0.15);
    --accent: #d94f2b; --accent-2: #e8793a;
    --accent-dim: rgba(217,79,43,0.1); --accent-glow: rgba(217,79,43,0.2);
    --text: #1e1208; --text-muted: #8a6a50; --text-dim: #c4a882;
    --green: #5a8a4a; --green-dim: rgba(90,138,74,0.1);
    --blue: #3a6e9e; --blue-dim: rgba(58,110,158,0.1);
    --yellow: #c8860a;
    --purple: #7a5a9e;
    --font-display: 'Playfair Display', serif;
    --font-body: 'IBM Plex Sans', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
    --r: 10px; --r-lg: 16px;
    --shadow-btn: 0 2px 8px rgba(180,80,20,0.18);
    --tr: all 0.12s cubic-bezier(0.34,1.2,0.64,1);
    --sidebar-w: 240px;
  }

  body.dark {
    --bg: #0d0d14; --bg-warm: #13131e; --surface: #17172a; --surface-2: #1e1e30;
    --border: rgba(60,110,210,0.2);
    --accent: #4a8fd4; --accent-2: #5fa8f0;
    --accent-dim: rgba(74,143,212,0.13); --accent-glow: rgba(74,143,212,0.28);
    --text: #e8e8f8; --text-muted: #7878a8; --text-dim: #44446a;
    --green: #3a8a6a; --green-dim: rgba(58,138,106,0.12);
    --blue: #4a8fd4; --blue-dim: rgba(74,143,212,0.12);
    --shadow-btn: 0 2px 12px rgba(30,60,160,0.28);
  }

  body {
    background: var(--bg); color: var(--text); font-family: var(--font-body);
    min-height: 100vh; -webkit-font-smoothing: antialiased;
    overflow-x: hidden; transition: background .3s, color .3s;
  }
  body.sidebar-open { overflow: hidden; }

  /* ── APP SHELL ── */
  .app-shell { display: flex; min-height: 100vh; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w); flex-shrink: 0;
    background: var(--surface); border-right: 1.5px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
    transition: transform .3s ease;
  }

  .sidebar-logo {
    padding: 28px 24px 20px;
    border-bottom: 1px solid var(--border);
  }
  .sidebar-logo h2 {
    font-family: var(--font-display); font-size: 1.15rem; line-height: 1.15;
  }
  .sidebar-logo h2 em { font-style: italic; color: var(--accent); }
  .sidebar-logo p { font-size: .62rem; color: var(--text-dim); font-family: var(--font-mono); margin-top: 4px; letter-spacing: .06em; }

  .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }

  .nav-section-label {
    font-family: var(--font-mono); font-size: .55rem; letter-spacing: .18em;
    color: var(--text-dim); text-transform: uppercase; padding: 10px 12px 6px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 11px;
    padding: 10px 14px; border-radius: var(--r); cursor: pointer;
    border: none; background: transparent; text-align: left;
    font-family: var(--font-body); font-size: .82rem; color: var(--text-muted);
    transition: var(--tr); width: 100%;
  }
  .nav-item:hover { background: var(--bg-warm); color: var(--text); }
  .nav-item:active { transform: scale(0.97); }
  .nav-item.active { background: var(--accent-dim); color: var(--accent); font-weight: 500; }
  .nav-item .nav-icon { font-size: 1rem; flex-shrink: 0; width: 20px; text-align: center; }
  .nav-item .nav-badge { font-family: var(--font-mono); font-size: .5rem; padding: 1px 6px; border-radius: 100px; background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent-dim); margin-left: auto; }

  .sidebar-footer {
    padding: 14px 12px; border-top: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 6px;
  }

  .dark-toggle {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px; border-radius: var(--r);
    border: 1.5px solid var(--border); background: transparent;
    color: var(--text-muted); font-family: var(--font-mono); font-size: .65rem;
    cursor: pointer; letter-spacing: .06em; transition: var(--tr);
    width: 100%;
  }
  .dark-toggle:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .dark-toggle:active { transform: scale(0.97); }

  .autosave-badge {
    font-family: var(--font-mono); font-size: .55rem; color: var(--green);
    background: var(--green-dim); border: 1px solid rgba(90,138,74,.2);
    padding: 3px 9px; border-radius: 100px; letter-spacing: .06em; text-align: center;
  }

  /* ── MAIN CONTENT ── */
  .main-content {
    margin-left: var(--sidebar-w); flex: 1;
    max-width: calc(1360px - var(--sidebar-w));
    padding: 0 48px; min-height: 100vh;
  }

  /* ── PAGE HEADER ── */
  .page-header {
    padding: 44px 0 36px;
    border-bottom: 1.5px solid var(--border); margin-bottom: 52px;
  }
  .page-header h1 { font-family: var(--font-display); font-size: 2.8rem; line-height: 1; letter-spacing: -.02em; }
  .page-header h1 em { font-style: italic; color: var(--accent); }
  .page-header p { font-size: .82rem; color: var(--text-muted); margin-top: 10px; font-weight: 300; letter-spacing: .03em; }

  /* ── CALCULATOR LAYOUT ── */
  .calc-layout {
    display: grid; grid-template-columns: 1fr 440px; gap: 64px;
    align-items: start;
  }

  .right-col {
    position: sticky; top: 32px; height: fit-content;
    max-height: calc(100vh - 80px); overflow-y: auto;
  }
  .right-col::-webkit-scrollbar { width: 3px; }
  .right-col::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── SECTIONS ── */
  .section { margin-bottom: 48px; }
  .section-label {
    font-family: var(--font-mono); font-size: .62rem; letter-spacing: .18em;
    color: var(--text-muted); text-transform: uppercase; margin-bottom: 20px;
    display: flex; align-items: center; gap: 10px;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* ── FORM ELEMENTS ── */
  .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .input-grid.cols-1 { grid-template-columns: 1fr; }
  .input-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .field { display: flex; flex-direction: column; gap: 7px; }
  .field > label { font-size: .73rem; color: var(--text-muted); font-weight: 400; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .num-input-wrap { display: flex; align-items: center; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); overflow: hidden; transition: border-color .2s, box-shadow .2s; }
  .num-input-wrap:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .num-input-wrap input { flex: 1; background: transparent; border: none; outline: none; color: var(--text); font-family: var(--font-mono); font-size: 1rem; padding: 11px 4px; min-width: 32px; text-align: center; }
  .num-input-unit { font-family: var(--font-mono); font-size: .68rem; color: var(--text-muted); padding: 0 6px 0 0; white-space: nowrap; flex-shrink: 0; }

  /* ocultar spinners nativos */
  input[type=number]::-webkit-outer-spin-button,
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }

  /* botones +/- personalizados */
  .spin-btn {
    width: 28px; height: 100%; flex-shrink: 0;
    background: transparent; border: none; outline: none;
    color: var(--text-muted); font-size: 1.05rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: var(--tr); font-family: var(--font-mono); line-height: 1;
    padding: 0; user-select: none;
  }
  .spin-btn:hover { color: var(--accent); background: var(--accent-dim); }
  .spin-btn:active { transform: scale(0.85); color: var(--accent-2); }

  .styled-select {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r);
    color: var(--text); font-family: var(--font-body); font-size: .83rem;
    padding: 11px 34px 11px 13px; outline: none; width: 100%; cursor: pointer;
    transition: border-color .2s, box-shadow .2s; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a6a50' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 13px center;
  }
  body.dark .styled-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237878a8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  }
  .styled-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .styled-select option { background: var(--surface); color: var(--text); }
  .sex-toggle { display: grid; grid-template-columns: 1fr 1fr; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); overflow: hidden; }
  .sex-btn { padding: 11px; text-align: center; cursor: pointer; font-size: .8rem; color: var(--text-muted); border: none; background: transparent; font-family: var(--font-body); transition: var(--tr); }
  .sex-btn:active { transform: scale(0.96); }
  .sex-btn.active { background: var(--accent-dim); color: var(--accent); font-weight: 500; }
  .info-box { background: var(--accent-dim); border: 1px solid rgba(217,79,43,.2); border-radius: var(--r); padding: 11px 15px; font-size: .75rem; color: var(--text-muted); line-height: 1.6; margin-top: 4px; }
  .info-box strong { color: var(--accent); font-weight: 500; }

  /* ── BUTTON / CTA ── */
  .cta {
    width: 100%; padding: 16px; background: var(--accent); color: #faf7f2;
    border: none; border-radius: 12px; font-family: var(--font-body); font-size: .9rem;
    font-weight: 500; cursor: pointer; letter-spacing: .03em; margin-top: 8px;
    transition: var(--tr); box-shadow: var(--shadow-btn), 0 4px 0 rgba(0,0,0,.15);
  }
  .cta:hover { background: var(--accent-2); transform: translateY(-2px); box-shadow: var(--shadow-btn), 0 6px 0 rgba(0,0,0,.12), 0 8px 20px var(--accent-glow); }
  .cta:active { transform: translateY(2px) scale(0.985); box-shadow: 0 1px 0 rgba(0,0,0,.15); }

  /* ── SLIDER ── */
  .slider-field { display: flex; flex-direction: column; gap: 10px; }
  .slider-top { display: flex; justify-content: space-between; align-items: center; }
  .slider-top label { font-size: .73rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
  .slider-value { font-family: var(--font-mono); font-size: .85rem; color: var(--accent); font-weight: 500; }
  .slider-wrap { position: relative; padding-bottom: 18px; }
  input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; border: none; cursor: pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--accent); cursor: pointer; box-shadow: 0 0 10px var(--accent-glow); transition: transform .12s; border: 3px solid var(--surface); }
  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.25); }
  input[type=range]::-webkit-slider-thumb:active { transform: scale(1.1); }
  .slider-mark { position: absolute; bottom: 0; transform: translateX(-50%); font-family: var(--font-mono); font-size: .57rem; color: var(--text-dim); white-space: nowrap; }
  .slider-hint { font-size: .68rem; color: var(--text-dim); font-style: italic; }

  /* ── TOOLTIP ── */
  .tip-wrap { position: relative; display: inline-flex; align-items: center; }
  .tip-icon { width: 15px; height: 15px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border); font-size: .6rem; color: var(--text-muted); cursor: help; display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-mono); flex-shrink: 0; transition: var(--tr); }
  .tip-icon:hover { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
  .tip-box { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: #1a1a2e; color: #e8e8f8; font-family: var(--font-body); font-size: .72rem; line-height: 1.55; padding: 10px 14px; border-radius: 8px; width: 230px; z-index: 300; pointer-events: none; opacity: 0; transition: opacity .15s; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
  .tip-wrap:hover .tip-box { opacity: 1; }

  /* ── ERROR BOX ── */
  .error-box { background: rgba(217,79,43,.08); border: 1.5px solid rgba(217,79,43,.35); border-radius: var(--r); padding: 13px 15px; display: flex; gap: 11px; align-items: flex-start; }
  .error-icon { font-size: 1.1rem; flex-shrink: 0; line-height: 1.3; }
  .error-title { font-size: .8rem; font-weight: 500; color: var(--accent); margin-bottom: 3px; }
  .error-msg { font-size: .73rem; color: var(--text-muted); line-height: 1.55; }

  /* ── WELCOME PANEL ── */
  .welcome-panel { border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; background: var(--surface); }
  @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .wel-line { animation: fadeSlideIn .4s ease both; }
  .wel-l1{animation-delay:.0s}.wel-l2{animation-delay:.08s}.wel-l3{animation-delay:.16s}.wel-l4{animation-delay:.24s}.wel-l5{animation-delay:.32s}
  @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
  .wel-dot { animation: pulse 2s ease-in-out infinite; }

  /* ── RESULTS PANEL ── */
  .results-panel { border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; background: var(--surface); animation: fadeUp .4s ease; box-shadow: 0 4px 40px rgba(180,100,40,.08); }
  body.dark .results-panel { box-shadow: 0 4px 40px rgba(30,60,160,.12); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .results-header { padding: 22px 26px 18px; border-bottom: 1px solid var(--border); background: linear-gradient(135deg, var(--surface) 0%, var(--bg-warm) 100%); }
  .results-header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .res-label { font-size: .65rem; color: var(--text-muted); font-family: var(--font-mono); letter-spacing: .12em; text-transform: uppercase; margin-bottom: 6px; }
  .tdee-main { display: flex; align-items: baseline; gap: 8px; }
  .tdee-number { font-family: var(--font-display); font-size: 3.4rem; color: var(--accent); line-height: 1; }
  .tdee-unit { font-family: var(--font-mono); font-size: .75rem; color: var(--text-muted); }
  .health-pill { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 100px; font-size: .66rem; font-family: var(--font-mono); border: 1px solid transparent; white-space: nowrap; }
  .imc-row { display: flex; align-items: center; gap: 10px; margin-top: 11px; padding-top: 11px; border-top: 1px solid var(--border); }
  .imc-lbl { font-size: .7rem; color: var(--text-muted); font-family: var(--font-mono); display: flex; align-items: center; gap: 5px; }
  .imc-val { font-family: var(--font-mono); font-size: .85rem; font-weight: 500; }
  .imc-cat { font-size: .65rem; padding: 2px 8px; border-radius: 100px; font-family: var(--font-mono); }
  .health-msg { font-size: .67rem; color: var(--text-muted); margin-top: 7px; line-height: 1.55; font-style: italic; }
  .tabs { display: flex; border-bottom: 1px solid var(--border); }
  .tab-btn { flex: 1; padding: 10px 4px; text-align: center; cursor: pointer; font-size: .63rem; font-family: var(--font-mono); color: var(--text-muted); border: none; background: transparent; border-bottom: 2px solid transparent; transition: var(--tr); letter-spacing: .06em; text-transform: uppercase; }
  .tab-btn:active { transform: scale(0.95); }
  .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--accent-dim); }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
  .psec { padding: 15px 26px; border-bottom: 1px solid var(--border); }
  .psec:last-child { border-bottom: none; }
  .psec-title { font-family: var(--font-mono); font-size: .58rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 11px; }
  .bar-wrap { padding: 13px 26px; border-bottom: 1px solid var(--border); }
  .bar-track { display: flex; gap: 3px; width: 100%; height: 7px; border-radius: 4px; overflow: hidden; }
  .bar-seg { border-radius: 2px; transition: flex .6s cubic-bezier(.34,1.56,.64,1); }
  .breakdown { padding: 14px 26px; display: flex; flex-direction: column; gap: 9px; border-bottom: 1px solid var(--border); }
  .brow { display: flex; justify-content: space-between; align-items: center; }
  .brow-lbl { display: flex; align-items: center; gap: 7px; font-size: .77rem; color: var(--text-muted); }
  .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .brow-val { font-family: var(--font-mono); font-size: .82rem; font-weight: 500; }
  .targets { padding: 14px 26px; display: flex; flex-direction: column; gap: 6px; }
  .target-row { background: var(--bg-warm); border-radius: var(--r); padding: 10px 13px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); transition: var(--tr); }
  .target-row.active { border-width: 1.5px; }
  .target-left p:first-child { font-size: .76rem; font-weight: 500; margin-bottom: 1px; }
  .target-left p:last-child { font-size: .65rem; color: var(--text-muted); }
  .target-kcal { font-family: var(--font-mono); font-size: .9rem; font-weight: 500; }
  .macros-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 7px; }
  .macro-card { background: var(--bg-warm); border-radius: var(--r); padding: 11px 7px; text-align: center; border: 1px solid var(--border); }
  .macro-val { font-family: var(--font-mono); font-size: 1.05rem; font-weight: 500; margin-bottom: 2px; }
  .macro-name { font-size: .58rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; }
  .macro-kcal { font-size: .57rem; color: var(--text-dim); font-family: var(--font-mono); margin-top: 2px; }
  .meal-sel { display: flex; gap: 6px; margin-bottom: 11px; }
  .meal-btn { padding: 4px 12px; border-radius: 6px; font-size: .67rem; font-family: var(--font-mono); cursor: pointer; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-muted); transition: var(--tr); box-shadow: 0 2px 0 var(--border); }
  .meal-btn:hover { border-color: var(--accent); color: var(--accent); }
  .meal-btn:active { transform: translateY(2px); box-shadow: none; }
  .meal-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent-dim); }
  .meal-grid { display: flex; flex-direction: column; gap: 6px; }
  .meal-row { background: var(--bg-warm); border-radius: var(--r); padding: 9px 11px; border: 1px solid var(--border); }
  .meal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
  .meal-name { font-size: .77rem; font-weight: 500; }
  .meal-kcal { font-family: var(--font-mono); font-size: .77rem; color: var(--accent); }
  .meal-macros { font-size: .64rem; color: var(--text-muted); font-family: var(--font-mono); }
  .xrow { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; }
  .xrow + .xrow { border-top: 1px solid var(--border); }
  .xrow-lbl { font-size: .77rem; color: var(--text-muted); }
  .xrow-val { font-family: var(--font-mono); font-size: .88rem; font-weight: 500; }
  .donut-wrap { display: flex; align-items: center; gap: 18px; }
  .donut-legend { display: flex; flex-direction: column; gap: 8px; }
  .dleg { display: flex; align-items: center; gap: 7px; font-size: .74rem; color: var(--text-muted); }
  .dleg-dot { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
  .dleg-val { font-family: var(--font-mono); font-size: .78rem; font-weight: 500; margin-left: auto; padding-left: 10px; }
  .recomp-card { border-radius: var(--r); padding: 11px 13px; font-size: .74rem; line-height: 1.6; border: 1px solid; }
  .recomp-card strong { display: block; margin-bottom: 4px; font-size: .77rem; }
  .proy-card { background: var(--bg-warm); border-radius: var(--r); padding: 13px 15px; border: 1px solid var(--border); margin-bottom: 9px; }
  .proy-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
  .proy-row + .proy-row { border-top: 1px solid var(--border); }
  .proy-lbl { font-size: .74rem; color: var(--text-muted); }
  .proy-val { font-family: var(--font-mono); font-size: .84rem; font-weight: 500; }
  .save-btn { width: 100%; padding: 11px; background: var(--surface); color: var(--text-muted); border: 1.5px solid var(--border); border-radius: var(--r); font-family: var(--font-body); font-size: .8rem; cursor: pointer; transition: var(--tr); box-shadow: 0 2px 0 var(--border); }
  .save-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); transform: translateY(-1px); }
  .save-btn:active { transform: translateY(2px); box-shadow: none; }
  .save-btn.saved { border-color: var(--green); color: var(--green); background: var(--green-dim); }
  .compare-toggle { display: flex; align-items: center; gap: 10px; margin-top: 26px; margin-bottom: 13px; }
  .tog-switch { position: relative; width: 36px; height: 20px; flex-shrink: 0; }
  .tog-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .tog-slider { position: absolute; cursor: pointer; inset: 0; background: var(--surface-2); border-radius: 20px; transition: .3s; border: 1px solid var(--border); }
  .tog-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background: var(--text-muted); border-radius: 50%; transition: .3s; }
  .tog-switch input:checked + .tog-slider { background: var(--accent-dim); border-color: var(--accent); }
  .tog-switch input:checked + .tog-slider:before { transform: translateX(16px); background: var(--accent); }
  .tog-lbl { font-size: .74rem; color: var(--text-muted); font-family: var(--font-mono); cursor: pointer; }
  .compare-form { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); padding: 15px; margin-bottom: 4px; }
  .compare-form-title { font-family: var(--font-mono); font-size: .58rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 14px; }
  .compare-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
  .ccard { background: var(--bg-warm); border-radius: var(--r); padding: 13px; border: 1px solid var(--border); }
  .ccard.active { border-color: var(--accent); background: var(--accent-dim); }
  .ccard-lbl { font-family: var(--font-mono); font-size: .57rem; color: var(--text-muted); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 5px; }
  .ccard.active .ccard-lbl { color: var(--accent); }
  .ccard-tdee { font-family: var(--font-display); font-size: 1.8rem; color: var(--accent); line-height: 1; margin-bottom: 2px; }
  .ccard-detail { font-size: .67rem; color: var(--text-muted); }
  .compare-diff { text-align: center; padding: 9px 0; font-family: var(--font-mono); font-size: .74rem; color: var(--text-muted); }
  .compare-diff span { font-size: .93rem; font-weight: 500; }
  .historial-section { padding-top: 48px; padding-bottom: 60px; border-top: 1px solid var(--border); margin-top: 16px; }
  .hist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
  .hist-title { font-family: var(--font-display); font-size: 1.4rem; }
  .hist-title em { font-style: italic; color: var(--accent); }
  .hist-clear { font-family: var(--font-mono); font-size: .67rem; color: var(--text-muted); background: none; border: 1px solid var(--border); border-radius: 6px; padding: 5px 12px; cursor: pointer; transition: var(--tr); }
  .hist-clear:hover { color: var(--accent); border-color: var(--accent-dim); }
  .hist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 11px; }
  .hist-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 13px 15px; }
  .hist-date { font-family: var(--font-mono); font-size: .58rem; color: var(--text-dim); margin-bottom: 7px; }
  .hist-tdee { font-family: var(--font-display); font-size: 1.6rem; color: var(--accent); line-height: 1; margin-bottom: 2px; }
  .hist-sub { font-size: .68rem; color: var(--text-muted); margin-bottom: 1px; }
  .hist-empty { font-size: .82rem; color: var(--text-dim); font-style: italic; }
  .note { padding: 11px 26px 18px; font-size: .68rem; color: var(--text-dim); line-height: 1.7; font-style: italic; }
  .page-footer { padding: 28px 0 40px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .page-footer p { font-size: .68rem; color: var(--text-dim); font-family: var(--font-mono); }

  /* ── OBJETIVO ── */
  .obj-dir-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); overflow: hidden; }

  /* ── CALENDAR PAGE ── */
  .calendar-page { padding-bottom: 80px; }
  .year-nav { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
  .year-btn { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-muted); cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; transition: var(--tr); box-shadow: 0 2px 0 var(--border); }
  .year-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .year-btn:active { transform: translateY(2px); box-shadow: none; }
  .year-label { font-family: var(--font-display); font-size: 2rem; }
  .year-label em { font-style: italic; color: var(--accent); }

  .months-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

  .month-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; transition: var(--tr); }
  .month-card:hover { border-color: var(--accent); box-shadow: 0 4px 20px var(--accent-glow); }
  .month-header { padding: 12px 14px 8px; border-bottom: 1px solid var(--border); }
  .month-name { font-family: var(--font-display); font-size: 1rem; }
  .month-name em { font-style: italic; color: var(--accent); }
  .month-stats { font-family: var(--font-mono); font-size: .55rem; color: var(--text-muted); margin-top: 3px; }

  .mini-cal-weekdays { display: grid; grid-template-columns: repeat(7,1fr); padding: 6px 10px 2px; }
  .mini-wd { text-align: center; font-family: var(--font-mono); font-size: .52rem; color: var(--text-dim); }

  .mini-cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; padding: 4px 10px 12px; }
  .mini-day {
    aspect-ratio: 1; border-radius: 5px; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    transition: var(--tr); position: relative; background: var(--bg-warm);
    border: 1px solid transparent; font-family: var(--font-mono); font-size: .6rem;
    color: var(--text-muted); gap: 1px;
  }
  .mini-day:hover { border-color: var(--accent); transform: scale(1.08); z-index: 2; }
  .mini-day:active { transform: scale(0.96); }
  .mini-day.empty { background: transparent; cursor: default; }
  .mini-day.empty:hover { transform: none; border-color: transparent; }
  .mini-day.today { border-color: var(--accent); color: var(--accent); font-weight: 700; }
  .mini-day.future { opacity: .35; cursor: not-allowed; }
  .mini-day.future:hover { transform: none; border-color: transparent; }
  .mini-day.full     { background: rgba(90,138,74,.18); border-color: rgba(90,138,74,.35); }
  .mini-day.partial  { background: rgba(200,134,10,.12); border-color: rgba(200,134,10,.28); }
  .mini-day.failed   { background: rgba(217,79,43,.07); border-color: rgba(217,79,43,.15); }
  .mini-dots { display: flex; gap: 1px; }
  .mini-dot { width: 4px; height: 4px; border-radius: 50%; }

  /* ── DAY MODAL ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 400; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); animation: fadeIn .15s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal-box { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 26px; width: 100%; max-width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,.3); animation: slideUp .2s ease; }
  @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .modal-title { font-family: var(--font-display); font-size: 1.25rem; margin-bottom: 4px; }
  .modal-title em { font-style: italic; color: var(--accent); }
  .modal-sub { font-size: .73rem; color: var(--text-muted); margin-bottom: 20px; font-family: var(--font-mono); }
  .cat-btn { width: 100%; display: flex; align-items: center; gap: 13px; padding: 13px 15px; border-radius: var(--r); border: 1.5px solid var(--border); background: var(--bg-warm); cursor: pointer; margin-bottom: 9px; transition: var(--tr); box-shadow: 0 2px 0 var(--border); text-align: left; font-family: var(--font-body); }
  .cat-btn:hover { border-color: var(--accent); transform: translateY(-1px); }
  .cat-btn:active { transform: translateY(2px); box-shadow: none; }
  .cat-btn.done { border-color: transparent; box-shadow: 0 2px 0 rgba(0,0,0,.06); }
  .cat-icon-big { font-size: 1.3rem; flex-shrink: 0; }
  .cat-text { flex: 1; }
  .cat-name { font-size: .84rem; font-weight: 500; margin-bottom: 1px; }
  .cat-desc { font-size: .68rem; color: var(--text-muted); }
  .cat-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: .75rem; flex-shrink: 0; transition: var(--tr); }
  .cat-btn.done .cat-check { border-color: transparent; }
  .modal-actions { display: flex; gap: 9px; margin-top: 16px; }
  .modal-save { flex: 1; padding: 12px; background: var(--accent); color: #faf7f2; border: none; border-radius: var(--r); font-family: var(--font-body); font-size: .85rem; font-weight: 500; cursor: pointer; transition: var(--tr); box-shadow: 0 4px 0 rgba(0,0,0,.15); }
  .modal-save:hover { background: var(--accent-2); transform: translateY(-2px); }
  .modal-save:active { transform: translateY(2px); box-shadow: none; }
  .modal-cancel { padding: 12px 16px; background: var(--surface); color: var(--text-muted); border: 1.5px solid var(--border); border-radius: var(--r); font-family: var(--font-body); font-size: .85rem; cursor: pointer; transition: var(--tr); }
  .modal-cancel:hover { border-color: var(--accent); color: var(--accent); }

  /* ── CAL LEGEND ── */
  .cal-legend-bar { display: flex; gap: 18px; flex-wrap: wrap; padding: 0 0 28px; }
  .leg-item { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: .62rem; color: var(--text-muted); }
  .leg-swatch { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }

  /* ── CAL SUMMARY ── */
  .cal-summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 28px; }
  .cal-stat { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); padding: 14px 16px; text-align: center; }
  .cal-stat-val { font-family: var(--font-display); font-size: 1.8rem; line-height: 1; margin-bottom: 3px; }
  .cal-stat-lbl { font-family: var(--font-mono); font-size: .58rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; }

  /* ── MOBILE BURGER ── */
  .burger { display: none; position: fixed; top: 14px; left: 14px; z-index: 200; width: 40px; height: 40px; border-radius: var(--r); border: 1.5px solid var(--border); background: var(--surface); cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 5px; }
  .burger span { display: block; width: 18px; height: 2px; background: var(--text-muted); border-radius: 2px; transition: .2s; }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 99; }

  /* ─── RESPONSIVE — 6 breakpoints ────────────────────────
     > 1280   sidebar visible, layout completo
     1100-1280 sidebar estrecha (200px)
     < 1100   sidebar se convierte en drawer (burger)
     < 900    layout 1 columna
     < 700    móvil amplio
     < 480    móvil estrecho
     < 360    ventana muy pequeña
  ─────────────────────────────────────────────────────── */

  /* 1100-1280: sidebar más estrecha, padding reducido */
  @media (max-width: 1280px) {
    :root { --sidebar-w: 200px; }
    .main-content { padding: 0 32px; }
    .calc-layout { gap: 40px; grid-template-columns: 1fr 380px; }
    .page-header h1 { font-size: 2.2rem; }
    .months-grid { grid-template-columns: repeat(3,1fr); }
  }

  /* < 1100: sidebar pasa a drawer, burger aparece */
  @media (max-width: 1100px) {
    :root { --sidebar-w: 240px; }
    .sidebar { transform: translateX(calc(-1 * var(--sidebar-w))); box-shadow: none; }
    .sidebar.open { transform: translateX(0); box-shadow: 4px 0 40px rgba(0,0,0,.22); }
    .sidebar-overlay.open { display: block; }
    .burger { display: flex; }
    .main-content { margin-left: 0; padding: 0 32px; padding-top: 64px; max-width: 100%; }
    .calc-layout { grid-template-columns: 1fr 360px; gap: 32px; }
    .page-header { padding: 32px 0 28px; margin-bottom: 36px; }
    .page-header h1 { font-size: 2rem; }
    .months-grid { grid-template-columns: repeat(3,1fr); }
    .cal-summary { grid-template-columns: repeat(4,1fr); }
    .input-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  }

  /* < 900: layout 1 columna, resultados debajo del form */
  @media (max-width: 900px) {
    .main-content { padding: 0 24px; padding-top: 64px; }
    .calc-layout { grid-template-columns: 1fr; gap: 28px; }
    .right-col { position: static; max-height: none; overflow-y: visible; }
    .page-header h1 { font-size: 1.9rem; }
    .months-grid { grid-template-columns: repeat(2,1fr); }
    .cal-summary { grid-template-columns: repeat(2,1fr); }
    .compare-cards { grid-template-columns: 1fr 1fr; }
    .input-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
    .tdee-number { font-size: 2.8rem; }
    .historial-section { padding-top: 36px; }
    .hist-grid { grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); }
  }

  /* < 700: móvil amplio */
  @media (max-width: 700px) {
    .main-content { padding: 0 16px; padding-top: 60px; }
    .page-header { padding: 24px 0 20px; margin-bottom: 28px; }
    .page-header h1 { font-size: 1.65rem; }
    .page-header p { font-size: .76rem; }
    .section { margin-bottom: 36px; }
    .input-grid.cols-3 { grid-template-columns: 1fr 1fr; }
    .input-grid { grid-template-columns: 1fr 1fr; }
    .months-grid { grid-template-columns: repeat(2,1fr); }
    .cal-summary { grid-template-columns: repeat(2,1fr); }
    .compare-cards { grid-template-columns: 1fr; }
    .obj-dir-grid { grid-template-columns: 1fr; }
    .macros-grid { grid-template-columns: 1fr 1fr 1fr; }
    .page-footer { flex-direction: column; gap: 8px; text-align: center; }
    .tdee-number { font-size: 2.4rem; }
    .results-header { padding: 16px 18px 14px; }
    .breakdown { padding: 12px 18px; }
    .targets { padding: 12px 18px; }
    .psec { padding: 12px 18px; }
    .bar-wrap { padding: 10px 18px; }
    .hist-grid { grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); }
  }

  /* < 480: móvil estrecho */
  @media (max-width: 480px) {
    .main-content { padding: 0 12px; padding-top: 58px; }
    .page-header h1 { font-size: 1.4rem; }
    .input-grid.cols-3 { grid-template-columns: 1fr; }
    .input-grid { grid-template-columns: 1fr; }
    .months-grid { grid-template-columns: 1fr 1fr; }
    .cal-summary { grid-template-columns: 1fr 1fr; }
    .macros-grid { grid-template-columns: 1fr 1fr; }
    .obj-dir-grid { grid-template-columns: 1fr; }
    .tabs { flex-wrap: wrap; }
    .tab-btn { font-size: .55rem; padding: 8px 2px; }
    .tdee-number { font-size: 2rem; }
    .hist-grid { grid-template-columns: 1fr 1fr; }
    .compare-cards { grid-template-columns: 1fr; }
    .meal-sel { flex-wrap: wrap; }
    .results-header { padding: 14px 14px 12px; }
    .breakdown { padding: 10px 14px; }
    .targets { padding: 10px 14px; }
    .psec { padding: 10px 14px; }
    .bar-wrap { padding: 8px 14px; }
    .brow-lbl { font-size: .7rem; }
    .section-label { font-size: .56rem; }
  }

  /* < 360: ventana muy pequeña */
  @media (max-width: 360px) {
    .main-content { padding: 0 8px; padding-top: 54px; }
    .page-header h1 { font-size: 1.2rem; }
    .months-grid { grid-template-columns: 1fr; }
    .cal-summary { grid-template-columns: 1fr 1fr; }
    .macros-grid { grid-template-columns: 1fr; }
    .hist-grid { grid-template-columns: 1fr; }
    .tab-btn { font-size: .5rem; letter-spacing: 0; }
    .tdee-number { font-size: 1.7rem; }
    .num-input-wrap input { font-size: .85rem; }
  }
  /* ── NUTRITION PAGE ── */
  .nutrition-page { padding-bottom: 80px; }

  .nutr-layout { display: grid; grid-template-columns: 1fr 320px; gap: 40px; align-items: start; }

  /* Donut summary card */
  .nutr-summary-card {
    position: sticky; top: 32px;
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: var(--r-lg); overflow: hidden;
  }
  .nutr-summary-header { padding: 12px 16px 10px; border-bottom: 1px solid var(--border); }
  .nutr-summary-title { font-family: var(--font-mono); font-size: .55rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
  .nutr-date-badge { font-family: var(--font-display); font-size: .95rem; }
  .nutr-date-badge em { font-style: italic; color: var(--accent); }

  .nutr-donut-wrap { padding: 14px 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .nutr-donut-svg { width: 140px; height: 140px; flex-shrink: 0; }
  .nutr-ring { transition: stroke-dasharray 0.6s cubic-bezier(.34,1.2,.64,1), stroke-dashoffset 0.6s cubic-bezier(.34,1.2,.64,1); }

  .nutr-macro-bars { width: 100%; display: flex; flex-direction: column; gap: 7px; }
  .nutr-bar-row { display: flex; flex-direction: column; gap: 3px; }
  .nutr-bar-top { display: flex; justify-content: space-between; align-items: center; }
  .nutr-bar-lbl { font-size: .65rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px; }
  .nutr-bar-lbl-dot { width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0; }
  .nutr-bar-vals { font-family: var(--font-mono); font-size: .62rem; color: var(--text-muted); }
  .nutr-bar-vals strong { color: var(--text); }
  .nutr-bar-track { height: 4px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
  .nutr-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s cubic-bezier(.34,1.2,.64,1); }

  .nutr-kcal-total { text-align: center; padding: 10px 16px 12px; border-top: 1px solid var(--border); }
  .nutr-kcal-num { font-family: var(--font-display); font-size: 1.9rem; color: var(--accent); line-height: 1; }
  .nutr-kcal-lbl { font-family: var(--font-mono); font-size: .55rem; color: var(--text-muted); letter-spacing: .1em; text-transform: uppercase; margin-top: 2px; }

  /* Meals column */
  .nutr-meals { display: flex; flex-direction: column; gap: 20px; }

  .nutr-meal-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; transition: var(--tr); }
  .nutr-meal-header { padding: 13px 18px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; background: var(--bg-warm); }
  .nutr-meal-header:hover { background: var(--surface-2); }
  .nutr-meal-title { display: flex; align-items: center; gap: 10px; }
  .nutr-meal-emoji { font-size: 1.1rem; }
  .nutr-meal-name { font-family: var(--font-display); font-size: .95rem; }
  .nutr-meal-name em { font-style: italic; color: var(--accent); }
  .nutr-meal-kcal { font-family: var(--font-mono); font-size: .75rem; color: var(--accent); }

  .nutr-food-list { padding: 8px 0; }
  .nutr-food-item { display: flex; align-items: center; gap: 10px; padding: 8px 18px; border-bottom: 1px solid var(--border); transition: background .15s; }
  .nutr-food-item:last-child { border-bottom: none; }
  .nutr-food-item:hover { background: var(--bg-warm); }
  .nutr-food-name { flex: 1; font-size: .8rem; }
  .nutr-food-grams { font-family: var(--font-mono); font-size: .68rem; color: var(--text-muted); }
  .nutr-food-kcal { font-family: var(--font-mono); font-size: .75rem; color: var(--accent); min-width: 52px; text-align: right; }
  .nutr-food-macros { font-size: .62rem; color: var(--text-dim); font-family: var(--font-mono); min-width: 120px; text-align: right; }
  .nutr-food-del { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: .9rem; padding: 2px 4px; border-radius: 4px; transition: var(--tr); flex-shrink: 0; }
  .nutr-food-del:hover { color: var(--accent); background: var(--accent-dim); }

  .nutr-add-row { padding: 10px 18px; }
  .nutr-add-form { display: flex; gap: 7px; flex-wrap: wrap; align-items: flex-end; }
  .nutr-add-field { display: flex; flex-direction: column; gap: 4px; }
  .nutr-add-field label { font-size: .62rem; color: var(--text-muted); font-family: var(--font-mono); }
  .nutr-add-input {
    background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r);
    color: var(--text); font-family: var(--font-mono); font-size: .8rem;
    padding: 7px 10px; outline: none; transition: border-color .2s, box-shadow .2s;
  }
  .nutr-add-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .nutr-add-input.wide { width: 140px; }
  .nutr-add-input.narrow { width: 60px; }
  .nutr-add-btn {
    padding: 7px 14px; background: var(--accent); color: #faf7f2;
    border: none; border-radius: var(--r); font-family: var(--font-body);
    font-size: .78rem; font-weight: 500; cursor: pointer; transition: var(--tr);
    box-shadow: 0 2px 0 rgba(0,0,0,.15); white-space: nowrap;
  }
  .nutr-add-btn:hover { background: var(--accent-2); transform: translateY(-1px); }
  .nutr-add-btn:active { transform: translateY(1px); box-shadow: none; }

  .nutr-meal-empty { padding: 14px 18px; font-size: .75rem; color: var(--text-dim); font-style: italic; }

  /* Quick foods panel */
  .nutr-quick { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 18px; margin-bottom: 20px; }
  .nutr-quick-title { font-family: var(--font-mono); font-size: .58rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
  .nutr-quick-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .nutr-quick-btn {
    padding: 4px 10px; border-radius: 6px; font-size: .68rem; font-family: var(--font-mono);
    cursor: pointer; border: 1.5px solid var(--border); background: var(--bg-warm);
    color: var(--text-muted); transition: var(--tr); box-shadow: 0 2px 0 var(--border);
  }
  .nutr-quick-btn:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-1px); }
  .nutr-quick-btn:active { transform: translateY(1px); box-shadow: none; }

  /* Responsive nutrition */
  @media (max-width: 900px) {
    .nutr-layout { grid-template-columns: 1fr; }
    .nutr-summary-card { position: static; order: -1; }
    /* En móvil: donut + barras en fila horizontal compacta */
    .nutr-donut-wrap { flex-direction: row; align-items: center; gap: 16px; padding: 12px 16px 10px; }
    .nutr-donut-svg { width: 110px; height: 110px; flex-shrink: 0; }
    .nutr-macro-bars { flex: 1; }
    .nutr-kcal-total { padding: 8px 16px 10px; }
    .nutr-kcal-num { font-size: 1.5rem; }
  }
  @media (max-width: 700px) {
    .nutr-layout { gap: 16px; }
    .nutr-donut-svg { width: 100px; height: 100px; }
    .nutr-add-form { flex-wrap: wrap; }
    .nutr-add-input.narrow { width: 54px; }
  }
  @media (max-width: 480px) {
    .nutr-add-form { flex-direction: column; align-items: stretch; }
    .nutr-add-input.wide, .nutr-add-input.narrow { width: 100%; }
    .nutr-food-macros { display: none; }
    .nutr-donut-svg { width: 90px; height: 90px; }
    .nutr-kcal-num { font-size: 1.3rem; }
  }

  /* ── MACRO PLAN CUSTOMIZER ── */
  .plan-strategy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .plan-strategy-btn {
    padding: 10px 8px; border-radius: var(--r); border: 1.5px solid var(--border);
    background: var(--bg-warm); cursor: pointer; text-align: left;
    font-family: var(--font-body); transition: var(--tr);
    box-shadow: 0 2px 0 var(--border);
  }
  .plan-strategy-btn:hover { border-color: var(--accent); transform: translateY(-1px); }
  .plan-strategy-btn:active { transform: translateY(1px); box-shadow: none; }
  .plan-strategy-btn.active { background: var(--accent-dim); border-color: var(--accent); box-shadow: none; }
  .plan-strategy-icon { font-size: 1.1rem; margin-bottom: 4px; }
  .plan-strategy-name { font-size: .76rem; font-weight: 500; color: var(--text); margin-bottom: 1px; }
  .plan-strategy-btn.active .plan-strategy-name { color: var(--accent); }
  .plan-strategy-desc { font-size: .62rem; color: var(--text-muted); line-height: 1.4; }

  .plan-macro-slider { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .plan-macro-top { display: flex; justify-content: space-between; align-items: center; }
  .plan-macro-lbl { display: flex; align-items: center; gap: 6px; font-size: .72rem; color: var(--text-muted); }
  .plan-macro-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
  .plan-macro-val { font-family: var(--font-mono); font-size: .78rem; font-weight: 500; }
  .plan-macro-grams { font-family: var(--font-mono); font-size: .65rem; color: var(--text-dim); }

  .plan-total-bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; margin: 12px 0 6px; gap: 2px; }
  .plan-total-seg { border-radius: 2px; transition: flex .4s cubic-bezier(.34,1.2,.64,1); }
  .plan-total-warn { font-family: var(--font-mono); font-size: .62rem; color: var(--accent); text-align: center; }
  .plan-total-ok { font-family: var(--font-mono); font-size: .62rem; color: var(--green); text-align: center; }

  .plan-save-btn {
    width: 100%; padding: 10px; background: var(--accent); color: #faf7f2;
    border: none; border-radius: var(--r); font-family: var(--font-body);
    font-size: .82rem; font-weight: 500; cursor: pointer; transition: var(--tr);
    box-shadow: 0 3px 0 rgba(0,0,0,.15); margin-top: 4px;
  }
  .plan-save-btn:hover { background: var(--accent-2); transform: translateY(-1px); }
  .plan-save-btn:active { transform: translateY(2px); box-shadow: none; }
  .plan-save-btn.saved { background: var(--green); }

  .plan-info-pill { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: .6rem; padding: 3px 9px; border-radius: 100px; border: 1px solid; }

  /* ── FOOD LIBRARY ── */
  .food-lib-panel {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: var(--r-lg); overflow: hidden; margin-bottom: 4px;
    animation: fadeUp .25s ease;
  }
  .food-lib-header {
    padding: 13px 18px; background: var(--bg-warm); border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .food-lib-title { font-family: var(--font-display); font-size: .95rem; }
  .food-lib-title em { font-style: italic; color: var(--accent); }
  .food-lib-close {
    background: none; border: none; color: var(--text-muted); cursor: pointer;
    font-size: 1.1rem; padding: 2px 6px; border-radius: 6px; transition: var(--tr);
  }
  .food-lib-close:hover { color: var(--accent); background: var(--accent-dim); }

  .food-lib-form { padding: 16px 18px; border-bottom: 1px solid var(--border); }
  .food-lib-form-title { font-family: var(--font-mono); font-size: .55rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }

  .food-lib-row { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
  .food-lib-field { display: flex; flex-direction: column; gap: 4px; }
  .food-lib-field label { font-size: .6rem; color: var(--text-muted); font-family: var(--font-mono); white-space: nowrap; }
  .food-lib-input {
    background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r);
    color: var(--text); font-family: var(--font-mono); font-size: .78rem;
    padding: 6px 9px; outline: none; transition: border-color .2s, box-shadow .2s;
  }
  .food-lib-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .food-lib-input.name-input { width: 160px; }
  .food-lib-input.num-input  { width: 62px; }
  .food-lib-input.qty-input  { width: 72px; }

  .food-lib-section-lbl { font-family: var(--font-mono); font-size: .55rem; letter-spacing: .1em; color: var(--text-dim); text-transform: uppercase; margin: 8px 0 6px; width: 100%; }

  .food-lib-add-btn {
    padding: 7px 16px; background: var(--accent); color: #faf7f2;
    border: none; border-radius: var(--r); font-family: var(--font-body);
    font-size: .78rem; font-weight: 500; cursor: pointer; transition: var(--tr);
    box-shadow: 0 2px 0 rgba(0,0,0,.15); white-space: nowrap; align-self: flex-end;
  }
  .food-lib-add-btn:hover { background: var(--accent-2); transform: translateY(-1px); }
  .food-lib-add-btn:active { transform: translateY(1px); box-shadow: none; }

  .food-lib-list { max-height: 260px; overflow-y: auto; }
  .food-lib-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 18px; border-bottom: 1px solid var(--border);
    transition: background .15s;
  }
  .food-lib-item:last-child { border-bottom: none; }
  .food-lib-item:hover { background: var(--bg-warm); }
  .food-lib-item-name { flex: 1; font-size: .79rem; }
  .food-lib-item-macros { font-family: var(--font-mono); font-size: .6rem; color: var(--text-dim); }
  .food-lib-item-kcal { font-family: var(--font-mono); font-size: .74rem; color: var(--accent); min-width: 48px; text-align: right; }
  .food-lib-item-use {
    padding: 3px 10px; border-radius: 6px; font-size: .65rem; font-family: var(--font-mono);
    cursor: pointer; border: 1.5px solid var(--border); background: var(--surface);
    color: var(--text-muted); transition: var(--tr); white-space: nowrap;
  }
  .food-lib-item-use:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .food-lib-item-del {
    background: none; border: none; color: var(--text-dim); cursor: pointer;
    font-size: .85rem; padding: 2px 5px; border-radius: 4px; transition: var(--tr);
    flex-shrink: 0;
  }
  .food-lib-item-del:hover { color: var(--accent); background: var(--accent-dim); }

  .food-lib-empty { padding: 20px 18px; text-align: center; font-size: .76rem; color: var(--text-dim); font-style: italic; }

  /* quick panel header */
  .nutr-quick-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .nutr-quick-open-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: var(--r); font-size: .7rem; font-family: var(--font-mono);
    cursor: pointer; border: 1.5px solid var(--border); background: var(--accent-dim);
    color: var(--accent); transition: var(--tr); box-shadow: 0 2px 0 var(--border);
  }
  .nutr-quick-open-btn:hover { background: var(--accent); color: #faf7f2; border-color: var(--accent); }
  .nutr-quick-open-btn:active { transform: translateY(1px); box-shadow: none; }

  @media (max-width: 480px) {
    .food-lib-input.name-input { width: 100%; }
    .food-lib-row { flex-direction: column; }
    .food-lib-input.num-input { width: 100%; }
  }

`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function markPos(val, min, max) {
  const pct = (val - min) / (max - min);
  return `calc(${pct * 100}% - ${9 * (2 * pct - 1)}px)`;
}

function imcInfo(v) {
  if (v < 18.5) return { label:"IMC bajo",       color:"#3a6e9e", bg:"rgba(58,110,158,.1)",  note:"Un IMC bajo puede indicar poca masa corporal total, pero el contexto individual siempre importa." };
  if (v < 25)   return { label:"Rango habitual", color:"#5a8a4a", bg:"rgba(90,138,74,.1)",   note:"IMC dentro del rango estadísticamente más común. Es solo una referencia poblacional." };
  if (v < 30)   return { label:"IMC elevado",    color:"#c8860a", bg:"rgba(200,134,10,.1)",  note:"Un IMC alto no significa exceso de grasa. En personas con mucha masa muscular es normal superarlo." };
  return               { label:"IMC muy elevado",color:"#d94f2b", bg:"rgba(217,79,43,.1)",   note:"El IMC es una métrica muy limitada. No distingue músculo de grasa ni distribución corporal." };
}

function getCategory(direction, delta) {
  if (direction === "mantenimiento") return { label:"Mantenimiento", color:"#8a6a50", prot: 1.8 };
  if (direction === "deficit") {
    if (delta <= 50)  return { label:"Mínimo",              color:"#5a8a4a", prot:1.6 };
    if (delta <= 150) return { label:"Ligero",              color:"#7a9a4a", prot:1.8 };
    if (delta <= 250) return { label:"Ligero / Moderado",   color:"#a08a30", prot:2.0 };
    if (delta <= 350) return { label:"Moderado",            color:"#c8860a", prot:2.2 };
    if (delta <= 450) return { label:"Moderado / Agresivo", color:"#d47020", prot:2.3 };
    if (delta <= 550) return { label:"Agresivo",            color:"#d94f2b", prot:2.4 };
    return                   { label:"Muy agresivo ⚠",     color:"#b03020", prot:2.5 };
  }
  if (delta <= 50)  return { label:"Mínimo",              color:"#5a8a4a", prot:1.6 };
  if (delta <= 150) return { label:"Ligero",              color:"#4a8a6a", prot:1.8 };
  if (delta <= 250) return { label:"Ligero / Moderado",   color:"#3a7a8a", prot:1.9 };
  if (delta <= 350) return { label:"Moderado",            color:"#3a6e9e", prot:2.0 };
  if (delta <= 450) return { label:"Moderado / Agresivo", color:"#5a5a9e", prot:2.0 };
  return                   { label:"Agresivo",            color:"#7a5a9e", prot:2.0 };
}

function healthStatus(r) {
  const pPerKg = r.proteinG / r.peso, deficit = r.mantenimiento - r.kcalObj;
  if (r.kcalObj < r.bmr * 0.85) return { label:"⚠ Riesgo",         color:"#d94f2b", bg:"rgba(217,79,43,.1)", msg:"Ingesta por debajo del 85% del BMR. Riesgo serio de pérdida muscular y carencias." };
  if (deficit > 500)             return { label:"⚠ Agresivo",       color:"#c8860a", bg:"rgba(200,134,10,.1)",msg:"Déficit elevado. Asegura proteína alta y descansa una semana cada 6-8 semanas." };
  if (pPerKg < 1.6 && deficit > 0) return { label:"⚠ Proteína baja",color:"#c8860a", bg:"rgba(200,134,10,.1)",msg:"En déficit la proteína debería ser ≥1.6 g/kg para preservar músculo." };
  if (deficit <= 0)              return { label:"✓ Óptimo",         color:"#5a8a4a", bg:"rgba(90,138,74,.1)", msg:"Plan equilibrado. Monitorea el peso cada semana en las mismas condiciones." };
  return                               { label:"✓ Correcto",        color:"#5a8a4a", bg:"rgba(90,138,74,.1)", msg:"Plan sostenible. Ajusta cada 2-3 semanas según evolución real." };
}

function recompViability(bf, sexo, dias, met) {
  if (!bf || Number(bf) <= 0) return null;
  const bfN = Number(bf), highBf = sexo === "hombre" ? bfN > 20 : bfN > 27;
  const good = dias >= 3 && met >= 4.5;
  if (highBf && good) return { viable:true,  msg:"Con tu % de grasa y nivel de entreno la recomposición es viable. Déficit mínimo (~150-200 kcal) y proteína alta (2.2+ g/kg)." };
  if (!good)          return { viable:false, msg:"Para recomp necesitas ≥3 días/semana con intensidad moderada-alta." };
  return                     { viable:false, msg:"Un déficit moderado + proteína alta dará resultados más rápidos." };
}

function computeMET(rir, series, descanso) {
  const r = {"0":2.0,"1-2":1.5,"3-4":1.0,"5+":0.5}[rir] || 1.5;
  const s = {"1-2":-0.5,"3":0,"4-5":0.4,"6+":0.8}[series] || 0;
  const d = {"menos60":0.8,"60-90":0.4,"90-120":0,"2-3min":-0.2,"mas3min":-0.5}[descanso] || 0;
  return Math.min(Math.max(2.0 + r + s + d, 2.5), 9.0);
}

function metLabel(met) {
  if (met < 3.5) return { label:"Ligero",     color:"#5a8a4a" };
  if (met < 5.0) return { label:"Moderado",   color:"#c8860a" };
  if (met < 6.5) return { label:"Intenso",    color:"#e8793a" };
  return               { label:"Muy intenso", color:"#d94f2b" };
}

function calcTDEE({ sexo,peso,altura,edad,grasa,diasFuerza,duracion,rir,series,descanso,cardio,pasos,trabajo }) {
  let bmr;
  if (grasa && Number(grasa) > 0) {
    bmr = 370 + 21.6 * (peso * (1 - Number(grasa) / 100));
  } else {
    bmr = sexo === "hombre" ? 10*peso+6.25*altura-5*edad+5 : 10*peso+6.25*altura-5*edad-161;
  }
  const met = computeMET(rir, series, descanso);
  const eat = ((met*peso*3.5)/200)*duracion*diasFuerza/7
    + {ninguno:0,poco:300,moderado:900,bastante:2000,mucho:3250}[cardio]/7;
  const neat = pasos*(peso*0.00055) + {sedentario:0,ligero:200,moderado:400,activo:700,muy_activo:1000}[trabajo];
  const tef = bmr*0.1;
  return {bmr:Math.round(bmr),eat:Math.round(eat),neat:Math.round(neat),tef:Math.round(tef),tdee:Math.round(bmr+eat+neat+tef)};
}

function validateCalc(base, kcalObj, proteinG, fatG, carbG, peso) {
  const e = [];
  if (kcalObj < 800)              e.push({title:"Objetivo calórico peligrosamente bajo", msg:`${kcalObj} kcal/día es insuficiente. Reduce el déficit o revisa tus datos.`});
  if (kcalObj < base.bmr * 0.75) e.push({title:"Ingesta por debajo del 75% del BMR",   msg:"Riesgo de pérdida muscular severa, fatiga crónica y carencias nutricionales."});
  if (carbG < 0)                  e.push({title:"Carbohidratos negativos — imposible",   msg:"Proteína + déficit demasiado alto. Reduce el déficit o la proteína objetivo."});
  if (fatG < 20)                  e.push({title:"Grasa demasiado baja",                  msg:`Solo ${fatG}g de grasa. Mínimo recomendado: 20-25g para vitaminas liposolubles y hormonas.`});
  if (peso <= 0 || isNaN(peso))   e.push({title:"Peso inválido",                         msg:"Introduce un peso válido (40-200 kg)."});
  return e;
}

function loadForm() {
  try { const s = localStorage.getItem(FORM_KEY); return s ? {...DEFAULT_FORM,...JSON.parse(s)} : DEFAULT_FORM; }
  catch { return DEFAULT_FORM; }
}

function loadPlan() {
  try { return JSON.parse(localStorage.getItem(PLAN_KEY) || "null"); } catch { return null; }
}

function savePlan(plan) {
  try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch {}
}

function loadCalendar() {
  try { return JSON.parse(localStorage.getItem(CAL_KEY) || "{}"); }
  catch { return {}; }
}

function dayKey(year, month, day) {
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function todayKey() { const d = new Date(); return dayKey(d.getFullYear(), d.getMonth(), d.getDate()); }

function getDayStatus(entry) {
  if (!entry) return null;
  const done = CATS.filter(c => entry[c.key]).length;
  if (done === 3) return "full";
  if (done > 0)  return "partial";
  return "failed";
}

function getFirstWeekday(year, month) {
  let d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function getCalStats(calendar, year) {
  let full = 0, partial = 0, failed = 0, streak = 0;
  const today = new Date();
  let checking = new Date(today);
  while (true) {
    const k = dayKey(checking.getFullYear(), checking.getMonth(), checking.getDate());
    const st = getDayStatus(calendar[k]);
    if (st === "full" || st === "partial") { streak++; checking.setDate(checking.getDate()-1); if(streak > 500) break; }
    else break;
  }
  Object.values(calendar).forEach(entry => {
    const st = getDayStatus(entry);
    if (st === "full") full++;
    else if (st === "partial") partial++;
    else if (st === "failed") failed++;
  });
  return { full, partial, failed, streak };
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
function Tip({ text }) {
  return (
    <span className="tip-wrap">
      <span className="tip-icon">i</span>
      <span className="tip-box">{text}</span>
    </span>
  );
}

function Slider({ label, value, onChange, min, max, step=1, unit="", marks=[], hint, tip }) {
  const pct = (value-min)/(max-min);
  const grad = `linear-gradient(to right, var(--accent) ${pct*100}%, var(--surface-2) ${pct*100}%)`;
  const display = unit === "pasos" ? value.toLocaleString() : `${value} ${unit}`;
  return (
    <div className="slider-field">
      <div className="slider-top">
        <label>{label}{tip && <Tip text={tip}/>}</label>
        <span className="slider-value">{display}</span>
      </div>
      <div className="slider-wrap">
        <input type="range" min={min} max={max} step={step} value={value} style={{background:grad}} onChange={e=>onChange(Number(e.target.value))}/>
        {marks.map(m=><span key={m.val} className="slider-mark" style={{left:markPos(m.val,min,max)}}>{m.label}</span>)}
      </div>
      {hint && <span className="slider-hint">{hint}</span>}
    </div>
  );
}

function DonutChart({ leanKg, fatKg }) {
  const r=52,cx=70,cy=70,sw=22,circ=2*Math.PI*r,total=leanKg+fatKg;
  const fatDash=(fatKg/total)*circ,leanDash=(leanKg/total)*circ,fatDeg=(fatKg/total)*360;
  return (
    <div className="donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={sw}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8793a" strokeWidth={sw} strokeDasharray={`${fatDash} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} style={{transition:"stroke-dasharray .6s"}}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d94f2b" strokeWidth={sw} strokeDasharray={`${leanDash} ${circ}`} transform={`rotate(${-90+fatDeg} ${cx} ${cy})`} style={{transition:"stroke-dasharray .6s"}}/>
        <text x={cx} y={cy-5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-muted)">TOTAL</text>
        <text x={cx} y={cy+11} textAnchor="middle" fontFamily="var(--font-display)" fontSize="15" fill="var(--text)">{total.toFixed(1)}kg</text>
      </svg>
      <div className="donut-legend">
        {[{label:"Masa magra",val:`${leanKg.toFixed(1)} kg`,color:"#d94f2b"},{label:"Masa grasa",val:`${fatKg.toFixed(1)} kg`,color:"#e8793a"},{label:"% Grasa",val:`${((fatKg/total)*100).toFixed(1)}%`,color:"var(--text-muted)"}].map(item=>(
          <div className="dleg" key={item.label}><div className="dleg-dot" style={{background:item.color}}/><span>{item.label}</span><span className="dleg-val" style={{color:item.color}}>{item.val}</span></div>
        ))}
      </div>
    </div>
  );
}

function MealPlan({ kcal, proteinG, fatG, carbG }) {
  const [n, setN] = useState(4);
  return (
    <div>
      <div className="meal-sel">{[3,4,5].map(v=><button key={v} className={`meal-btn ${n===v?"active":""}`} onClick={()=>setN(v)}>{v} comidas</button>)}</div>
      <div className="meal-grid">
        {MEAL_PLANS[n].map(m=>{
          const mk=Math.round(kcal*m.pct),mp=Math.round(proteinG*m.pct),mf=Math.round(fatG*m.pct),mc=Math.round(carbG*m.pct);
          return (
            <div className="meal-row" key={m.name}>
              <div className="meal-top"><span className="meal-name">{m.emoji} {m.name}</span><span className="meal-kcal">{mk} kcal</span></div>
              <div className="meal-macros">P {mp}g · G {mf}g · C {mc}g</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── MACRO PLAN CUSTOMIZER ───────────────────────────────────────────────────
const STRATEGIES = [
  { id:"deficit",    icon:"🔥", name:"Déficit",       desc:"Pérdida de grasa con masa preservada",  pPct:35, fPct:25, cPct:40 },
  { id:"recomp",     icon:"⚖️", name:"Recomposición", desc:"Perder grasa y ganar músculo a la vez", pPct:40, fPct:25, cPct:35 },
  { id:"superavit",  icon:"💪", name:"Superávit",     desc:"Ganancia muscular con algo de grasa",   pPct:30, fPct:25, cPct:45 },
  { id:"lean_bulk",  icon:"🎯", name:"Lean Bulk",     desc:"Superávit mínimo, máximo músculo limpio",pPct:35, fPct:25, cPct:40 },
];

function MacroPlanCustomizer({ kcalObj, onSave }) {
  const existing = loadPlan();
  const [strategy, setStrategy] = useState(existing?.strategy || "deficit");
  const [pPct, setPPct] = useState(existing?.pPct ?? 35);
  const [fPct, setFPct] = useState(existing?.fPct ?? 25);
  const [planSaved, setPlanSaved] = useState(false);

  const cPct = Math.max(0, 100 - pPct - fPct);
  const total = pPct + fPct + cPct;
  const ok = total === 100;

  const protG = Math.round((kcalObj * pPct / 100) / 4);
  const fatG  = Math.round((kcalObj * fPct / 100) / 9);
  const carbG = Math.round((kcalObj * cPct / 100) / 4);

  const applyStrategy = (s) => {
    const st = STRATEGIES.find(x => x.id === s);
    setStrategy(s);
    setPPct(st.pPct);
    setFPct(st.fPct);
  };

  const handleSave = () => {
    const plan = { strategy, pPct, fPct, cPct, protG, fatG, carbG, kcalObj, updatedAt: Date.now() };
    savePlan(plan);
    onSave(plan);
    setPlanSaved(true);
    setTimeout(() => setPlanSaved(false), 2000);
  };

  return (
    <div>
      {/* Strategy selector */}
      <div style={{fontFamily:"var(--font-mono)",fontSize:".56rem",letterSpacing:".15em",color:"var(--text-muted)",textTransform:"uppercase",marginBottom:10}}>Estrategia</div>
      <div className="plan-strategy-grid">
        {STRATEGIES.map(s => (
          <button key={s.id} className={`plan-strategy-btn ${strategy===s.id?"active":""}`} onClick={() => applyStrategy(s.id)}>
            <div className="plan-strategy-icon">{s.icon}</div>
            <div className="plan-strategy-name">{s.name}</div>
            <div className="plan-strategy-desc">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Visual bar */}
      <div className="plan-total-bar">
        <div className="plan-total-seg" style={{flex:pPct,background:"#d94f2b"}}/>
        <div className="plan-total-seg" style={{flex:fPct,background:"#e8793a"}}/>
        <div className="plan-total-seg" style={{flex:cPct,background:"#3a6e9e"}}/>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
        {[{label:"Proteína",pct:pPct,g:protG,color:"#d94f2b"},{label:"Grasa",pct:fPct,g:fatG,color:"#e8793a"},{label:"Carbos",pct:cPct,g:carbG,color:"#3a6e9e"}].map(m=>(
          <span key={m.label} className="plan-info-pill" style={{color:m.color,background:m.color+"14",borderColor:m.color+"44"}}>
            {m.label} {m.pct}% · {m.g}g
          </span>
        ))}
      </div>

      {/* Sliders */}
      <div style={{fontFamily:"var(--font-mono)",fontSize:".56rem",letterSpacing:".15em",color:"var(--text-muted)",textTransform:"uppercase",marginBottom:12}}>Ajuste fino</div>
      {[
        {label:"Proteína", val:pPct, set:setPPct, color:"#d94f2b", g:protG, kcalPerG:4},
        {label:"Grasa",    val:fPct, set:setFPct, color:"#e8793a", g:fatG,  kcalPerG:9},
      ].map(m => {
        const pct = (m.val - 10) / (70 - 10);
        const grad = `linear-gradient(to right, ${m.color} ${pct*100}%, var(--surface-2) ${pct*100}%)`;
        return (
          <div key={m.label} className="plan-macro-slider">
            <div className="plan-macro-top">
              <div className="plan-macro-lbl">
                <div className="plan-macro-dot" style={{background:m.color}}/>
                {m.label}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
                <span className="plan-macro-val" style={{color:m.color}}>{m.val}%</span>
                <span className="plan-macro-grams">{m.g}g · {Math.round(m.g*m.kcalPerG)} kcal</span>
              </div>
            </div>
            <input type="range" min={10} max={70} step={1} value={m.val} style={{background:grad}}
              onChange={e => m.set(Number(e.target.value))}/>
          </div>
        );
      })}

      {/* Carbs derived */}
      <div className="plan-macro-slider" style={{opacity:.7}}>
        <div className="plan-macro-top">
          <div className="plan-macro-lbl">
            <div className="plan-macro-dot" style={{background:"#3a6e9e"}}/>
            Carbohidratos <span style={{fontSize:".58rem",color:"var(--text-dim)"}}>(calculado)</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
            <span className="plan-macro-val" style={{color:"#3a6e9e"}}>{cPct}%</span>
            <span className="plan-macro-grams">{carbG}g · {Math.round(carbG*4)} kcal</span>
          </div>
        </div>
      </div>

      {!ok && <div className="plan-total-warn">⚠ Proteína + Grasa no puede superar 100%</div>}
      {ok  && <div className="plan-total-ok">✓ Distribución válida — total 100%</div>}

      <button className={`plan-save-btn ${planSaved?"saved":""}`} onClick={handleSave} disabled={!ok}>
        {planSaved ? "✓ Plan guardado en Mi Nutrición" : "Guardar plan de macros"}
      </button>
    </div>
  );
}

// ─── DAY MODAL ───────────────────────────────────────────────────────────────
function DayModal({ dateKey, calendar, onSave, onClose }) {
  const existing = calendar[dateKey] || {};
  const [draft, setDraft] = useState({training:false,diet:false,sleep:false,...existing});
  const toggle = key => setDraft(d=>({...d,[key]:!d[key]}));
  const done = CATS.filter(c=>draft[c.key]).length;
  const d = new Date(dateKey+"T12:00:00");
  const label = d.toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"});
  return (
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-box">
        <div className="modal-title">¿Cómo fue el <em>día</em>?</div>
        <div className="modal-sub">{label.charAt(0).toUpperCase()+label.slice(1)}</div>
        {CATS.map(cat=>(
          <button key={cat.key} className={`cat-btn ${draft[cat.key]?"done":""}`}
            style={draft[cat.key]?{background:cat.bg,borderColor:cat.color}:{}}
            onClick={()=>toggle(cat.key)}>
            <span className="cat-icon-big">{cat.icon}</span>
            <div className="cat-text">
              <div className="cat-name" style={{color:draft[cat.key]?cat.color:"var(--text)"}}>{cat.name}</div>
              <div className="cat-desc">{cat.desc}</div>
            </div>
            <div className="cat-check" style={draft[cat.key]?{background:cat.color,borderColor:cat.color}:{}}>
              {draft[cat.key] && <span style={{color:"#fff",fontSize:".85rem"}}>✓</span>}
            </div>
          </button>
        ))}
        <div style={{marginTop:11,padding:"9px 13px",background:"var(--bg-warm)",borderRadius:"var(--r)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:".72rem",color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>Hábitos cumplidos:</span>
          <span style={{fontFamily:"var(--font-display)",fontSize:"1.4rem",color:done===3?"#5a8a4a":done>0?"#c8860a":"var(--text-muted)"}}>{done}/3</span>
        </div>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-save" onClick={()=>onSave(dateKey,draft)}>Guardar día</button>
        </div>
      </div>
    </div>
  );
}

// ─── MINI MONTH ──────────────────────────────────────────────────────────────
function MiniMonth({ year, month, calendar, onDayClick }) {
  const today = todayKey();
  const now = new Date();
  const days = new Date(year, month+1, 0).getDate();
  const firstWd = getFirstWeekday(year, month);
  let full=0, tracked=0;
  for(let d=1;d<=days;d++){const k=dayKey(year,month,d);const st=getDayStatus(calendar[k]);if(st)tracked++;if(st==="full")full++;}
  return (
    <div className="month-card">
      <div className="month-header">
        <div className="month-name"><em>{MONTHS[month]}</em></div>
        <div className="month-stats">{tracked > 0 ? `${full} días perfectos · ${tracked} registrados` : "Sin registros aún"}</div>
      </div>
      <div className="mini-cal-weekdays">{WEEKDAYS.map(w=><div key={w} className="mini-wd">{w}</div>)}</div>
      <div className="mini-cal-grid">
        {Array(firstWd).fill(null).map((_,i)=><div key={`e${i}`} className="mini-day empty"/>)}
        {Array(days).fill(null).map((_,i)=>{
          const d=i+1, k=dayKey(year,month,d);
          const dayDate=new Date(year,month,d);
          const nowEnd=new Date(now);nowEnd.setHours(23,59,59,999);
          const isFuture=dayDate>nowEnd;
          const isToday=k===today;
          const st=getDayStatus(calendar[k]);
          let cls="mini-day";
          if(isToday)cls+=" today";
          if(isFuture)cls+=" future";
          else if(st==="full")cls+=" full";
          else if(st==="partial")cls+=" partial";
          else if(st==="failed")cls+=" failed";
          return (
            <div key={d} className={cls} onClick={()=>!isFuture&&onDayClick(k)}>
              <span style={{fontSize:".58rem"}}>{d}</span>
              {calendar[k] && (
                <div className="mini-dots">
                  {CATS.map(c=><div key={c.key} className="mini-dot" style={{background:calendar[k][c.key]?c.color:"var(--border)"}}/>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CALENDAR PAGE ───────────────────────────────────────────────────────────
function CalendarPage() {
  const [calendar, setCalendar] = useState(loadCalendar);
  const [viewYear, setViewYear] = useState(()=>new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const now = new Date();
  const stats = getCalStats(calendar, viewYear);

  const handleSave = (k, draft) => {
    const updated = {...calendar,[k]:draft};
    setCalendar(updated);
    try { localStorage.setItem(CAL_KEY, JSON.stringify(updated)); } catch {}
    setSelectedDay(null);
  };

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>Mi <em>Calendario</em></h1>
        <p>Registra tus hábitos diarios — entrenamiento, dieta y sueño — y sigue tu racha</p>
      </div>

      <div className="cal-summary">
        {[
          {val:`🔥 ${stats.streak}`,  lbl:"Racha actual",    color:"#d94f2b"},
          {val:`✅ ${stats.full}`,    lbl:"Días perfectos",   color:"#5a8a4a"},
          {val:`🟡 ${stats.partial}`, lbl:"Días parciales",   color:"#c8860a"},
          {val:`📅 ${stats.full+stats.partial+stats.failed}`,lbl:"Días registrados", color:"#3a6e9e"},
        ].map((s,i)=>(
          <div key={i} className="cal-stat">
            <div className="cal-stat-val" style={{color:s.color}}>{s.val}</div>
            <div className="cal-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="cal-legend-bar">
        {[
          {color:"rgba(90,138,74,.4)",   label:"Día perfecto (3/3)"},
          {color:"rgba(200,134,10,.35)", label:"Día parcial (1-2/3)"},
          {color:"rgba(217,79,43,.2)",   label:"Registrado sin cumplir"},
          {color:"var(--accent)",        label:"Hoy"},
        ].map(l=><div key={l.label} className="leg-item"><div className="leg-swatch" style={{background:l.color}}/>{l.label}</div>)}
        <div className="leg-item">
          {CATS.map(c=><div key={c.key} className="leg-swatch" style={{background:c.color,marginRight:2}}/>)}
          <span style={{marginLeft:4}}>💪 🥗 😴</span>
        </div>
      </div>

      <div className="year-nav">
        <button className="year-btn" onClick={()=>setViewYear(y=>y-1)}>‹</button>
        <div className="year-label"><em>{viewYear}</em></div>
        <button className="year-btn" onClick={()=>setViewYear(y=>Math.min(y+1, now.getFullYear()))} style={{opacity:viewYear>=now.getFullYear()?.4:1}}>›</button>
      </div>

      <div className="months-grid">
        {Array(12).fill(null).map((_,m)=>(
          <MiniMonth key={m} year={viewYear} month={m} calendar={calendar} onDayClick={setSelectedDay}/>
        ))}
      </div>

      {selectedDay && (
        <DayModal dateKey={selectedDay} calendar={calendar} onSave={handleSave} onClose={()=>setSelectedDay(null)}/>
      )}
    </div>
  );
}

// ─── CALCULATOR PAGE ─────────────────────────────────────────────────────────
function CalculatorPage() {
  const saved0 = loadForm();
  const [sexo,setSexo]=useState(saved0.sexo);
  const [peso,setPeso]=useState(saved0.peso);
  const [altura,setAltura]=useState(saved0.altura);
  const [edad,setEdad]=useState(saved0.edad);
  const [grasa,setGrasa]=useState(saved0.grasa);
  const [diasF,setDiasF]=useState(saved0.diasF);
  const [duracion,setDuracion]=useState(saved0.duracion);
  const [rir,setRir]=useState(saved0.rir);
  const [series,setSeries]=useState(saved0.series);
  const [descanso,setDescanso]=useState(saved0.descanso);
  const [cardio,setCardio]=useState(saved0.cardio);
  const [pasos,setPasos]=useState(saved0.pasos);
  const [trabajo,setTrabajo]=useState(saved0.trabajo);
  const [direction,setDirection]=useState(saved0.direction);
  const [customDelta,setCustomDelta]=useState(saved0.customDelta);
  const [pesoObj,setPesoObj]=useState(saved0.pesoObj);
  const [compareOn,setCompareOn]=useState(false);
  const [bDias,setBDias]=useState(5);
  const [bDuracion,setBDuracion]=useState(60);
  const [bCardio,setBCardio]=useState("ninguno");
  const [bPasos,setBPasos]=useState(7000);
  const [resultado,setResultado]=useState(null);
  const [calcErrors,setCalcErrors]=useState([]);
  const [tab,setTab]=useState(0);
  const [savedOk,setSavedOk]=useState(false);
  const [historial,setHistorial]=useState(()=>{try{return JSON.parse(localStorage.getItem(HIST_KEY)||"[]")}catch{return[]}});
  const [macroPlan,setMacroPlan]=useState(()=>loadPlan());

  useEffect(()=>{
    const state={sexo,peso,altura,edad,grasa,diasF,duracion,rir,series,descanso,cardio,pasos,trabajo,direction,customDelta,pesoObj};
    try{localStorage.setItem(FORM_KEY,JSON.stringify(state));}catch{}
  },[sexo,peso,altura,edad,grasa,diasF,duracion,rir,series,descanso,cardio,pasos,trabajo,direction,customDelta,pesoObj]);

  const calcular=()=>{
    const base=calcTDEE({sexo,peso,altura,edad,grasa,diasFuerza:diasF,duracion,rir,series,descanso,cardio,pasos,trabajo});
    const mant=base.tdee,def_mod=mant-300,def_agr=mant-500,sup_lig=mant+250,sup_agr=mant+500;
    const cat=getCategory(direction,customDelta);
    let kcalObj,proteinG;
    if(direction==="mantenimiento"){kcalObj=mant;proteinG=Math.round(peso*1.8);}
    else if(direction==="deficit"){kcalObj=mant-customDelta;proteinG=Math.round(peso*cat.prot);}
    else{kcalObj=mant+customDelta;proteinG=Math.round(peso*cat.prot);}
    const fatG=Math.round((kcalObj*0.28)/9);
    const carbG=Math.round((kcalObj-proteinG*4-fatG*9)/4);
    const errors=validateCalc(base,kcalObj,proteinG,fatG,carbG,peso);
    setCalcErrors(errors);
    if(errors.length>0){setResultado(null);return;}
    const horasEj=(duracion/60*diasF)/7;
    const agua=Math.round((peso*35+horasEj*500)/100)/10;
    const fibra=sexo==="hombre"?38:25;
    const imc=+(peso/((altura/100)**2)).toFixed(1);
    setResultado({...base,mantenimiento:mant,def_mod,def_agr,sup_lig,sup_agr,kcalObj,proteinG,fatG,carbG,agua,fibra,imc,peso,sexo,direction,customDelta,usandoKatch:!!(grasa&&Number(grasa)>0)});
    setSavedOk(false);setTab(0);
  };

  const calcB=()=>resultado?calcTDEE({sexo,peso,altura,edad,grasa,diasFuerza:bDias,duracion:bDuracion,rir,series,descanso,cardio:bCardio,pasos:bPasos,trabajo}):null;

  const guardar=()=>{
    if(!resultado)return;
    const entry={date:new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}),tdee:resultado.mantenimiento,kcalObj:resultado.kcalObj,peso:resultado.peso,imc:resultado.imc,objetivo:resultado.direction==="mantenimiento"?"Mantenimiento":`${resultado.direction==="deficit"?"−":"+"}${resultado.customDelta} kcal · ${getCategory(resultado.direction,resultado.customDelta).label}`};
    const next=[entry,...historial].slice(0,12);
    setHistorial(next);
    try{localStorage.setItem(HIST_KEY,JSON.stringify(next));}catch{}
    setSavedOk(true);setTimeout(()=>setSavedOk(false),2000);
  };

  const limpiarHistorial=()=>{setHistorial([]);try{localStorage.removeItem(HIST_KEY);}catch{}};

  const total=resultado?resultado.bmr+resultado.eat+resultado.neat+resultado.tef:1;
  const bResult=compareOn&&resultado?calcB():null;
  const health=resultado?healthStatus(resultado):null;
  const currentMET=computeMET(rir,series,descanso);
  const currentCat=getCategory(direction,customDelta);
  const recomp=recompViability(grasa,sexo,diasF,currentMET);

  const getProyeccion=()=>{
    if(!resultado)return null;
    const def=resultado.mantenimiento-resultado.kcalObj;
    if(def<=0)return null;
    const kgSem=(def*7)/7700;
    const semanas=(pesoObj&&Number(pesoObj)>0&&Number(pesoObj)<resultado.peso)?Math.round((resultado.peso-Number(pesoObj))/kgSem):null;
    return{kgSem:kgSem.toFixed(2),semanas};
  };
  const proy=getProyeccion();

  const targets=resultado?[
    {label:"Déficit agresivo",   desc:"−500 kcal/día", val:resultado.def_agr,       color:"#d94f2b"},
    {label:"Déficit moderado",   desc:"−300 kcal/día", val:resultado.def_mod,       color:"#e8793a"},
    {label:"Mantenimiento",      desc:"Sin cambios",   val:resultado.mantenimiento,  color:"#8a6a50"},
    {label:"Superávit ligero",   desc:"+250 kcal/día", val:resultado.sup_lig,       color:"#3a6e9e"},
    {label:"Superávit agresivo", desc:"+500 kcal/día", val:resultado.sup_agr,       color:"#5a8a4a"},
    ...([resultado.def_agr,resultado.def_mod,resultado.mantenimiento,resultado.sup_lig,resultado.sup_agr].includes(resultado.kcalObj)?[]:[{
      label:`${resultado.direction==="deficit"?"Déficit":resultado.direction==="superavit"?"Superávit":""} personalizado`,
      desc:`${resultado.direction==="deficit"?"−":"+"}${resultado.customDelta} kcal/día · ${getCategory(resultado.direction,resultado.customDelta).label}`,
      val:resultado.kcalObj,color:getCategory(resultado.direction,resultado.customDelta).color,
    }]),
  ]:[];

  const objLabel=resultado?resultado.direction==="mantenimiento"?"Mantenimiento":`${resultado.direction==="deficit"?"Déficit":"Superávit"} ${resultado.customDelta} kcal · ${getCategory(resultado.direction,resultado.customDelta).label}`:"";

  // ── numField con botones +/- personalizados ──────────────────────────────
  const numField = (label, val, set, min, max, unit) => (
    <div className="field" key={label}>
      <label>{label}</label>
      <div className="num-input-wrap">
        <button
          className="spin-btn"
          type="button"
          tabIndex={-1}
          onClick={() => set(v => Math.max(min, Number(v) - 1))}
        >−</button>
        <input
          type="number"
          value={val}
          min={min}
          max={max}
          onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) set(v); }}
        />
        <span className="num-input-unit">{unit}</span>
        <button
          className="spin-btn"
          type="button"
          tabIndex={-1}
          onClick={() => set(v => Math.min(max, Number(v) + 1))}
        >+</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <h1>Mi <em>Calculadora</em></h1>
        <p>Mifflin-St Jeor · Katch-McArdle · MET compendium · evidencia actualizada</p>
      </div>

      <div className="calc-layout">
        {/* LEFT */}
        <div>
          {/* 01 */}
          <div className="section">
            <div className="section-label">01 · Datos biométricos</div>
            <div className="input-grid cols-1" style={{marginBottom:14}}>
              <div className="field">
                <label>Sexo biológico</label>
                <div className="sex-toggle">
                  <button className={`sex-btn ${sexo==="hombre"?"active":""}`} onClick={()=>setSexo("hombre")}>Hombre</button>
                  <button className={`sex-btn ${sexo==="mujer"?"active":""}`}  onClick={()=>setSexo("mujer")}>Mujer</button>
                </div>
              </div>
            </div>
            <div className="input-grid cols-3" style={{marginBottom:14}}>
              {numField("Peso",peso,setPeso,40,200,"kg")}
              {numField("Altura",altura,setAltura,140,220,"cm")}
              {numField("Edad",edad,setEdad,15,80,"años")}
            </div>
            <div className="field">
              <label>% Grasa corporal <span style={{color:"var(--text-dim)"}}>— opcional</span> <Tip text={TIPS.katch}/></label>
              <div className="num-input-wrap">
                <input type="number" value={grasa} min={3} max={60} placeholder="Ej: 18" onChange={e=>setGrasa(e.target.value)}/>
                <span className="num-input-unit">%</span>
              </div>
            </div>
            {grasa&&Number(grasa)>0&&<div className="info-box" style={{marginTop:9}}><strong>Katch-McArdle activo</strong> — fórmula basada en tu masa magra real.</div>}
          </div>

          {/* 02 */}
          <div className="section">
            <div className="section-label">02 · Entrenamiento de fuerza</div>
            <div style={{display:"flex",flexDirection:"column",gap:24}}>
              <Slider label="Días por semana" value={diasF} onChange={setDiasF} min={1} max={7} unit="días" marks={[1,2,3,4,5,6,7].map(d=>({val:d,label:String(d)}))}/>
              <Slider label="Duración por sesión" value={duracion} onChange={setDuracion} min={20} max={180} step={5} unit="min" marks={[20,45,60,90,120,150,180].map(d=>({val:d,label:d+"'"}))}/>
              <div style={{display:"flex",flexDirection:"column",gap:13}}>
                <div className="field">
                  <label>Esfuerzo — proximidad al fallo <Tip text={TIPS.rir}/></label>
                  <select className="styled-select" value={rir} onChange={e=>setRir(e.target.value)}>
                    <option value="0">RIR 0 — Fallo muscular total</option>
                    <option value="1-2">RIR 1-2 — Quedan 1-2 reps, trabajo duro</option>
                    <option value="3-4">RIR 3-4 — Trabajo moderado</option>
                    <option value="5+">RIR 5+ — Esfuerzo ligero</option>
                  </select>
                </div>
                <div className="field">
                  <label>Volumen — series por ejercicio</label>
                  <select className="styled-select" value={series} onChange={e=>setSeries(e.target.value)}>
                    <option value="1-2">1-2 series — Volumen muy bajo</option>
                    <option value="3">3 series — Volumen estándar</option>
                    <option value="4-5">4-5 series — Volumen alto</option>
                    <option value="6+">6+ series — Volumen muy alto</option>
                  </select>
                </div>
                <div className="field">
                  <label>Densidad — descanso entre series</label>
                  <select className="styled-select" value={descanso} onChange={e=>setDescanso(e.target.value)}>
                    <option value="menos60">&lt;60 s — Circuitos, HIIT</option>
                    <option value="60-90">60-90 s — Hipertrofia corto</option>
                    <option value="90-120">90-120 s — Hipertrofia/fuerza</option>
                    <option value="2-3min">2-3 min — Fuerza, cargas altas</option>
                    <option value="mas3min">3+ min — Powerlifting</option>
                  </select>
                </div>
                <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"11px 13px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <p style={{fontSize:".67rem",color:"var(--text-muted)",marginBottom:2}}>Intensidad calculada:</p>
                    <p style={{fontSize:".7rem",color:"var(--text-dim)",fontStyle:"italic"}}>MET: <strong style={{color:metLabel(currentMET).color,fontStyle:"normal"}}>{currentMET.toFixed(1)}</strong></p>
                  </div>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:".73rem",fontWeight:500,padding:"4px 13px",borderRadius:100,color:metLabel(currentMET).color,background:metLabel(currentMET).color+"18",border:`1px solid ${metLabel(currentMET).color}44`}}>{metLabel(currentMET).label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 03 */}
          <div className="section">
            <div className="section-label">03 · Cardio adicional</div>
            <div className="field">
              <label>¿Haces cardio además de la fuerza?</label>
              <select className="styled-select" value={cardio} onChange={e=>setCardio(e.target.value)}>
                <option value="ninguno">Ninguno — solo fuerza</option>
                <option value="poco">Poco — 1-2 sesiones/semana 20-30 min</option>
                <option value="moderado">Moderado — 3 sesiones/semana 30-45 min</option>
                <option value="bastante">Bastante — 4 sesiones/semana 45-60 min</option>
                <option value="mucho">Mucho — 5+ sesiones/semana o 60+ min</option>
              </select>
            </div>
          </div>

          {/* 04 */}
          <div className="section">
            <div className="section-label">04 · Actividad diaria (NEAT) <Tip text={TIPS.neat}/></div>
            <div style={{display:"flex",flexDirection:"column",gap:24}}>
              <Slider label="Pasos diarios promedio" value={pasos} onChange={setPasos} min={1000} max={30000} step={500} unit="pasos"
                marks={[1000,5000,10000,15000,20000,25000,30000].map(d=>({val:d,label:(d/1000)+"k"}))}
                hint="Sin contar el entrenamiento"/>
              <div className="field">
                <label>Tipo de trabajo</label>
                <select className="styled-select" value={trabajo} onChange={e=>setTrabajo(e.target.value)}>
                  <option value="sedentario">Sedentario — oficina, sentado 6+ h</option>
                  <option value="ligero">Ligero — de pie a ratos (dependiente, recepcionista)</option>
                  <option value="moderado">Moderado — de pie 6+ h (camarero, enfermero)</option>
                  <option value="activo">Activo — trabajo físico (almacén, fontanero)</option>
                  <option value="muy_activo">Muy activo — esfuerzo todo el día (construcción)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 05 */}
          <div className="section">
            <div className="section-label">05 · Objetivo calórico</div>
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <div className="field">
                <label>Dirección</label>
                <div className="obj-dir-grid">
                  {[{val:"deficit",label:"Pérdida de grasa"},{val:"mantenimiento",label:"Mantenimiento"},{val:"superavit",label:"Ganancia muscular"}].map(opt=>(
                    <button key={opt.val} className={`sex-btn ${direction===opt.val?"active":""}`}
                      style={{fontSize:".7rem",padding:"12px 5px",lineHeight:1.3}}
                      onClick={()=>{setDirection(opt.val);if(opt.val==="mantenimiento")setCustomDelta(0);else if(customDelta===0)setCustomDelta(300);}}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {direction!=="mantenimiento"&&(
                <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"15px"}}>
                  <div style={{display:"flex",gap:6,marginBottom:13,flexWrap:"wrap"}}>
                    <span style={{fontSize:".67rem",color:"var(--text-muted)",alignSelf:"center",marginRight:2}}>Presets:</span>
                    {(direction==="deficit"
                      ?[{v:100,l:"Mínimo"},{v:200,l:"Ligero"},{v:300,l:"Moderado"},{v:400,l:"Mod/Agr."},{v:500,l:"Agresivo"},{v:600,l:"Muy agr."}]
                      :[{v:100,l:"Mínimo"},{v:150,l:"Ligero"},{v:250,l:"Moderado"},{v:350,l:"Mod/Agr."},{v:500,l:"Agresivo"}]
                    ).map(p=>(
                      <button key={p.v} onClick={()=>setCustomDelta(p.v)} style={{padding:"3px 9px",borderRadius:6,fontSize:".64rem",fontFamily:"var(--font-mono)",cursor:"pointer",border:"1.5px solid",transition:"var(--tr)",boxShadow:customDelta===p.v?"none":"0 2px 0 var(--border)",background:customDelta===p.v?"var(--accent-dim)":"transparent",color:customDelta===p.v?"var(--accent)":"var(--text-muted)",borderColor:customDelta===p.v?"var(--accent-dim)":"var(--border)"}}>
                        {p.l}
                      </button>
                    ))}
                  </div>
                  <Slider label={direction==="deficit"?"Déficit calórico":"Superávit calórico"} value={customDelta} onChange={setCustomDelta}
                    min={50} max={700} step={25} unit="kcal"
                    marks={[{val:50,label:"50"},{val:200,label:"200"},{val:300,label:"300"},{val:500,label:"500"},{val:700,label:"700"}]}/>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginTop:13,paddingTop:11,borderTop:"1px solid var(--border)"}}>
                    <span style={{fontSize:".7rem",color:"var(--text-muted)"}}>Categoría:</span>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:".7rem",fontWeight:500,padding:"2px 11px",borderRadius:100,color:currentCat.color,background:currentCat.color+"18",border:`1px solid ${currentCat.color}44`}}>{currentCat.label}</span>
                    <span style={{fontSize:".67rem",color:"var(--text-dim)",marginLeft:4}}>{currentCat.prot} g/kg proteína</span>
                  </div>
                </div>
              )}
              {direction==="deficit"&&(
                <div className="field">
                  <label>Peso objetivo <span style={{color:"var(--text-dim)"}}>— para proyección</span></label>
                  <div className="num-input-wrap">
                    <input type="number" value={pesoObj} min={30} max={peso} placeholder={`Ej: ${Math.round(peso*0.9)}`} onChange={e=>setPesoObj(e.target.value)}/>
                    <span className="num-input-unit">kg</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="cta" onClick={calcular}>Calcular mi gasto calórico total</button>

          {calcErrors.length>0&&(
            <div style={{display:"flex",flexDirection:"column",gap:9,marginTop:14}}>
              {calcErrors.map((e,i)=>(
                <div key={i} className="error-box">
                  <span className="error-icon">⚠️</span>
                  <div><div className="error-title">{e.title}</div><div className="error-msg">{e.msg}</div></div>
                </div>
              ))}
            </div>
          )}

          {resultado&&(
            <>
              <div className="compare-toggle">
                <label className="tog-switch">
                  <input type="checkbox" checked={compareOn} onChange={e=>setCompareOn(e.target.checked)}/>
                  <span className="tog-slider"/>
                </label>
                <span className="tog-lbl" onClick={()=>setCompareOn(v=>!v)}>Comparar escenario B</span>
              </div>
              {compareOn&&(
                <div className="compare-form">
                  <div className="compare-form-title">Escenario B</div>
                  <div style={{display:"flex",flexDirection:"column",gap:20}}>
                    <Slider label="Días de fuerza" value={bDias} onChange={setBDias} min={1} max={7} unit="días" marks={[1,2,3,4,5,6,7].map(d=>({val:d,label:String(d)}))}/>
                    <Slider label="Duración/sesión" value={bDuracion} onChange={setBDuracion} min={20} max={180} step={5} unit="min" marks={[20,60,120,180].map(d=>({val:d,label:d+"'"}))}/>
                    <Slider label="Pasos diarios" value={bPasos} onChange={setBPasos} min={1000} max={30000} step={500} unit="pasos" marks={[1000,5000,10000,20000,30000].map(d=>({val:d,label:(d/1000)+"k"}))}/>
                    <div className="field">
                      <label>Cardio</label>
                      <select className="styled-select" value={bCardio} onChange={e=>setBCardio(e.target.value)}>
                        <option value="ninguno">Ninguno</option>
                        <option value="poco">Poco — 1-2 sesiones/semana</option>
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
        </div>

        {/* RIGHT */}
        <div className="right-col">
          {!resultado?(
            <div className="welcome-panel">
              <div style={{background:"linear-gradient(90deg, var(--accent), var(--accent-2), #ffd166)",height:4}}/>
              <div style={{padding:"32px 28px 28px"}}>
                <div className="wel-line wel-l1" style={{fontFamily:"var(--font-mono)",fontSize:".6rem",letterSpacing:".18em",color:"var(--accent)",textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                  <span className="wel-dot" style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"inline-block"}}/>
                  Calculadora de gasto calórico
                </div>
                <div className="wel-line wel-l2" style={{fontFamily:"var(--font-display)",fontSize:"1.85rem",lineHeight:1.15,color:"var(--text)",marginBottom:18,letterSpacing:"-.02em"}}>
                  Descubre exactamente<br/><em style={{color:"var(--accent)"}}>lo que necesita</em><br/>tu cuerpo
                </div>
                <div className="wel-line wel-l3" style={{height:1,background:"var(--border)",marginBottom:18}}/>
                <div className="wel-line wel-l3" style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
                  {[{icon:"⚡",text:"Gasto calórico real en 4 componentes"},{icon:"🎯",text:"Macros adaptados a tu objetivo personalizado"},{icon:"📊",text:"Composición corporal e IMC contextualizado"},{icon:"🔄",text:"Comparación de escenarios e historial"},].map(item=>(
                    <div key={item.text} style={{display:"flex",alignItems:"flex-start",gap:11,background:"var(--bg-warm)",borderRadius:"var(--r)",padding:"9px 13px",border:"1px solid var(--border)"}}>
                      <span style={{fontSize:"1rem",lineHeight:1.4,flexShrink:0}}>{item.icon}</span>
                      <span style={{fontSize:".77rem",color:"var(--text-muted)",lineHeight:1.5}}>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="wel-line wel-l5" style={{background:"var(--accent-dim)",border:"1px solid rgba(217,79,43,.25)",borderRadius:"var(--r)",padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:"var(--accent)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",color:"#fff"}}>←</div>
                  <div>
                    <p style={{fontSize:".77rem",color:"var(--accent)",fontWeight:500,marginBottom:2}}>¿Por dónde empiezo?</p>
                    <p style={{fontSize:".7rem",color:"var(--text-muted)",lineHeight:1.5}}>Rellena el formulario y pulsa <strong style={{color:"var(--accent)"}}>Calcular</strong>.</p>
                  </div>
                </div>
              </div>
              <div className="wel-line wel-l5" style={{borderTop:"1px solid var(--border)",display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
                {[{val:"4",label:"componentes"},{ val:"5",label:"pestañas"},{val:"100%",label:"evidencia"}].map((s,i)=>(
                  <div key={s.label} style={{padding:"13px 8px",textAlign:"center",borderRight:i<2?"1px solid var(--border)":"none"}}>
                    <div style={{fontFamily:"var(--font-display)",fontSize:"1.3rem",color:"var(--accent)",lineHeight:1}}>{s.val}</div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:".57rem",color:"var(--text-muted)",marginTop:3}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ):(
            <div className="results-panel">
              <div className="results-header">
                <div className="results-header-top">
                  <div>
                    <p className="res-label">Mantenimiento · {resultado.usandoKatch?"Katch-McArdle":"Mifflin-St Jeor"}</p>
                    <div className="tdee-main">
                      <span className="tdee-number">{resultado.mantenimiento.toLocaleString()}</span>
                      <span className="tdee-unit">kcal/día</span>
                    </div>
                  </div>
                  {health&&<div className="health-pill" style={{color:health.color,background:health.bg,borderColor:health.color+"44"}}>{health.label}</div>}
                </div>
                {health&&<p className="health-msg">{health.msg}</p>}
                <div className="imc-row">
                  <span className="imc-lbl">IMC <Tip text={TIPS.imc}/></span>
                  <span className="imc-val" style={{color:imcInfo(resultado.imc).color}}>{resultado.imc}</span>
                  <span className="imc-cat" style={{color:imcInfo(resultado.imc).color,background:imcInfo(resultado.imc).bg}}>{imcInfo(resultado.imc).label}</span>
                </div>
              </div>
              <div className="tabs">
                {["Resultados","Nutrición","Composición","Proyección"].map((t,i)=>(
                  <button key={t} className={`tab-btn ${tab===i?"active":""}`} onClick={()=>setTab(i)}>{t}</button>
                ))}
              </div>
              {/* TAB 0 */}
              <div className={`tab-content ${tab===0?"active":""}`}>
                <div className="bar-wrap"><div className="bar-track">
                  {[{v:resultado.bmr,c:"#c4a882"},{v:resultado.eat,c:"#3a6e9e"},{v:resultado.neat,c:"#e8793a"},{v:resultado.tef,c:"#7a5a9e"}]
                    .map((s,i)=><div key={i} className="bar-seg" style={{flex:s.v/total,background:s.c}}/>)}
                </div></div>
                <div className="breakdown">
                  {[{label:"Metabolismo basal (BMR)",key:"bmr",color:"#c4a882",tip:TIPS.bmr},{label:"Gasto por entreno (EAT)",key:"eat",color:"#3a6e9e",tip:TIPS.eat},{label:"Actividad diaria (NEAT)",key:"neat",color:"#e8793a",tip:TIPS.neat},{label:"Efecto térmico alimentos",key:"tef",color:"#7a5a9e",tip:TIPS.tef}]
                    .map(row=>(
                      <div className="brow" key={row.key}>
                        <div className="brow-lbl"><div className="dot" style={{background:row.color}}/>{row.label}<Tip text={row.tip}/></div>
                        <span className="brow-val" style={{color:row.color}}>+{resultado[row.key].toLocaleString()}</span>
                      </div>
                    ))}
                </div>
                <div className="targets">
                  {targets.map(t=>(
                    <div key={t.label} className={`target-row ${resultado.kcalObj===t.val?"active":""}`} style={resultado.kcalObj===t.val?{borderColor:t.color}:{}}>
                      <div className="target-left">
                        <p style={{color:t.color}}>{t.label}{resultado.kcalObj===t.val?" ←":""}</p>
                        <p>{t.desc}</p>
                      </div>
                      <span className="target-kcal" style={{color:t.color}}>{t.val.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {compareOn&&bResult&&(
                  <div className="psec">
                    <div className="psec-title">Comparación A vs B</div>
                    <div className="compare-cards">
                      <div className="ccard"><div className="ccard-lbl">Escenario A</div><div className="ccard-tdee">{resultado.mantenimiento.toLocaleString()}</div><div className="ccard-detail">kcal/día</div></div>
                      <div className="ccard active"><div className="ccard-lbl">Escenario B</div><div className="ccard-tdee">{bResult.tdee.toLocaleString()}</div><div className="ccard-detail">kcal/día</div></div>
                    </div>
                    <div className="compare-diff">Diferencia: <span style={{color:bResult.tdee>resultado.mantenimiento?"#5a8a4a":"#d94f2b"}}>{bResult.tdee>resultado.mantenimiento?"+":""}{(bResult.tdee-resultado.mantenimiento).toLocaleString()} kcal/día</span></div>
                  </div>
                )}
              </div>
              {/* TAB 1 */}
              <div className={`tab-content ${tab===1?"active":""}`}>
                {/* ── Active macros display (from plan or default) ── */}
                <div className="psec">
                  <div className="psec-title" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span>Macros activos · {objLabel}</span>
                    {macroPlan&&<span className="plan-info-pill" style={{color:"#5a8a4a",background:"rgba(90,138,74,.1)",borderColor:"rgba(90,138,74,.3)"}}>✓ Plan personalizado</span>}
                  </div>
                  {(()=>{
                    const pG = macroPlan ? macroPlan.protG : resultado.proteinG;
                    const fG = macroPlan ? macroPlan.fatG   : resultado.fatG;
                    const cG = macroPlan ? macroPlan.carbG  : resultado.carbG;
                    if(cG<0) return <div className="error-box"><span className="error-icon">⚠️</span><div><div className="error-title">Distribución imposible</div><div className="error-msg">Reduce el déficit o la proteína.</div></div></div>;
                    return (
                      <div className="macros-grid">
                        {[{name:"Proteína",val:pG,color:"#d94f2b",kcal:pG*4},{name:"Grasa",val:fG,color:"#e8793a",kcal:fG*9},{name:"Carbohidrato",val:cG,color:"#3a6e9e",kcal:cG*4}]
                          .map(m=>(
                            <div className="macro-card" key={m.name}>
                              <div className="macro-val" style={{color:m.color}}>{m.val}g</div>
                              <div className="macro-name">{m.name}</div>
                              <div className="macro-kcal">{m.kcal} kcal</div>
                            </div>
                          ))}
                      </div>
                    );
                  })()}
                </div>
                {/* ── Meal distribution ── */}
                {(()=>{
                  const pG = macroPlan ? macroPlan.protG : resultado.proteinG;
                  const fG = macroPlan ? macroPlan.fatG   : resultado.fatG;
                  const cG = macroPlan ? macroPlan.carbG  : resultado.carbG;
                  return cG>=0 ? <div className="psec"><div className="psec-title">Distribución por comidas</div><MealPlan kcal={resultado.kcalObj} proteinG={pG} fatG={fG} carbG={cG}/></div> : null;
                })()}
                {/* ── Other targets ── */}
                <div className="psec">
                  <div className="psec-title">Otros objetivos</div>
                  <div className="xrow"><span className="xrow-lbl">💧 Agua</span><span className="xrow-val" style={{color:"#3a6e9e"}}>{resultado.agua} L</span></div>
                  <div className="xrow"><span className="xrow-lbl">🌾 Fibra mínima</span><span className="xrow-val" style={{color:"#5a8a4a"}}>{resultado.fibra} g</span></div>
                  <div className="xrow"><span className="xrow-lbl">🎯 Objetivo calórico</span><span className="xrow-val" style={{color:"var(--accent)"}}>{resultado.kcalObj.toLocaleString()} kcal</span></div>
                </div>
                {/* ── Macro plan customizer ── */}
                <div className="psec">
                  <div className="psec-title" style={{marginBottom:14}}>Personalizar plan de macros</div>
                  <MacroPlanCustomizer kcalObj={resultado.kcalObj} onSave={plan=>setMacroPlan(plan)}/>
                </div>
              </div>
              {/* TAB 2 */}
              <div className={`tab-content ${tab===2?"active":""}`}>
                {grasa&&Number(grasa)>0?(
                  <>
                    <div className="psec"><div className="psec-title">Composición corporal</div><DonutChart fatKg={+(resultado.peso*Number(grasa)/100).toFixed(1)} leanKg={+(resultado.peso*(1-Number(grasa)/100)).toFixed(1)}/></div>
                    <div className="psec">
                      <div className="psec-title">Viabilidad recomposición</div>
                      {recomp&&<div className="recomp-card" style={{color:recomp.viable?"#5a8a4a":"#8a6a50",background:recomp.viable?"rgba(90,138,74,.08)":"var(--bg-warm)",borderColor:recomp.viable?"rgba(90,138,74,.3)":"var(--border)"}}><strong>{recomp.viable?"✓ Recomp viable":"⊘ No óptima"}</strong>{recomp.msg}</div>}
                    </div>
                  </>
                ):(
                  <div className="psec" style={{textAlign:"center",padding:"28px"}}>
                    <div style={{fontSize:"2rem",marginBottom:10,opacity:.3}}>📊</div>
                    <p style={{fontSize:".82rem",color:"var(--text-muted)",lineHeight:1.7}}>Introduce tu % de grasa para ver la composición corporal.</p>
                  </div>
                )}
                <div className="psec">
                  <div className="psec-title">IMC</div>
                  <div className="proy-card">
                    {[{l:"Valor",v:resultado.imc,c:imcInfo(resultado.imc).color},{l:"Clasificación",v:imcInfo(resultado.imc).label,c:"var(--text)"},{l:"Rango habitual",v:"18.5 – 24.9",c:"var(--text-muted)"}].map(r=><div className="proy-row" key={r.l}><span className="proy-lbl">{r.l}</span><span className="proy-val" style={{color:r.c}}>{r.v}</span></div>)}
                  </div>
                  <p style={{fontSize:".7rem",color:"var(--text-muted)",lineHeight:1.6,marginTop:9,background:"var(--bg-warm)",padding:"9px 13px",borderRadius:"var(--r)",border:"1px solid var(--border)"}}>💡 {imcInfo(resultado.imc).note}</p>
                </div>
              </div>
              {/* TAB 3 */}
              <div className={`tab-content ${tab===3?"active":""}`}>
                {proy?(
                  <div className="psec">
                    <div className="psec-title">Proyección de progreso</div>
                    <div className="proy-card">
                      <div className="proy-row"><span className="proy-lbl">Ritmo semanal</span><span className="proy-val" style={{color:"var(--accent)"}}>{proy.kgSem} kg/sem</span></div>
                      <div className="proy-row"><span className="proy-lbl">Estimación mensual</span><span className="proy-val">{(Number(proy.kgSem)*4.33).toFixed(1)} kg/mes</span></div>
                      {proy.semanas&&<>
                        <div className="proy-row"><span className="proy-lbl">Peso objetivo</span><span className="proy-val">{pesoObj} kg</span></div>
                        <div className="proy-row"><span className="proy-lbl">Tiempo estimado</span><span className="proy-val" style={{color:"var(--accent)"}}>{proy.semanas} semanas</span></div>
                        <div className="proy-row"><span className="proy-lbl">Equivale a</span><span className="proy-val">{(proy.semanas/4.33).toFixed(1)} meses</span></div>
                      </>}
                    </div>
                    {!pesoObj&&<p style={{fontSize:".7rem",color:"var(--text-muted)",fontStyle:"italic",marginTop:5}}>Introduce un peso objetivo para el tiempo estimado.</p>}
                  </div>
                ):(
                  <div className="psec" style={{textAlign:"center",padding:"20px"}}>
                    <p style={{fontSize:".82rem",color:"var(--text-muted)"}}>Disponible con objetivo de déficit calórico.</p>
                  </div>
                )}
                <div className="psec">
                  <div className="psec-title">Guardar cálculo</div>
                  <button className={`save-btn ${savedOk?"saved":""}`} onClick={guardar}>{savedOk?"✓ Guardado":"Guardar este cálculo"}</button>
                  <p style={{fontSize:".67rem",color:"var(--text-dim)",marginTop:7,lineHeight:1.6,fontStyle:"italic"}}>Guarda para seguir la evolución de tu TDEE.</p>
                </div>
              </div>
              <p className="note">Estimación ±10–15%. El IMC es una referencia estadística poblacional. No sustituye consulta con dietista-nutricionista colegiado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Historial */}
      <div className="historial-section">
        <div className="hist-header">
          <h2 className="hist-title">Historial de <em>cálculos</em></h2>
          {historial.length>0&&<button className="hist-clear" onClick={limpiarHistorial}>Limpiar</button>}
        </div>
        {historial.length===0?(
          <p className="hist-empty">Sin cálculos guardados. Usa "Guardar este cálculo" en la pestaña Proyección.</p>
        ):(
          <div className="hist-grid">
            {historial.map((h,i)=>(
              <div className="hist-card" key={i}>
                <div className="hist-date">{h.date}</div>
                <div className="hist-tdee">{h.tdee.toLocaleString()}</div>
                <div className="hist-sub" style={{marginBottom:3}}>kcal/día mantenimiento</div>
                <div className="hist-sub">Objetivo: {h.kcalObj.toLocaleString()} kcal</div>
                <div className="hist-sub">Peso: {h.peso} kg · IMC: {h.imc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="page-footer">
        <p>Mifflin-St Jeor (1990) · Katch-McArdle · Ainsworth MET Compendium · IoM DRI</p>
        <p>No sustituye consulta con dietista-nutricionista colegiado</p>
      </div>
    </>
  );
}


// ─── NUTRITION PAGE ──────────────────────────────────────────────────────────
const NUTR_KEY = "tdee_nutrition_v1";

const MEAL_DEFS = [
  { id:"breakfast", name:"Desayuno",    emoji:"☕" },
  { id:"midmorning",name:"Media mañana",emoji:"🍎" },
  { id:"lunch",     name:"Almuerzo",    emoji:"🍽️" },
  { id:"snack",     name:"Merienda",    emoji:"🫐" },
  { id:"dinner",    name:"Cena",        emoji:"🌙" },
];

const QUICK_FOODS_KEY = "tdee_quick_foods_v1";

function loadQuickFoods() {
  try { return JSON.parse(localStorage.getItem(QUICK_FOODS_KEY) || "[]"); } catch { return []; }
}
function saveQuickFoods(list) {
  try { localStorage.setItem(QUICK_FOODS_KEY, JSON.stringify(list)); } catch {}
}

const MACRO_COLORS = {
  p: "#d94f2b",
  f: "#e8793a",
  c: "#3a6e9e",
  rest: "var(--surface-2)",
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function loadNutrition() {
  try { return JSON.parse(localStorage.getItem(NUTR_KEY) || "{}"); } catch { return {}; }
}

function saveNutrition(data) {
  try { localStorage.setItem(NUTR_KEY, JSON.stringify(data)); } catch {}
}

// SVG donut ring component
function NutrDonut({ kcal, protG, fatG, carbG, goalKcal }) {
  const cx = 90, cy = 90, r = 72, sw = 13;
  const circ = 2 * Math.PI * r;
  const total = kcal || 0;
  const pKcal = protG * 4, fKcal = fatG * 9, cKcal = carbG * 4;
  const pct = (v) => total > 0 ? v / total : 0;

  // Build arc segments: protein, fat, carbs, rest
  const segs = [
    { val: pKcal, color: MACRO_COLORS.p  },
    { val: fKcal, color: MACRO_COLORS.f  },
    { val: cKcal, color: MACRO_COLORS.c  },
  ];
  const usedFrac = total > 0 ? Math.min(total / Math.max(goalKcal, 1), 1) : 0;

  let offset = 0;
  const arcs = segs.map(seg => {
    const frac = pct(seg.val) * usedFrac;
    const dash = frac * circ;
    const arc = { ...seg, dash, offset: offset * circ };
    offset += frac;
    return arc;
  });

  const pctLabel = Math.round(usedFrac * 100);

  return (
    <svg className="nutr-donut-svg" viewBox="0 0 180 180">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={sw}/>
      {/* Segments */}
      {arcs.map((arc, i) => (
        <circle key={i} className="nutr-ring"
          cx={cx} cy={cy} r={r} fill="none"
          stroke={arc.color} strokeWidth={sw}
          strokeDasharray={`${arc.dash} ${circ}`}
          strokeDashoffset={-arc.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      {/* Center text */}
      <text x={cx} y={cy-14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--text-muted)">CONSUMIDO</text>
      <text x={cx} y={cy+8} textAnchor="middle" fontFamily="var(--font-display)" fontSize="26" fill="var(--accent)">{total > 0 ? total.toLocaleString() : "0"}</text>
      <text x={cx} y={cy+24} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-muted)">kcal</text>
      <text x={cx} y={cy+42} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={pctLabel >= 100 ? "#d94f2b" : "#5a8a4a"} fontWeight="500">{pctLabel}% del objetivo</text>
    </svg>
  );
}

function NutritionPage() {
  const today = todayStr();
  const [allData, setAllData] = useState(loadNutrition);
  const [openMeal, setOpenMeal] = useState("lunch");
  const [drafts, setDrafts] = useState({});
  const [quickFoods, setQuickFoods] = useState(loadQuickFoods);
  const [libOpen, setLibOpen] = useState(false);
  const [libDraft, setLibDraft] = useState({ name:"", qty:"100", kcal:"", p:"", f:"", fSat:"", c:"", cSug:"", fiber:"", salt:"", kcalManual:false });

  // Goal — from saved macro plan (if exists) or from history
  const [plan] = useState(() => loadPlan());
  const [goalKcal] = useState(() => {
    try {
      if (plan?.kcalObj) return plan.kcalObj;
      const hist = JSON.parse(localStorage.getItem("tdee_hist") || "[]");
      return hist[0]?.kcalObj || 2000;
    } catch { return 2000; }
  });
  const [goalP] = useState(() => {
    if (plan?.protG) return plan.protG;
    try {
      const hist = JSON.parse(localStorage.getItem("tdee_hist") || "[]");
      if (!hist[0]) return 150;
      return Math.round(hist[0].peso * 2) || 150;
    } catch { return 150; }
  });

  const todayData = allData[today] || {};
  // todayData[mealId] = [{name, kcal, p, f, c, grams?}]

  const getMealFoods = (mealId) => todayData[mealId] || [];

  const totals = MEAL_DEFS.reduce((acc, m) => {
    getMealFoods(m.id).forEach(food => {
      acc.kcal += food.kcal || 0;
      acc.p    += food.p    || 0;
      acc.f    += food.f    || 0;
      acc.c    += food.c    || 0;
    });
    return acc;
  }, { kcal:0, p:0, f:0, c:0 });

  const updateDraft = (mealId, field, value) => {
    setDrafts(d => ({ ...d, [mealId]: { ...(d[mealId]||{}), [field]: value } }));
  };

  const updateLib = (field, val) => {
    setLibDraft(d => {
      const next = { ...d, [field]: val };
      // If user manually edits kcal, flag it so auto-calc stops
      if (field === "kcal") { next.kcalManual = val !== ""; return next; }
      // Auto-calculate kcal from p, f, c whenever any of them change (and kcal not locked)
      if (!next.kcalManual && ["p","f","c"].includes(field)) {
        const p = parseFloat(next.p) || 0;
        const f = parseFloat(next.f) || 0;
        const c = parseFloat(next.c) || 0;
        const auto = Math.round(p * 4 + f * 9 + c * 4);
        next.kcal = auto > 0 ? String(auto) : "";
      }
      return next;
    });
  };

  const addToLibrary = () => {
    const name = libDraft.name.trim();
    if (!name) return;
    const qty   = parseFloat(libDraft.qty)   || 100;
    const kcal  = parseFloat(libDraft.kcal)  || 0;
    const p     = parseFloat(libDraft.p)     || 0;
    const f     = parseFloat(libDraft.f)     || 0;
    const fSat  = parseFloat(libDraft.fSat)  || 0;
    const c     = parseFloat(libDraft.c)     || 0;
    const cSug  = parseFloat(libDraft.cSug)  || 0;
    const fiber = parseFloat(libDraft.fiber) || 0;
    const salt  = parseFloat(libDraft.salt)  || 0;
    const entry = { id: Date.now(), name: qty !== 100 ? `${name} ${qty}g` : name, qty, kcal, p, f, fSat, c, cSug, fiber, salt };
    const updated = [entry, ...quickFoods];
    setQuickFoods(updated);
    saveQuickFoods(updated);
    setLibDraft({ name:"", qty:"100", kcal:"", p:"", f:"", fSat:"", c:"", cSug:"", fiber:"", salt:"", kcalManual:false });
  };

  const removeFromLibrary = (id) => {
    const updated = quickFoods.filter(f => f.id !== id);
    setQuickFoods(updated);
    saveQuickFoods(updated);
  };

  const addFood = (mealId, food) => {
    const updated = {
      ...allData,
      [today]: {
        ...todayData,
        [mealId]: [...getMealFoods(mealId), { ...food, id: Date.now() }],
      }
    };
    setAllData(updated);
    saveNutrition(updated);
    setDrafts(d => ({ ...d, [mealId]: {} }));
  };

  const addCustomFood = (mealId) => {
    const d = drafts[mealId] || {};
    const name = (d.name || "").trim();
    if (!name) return;
    const kcal = parseFloat(d.kcal) || 0;
    const p    = parseFloat(d.p)    || 0;
    const f    = parseFloat(d.f)    || 0;
    const c    = parseFloat(d.c)    || 0;
    const grams = d.grams ? parseFloat(d.grams) : undefined;
    addFood(mealId, { name: grams ? `${name} ${grams}g` : name, kcal, p, f, c });
  };

  const removeFood = (mealId, foodId) => {
    const updated = {
      ...allData,
      [today]: {
        ...todayData,
        [mealId]: getMealFoods(mealId).filter(f => f.id !== foodId),
      }
    };
    setAllData(updated);
    saveNutrition(updated);
  };

  const goalF = plan?.fatG  ?? Math.round(goalKcal * 0.28 / 9);
  const goalC = plan?.carbG ?? Math.round((goalKcal - goalP*4 - goalF*9) / 4);

  const todayFormatted = new Date().toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" });

  return (
    <div className="nutrition-page">
      <div className="page-header">
        <h1>Mi <em>Nutrición</em></h1>
        <p>Diario de comidas · registro diario de calorías y macronutrientes</p>
      </div>

      {/* ── Plan banner ── */}
      {plan && (
        <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <span style={{fontSize:"1.1rem"}}>{{"deficit":"🔥","recomp":"⚖️","superavit":"💪","lean_bulk":"🎯"}[plan.strategy]||"🎯"}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:".72rem",fontWeight:500,color:"var(--text)",marginBottom:2}}>
              Plan activo: <span style={{color:"var(--accent)"}}>{{"deficit":"Déficit","recomp":"Recomposición","superavit":"Superávit","lean_bulk":"Lean Bulk"}[plan.strategy]||plan.strategy}</span>
            </div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:".62rem",color:"var(--text-muted)"}}>
              {plan.kcalObj.toLocaleString()} kcal · P {plan.protG}g ({plan.pPct}%) · G {plan.fatG}g ({plan.fPct}%) · C {plan.carbG}g ({plan.cPct}%)
            </div>
          </div>
          <span style={{fontFamily:"var(--font-mono)",fontSize:".58rem",color:"var(--text-dim)"}}>Edita en Mi Calculadora → Nutrición</span>
        </div>
      )}

      <div className="nutr-layout">

        {/* ── LEFT: meals ── */}
        <div>
          {/* ── Food library ── */}
          <div className="nutr-quick">
            <div className="nutr-quick-header">
              <div className="nutr-quick-title">Mis alimentos frecuentes</div>
              <button className="nutr-quick-open-btn" onClick={() => setLibOpen(v => !v)}>
                <span style={{fontSize:"1rem",lineHeight:1}}>{libOpen ? "−" : "+"}</span>
                {libOpen ? "Cerrar" : "Añadir alimento"}
              </button>
            </div>

            {/* Add-to-library form */}
            {libOpen && (
              <div className="food-lib-panel">
                <div className="food-lib-header">
                  <div className="food-lib-title">Nuevo <em>alimento</em></div>
                  <button className="food-lib-close" onClick={() => setLibOpen(false)}>×</button>
                </div>
                <div className="food-lib-form">
                  <div className="food-lib-form-title">Datos básicos</div>
                  <div className="food-lib-row">
                    <div className="food-lib-field" style={{flex:1}}>
                      <label>Nombre del alimento</label>
                      <input className="food-lib-input name-input" placeholder="Ej: Yogur griego 0%" value={libDraft.name} onChange={e=>updateLib("name",e.target.value)}/>
                    </div>
                    <div className="food-lib-field">
                      <label>Cantidad (g/ml)</label>
                      <input className="food-lib-input qty-input" type="number" min="1" placeholder="100" value={libDraft.qty} onChange={e=>updateLib("qty",e.target.value)}/>
                    </div>
                    <div className="food-lib-field">
                      <label>Calorías (kcal) <span style={{color:"var(--text-dim)",fontSize:".55rem"}}>{libDraft.kcalManual?"manual":"auto"}</span></label>
                      <input className="food-lib-input num-input" type="number" min="0" placeholder={libDraft.kcalManual?"":"auto"} value={libDraft.kcal} onChange={e=>updateLib("kcal",e.target.value)} title="Se calcula sola a partir de P·4 + G·9 + C·4. Edítala para fijar un valor manual."/>
                    </div>
                  </div>

                  <div className="food-lib-section-lbl">Macronutrientes principales</div>
                  <div className="food-lib-row">
                    {[
                      {key:"p",    label:"Proteínas (g)"},
                      {key:"f",    label:"Grasas tot. (g)"},
                      {key:"fSat", label:"— Saturadas (g)"},
                      {key:"c",    label:"Carbohidratos (g)"},
                      {key:"cSug", label:"— Azúcares (g)"},
                    ].map(field => (
                      <div key={field.key} className="food-lib-field">
                        <label>{field.label}</label>
                        <input className="food-lib-input num-input" type="number" min="0" step="0.1" placeholder="0"
                          value={libDraft[field.key]} onChange={e=>updateLib(field.key,e.target.value)}/>
                      </div>
                    ))}
                  </div>

                  <div className="food-lib-section-lbl">Otros nutrientes</div>
                  <div className="food-lib-row">
                    {[
                      {key:"fiber", label:"Fibra (g)"},
                      {key:"salt",  label:"Sal (g)"},
                    ].map(field => (
                      <div key={field.key} className="food-lib-field">
                        <label>{field.label}</label>
                        <input className="food-lib-input num-input" type="number" min="0" step="0.1" placeholder="0"
                          value={libDraft[field.key]} onChange={e=>updateLib(field.key,e.target.value)}/>
                      </div>
                    ))}
                    <div className="food-lib-field" style={{alignSelf:"flex-end"}}>
                      <button className="food-lib-add-btn" onClick={addToLibrary}>+ Guardar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Library list */}
            {quickFoods.length === 0 ? (
              <div className="food-lib-empty">Tu biblioteca está vacía. Pulsa «+ Añadir alimento» para crear tu primer alimento frecuente.</div>
            ) : (
              <div className="food-lib-list">
                {quickFoods.map(qf => (
                  <div key={qf.id} className="food-lib-item">
                    <div style={{flex:1,minWidth:0}}>
                      <div className="food-lib-item-name">{qf.name}</div>
                      <div className="food-lib-item-macros">
                        P{qf.p}g · G{qf.f}g{qf.fSat>0?` (sat${qf.fSat}g)`:""} · C{qf.c}g{qf.cSug>0?` (az${qf.cSug}g)`:""}
                        {qf.fiber>0?` · Fib${qf.fiber}g`:""}
                        {qf.salt>0?` · Sal${qf.salt}g`:""}
                      </div>
                    </div>
                    <span className="food-lib-item-kcal">{qf.kcal} kcal</span>
                    <button className="food-lib-item-use" onClick={() => addFood(openMeal, qf)}>+ Añadir</button>
                    <button className="food-lib-item-del" onClick={() => removeFromLibrary(qf.id)} title="Eliminar de biblioteca">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meals */}
          <div className="nutr-meals">
            {MEAL_DEFS.map(meal => {
              const foods = getMealFoods(meal.id);
              const mKcal = foods.reduce((s,f) => s + (f.kcal||0), 0);
              const isOpen = openMeal === meal.id;
              const draft  = drafts[meal.id] || {};

              return (
                <div key={meal.id} className="nutr-meal-card">
                  <div className="nutr-meal-header" onClick={() => setOpenMeal(isOpen ? null : meal.id)}>
                    <div className="nutr-meal-title">
                      <span className="nutr-meal-emoji">{meal.emoji}</span>
                      <span className="nutr-meal-name"><em>{meal.name}</em></span>
                      {foods.length > 0 && <span style={{fontFamily:"var(--font-mono)",fontSize:".62rem",color:"var(--text-dim)"}}>· {foods.length} alimento{foods.length>1?"s":""}</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span className="nutr-meal-kcal">{mKcal > 0 ? `${Math.round(mKcal)} kcal` : ""}</span>
                      <span style={{fontFamily:"var(--font-mono)",fontSize:".8rem",color:"var(--text-dim)",transition:"transform .2s",display:"inline-block",transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
                    </div>
                  </div>

                  {isOpen && (
                    <>
                      {foods.length === 0 ? (
                        <div className="nutr-meal-empty">Sin alimentos registrados aún.</div>
                      ) : (
                        <div className="nutr-food-list">
                          {foods.map(food => (
                            <div key={food.id} className="nutr-food-item">
                              <span className="nutr-food-name">{food.name}</span>
                              <span className="nutr-food-macros">P{Math.round(food.p)}·G{Math.round(food.f)}·C{Math.round(food.c)}</span>
                              <span className="nutr-food-kcal">{Math.round(food.kcal)} kcal</span>
                              <button className="nutr-food-del" onClick={() => removeFood(meal.id, food.id)} title="Eliminar">×</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add food form */}
                      <div className="nutr-add-row">
                        <div className="nutr-add-form">
                          <div className="nutr-add-field" style={{flex:1,minWidth:120}}>
                            <label>Alimento</label>
                            <input className="nutr-add-input wide" placeholder="Ej: Yogur griego" value={draft.name||""} onChange={e => updateDraft(meal.id,"name",e.target.value)}
                              onKeyDown={e => e.key==="Enter" && addCustomFood(meal.id)}/>
                          </div>
                          <div className="nutr-add-field">
                            <label>kcal</label>
                            <input className="nutr-add-input narrow" type="number" min="0" placeholder="150" value={draft.kcal||""} onChange={e => updateDraft(meal.id,"kcal",e.target.value)}/>
                          </div>
                          <div className="nutr-add-field">
                            <label>P(g)</label>
                            <input className="nutr-add-input narrow" type="number" min="0" placeholder="12" value={draft.p||""} onChange={e => updateDraft(meal.id,"p",e.target.value)}/>
                          </div>
                          <div className="nutr-add-field">
                            <label>G(g)</label>
                            <input className="nutr-add-input narrow" type="number" min="0" placeholder="5" value={draft.f||""} onChange={e => updateDraft(meal.id,"f",e.target.value)}/>
                          </div>
                          <div className="nutr-add-field">
                            <label>C(g)</label>
                            <input className="nutr-add-input narrow" type="number" min="0" placeholder="8" value={draft.c||""} onChange={e => updateDraft(meal.id,"c",e.target.value)}/>
                          </div>
                          <div className="nutr-add-field">
                            <label>&nbsp;</label>
                            <button className="nutr-add-btn" onClick={() => addCustomFood(meal.id)}>+ Añadir</button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: summary donut ── */}
        <div className="nutr-summary-card">
          <div className="nutr-summary-header">
            <div className="nutr-summary-title">Resumen del día</div>
            <div className="nutr-date-badge"><em>{todayFormatted.charAt(0).toUpperCase()+todayFormatted.slice(1)}</em></div>
          </div>

          <div className="nutr-donut-wrap">
            <NutrDonut kcal={Math.round(totals.kcal)} protG={totals.p} fatG={totals.f} carbG={totals.c} goalKcal={goalKcal}/>

            <div className="nutr-macro-bars">
              {[
                { label:"Proteína",   key:"p", val:totals.p, goal:goalP,  color:MACRO_COLORS.p, unit:"g" },
                { label:"Grasa",      key:"f", val:totals.f, goal:goalF,  color:MACRO_COLORS.f, unit:"g" },
                { label:"Carbohidrato",key:"c",val:totals.c, goal:goalC,  color:MACRO_COLORS.c, unit:"g" },
              ].map(m => {
                const pct = Math.min((m.val / Math.max(m.goal,1)) * 100, 100);
                return (
                  <div key={m.key} className="nutr-bar-row">
                    <div className="nutr-bar-top">
                      <div className="nutr-bar-lbl">
                        <div className="nutr-bar-lbl-dot" style={{background:m.color}}/>
                        {m.label}
                      </div>
                      <div className="nutr-bar-vals">
                        <strong>{Math.round(m.val)}</strong> / {m.goal}{m.unit}
                      </div>
                    </div>
                    <div className="nutr-bar-track">
                      <div className="nutr-bar-fill" style={{width:`${pct}%`,background:m.color}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="nutr-kcal-total">
            <div className="nutr-kcal-num">{Math.round(totals.kcal).toLocaleString()}</div>
            <div className="nutr-kcal-lbl">de {goalKcal.toLocaleString()} kcal objetivo</div>
            <div style={{marginTop:10,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              {Math.round(goalKcal - totals.kcal) > 0
                ? <span style={{fontFamily:"var(--font-mono)",fontSize:".68rem",color:"var(--green)",background:"var(--green-dim)",padding:"3px 10px",borderRadius:100}}>
                    Restan {Math.round(goalKcal - totals.kcal)} kcal
                  </span>
                : <span style={{fontFamily:"var(--font-mono)",fontSize:".68rem",color:"var(--accent)",background:"var(--accent-dim)",padding:"3px 10px",borderRadius:100}}>
                    Objetivo alcanzado ✓
                  </span>
              }
            </div>
          </div>

          {/* Per-meal breakdown */}
          <div style={{borderTop:"1px solid var(--border)",padding:"14px 22px 18px"}}>
            <div style={{fontFamily:"var(--font-mono)",fontSize:".55rem",letterSpacing:".15em",color:"var(--text-muted)",textTransform:"uppercase",marginBottom:10}}>Por comida</div>
            {MEAL_DEFS.map(meal => {
              const foods = getMealFoods(meal.id);
              const mKcal = Math.round(foods.reduce((s,f)=>s+(f.kcal||0),0));
              if (mKcal === 0 && foods.length === 0) return null;
              const pct = Math.round((mKcal / Math.max(totals.kcal,1))*100);
              return (
                <div key={meal.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                  <span style={{fontSize:".85rem",width:20,textAlign:"center",flexShrink:0}}>{meal.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{height:4,background:"var(--surface-2)",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:"var(--accent)",borderRadius:2,transition:"width .5s"}}/>
                    </div>
                  </div>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:".65rem",color:"var(--accent)",minWidth:52,textAlign:"right"}}>{mKcal > 0 ? `${mKcal} kcal` : "—"}</span>
                </div>
              );
            }).filter(Boolean)}
            {totals.kcal === 0 && <p style={{fontSize:".72rem",color:"var(--text-dim)",fontStyle:"italic"}}>Empieza añadiendo alimentos a cualquier comida.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("calculator");
  const [darkMode, setDarkMode] = useState(()=>{ try{return localStorage.getItem("tdee_dark")==="1";}catch{return false;} });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoSaveTs, setAutoSaveTs] = useState(null);

  useEffect(()=>{
    document.body.classList.toggle("dark", darkMode);
    try{localStorage.setItem("tdee_dark", darkMode?"1":"0");}catch{}
  }, [darkMode]);

  useEffect(()=>{
    document.body.classList.toggle("sidebar-open", sidebarOpen);
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  useEffect(()=>{
    const interval = setInterval(()=>{
      setAutoSaveTs(new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}));
    }, 30000);
    setAutoSaveTs(new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}));
    return ()=>clearInterval(interval);
  },[]);

  const navigate = (p) => { setPage(p); setSidebarOpen(false); window.scrollTo(0,0); };

  const NAV = [
    {
      section: "Principal",
      items: [
        {id:"calculator", icon:"🧮", label:"Mi Calculadora"},
        {id:"calendar",   icon:"📅", label:"Mi Calendario"},
        {id:"nutrition",  icon:"🥗", label:"Mi Nutrición"},
      ]
    },
    {
      section: "Próximamente",
      items: [
        {id:"progress",  icon:"🏆", label:"Mi Progreso",    badge:"Soon"},
        {id:"profile",   icon:"👤", label:"Mi Perfil",      badge:"Soon"},
      ]
    },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">

        <button className="burger" onClick={()=>setSidebarOpen(v=>!v)}>
          <span/><span/><span/>
        </button>

        <div className={`sidebar-overlay ${sidebarOpen?"open":""}`} onClick={()=>setSidebarOpen(false)}/>

        <nav className={`sidebar ${sidebarOpen?"open":""}`}>
          <div className="sidebar-logo">
            <h2>Gasto <em>calórico</em></h2>
            <p>TDEE CALCULATOR v3.2</p>
          </div>

          <div className="sidebar-nav">
            {NAV.map(group=>(
              <div key={group.section}>
                <div className="nav-section-label">{group.section}</div>
                {group.items.map(item=>(
                  <button key={item.id}
                    className={`nav-item ${page===item.id?"active":""}`}
                    onClick={()=>item.badge?null:navigate(item.id)}
                    style={item.badge?{opacity:.55,cursor:"default"}:{}}>
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge&&<span className="nav-badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <button className="dark-toggle" onClick={()=>setDarkMode(d=>!d)}>
              <span>{darkMode?"☀️":"🌙"}</span>
              <span>{darkMode?"Modo claro":"Modo oscuro"}</span>
            </button>
            {autoSaveTs&&<div className="autosave-badge">✓ Guardado automático {autoSaveTs}</div>}
          </div>
        </nav>

        <div className="main-content">
          {page==="calculator" && <CalculatorPage/>}
          {page==="calendar"   && <CalendarPage/>}
          {page==="nutrition"  && <NutritionPage/>}
          {page==="progress"   && (
            <div className="page-header" style={{borderBottom:"none"}}>
              <h1>Mi <em>Progreso</em></h1>
              <p style={{marginTop:20,padding:"18px 22px",background:"var(--accent-dim)",borderRadius:"var(--r)",border:"1px solid rgba(217,79,43,.2)",fontSize:".85rem",color:"var(--text-muted)"}}>🚀 Esta sección está en desarrollo. Pronto podrás ver tus niveles, rachas y estadísticas de progreso.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}