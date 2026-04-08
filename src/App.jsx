import { useState, useEffect, useRef, useMemo } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&display=swap');`;

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
  3: [{name:"Desayuno",pct:.30},{name:"Almuerzo",pct:.40},{name:"Cena",pct:.30}],
  4: [{name:"Desayuno",pct:.25},{name:"Almuerzo",pct:.35},{name:"Merienda",pct:.15},{name:"Cena",pct:.25}],
  5: [{name:"Desayuno",pct:.20},{name:"Media mañana",pct:.12},{name:"Almuerzo",pct:.35},{name:"Merienda",pct:.13},{name:"Cena",pct:.20}],
};

const FORM_KEY  = "tdee_form_v1";
const HIST_KEY  = "tdee_hist";
const PLAN_KEY  = "tdee_macro_plan_v1";
const CAL_KEY   = "tdee_calendar_v1";
const PESO_KEY  = "tdee_peso_v1";
const CHECKIN_KEY  = "tdee_checkins_v1";
const ADJUST_KEY   = "tdee_adjustments_v1";
const PROFILE_KEY  = "tdee_profile_v1";

const MONTHS    = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WEEKDAYS  = ["L","M","X","J","V","S","D"];

const CATS = [
  {key:"training",  name:"Entrenamiento", desc:"¿Has entrenado hoy?",         color:"#d94f2b", bg:"rgba(217,79,43,.12)"},
  {key:"diet",      name:"Dieta",         desc:"¿Has cumplido tu plan nutricional?", color:"#5a8a4a", bg:"rgba(90,138,74,.12)"},
  {key:"sleep",     name:"Sueño",         desc:"¿Has dormido 7-9 horas?",     color:"#3a6e9e", bg:"rgba(58,110,158,.12)"},
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
    --bg: #FFEDE1; --bg-warm: #ede6d6; --surface: #F8F2EE; --surface-2: #ede6d6;
    --border: rgba(180,120,60,0.15);
    --accent: #E53D00; --accent-2: #E53D00;
    --accent-dim: rgba(217,79,43,0.1); --accent-glow: rgba(217,79,43,0.2);
    --text: #1e1208; --text-muted: #8a6a50; --text-dim: #c4a882;
    --green: #5a8a4a; --green-dim: rgba(90,138,74,0.1);
    --blue: #0FA3B1; --blue-dim: rgba(15,163,177,0.1);
    --yellow: #c8860a;
    --purple: #7a5a9e;
    --font-display: 'Roboto', sans-serif;
    --font-body: 'Roboto', sans-serif;
    --font-mono: 'Roboto', monospace;
    --r: 10px; --r-lg: 16px;
    --shadow-btn: 0 2px 8px rgba(180,80,20,0.18);
    --tr: all 0.12s cubic-bezier(0.34,1.2,0.64,1);
    --sidebar-w: 240px;
  }

  body.dark {
    --bg: #0d0d14; --bg-warm: #13131e; --surface: #17172a; --surface-2: #1e1e30;
    --border: rgba(60,110,210,0.2);
    --accent: #0FA3B1; --accent-2: #0FA3B1;
    --accent-dim: rgba(74,143,212,0.13); --accent-glow: rgba(74,143,212,0.28);
    --text: #e8e8f8; --text-muted: #7878a8; --text-dim: #44446a;
    --green: #3a8a6a; --green-dim: rgba(58,138,106,0.12);
    --blue: #0FA3B1; --blue-dim: rgba(15,163,177,0.12);
    --shadow-btn: 0 2px 12px rgba(30,60,160,0.28);
  }

  html { overflow-x: hidden; max-width: 100%; }
  body {
    background: var(--bg); color: var(--text); font-family: var(--font-body);
    min-height: 100vh; -webkit-font-smoothing: antialiased;
    overflow-x: hidden; transition: background .3s, color .3s;
    max-width: 100%; position: relative;
  }
  body.sidebar-open { overflow: hidden; }

  /* ── APP SHELL ── */
  .app-shell { display: flex; min-height: 100vh; overflow-x: hidden; max-width: 100%; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w); flex-shrink: 0;
    background: var(--surface); border-right: 1.5px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
    transition: transform .3s ease;
    will-change: transform;
  }

  .sidebar-logo {
    padding: 28px 24px 20px;
    border-bottom: 1px solid var(--border);
  }
  .sidebar-logo h2 {
    font-family: var(--font-display); font-size: 1.15rem; line-height: 1.15;
  }
  .sidebar-logo h2 em { font-style: italic; color: var(--accent); }
  .sidebar-logo p { font-size: .62rem; color: var(--text-dim); font-family: var(--font-mono); margin-top: 4px; letter-spacing: .06em; display:flex; align-items:center; gap:6px; }
  .sidebar-v-badge { background: var(--accent-dim); color: var(--accent); border-radius: 4px; padding: 1px 5px; font-size: .52rem; font-family: var(--font-mono); letter-spacing: .04em; border: 1px solid var(--accent-dim); }

  .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }

  .nav-section-label {
    font-family: var(--font-mono); font-size: .55rem; letter-spacing: .18em;
    color: var(--text-dim); text-transform: uppercase; padding: 10px 12px 6px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 0px;
    padding: 10px 14px; border-radius: var(--r); cursor: pointer;
    border: none; background: transparent; text-align: left;
    font-family: var(--font-body); font-size: .82rem; color: var(--text-muted);
    transition: var(--tr); width: 100%;
  }
  .nav-item:hover { background: var(--bg-warm); color: var(--text); }
  .nav-item:active { transform: scale(0.97); }
  .nav-item.active { background: var(--accent-dim); color: var(--accent); font-weight: 500; box-shadow: inset 3px 0 0 var(--accent); }
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

  @keyframes savePulse { 0%,100%{opacity:.6} 50%{opacity:1} }
  .autosave-badge {
    font-family: var(--font-mono); font-size: .55rem; color: var(--green);
    background: var(--green-dim); border: 1px solid rgba(90,138,74,.2);
    padding: 3px 9px; border-radius: 100px; letter-spacing: .06em; text-align: center;
    animation: savePulse 3s ease-in-out infinite;
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
    border-bottom: none; margin-bottom: 52px;
    position: relative;
  }
  .page-header::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,var(--accent),var(--accent-2),transparent); border-radius:2px; }
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
    position: relative; overflow: hidden;
  }
  .cta::after { content:''; position:absolute; inset:0; background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.18) 50%,transparent 60%); transform:translateX(-100%); transition:transform .4s ease; }
  .cta:hover::after { transform:translateX(100%); }
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
 .slider-mark { position: absolute; bottom: 0; transform: translateX(-50%); font-family: var(--font-mono); font-size: .57rem; color: var(--text); white-space: nowrap; }
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
  .tdee-number { font-family: var(--font-mono); font-size: 3.4rem; color: var(--accent); line-height: 1; }
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
  .cal-stat { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); padding: 14px 16px; text-align: center; transition: var(--tr); }
  .cal-stat:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 6px 16px var(--accent-glow); }
  .cal-stat-val { font-family: var(--font-display); font-size: 1.8rem; line-height: 1; margin-bottom: 3px; }
  .cal-stat-lbl { font-family: var(--font-mono); font-size: .58rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; }

  /* ── MOBILE BURGER ── */
  .burger { display: none; position: fixed; top: 14px; left: 14px; z-index: 200; width: 40px; height: 40px; border-radius: var(--r); border: 1.5px solid var(--border); background: var(--surface); cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 5px; transition: opacity .2s, transform .2s; }
  body.sidebar-open .burger { opacity: 0; pointer-events: none; transform: scale(0.85); }
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

  /* ── STREAK TOAST ── */
  .streak-toast {
    position: fixed; bottom: 32px; right: 32px; z-index: 500;
    background: var(--surface); border: 1.5px solid var(--accent);
    border-radius: var(--r-lg); padding: 18px 22px;
    box-shadow: 0 8px 40px var(--accent-glow), 0 2px 12px rgba(0,0,0,.15);
    display: flex; align-items: center; gap: 14px; max-width: 320px;
    animation: toastIn .35s cubic-bezier(.34,1.4,.64,1);
  }
  @keyframes toastIn { from{opacity:0;transform:translateY(20px) scale(.92)} to{opacity:1;transform:translateY(0) scale(1)} }
  .toast-out { animation: toastOut .25s ease forwards; }
  @keyframes toastOut { to{opacity:0;transform:translateY(12px) scale(.95)} }
  .toast-icon { font-size: 2rem; flex-shrink: 0; }
  .toast-body strong { display: block; font-size: .88rem; color: var(--accent); margin-bottom: 2px; }
  .toast-body p { font-size: .75rem; color: var(--text-muted); line-height: 1.45; }
  .toast-close { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 1rem; padding: 2px 4px; border-radius: 4px; transition: var(--tr); flex-shrink: 0; align-self: flex-start; }
  .toast-close:hover { color: var(--accent); background: var(--accent-dim); }

  /* ── TODAY BANNER ── */
  .today-banner {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: var(--r-lg); padding: 14px 20px;
    margin-bottom: 32px; display: flex; align-items: center;
    gap: 18px; flex-wrap: wrap;
  }
  .today-banner-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px; }
  .today-banner-streak { font-mono: var(--font-mono); font-size: 2.8rem; line-height: 1; color: #E53D00; flex-shrink: 0; }
  .today-banner-info strong { display: block; font-size: .82rem; color: var(--text); margin-bottom: 1px; }
  .today-banner-info span { font-size: .72rem; color: var(--text-muted); font-family: var(--font-mono); }
  .today-banner-cats { display: flex; gap: 7px; flex-wrap: wrap; }
  .today-cat-pill {
    display: flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 100px; font-size: .68rem;
    font-family: var(--font-mono); border: 1.5px solid; transition: var(--tr);
    cursor: pointer;
  }
  .today-banner-cta { font-family: var(--font-mono); font-size: .65rem; color: var(--accent); background: var(--accent-dim); border: 1px solid var(--accent-dim); border-radius: 6px; padding: 5px 12px; cursor: pointer; white-space: nowrap; transition: var(--tr); }
  .today-banner-cta:hover { background: var(--accent); color: #faf7f2; }

  /* ── MI PESO PAGE ── */
  .peso-page { padding-bottom: 80px; }
  .peso-layout { display: grid; grid-template-columns: 1fr 300px; gap: 36px; align-items: start; }
  .peso-form { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 22px; margin-bottom: 24px; }
  .peso-form-title { font-family: var(--font-mono); font-size: .58rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }
  .peso-form-row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
  .peso-form-field { display: flex; flex-direction: column; gap: 5px; }
  .peso-form-field label { font-size: .68rem; color: var(--text-muted); font-family: var(--font-mono); }
  .peso-form-input { background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r); color: var(--text); font-family: var(--font-mono); font-size: .9rem; padding: 8px 12px; outline: none; transition: border-color .2s, box-shadow .2s; }
  .peso-form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .peso-form-input.wide { width: 180px; }
  .peso-form-input.narrow { width: 88px; }
  .peso-add-btn { padding: 8px 16px; background: var(--accent); color: #faf7f2; border: none; border-radius: var(--r); font-family: var(--font-body); font-size: .8rem; font-weight: 500; cursor: pointer; transition: var(--tr); box-shadow: 0 2px 0 rgba(0,0,0,.12); white-space: nowrap; }
  .peso-add-btn:hover { background: var(--accent-2); transform: translateY(-1px); }
  .peso-add-btn:active { transform: translateY(1px); box-shadow: none; }
  .peso-log { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
  .peso-log-header { padding: 12px 18px; border-bottom: 1px solid var(--border); font-family: var(--font-mono); font-size: .58rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; display: flex; justify-content: space-between; align-items: center; }
  .peso-log-clear { font-family: var(--font-mono); font-size: .6rem; color: var(--text-dim); background: none; border: 1px solid var(--border); border-radius: 5px; padding: 3px 9px; cursor: pointer; transition: var(--tr); }
  .peso-log-clear:hover { color: var(--accent); border-color: var(--accent-dim); }
  .peso-entry { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-bottom: 1px solid var(--border); transition: background .15s; }
  .peso-entry:last-child { border-bottom: none; }
  .peso-entry:hover { background: var(--bg-warm); }
  .peso-entry-date { font-family: var(--font-mono); font-size: .65rem; color: var(--text-muted); min-width: 86px; }
  .peso-entry-val { font-family: var(--font-display); font-size: 1.15rem; color: var(--accent); line-height: 1; min-width: 60px; }
  .peso-entry-delta { font-family: var(--font-mono); font-size: .65rem; min-width: 44px; }
  .peso-entry-note { font-size: .72rem; color: var(--text-muted); flex: 1; font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .peso-entry-del { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: .85rem; padding: 2px 5px; border-radius: 4px; transition: var(--tr); flex-shrink: 0; }
  .peso-entry-del:hover { color: var(--accent); background: var(--accent-dim); }
  .peso-empty { padding: 28px 18px; text-align: center; font-size: .8rem; color: var(--text-dim); font-style: italic; }
  .peso-stats { display: flex; flex-direction: column; gap: 12px; }
  .peso-stat-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); padding: 14px 16px; }
  .peso-stat-lbl { font-family: var(--font-mono); font-size: .55rem; letter-spacing: .12em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; }
  .peso-stat-val { font-family: var(--font-display); font-size: 1.7rem; line-height: 1; }
  .peso-stat-sub { font-size: .68rem; color: var(--text-muted); margin-top: 3px; font-family: var(--font-mono); }
  .peso-chart-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 18px 20px; }
  .peso-chart-title { font-family: var(--font-mono); font-size: .58rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 14px; }
  .modal-notes { width: 100%; background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r); color: var(--text); font-family: var(--font-body); font-size: .8rem; padding: 9px 12px; outline: none; resize: none; transition: border-color .2s; margin-top: 10px; }
  .modal-notes:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .modal-notes::placeholder { color: var(--text-dim); }

  @media (max-width: 900px) {
    .peso-layout { grid-template-columns: 1fr; }
    .peso-stats { flex-direction: row; flex-wrap: wrap; }
    .peso-stat-card { flex: 1; min-width: 140px; }
  }
  @media (max-width: 480px) {
    .today-banner { flex-direction: column; align-items: flex-start; gap: 10px; }
    .streak-toast { left: 16px; right: 16px; bottom: 16px; }
    .peso-form-row { flex-direction: column; }
    .peso-form-input.wide, .peso-form-input.narrow { width: 100%; }
  }

  /* ── ANALYSIS PAGE ── */
  .analysis-page { padding-bottom: 80px; }
  .analysis-layout { display: grid; grid-template-columns: 1fr 320px; gap: 36px; align-items: start; }

  .coach-card {
    border-radius: var(--r-lg); padding: 24px 28px; margin-bottom: 28px;
    border: 1.5px solid; position: relative; overflow: hidden;
    animation: fadeUp .4s ease;
  }
  .coach-card-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 14px; }
  .coach-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
  .coach-meta strong { display: block; font-size: .9rem; margin-bottom: 2px; }
  .coach-meta span { font-family: var(--font-mono); font-size: .65rem; opacity: .7; }
  .coach-message { font-size: .84rem; line-height: 1.7; margin-bottom: 16px; }
  .coach-delta-pill { display: inline-flex; align-items: center; gap: 7px; padding: 7px 14px; border-radius: 100px; font-family: var(--font-mono); font-size: .78rem; font-weight: 500; border: 1.5px solid; margin-bottom: 14px; }
  .coach-reasoning { font-size: .74rem; line-height: 1.65; opacity: .8; }
  .coach-reasoning strong { font-weight: 500; }
  .coach-apply-btn {
    margin-top: 18px; padding: 11px 22px; border: none; border-radius: var(--r);
    font-family: var(--font-body); font-size: .84rem; font-weight: 500; cursor: pointer;
    transition: var(--tr); box-shadow: 0 3px 0 rgba(0,0,0,.15);
  }
  .coach-apply-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 0 rgba(0,0,0,.12); }
  .coach-apply-btn:active { transform: translateY(2px); box-shadow: none; }

  .insight-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .insight-chip { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 100px; font-family: var(--font-mono); font-size: .67rem; border: 1px solid; }

  .checkin-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 22px; margin-bottom: 24px; }
  .checkin-title { font-family: var(--font-mono); font-size: .58rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
  .checkin-already { font-size: .7rem; color: var(--green); font-family: var(--font-mono); }
  .checkin-row { margin-bottom: 16px; }
  .checkin-row-label { font-size: .76rem; color: var(--text-muted); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
  .checkin-row-label span { font-family: var(--font-mono); font-size: .7rem; color: var(--accent); }
  .rating-btns { display: flex; gap: 6px; }
  .rating-btn {
    flex: 1; padding: 9px 4px; border-radius: var(--r); border: 1.5px solid var(--border);
    background: var(--bg-warm); cursor: pointer; font-family: var(--font-mono);
    font-size: .72rem; color: var(--text-muted); text-align: center;
    transition: var(--tr); box-shadow: 0 2px 0 var(--border);
  }
  .rating-btn:hover { border-color: var(--accent); color: var(--accent); }
  .rating-btn:active { transform: translateY(2px); box-shadow: none; }
  .rating-btn.sel { border-color: var(--accent); background: var(--accent-dim); color: var(--accent); box-shadow: none; }
  .rating-labels { display: flex; justify-content: space-between; font-size: .6rem; color: var(--text-dim); font-family: var(--font-mono); margin-top: 4px; }
  .checkin-notes { width: 100%; background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r); color: var(--text); font-family: var(--font-body); font-size: .8rem; padding: 9px 12px; outline: none; resize: none; transition: border-color .2s; margin-top: 4px; }
  .checkin-notes:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .checkin-notes::placeholder { color: var(--text-dim); }
  .checkin-submit { width: 100%; padding: 12px; background: var(--accent); color: #faf7f2; border: none; border-radius: var(--r); font-family: var(--font-body); font-size: .85rem; font-weight: 500; cursor: pointer; transition: var(--tr); box-shadow: 0 3px 0 rgba(0,0,0,.15); margin-top: 4px; }
  .checkin-submit:hover { background: var(--accent-2); transform: translateY(-1px); }
  .checkin-submit:active { transform: translateY(2px); box-shadow: none; }
  .checkin-submit:disabled { opacity: .5; cursor: not-allowed; }

  .adj-history { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
  .adj-history-header { padding: 14px 18px; border-bottom: 1px solid var(--border); font-family: var(--font-mono); font-size: .58rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; display: flex; justify-content: space-between; align-items: center; }
  .adj-history-clear { font-family: var(--font-mono); font-size: .6rem; color: var(--text-dim); background: none; border: 1px solid var(--border); border-radius: 5px; padding: 3px 9px; cursor: pointer; transition: var(--tr); }
  .adj-history-clear:hover { color: var(--accent); border-color: var(--accent-dim); }
  .adj-entry { display: flex; align-items: flex-start; gap: 12px; padding: 13px 18px; border-bottom: 1px solid var(--border); transition: background .15s; }
  .adj-entry:last-child { border-bottom: none; }
  .adj-entry:hover { background: var(--bg-warm); }
  .adj-entry-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
  .adj-entry-body { flex: 1; }
  .adj-entry-date { font-family: var(--font-mono); font-size: .6rem; color: var(--text-dim); margin-bottom: 3px; }
  .adj-entry-kcal { font-family: var(--font-display); font-size: 1rem; margin-bottom: 2px; }
  .adj-entry-reason { font-size: .73rem; color: var(--text-muted); line-height: 1.5; }
  .adj-empty { padding: 24px 18px; text-align: center; font-size: .78rem; color: var(--text-dim); font-style: italic; }

  .analysis-stats { display: flex; flex-direction: column; gap: 12px; }
  .analysis-stat-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); padding: 14px 16px; }
  .analysis-stat-lbl { font-family: var(--font-mono); font-size: .55rem; letter-spacing: .12em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; }
  .analysis-stat-val { font-family: var(--font-display); font-size: 1.6rem; line-height: 1; margin-bottom: 2px; }
  .analysis-stat-sub { font-size: .67rem; color: var(--text-muted); font-family: var(--font-mono); }
  .weight-trend-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 18px; margin-bottom: 12px; }
  .weight-trend-title { font-family: var(--font-mono); font-size: .58rem; letter-spacing: .15em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 14px; }

  .analysis-empty { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 36px 28px; text-align: center; margin-bottom: 24px; }
  .analysis-empty-icon { font-size: 2.5rem; margin-bottom: 14px; opacity: .35; }
  .analysis-empty-title { font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 10px; }
  .analysis-empty-title em { font-style: italic; color: var(--accent); }
  .analysis-empty-body { font-size: .8rem; color: var(--text-muted); line-height: 1.7; max-width: 360px; margin: 0 auto 20px; }
  .analysis-empty-steps { display: flex; flex-direction: column; gap: 8px; max-width: 320px; margin: 0 auto; text-align: left; }
  .analysis-empty-step { display: flex; align-items: flex-start; gap: 12px; background: var(--bg-warm); border-radius: var(--r); padding: 10px 14px; border: 1px solid var(--border); }
  .analysis-empty-step-num { font-family: var(--font-mono); font-size: .65rem; color: var(--accent); font-weight: 500; flex-shrink: 0; width: 18px; }
  .analysis-empty-step-text { font-size: .76rem; color: var(--text-muted); line-height: 1.5; }

  @media (max-width: 900px) {
    .analysis-layout { grid-template-columns: 1fr; }
    .analysis-stats { flex-direction: row; flex-wrap: wrap; }
    .analysis-stat-card { flex: 1; min-width: 140px; }
  }
  @media (max-width: 480px) {
    .rating-btns { gap: 4px; }
    .rating-btn { font-size: .65rem; padding: 8px 2px; }
  }

  /* ── AUTH PAGE ── */
  .auth-shell {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); padding: 24px;
  }
  .auth-card {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: var(--r-lg); width: 100%; max-width: 400px;
    overflow: hidden; animation: fadeUp .35s ease;
    box-shadow: 0 8px 40px rgba(0,0,0,.08);
  }
  .auth-header {
    padding: 28px 28px 20px;
    background: linear-gradient(135deg, var(--surface) 0%, var(--bg-warm) 100%);
    border-bottom: 1px solid var(--border); text-align: center;
  }
  .auth-logo { font-family: var(--font-display); font-size: 1.4rem; margin-bottom: 4px; }
  .auth-logo em { font-style: italic; color: var(--accent); }
  .auth-logo-sub { font-family: var(--font-mono); font-size: .58rem; color: var(--text-dim); letter-spacing: .1em; }
  .auth-tabs { display: flex; border-bottom: 1px solid var(--border); }
  .auth-tab { flex: 1; padding: 12px; text-align: center; cursor: pointer; font-size: .78rem; font-family: var(--font-body); color: var(--text-muted); border: none; background: transparent; border-bottom: 2px solid transparent; transition: var(--tr); }
  .auth-tab.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--accent-dim); }
  .auth-body { padding: 24px 28px; }
  .auth-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .auth-field label { font-size: .72rem; color: var(--text-muted); font-family: var(--font-mono); }
  .auth-input { background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r); color: var(--text); font-family: var(--font-body); font-size: .88rem; padding: 10px 13px; outline: none; transition: border-color .2s, box-shadow .2s; width: 100%; }
  .auth-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .auth-input::placeholder { color: var(--text-dim); }
  .auth-input.error { border-color: #d94f2b; box-shadow: 0 0 0 3px rgba(217,79,43,.12); }
  .auth-btn { width: 100%; padding: 13px; background: var(--accent); color: #faf7f2; border: none; border-radius: var(--r); font-family: var(--font-body); font-size: .88rem; font-weight: 500; cursor: pointer; transition: var(--tr); box-shadow: var(--shadow-btn), 0 4px 0 rgba(0,0,0,.12); margin-top: 4px; }
  .auth-btn:hover { background: var(--accent-2); transform: translateY(-2px); }
  .auth-btn:active { transform: translateY(2px); box-shadow: none; }
  .auth-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
  .auth-error { background: rgba(217,79,43,.08); border: 1px solid rgba(217,79,43,.3); border-radius: var(--r); padding: 9px 13px; font-size: .75rem; color: #d94f2b; margin-bottom: 14px; display: flex; align-items: center; gap: 7px; }
  .auth-success { background: rgba(90,138,74,.08); border: 1px solid rgba(90,138,74,.3); border-radius: var(--r); padding: 9px 13px; font-size: .75rem; color: #5a8a4a; margin-bottom: 14px; display: flex; align-items: center; gap: 7px; }
  .auth-link { font-size: .72rem; color: var(--accent); cursor: pointer; background: none; border: none; text-decoration: underline; font-family: var(--font-body); padding: 0; }
  .auth-link:hover { color: var(--accent-2); }
  .auth-footer { text-align: center; margin-top: 14px; font-size: .72rem; color: var(--text-muted); }
  .auth-hint { font-size: .68rem; color: var(--text-dim); line-height: 1.5; margin-top: -10px; margin-bottom: 12px; }
  .pw-wrap { position: relative; }
  .pw-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-dim); font-size: .8rem; padding: 2px 5px; transition: color .15s; }
  .pw-toggle:hover { color: var(--accent); }

  /* ── PROFILE PAGE ── */
  .profile-page { padding-bottom: 80px; }
  .profile-layout { display: grid; grid-template-columns: 300px 1fr; gap: 28px; align-items: start; }
  .profile-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; position: sticky; top: 32px; }
  .profile-card-header { padding: 28px 22px 20px; text-align: center; background: linear-gradient(160deg, var(--surface) 0%, var(--bg-warm) 100%); border-bottom: 1px solid var(--border); }
  .profile-avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--accent-dim); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer; transition: var(--tr); margin: 0 auto 14px; }
  .profile-avatar:hover { transform: scale(1.06); box-shadow: 0 0 0 4px var(--accent-dim); }
  .profile-emoji-picker { display: grid; grid-template-columns: repeat(6,1fr); gap: 5px; padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg-warm); }
  .profile-emoji-btn { aspect-ratio:1; border-radius: var(--r); border: 1.5px solid transparent; background: var(--surface); cursor: pointer; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; transition: var(--tr); }
  .profile-emoji-btn:hover { border-color: var(--accent); transform: scale(1.1); }
  .profile-emoji-btn.active { border-color: var(--accent); background: var(--accent-dim); }
  .profile-name { font-family: var(--font-display); font-size: 1.3rem; }
  .profile-name em { font-style: italic; color: var(--accent); }
  .profile-username { font-family: var(--font-mono); font-size: .62rem; color: var(--text-dim); margin-top: 3px; }
  .profile-since { font-family: var(--font-mono); font-size: .57rem; color: var(--text-dim); margin-top: 5px; letter-spacing: .04em; }
  .profile-ficha { padding: 14px 18px; }
  .ficha-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border); }
  .ficha-row:last-child { border-bottom: none; }
  .ficha-lbl { font-size: .71rem; color: var(--text-muted); }
  .ficha-val { font-family: var(--font-mono); font-size: .78rem; font-weight: 500; color: var(--text); }
  .ficha-val.accent { color: var(--accent); }
  .profile-logout-btn { width: calc(100% - 36px); margin: 14px 18px; padding: 9px; border: 1.5px solid var(--border); border-radius: var(--r); background: transparent; color: var(--text-muted); font-family: var(--font-mono); font-size: .68rem; cursor: pointer; transition: var(--tr); }
  .profile-logout-btn:hover { border-color: #E53D00; color: #E53D00; background: rgba(217,79,43,.06); }
  .profile-right { display: flex; flex-direction: column; gap: 20px; }
  .profile-section-title { font-family: var(--font-mono); font-size: .58rem; letter-spacing: .18em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
  .profile-section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .logros-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  .logro-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 14px 12px; text-align: center; transition: var(--tr); }
  .logro-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 6px 20px var(--accent-glow); }
  .logro-icon { font-size: 1.5rem; margin-bottom: 5px; }
  .logro-val { font-family: var(--font-display); font-size: 1.7rem; line-height: 1; color: var(--accent); margin-bottom: 1px; }
  .logro-val.green { color: #5a8a4a; }
  .logro-val.blue { color: #3a6e9e; }
  .logro-val.yellow { color: #c8860a; }
  .logro-val.purple { color: #7a5a9e; }
  .logro-lbl { font-family: var(--font-mono); font-size: .55rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; }
  .logro-sub { font-family: var(--font-mono); font-size: .58rem; color: var(--text-dim); margin-top: 2px; }
  .objetivo-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 16px 18px; display: flex; align-items: center; gap: 14px; }
  .objetivo-icon { font-size: 1.8rem; flex-shrink: 0; }
  .objetivo-text { flex: 1; }
  .objetivo-label { font-size: .72rem; color: var(--text-muted); margin-bottom: 2px; }
  .objetivo-value { font-family: var(--font-display); font-size: 1.05rem; }
  .objetivo-value em { font-style: italic; color: var(--accent); }
  .objetivo-sub { font-family: var(--font-mono); font-size: .6rem; color: var(--text-dim); margin-top: 2px; }
  .plan-activo-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
  .plan-activo-header { padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg-warm); display: flex; align-items: center; gap: 10px; }
  .plan-activo-title { font-family: var(--font-display); font-size: .95rem; }
  .plan-activo-title em { font-style: italic; color: var(--accent); }
  .plan-activo-badge { margin-left: auto; font-family: var(--font-mono); font-size: .57rem; padding: 2px 8px; border-radius: 100px; border: 1px solid; }
  .plan-activo-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
  .plan-macro-row { display: flex; align-items: center; gap: 8px; }
  .plan-macro-bar-wrap { flex: 1; height: 5px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
  .plan-macro-bar-fill { height: 100%; border-radius: 3px; }
  .datos-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
  .datos-item { display: flex; align-items: center; justify-content: space-between; padding: 11px 16px; border-bottom: 1px solid var(--border); gap: 12px; }
  .datos-item:last-child { border-bottom: none; }
  .datos-item-left { display: flex; align-items: center; gap: 10px; }
  .datos-item-icon { font-size: .95rem; width: 18px; text-align: center; flex-shrink: 0; }
  .datos-item-info strong { display: block; font-size: .78rem; color: var(--text); margin-bottom: 1px; }
  .datos-item-info span { font-size: .66rem; color: var(--text-muted); }
  .datos-clear-btn { padding: 4px 10px; border-radius: var(--r); font-size: .65rem; font-family: var(--font-mono); cursor: pointer; border: 1.5px solid var(--border); background: transparent; color: var(--text-muted); transition: var(--tr); white-space: nowrap; flex-shrink: 0; }
  .datos-clear-btn:hover { border-color: #E53D00; color: #E53D00; background: rgba(217,79,43,.06); }
  .datos-clear-btn:disabled { opacity: .4; cursor: not-allowed; }
  .profile-quote { background: linear-gradient(135deg, var(--accent-dim), var(--blue-dim)); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 18px 20px; text-align: center; }
  .profile-quote p { font-family: var(--font-display); font-size: .95rem; font-style: italic; line-height: 1.55; color: var(--text); }
  .profile-quote span { font-family: var(--font-mono); font-size: .58rem; color: var(--text-dim); display: block; margin-top: 5px; letter-spacing: .06em; }

  @media (max-width: 1100px) { .profile-layout { grid-template-columns: 270px 1fr; } }
  @media (max-width: 900px) {
    .profile-layout { grid-template-columns: 1fr; }
    .profile-card { position: static; }
    .logros-grid { grid-template-columns: repeat(3,1fr); }
  }
  @media (max-width: 600px) { .logros-grid { grid-template-columns: repeat(2,1fr); } }

  /* ── PROFILE PAGE ── */
  .profile-page { padding-bottom: 80px; }
  .profile-layout { display: grid; grid-template-columns: 300px 1fr; gap: 28px; align-items: start; }

  .profile-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; position: sticky; top: 32px; }
  .profile-card-top { padding: 26px 22px 20px; text-align: center; background: linear-gradient(160deg,var(--surface) 0%,var(--bg-warm) 100%); border-bottom: 1px solid var(--border); }
  .profile-avatar-wrap { position: relative; width: 90px; margin: 0 auto 14px; cursor: pointer; }
  .profile-avatar { width: 90px; height: 90px; border-radius: 50%; background: var(--accent-dim); border: 2.5px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 2.4rem; transition: var(--tr); overflow: hidden; box-shadow: 0 4px 18px var(--accent-glow); }
  .profile-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .profile-avatar-overlay { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .18s; pointer-events: none; }
  .profile-avatar-overlay span { font-size: 1.4rem; }
  .profile-avatar-wrap:hover .profile-avatar { border-color: var(--accent-2); box-shadow: 0 6px 26px var(--accent-glow); }
  .profile-avatar-wrap:hover .profile-avatar-overlay { opacity: 1; }
  .profile-avatar-badge { position: absolute; bottom: 2px; right: 2px; width: 24px; height: 24px; border-radius: 50%; background: var(--accent); border: 2px solid var(--surface); display: flex; align-items: center; justify-content: center; font-size: .75rem; color: #fff; pointer-events: none; }
  .profile-emoji-picker { padding: 11px 15px; border-bottom: 1px solid var(--border); background: var(--bg-warm); display: flex; flex-direction: column; gap: 8px; }
  .profile-emoji-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 5px; }
  .profile-photo-row { display: flex; gap: 6px; padding-top: 4px; border-top: 1px solid var(--border); }
  .profile-photo-btn { flex:1; padding: 6px 10px; border-radius: var(--r); border: 1.5px solid var(--border); background: var(--surface); color: var(--text-muted); font-family: var(--font-mono); font-size: .65rem; cursor: pointer; transition: var(--tr); text-align: center; }
  .profile-photo-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .profile-photo-btn.danger:hover { border-color: #d94f2b; color: #d94f2b; background: rgba(217,79,43,.07); }
  .profile-emoji-btn { aspect-ratio:1; border-radius: var(--r); border: 1.5px solid transparent; background: var(--surface); cursor: pointer; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; transition: var(--tr); }
  .profile-emoji-btn:hover { border-color: var(--accent); transform: scale(1.1); }
  .profile-emoji-btn.sel { border-color: var(--accent); background: var(--accent-dim); }
  .profile-name-wrap { cursor: pointer; }
  .profile-name-display { font-family: var(--font-display); font-size: 1.3rem; }
  .profile-name-display em { font-style: italic; color: var(--accent); }
  .profile-edit-hint { font-size: .62rem; color: var(--text-dim); opacity: 0; transition: opacity .15s; margin-top: 2px; }
  .profile-name-wrap:hover .profile-edit-hint { opacity: 1; }
  .profile-name-input { font-family: var(--font-display); font-size: 1.15rem; background: var(--bg); border: 1.5px solid var(--accent); border-radius: var(--r); color: var(--text); padding: 5px 11px; outline: none; text-align: center; width: 100%; box-shadow: 0 0 0 3px var(--accent-dim); }
  .profile-since { font-family: var(--font-mono); font-size: .57rem; color: var(--text-dim); letter-spacing: .05em; margin-top: 6px; }
  .profile-ficha { padding: 13px 18px; }
  .ficha-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid var(--border); }
  .ficha-row:last-child { border-bottom: none; }
  .ficha-lbl { font-size: .71rem; color: var(--text-muted); }
  .ficha-val { font-family: var(--font-mono); font-size: .78rem; font-weight: 500; color: var(--text); }
  .ficha-val.accent { color: var(--accent); }

  .profile-right { display: flex; flex-direction: column; gap: 20px; }
  .profile-section-title { font-family: var(--font-mono); font-size: .57rem; letter-spacing: .17em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 13px; display: flex; align-items: center; gap: 10px; }
  .profile-section-title::after { content:''; flex:1; height:1px; background:var(--border); }

  .logros-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  .logro-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 14px 12px; text-align: center; transition: var(--tr); }
  .logro-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 6px 18px var(--accent-glow); }
  .logro-icon { font-size: 1.5rem; margin-bottom: 4px; }
  .logro-val { font-family: var(--font-display); font-size: 1.65rem; line-height: 1; color: var(--accent); margin-bottom: 1px; }
  .logro-val.green { color: #5a8a4a; } .logro-val.blue { color: #3a6e9e; } .logro-val.yellow { color: #c8860a; } .logro-val.purple { color: #7a5a9e; }
  .logro-lbl { font-family: var(--font-mono); font-size: .54rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; }
  .logro-sub { font-family: var(--font-mono); font-size: .57rem; color: var(--text-dim); margin-top: 2px; }

  .objetivo-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 15px 18px; display: flex; align-items: center; gap: 14px; }
  .objetivo-icon { font-size: 1.8rem; flex-shrink: 0; }
  .objetivo-text { flex: 1; }
  .objetivo-label { font-size: .71rem; color: var(--text-muted); margin-bottom: 2px; }
  .objetivo-value { font-family: var(--font-display); font-size: 1.05rem; }
  .objetivo-value em { font-style: italic; color: var(--accent); }
  .objetivo-sub { font-family: var(--font-mono); font-size: .59rem; color: var(--text-dim); margin-top: 2px; }

  .plan-activo-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
  .plan-activo-header { padding: 11px 16px; border-bottom: 1px solid var(--border); background: var(--bg-warm); display: flex; align-items: center; gap: 10px; }
  .plan-activo-title { font-family: var(--font-display); font-size: .93rem; }
  .plan-activo-title em { font-style: italic; color: var(--accent); }
  .plan-activo-badge { margin-left: auto; font-family: var(--font-mono); font-size: .56rem; padding: 2px 8px; border-radius: 100px; border: 1px solid; }
  .plan-activo-body { padding: 13px 16px; display: flex; flex-direction: column; gap: 8px; }
  .plan-macro-row { display: flex; align-items: center; gap: 8px; }
  .plan-macro-bar-wrap { flex:1; height:5px; background:var(--surface-2); border-radius:3px; overflow:hidden; }
  .plan-macro-bar-fill { height:100%; border-radius:3px; }

  .profile-quote { background: linear-gradient(135deg,var(--accent-dim),var(--blue-dim)); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 17px 20px; text-align: center; }
  .profile-quote p { font-family: var(--font-display); font-size: .93rem; font-style: italic; line-height: 1.55; color: var(--text); }
  .profile-quote span { font-family: var(--font-mono); font-size: .57rem; color: var(--text-dim); display: block; margin-top: 5px; letter-spacing: .06em; }

  /* Transfer / import-export */
  .transfer-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
  .transfer-card-header { padding: 13px 18px; border-bottom: 1px solid var(--border); background: var(--bg-warm); display: flex; align-items: center; gap: 10px; }
  .transfer-card-title { font-family: var(--font-display); font-size: .93rem; }
  .transfer-card-title em { font-style: italic; color: var(--accent); }
  .xfer-tabs { display: flex; border-bottom: 1px solid var(--border); }
  .xfer-tab { flex: 1; padding: 9px 4px; text-align: center; cursor: pointer; font-size: .65rem; font-family: var(--font-mono); color: var(--text-muted); border: none; background: transparent; border-bottom: 2px solid transparent; transition: var(--tr); letter-spacing: .06em; text-transform: uppercase; }
  .xfer-tab.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--accent-dim); }
  .xfer-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
  .xfer-code-box { background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r); padding: 10px 13px; font-family: var(--font-mono); font-size: .63rem; color: var(--text-muted); word-break: break-all; line-height: 1.6; max-height: 88px; overflow-y: auto; cursor: text; user-select: all; transition: border-color .2s; }
  .xfer-note { font-family: var(--font-mono); font-size: .6rem; color: var(--text-dim); line-height: 1.55; padding: 8px 11px; background: var(--bg-warm); border-radius: var(--r); border: 1px solid var(--border); }
  .xfer-note strong { color: var(--text-muted); }
  .xfer-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .xfer-btn { padding: 8px 14px; border-radius: var(--r); font-family: var(--font-mono); font-size: .7rem; cursor: pointer; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-muted); transition: var(--tr); white-space: nowrap; flex-shrink: 0; }
  .xfer-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .xfer-btn.ok { border-color: var(--green); color: var(--green); background: var(--green-dim); }
  .xfer-btn.primary { background: var(--accent); color: #faf7f2; border-color: var(--accent); }
  .xfer-btn.primary:hover { background: var(--accent-2); border-color: var(--accent-2); }
  .xfer-input { flex:1; background:var(--bg); border:1.5px solid var(--border); border-radius:var(--r); color:var(--text); font-family:var(--font-mono); font-size:.68rem; padding:8px 11px; outline:none; transition:border-color .2s,box-shadow .2s; min-width:0; }
  .xfer-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-dim); }
  .xfer-error { background:rgba(217,79,43,.08); border:1px solid rgba(217,79,43,.3); border-radius:var(--r); padding:8px 12px; font-size:.71rem; color:#d94f2b; font-family:var(--font-mono); }
  .xfer-success { background:rgba(90,138,74,.08); border:1px solid rgba(90,138,74,.3); border-radius:var(--r); padding:8px 12px; font-size:.71rem; color:#5a8a4a; font-family:var(--font-mono); }
  .datos-card { background:var(--surface); border:1.5px solid var(--border); border-radius:var(--r-lg); overflow:hidden; }
  .datos-item { display:flex; align-items:center; justify-content:space-between; padding:11px 16px; border-bottom:1px solid var(--border); gap:12px; }
  .datos-item:last-child { border-bottom:none; }
  .datos-item-left { display:flex; align-items:center; gap:10px; }
  .datos-item-icon { font-size:.95rem; width:18px; text-align:center; flex-shrink:0; }
  .datos-item-info strong { display:block; font-size:.78rem; color:var(--text); margin-bottom:1px; }
  .datos-item-info span { font-size:.66rem; color:var(--text-muted); }
  .datos-clear-btn { padding:4px 10px; border-radius:var(--r); font-size:.65rem; font-family:var(--font-mono); cursor:pointer; border:1.5px solid var(--border); background:transparent; color:var(--text-muted); transition:var(--tr); white-space:nowrap; flex-shrink:0; }
  .datos-clear-btn:hover { border-color:#d94f2b; color:#d94f2b; background:rgba(217,79,43,.06); }

  @media (max-width:1100px) { .profile-layout { grid-template-columns:270px 1fr; } }
  @media (max-width:900px)  { .profile-layout { grid-template-columns:1fr; } .profile-card { position:static; } .logros-grid { grid-template-columns:repeat(3,1fr); } }
  @media (max-width:600px)  { .logros-grid { grid-template-columns:repeat(2,1fr); } }

  em {
    font-style: normal !important;
    color: inherit !important;
    font-family: inherit !important;
  }

  .tdee-number, .hist-tdee, .cal-stat-val, .peso-stat-val,
  .logro-val, .analysis-stat-val, .ccard-tdee, .nutr-kcal-num,
  .today-banner-streak, .proy-val, .brow-val, .target-kcal,
  .macro-val, .imc-val, .meal-kcal, .xrow-val, .ficha-val,
  .adj-entry-kcal {
    font-family: var(--font-mono);
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
  // BMR: Mifflin-St Jeor o Katch-McArdle si hay % grasa
  let bmr;
  if (grasa && Number(grasa) > 0) {
    bmr = 370 + 21.6 * (peso * (1 - Number(grasa) / 100));
  } else {
    bmr = sexo === "hombre" ? 10*peso+6.25*altura-5*edad+5 : 10*peso+6.25*altura-5*edad-161;
  }

  // Factor de actividad base (tabla Mifflin estándar por días de entreno)
  let fb;
  if (diasFuerza === 0)       fb = 1.20;
  else if (diasFuerza <= 2)   fb = 1.375;
  else if (diasFuerza <= 5)   fb = 1.55;
  else                        fb = 1.725;

  // Ajustes por intensidad/volumen del entreno (escala conservadora)
  // Referencia neutra: RIR 1-2, 3 series, 90-120s, 60min, poco cardio, 7000 pasos, sedentario
  const rir_adj    = {"0":0.02,"1-2":0.0,"3-4":-0.01,"5+":-0.02}[rir] ?? 0;
  const series_adj = {"1-2":-0.01,"3":0.0,"4-5":0.01,"6+":0.02}[series] ?? 0;
  const desc_adj   = {"menos60":0.01,"60-90":0.005,"90-120":0.0,"2-3min":-0.005,"mas3min":-0.01}[descanso] ?? 0;
  const dur_adj    = Math.max(-0.02, Math.min(0.03, (duracion - 60) / 120 * 0.025));
  const cardio_adj = {"ninguno":-0.01,"poco":0.0,"moderado":0.03,"bastante":0.06,"mucho":0.10}[cardio] ?? 0;
  const pasos_adj  = Math.max(-0.03, Math.min(0.04, (pasos - 7000) / 7000 * 0.03));
  const trabajo_adj= {"sedentario":0.0,"ligero":0.03,"moderado":0.07,"activo":0.12,"muy_activo":0.17}[trabajo] ?? 0;

  let adj = rir_adj + series_adj + desc_adj + dur_adj + cardio_adj + pasos_adj + trabajo_adj;
  adj = Math.max(-0.12, Math.min(0.20, adj));  // cap para evitar extremos

  const factor = fb + adj;
  const tdee   = bmr * factor;
  const tef    = bmr * 0.1;
  const act    = tdee - bmr - tef;

  // Desglose EAT/NEAT proporcional para mantener el panel visual
  const eat_frac = Math.min(0.60, Math.max(0.38, 0.44 + (diasFuerza - 3) * 0.025));
  const eat  = Math.max(0, act * eat_frac);
  const neat = Math.max(0, act * (1 - eat_frac));

  return {bmr:Math.round(bmr),eat:Math.round(eat),neat:Math.round(neat),tef:Math.round(tef),tdee:Math.round(tdee)};
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



// ─── AUTH & PROFILE HELPERS ──────────────────────────────────────────────────
function loadPeso() {
  try { return JSON.parse(localStorage.getItem(PESO_KEY) || "[]"); }
  catch { return []; }
}

function savePeso(data) {
  try { localStorage.setItem(PESO_KEY, JSON.stringify(data)); } catch {}
}

function formatDateShort(isoStr) {
  const d = new Date(isoStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { day:"2-digit", month:"short" });
}


function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getWeekBounds(isoWeek) {
  const [year, weekStr] = isoWeek.split('-W');
  const week = parseInt(weekStr, 10);
  const jan4 = new Date(Date.UTC(parseInt(year, 10), 0, 4));
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setUTCDate(jan4.getUTCDate() - (jan4.getUTCDay() || 7) + 1);
  const start = new Date(startOfWeek1);
  start.setUTCDate(startOfWeek1.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start, end };
}

function loadCheckins() {
  try { return JSON.parse(localStorage.getItem(CHECKIN_KEY) || "[]"); }
  catch { return []; }
}
function saveCheckins(data) {
  try { localStorage.setItem(CHECKIN_KEY, JSON.stringify(data)); } catch {}
}

function loadAdjustments() {
  try { return JSON.parse(localStorage.getItem(ADJUST_KEY) || "[]"); }
  catch { return []; }
}
function saveAdjustments(data) {
  try { localStorage.setItem(ADJUST_KEY, JSON.stringify(data)); } catch {}
}

function weekAvgWeight(pesoEntries, isoWeek) {
  const { start, end } = getWeekBounds(isoWeek);
  const entries = pesoEntries.filter(e => {
    const d = new Date(e.date + "T12:00:00");
    return d >= start && d <= end;
  });
  if (entries.length === 0) return null;
  return entries.reduce((s, e) => s + e.weight, 0) / entries.length;
}

function weekAdherence(calendar, isoWeek) {
  const { start, end } = getWeekBounds(isoWeek);
  const days = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const k = dayKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    days.push(k);
  }
  const registered = days.filter(k => calendar[k]).length;
  if (registered === 0) return null;
  const totalPossible = registered * CATS.length;
  const done = days.reduce((s, k) => {
    if (!calendar[k]) return s;
    return s + CATS.filter(c => calendar[k][c.key]).length;
  }, 0);
  return Math.round((done / totalPossible) * 100);
}

function runAnalysis({ pesoEntries, calendar, currentKcal, checkins }) {
  const now = new Date();
  const thisWeek = getISOWeek(now);
  const prevDate = new Date(now); prevDate.setDate(now.getDate() - 7);
  const lastWeek = getISOWeek(prevDate);
  const twoWeeksDate = new Date(now); twoWeeksDate.setDate(now.getDate() - 14);
  const twoWeeksAgo = getISOWeek(twoWeeksDate);

  const avgThis = weekAvgWeight(pesoEntries, thisWeek);
  const avgLast = weekAvgWeight(pesoEntries, lastWeek);
  const avgTwo  = weekAvgWeight(pesoEntries, twoWeeksAgo);

  const adherenceThis = weekAdherence(calendar, thisWeek);
  const adherenceLast = weekAdherence(calendar, lastWeek);
  const adherence = adherenceLast !== null ? adherenceLast : adherenceThis;

  const hasWeightData = avgLast !== null && (avgThis !== null || avgTwo !== null);
  const comparePrev = avgThis !== null ? avgLast : avgTwo;
  const compareCurr = avgThis !== null ? avgThis : avgLast;

  if (!hasWeightData || currentKcal == null) {
    return { type: "no_data", reason: "no_data" };
  }

  const weightChange = compareCurr - comparePrev;
  const weeksDiff = avgThis !== null ? 1 : 2;
  const changePerWeek = weightChange / weeksDiff;
  const lossRate = changePerWeek;

  if (adherence !== null && adherence < 60) {
    return { type:"low_adherence", reason:"low_adherence", adherence, weightChange:changePerWeek, avgCurr:compareCurr, avgPrev:comparePrev };
  }

  const bodyWeightPct = Math.abs(lossRate) / comparePrev * 100;
  if (lossRate < -1.2 || bodyWeightPct > 1.2) {
    const increase = lossRate < -1.5 ? 250 : 150;
    return { type:"too_fast", reason:"too_fast", delta:+increase, newKcal:currentKcal+increase, weightChange:changePerWeek, avgCurr:compareCurr, avgPrev:comparePrev, adherence, bodyWeightPct:bodyWeightPct.toFixed(1) };
  }

  if (lossRate >= -0.1) {
    const adherenceHigh = adherence === null || adherence >= 75;
    if (adherenceHigh) {
      const decrease = lossRate > 0.2 ? 200 : 150;
      return { type:"stall", reason:"stall", delta:-decrease, newKcal:Math.max(1200,currentKcal-decrease), weightChange:changePerWeek, avgCurr:compareCurr, avgPrev:comparePrev, adherence };
    } else {
      return { type:"stall_low_adherence", reason:"stall_low_adherence", weightChange:changePerWeek, adherence, avgCurr:compareCurr, avgPrev:comparePrev };
    }
  }

  if (lossRate >= -0.5 && lossRate < -0.1) {
    return { type:"on_track", reason:"on_track", weightChange:changePerWeek, avgCurr:compareCurr, avgPrev:comparePrev, adherence };
  }

  return { type:"ideal", reason:"ideal", weightChange:changePerWeek, avgCurr:compareCurr, avgPrev:comparePrev, adherence };
}

function buildCoachMessage(analysis, currentKcal, checkinData) {
  const hunger  = checkinData?.hunger  || null;
  const energy  = checkinData?.energy  || null;
  const fmt = (n) => n !== null && n !== undefined ? n.toFixed(1) : "?";
  const adh = analysis.adherence !== null && analysis.adherence !== undefined
    ? `${analysis.adherence}% de adherencia` : "adherencia desconocida";

  const hungerNote  = hunger !== null && hunger >= 4 ? " Además reportas bastante hambre, lo cual refuerza este ajuste." : "";
  const energyNote  = energy !== null && energy <= 2 ? " La energía baja que reportas puede ser señal de que el déficit es demasiado agresivo." : "";

  switch (analysis.type) {
    case "no_data":
      return {  color:"#8a6a50", bg:"rgba(138,106,80,.07)", border:"rgba(138,106,80,.2)", title:"Necesitamos más datos", message:"Para que el análisis funcione necesitas al menos 2 semanas de registros de peso y datos del calendario. El sistema compara promedios semanales para detectar tendencias reales.", delta:null, reasoning:null, canApply:false };
    case "low_adherence":
      return {  color:"#c8860a", bg:"rgba(200,134,10,.07)", border:"rgba(200,134,10,.25)", title:"Primero la adherencia", message:`Tu adherencia al plan esta semana es del ${analysis.adherence}%. Antes de ajustar calorías, la prioridad es llegar a ≥75% de consistencia. Con baja adherencia los datos de peso no reflejan el efecto real de tu dieta.`, delta:null, reasoning:`Peso medio: ${fmt(analysis.avgCurr)} kg (cambio: ${analysis.weightChange > 0 ? "+" : ""}${fmt(analysis.weightChange)} kg/semana)`, canApply:false };
    case "too_fast":
      return {  color:"#3a6e9e", bg:"rgba(58,110,158,.07)", border:"rgba(58,110,158,.25)", title:`Pérdida demasiado rápida — subimos +${analysis.delta} kcal`, message:`Estás perdiendo ${Math.abs(fmt(analysis.weightChange))} kg/semana (${analysis.bodyWeightPct}% de tu peso corporal). Superar el 1% semanal aumenta el riesgo de perder músculo y afecta la adherencia a largo plazo.${energyNote}`, delta:+analysis.delta, newKcal:analysis.newKcal, reasoning:`Peso anterior: ${fmt(analysis.avgPrev)} kg → actual: ${fmt(analysis.avgCurr)} kg | ${adh}`, canApply:true };
    case "stall":
      return {  color:"#d94f2b", bg:"rgba(217,79,43,.07)", border:"rgba(217,79,43,.25)", title:`Sin progreso esta semana — ajustamos ${analysis.delta} kcal`, message:`Tu peso medio no ha bajado (${analysis.weightChange > 0 ? "+" : ""}${fmt(analysis.weightChange)} kg) con una ${adh}. Esto indica que tu TDEE real es mayor de lo calculado o que tu metabolismo se ha adaptado. Reducimos el objetivo calórico.${hungerNote}`, delta:analysis.delta, newKcal:analysis.newKcal, reasoning:`Peso anterior: ${fmt(analysis.avgPrev)} kg → actual: ${fmt(analysis.avgCurr)} kg | ${adh}`, canApply:true };
    case "stall_low_adherence":
      return {  color:"#c8860a", bg:"rgba(200,134,10,.07)", border:"rgba(200,134,10,.25)", title:"No hay progreso — pero la adherencia es baja", message:`Tu peso no ha bajado, pero con solo ${analysis.adherence}% de adherencia no es momento de reducir calorías. Primero consolida el hábito. Si mejoras la adherencia y el peso sigue estancado, entonces ajustamos.`, delta:null, reasoning:`Peso anterior: ${fmt(analysis.avgPrev)} kg → actual: ${fmt(analysis.avgCurr)} kg`, canApply:false };
    case "on_track":
      return {  color:"#5a8a4a", bg:"rgba(90,138,74,.07)", border:"rgba(90,138,74,.25)", title:"Progreso lento pero constante — mantener", message:`Estás perdiendo ${Math.abs(fmt(analysis.weightChange))} kg/semana. Es un ritmo conservador que maximiza la retención muscular. No es necesario ningún ajuste esta semana.`, delta:0, reasoning:`Peso anterior: ${fmt(analysis.avgPrev)} kg → actual: ${fmt(analysis.avgCurr)} kg | ${adh}`, canApply:false };
    case "ideal":
      return {  color:"#5a8a4a", bg:"rgba(90,138,74,.07)", border:"rgba(90,138,74,.25)", title:"Progreso óptimo — no tocar nada", message:`Estás perdiendo ${Math.abs(fmt(analysis.weightChange))} kg/semana. Este es el rango ideal para perder grasa preservando músculo al máximo. El plan funciona. Revisa en 2 semanas.`, delta:0, reasoning:`Peso anterior: ${fmt(analysis.avgPrev)} kg → actual: ${fmt(analysis.avgCurr)} kg | ${adh}`, canApply:false };
    default:
      return null;
  }
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
              <div className="meal-top"><span className="meal-name"> {m.name}</span><span className="meal-kcal">{mk} kcal</span></div>
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
  { id:"deficit",     name:"Déficit",       desc:"Pérdida de grasa con masa preservada",  pPct:35, fPct:25, cPct:40 },
  { id:"recomp",      name:"Recomposición", desc:"Perder grasa y ganar músculo a la vez", pPct:40, fPct:25, cPct:35 },
  { id:"superavit",   name:"Superávit",     desc:"Ganancia muscular con algo de grasa",   pPct:30, fPct:25, cPct:45 },
  { id:"lean_bulk",   name:"Lean Bulk",     desc:"Superávit mínimo, máximo músculo limpio",pPct:35, fPct:25, cPct:40 },
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


// ─── STREAK TOAST ────────────────────────────────────────────────────────────
function StreakToast({ streak, onClose }) {
  const milestones = {
    3:  {  title:"¡3 días seguidos!", msg:"El hábito empieza a formarse. ¡Sigue así!" },
    7:  {  title:"¡1 semana de racha!", msg:"Una semana completa. Esto ya es un hábito real." },
    14: {  title:"¡2 semanas sin fallar!", msg:"Dos semanas de constancia. La disciplina es tuya." },
    21: {  title:"¡21 días!", msg:"Dicen que tarda 21 días. Ya lo tienes." },
    30: {  title:"¡1 mes de racha!", msg:"Un mes entero. Nivel otro." },
    60: {  title:"¡60 días seguidos!", msg:"Dos meses. Estás en modo élite." },
    100:{  title:"¡100 días!", msg:"Triple dígito. Leyenda." },
  };
  const m = milestones[streak];
  if (!m) return null;
  const [exiting, setExiting] = useState(false);
  const close = () => { setExiting(true); setTimeout(onClose, 260); };
  useEffect(() => {
    const t = setTimeout(close, 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`streak-toast ${exiting ? "toast-out" : ""}`}>
      <div className="toast-icon">{m.icon}</div>
      <div className="toast-body">
        <strong>{m.title}</strong>
        <p>{m.msg}</p>
      </div>
      <button className="toast-close" onClick={close}>×</button>
    </div>
  );
}

// ─── WEIGHT SPARKLINE ────────────────────────────────────────────────────────
function WeightSparkline({ entries }) {
  if (entries.length < 2) {
    return (
      <div style={{height:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <p style={{fontSize:".75rem",color:"var(--text-dim)",fontStyle:"italic",textAlign:"center"}}>
          Añade al menos 2 registros para ver la gráfica
        </p>
      </div>
    );
  }
  const W = 260, H = 100, PAD = 12;
  const vals = entries.map(e => e.weight);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const pts = entries.map((e, i) => {
    const x = PAD + (i / (entries.length - 1)) * (W - PAD * 2);
    const y = PAD + ((maxV - e.weight) / range) * (H - PAD * 2);
    return { x, y, ...e };
  });
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = pathD + ` L${pts[pts.length-1].x.toFixed(1)},${H} L${PAD},${H} Z`;
  const trend = vals[vals.length - 1] - vals[0];
  const trendColor = trend < 0 ? "#5a8a4a" : trend > 0 ? "#d94f2b" : "#8a6a50";
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      <path d={areaD} fill="var(--accent)" opacity=".07"/>
      <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--accent)" stroke="var(--surface)" strokeWidth="1.5"/>
      ))}
      <text x={pts[0].x} y={pts[0].y - 7} textAnchor="middle"
        style={{fontFamily:"var(--font-mono)",fontSize:"9px",fill:"var(--text-muted)"}}>
        {vals[0].toFixed(1)}
      </text>
      <text x={pts[pts.length-1].x} y={pts[pts.length-1].y - 7} textAnchor="middle"
        style={{fontFamily:"var(--font-mono)",fontSize:"9px",fill:trendColor,fontWeight:600}}>
        {vals[vals.length-1].toFixed(1)}
      </text>
    </svg>
  );
}

// ─── TODAY BANNER ─────────────────────────────────────────────────────────────
function TodayBanner({ onNavigate }) {
  const calendar = useMemo(() => loadCalendar(), []);
  const today    = todayKey();
  const entry    = calendar[today] || null;
  const stats    = useMemo(() => getCalStats(calendar), [calendar]);
  const doneCats = entry ? CATS.filter(c => entry[c.key]) : [];
  return (
    <div className="today-banner">
      <div className="today-banner-left">
        <div className="today-banner-streak"> {stats.streak}</div>
        <div className="today-banner-info">
          <strong>Racha actual</strong>
          <span>{stats.streak === 0 ? "Empieza hoy tu racha" : `${stats.streak} día${stats.streak!==1?"s":""} seguido${stats.streak!==1?"s":""}`}</span>
        </div>
      </div>
      <div className="today-banner-cats">
        {CATS.map(cat => {
          const done = entry && entry[cat.key];
          return (
            <div key={cat.key} className="today-cat-pill" onClick={()=>onNavigate("calendar")}
              style={{
                color: done ? cat.color : "var(--text-dim)",
                background: done ? cat.bg : "transparent",
                borderColor: done ? cat.color : "var(--border)",
              }}>
              {cat.name}
              {done && <span style={{fontSize:".7rem"}}>✓</span>}
            </div>
          );
        })}
      </div>
      <button className="today-banner-cta" onClick={()=>onNavigate("calendar")}>
        {!entry ? "Registrar hoy →" : doneCats.length < 3 ? "Completar día →" : "Ver calendario →"}
      </button>
    </div>
  );
}

// ─── MI PESO PAGE ─────────────────────────────────────────────────────────────
function PesoPage() {
  const [entries, setEntries] = useState(loadPeso);
  const [draftWeight, setDraftWeight] = useState("");
  const [draftDate,   setDraftDate]   = useState(() => new Date().toISOString().slice(0,10));
  const [draftNote,   setDraftNote]   = useState("");
  const [addedOk,     setAddedOk]     = useState(false);

  const addEntry = () => {
    const w = parseFloat(draftWeight);
    if (isNaN(w) || w < 20 || w > 300) return;
    const entry = { id: Date.now(), date: draftDate, weight: w, note: draftNote.trim() };
    const updated = [...entries, entry].sort((a, b) => a.date.localeCompare(b.date));
    setEntries(updated);
    savePeso(updated);
    setDraftWeight(""); setDraftNote("");
    setAddedOk(true); setTimeout(() => setAddedOk(false), 1800);
  };

  const removeEntry = (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    savePeso(updated);
  };

  const clearAll = () => {
    if (entries.length === 0) return;
    setEntries([]); savePeso([]);
  };

  const firstEntry = entries[0];
  const lastEntry  = entries[entries.length - 1];
  const totalChange = entries.length >= 2 ? lastEntry.weight - firstEntry.weight : null;
  const avgPerWeek  = entries.length >= 2 ? (() => {
    const days = (new Date(lastEntry.date) - new Date(firstEntry.date)) / 86400000;
    const weeks = days / 7 || 1;
    return (totalChange / weeks).toFixed(2);
  })() : null;
  const chartEntries = entries.slice(-12);

  return (
    <div className="peso-page">
      <div className="page-header">
        <h1>Mi <em>Peso</em></h1>
        <p>Registra tu peso periódicamente y visualiza tu progreso real a lo largo del tiempo</p>
      </div>
      <div className="peso-layout">
        <div>
          <div className="peso-form">
            <div className="peso-form-title">Nuevo registro</div>
            <div className="peso-form-row">
              <div className="peso-form-field">
                <label>Fecha</label>
                <input type="date" className="peso-form-input narrow" style={{width:140}} value={draftDate}
                  onChange={e=>setDraftDate(e.target.value)}/>
              </div>
              <div className="peso-form-field">
                <label>Peso (kg)</label>
                <input className="peso-form-input narrow" type="number" min={20} max={300} step={0.1}
                  placeholder="75.4" value={draftWeight}
                  onChange={e=>setDraftWeight(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addEntry()}/>
              </div>
              <div className="peso-form-field" style={{flex:1,minWidth:120}}>
                <label>Nota (opcional)</label>
                <input className="peso-form-input wide" placeholder="Ej: En ayunas, después de entreno..."
                  value={draftNote} onChange={e=>setDraftNote(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addEntry()}/>
              </div>
              <button className="peso-add-btn" onClick={addEntry} style={addedOk?{background:"var(--green)"}:{}}>{addedOk?"✓ Guardado":"+ Añadir"}</button>
            </div>
          </div>
          <div className="peso-log">
            <div className="peso-log-header">
              <span>Historial de peso</span>
              {entries.length > 0 && <button className="peso-log-clear" onClick={clearAll}>Limpiar todo</button>}
            </div>
            {entries.length === 0 ? (
              <div className="peso-empty">Sin registros aún. Añade tu primer pesaje arriba.</div>
            ) : (
              [...entries].reverse().map((e, i, arr) => {
                const prev = arr[i + 1];
                const delta = prev ? e.weight - prev.weight : null;
                const deltaColor = delta === null ? "var(--text-dim)" : delta < 0 ? "#5a8a4a" : delta > 0 ? "#d94f2b" : "#8a6a50";
                const deltaStr   = delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`;
                return (
                  <div key={e.id} className="peso-entry">
                    <span className="peso-entry-date">{formatDateShort(e.date)}</span>
                    <span className="peso-entry-val">{e.weight.toFixed(1)}<span style={{fontSize:".62rem",color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginLeft:2}}>kg</span></span>
                    <span className="peso-entry-delta" style={{color:deltaColor,fontFamily:"var(--font-mono)",fontSize:".65rem"}}>{deltaStr}</span>
                    <span className="peso-entry-note">{e.note || ""}</span>
                    <button className="peso-entry-del" onClick={()=>removeEntry(e.id)}>×</button>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="peso-stats">
          <div className="peso-chart-card">
            <div className="peso-chart-title">Evolución {entries.length > 0 ? `· ${entries.length} registros` : ""}</div>
            <WeightSparkline entries={chartEntries}/>
          </div>
          {lastEntry && (
            <div className="peso-stat-card">
              <div className="peso-stat-lbl">Peso actual</div>
              <div className="peso-stat-val" style={{color:"var(--accent)"}}>{lastEntry.weight.toFixed(1)} <span style={{fontSize:".9rem",fontFamily:"var(--font-mono)",color:"var(--text-muted)"}}>kg</span></div>
              <div className="peso-stat-sub">{formatDateShort(lastEntry.date)}</div>
            </div>
          )}
          {totalChange !== null && (
            <div className="peso-stat-card">
              <div className="peso-stat-lbl">Cambio total</div>
              <div className="peso-stat-val" style={{color:totalChange<0?"#5a8a4a":totalChange>0?"#d94f2b":"#8a6a50"}}>
                {totalChange > 0 ? "+" : ""}{totalChange.toFixed(1)} <span style={{fontSize:".9rem",fontFamily:"var(--font-mono)",color:"var(--text-muted)"}}>kg</span>
              </div>
              <div className="peso-stat-sub">desde {formatDateShort(firstEntry.date)}</div>
            </div>
          )}
          {avgPerWeek !== null && (
            <div className="peso-stat-card">
              <div className="peso-stat-lbl">Media semanal</div>
              <div className="peso-stat-val" style={{color:parseFloat(avgPerWeek)<0?"#5a8a4a":parseFloat(avgPerWeek)>0?"#d94f2b":"#8a6a50"}}>
                {parseFloat(avgPerWeek) > 0 ? "+" : ""}{avgPerWeek} <span style={{fontSize:".9rem",fontFamily:"var(--font-mono)",color:"var(--text-muted)"}}>kg/sem</span>
              </div>
              <div className="peso-stat-sub">{entries.length} registros en total</div>
            </div>
          )}
          {entries.length === 0 && (
            <div className="peso-stat-card" style={{textAlign:"center",padding:"24px 16px"}}>
              <div style={{fontSize:"2rem",marginBottom:8,opacity:.3}}>⚖️</div>
              <p style={{fontSize:".78rem",color:"var(--text-muted)",lineHeight:1.6}}>Cuando tengas registros verás aquí tu progreso y tendencia semanal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── ANALYSIS COMPONENTS ─────────────────────────────────────────────────────
function WeightTrend2W({ pesoEntries }) {
  const now = new Date();
  const cutoff = new Date(now); cutoff.setDate(now.getDate() - 14);
  const recent = pesoEntries.filter(e => new Date(e.date + "T12:00:00") >= cutoff)
    .sort((a,b) => a.date.localeCompare(b.date));

  if (recent.length < 2) {
    return (
      <div style={{height:80,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <p style={{fontSize:".72rem",color:"var(--text-dim)",fontStyle:"italic"}}>
          Sin suficientes registros en las últimas 2 semanas
        </p>
      </div>
    );
  }

  const W = 280, H = 80, PAD = 10;
  const vals = recent.map(e => e.weight);
  const minV = Math.min(...vals) - 0.3;
  const maxV = Math.max(...vals) + 0.3;
  const range = maxV - minV || 1;
  const pts = recent.map((e, i) => ({
    x: PAD + (i / (recent.length - 1)) * (W - PAD * 2),
    y: PAD + ((maxV - e.weight) / range) * (H - PAD * 2),
    ...e
  }));
  const pathD = pts.map((p,i) => `${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = pathD + ` L${pts[pts.length-1].x.toFixed(1)},${H} L${PAD},${H} Z`;
  const trend = vals[vals.length-1] - vals[0];
  const trendColor = trend < 0 ? "#5a8a4a" : trend > 0.1 ? "#d94f2b" : "#8a6a50";

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      <path d={areaD} fill="var(--accent)" opacity=".06"/>
      <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="1.5"/>
      ))}
      <text x={pts[0].x} y={pts[0].y-6} textAnchor="middle"
        style={{fontFamily:"var(--font-mono)",fontSize:"8px",fill:"var(--text-muted)"}}>
        {vals[0].toFixed(1)}
      </text>
      <text x={pts[pts.length-1].x} y={pts[pts.length-1].y-6} textAnchor="middle"
        style={{fontFamily:"var(--font-mono)",fontSize:"8px",fill:trendColor,fontWeight:600}}>
        {vals[vals.length-1].toFixed(1)}
      </text>
    </svg>
  );
}

function CoachCard({ coach, onApply, applied }) {
  if (!coach) return null;
  return (
    <div className="coach-card" style={{background:coach.bg, borderColor:coach.border, color:coach.color}}>
      <div className="coach-card-top">
        <div className="coach-avatar" style={{background:coach.color+"20",border:`1.5px solid ${coach.border}`}}>
        </div>
        <div className="coach-meta">
          <strong style={{color:coach.color}}>{coach.title}</strong>
          <span>Análisis de esta semana</span>
        </div>
      </div>
      <p className="coach-message" style={{color:"var(--text)"}}>{coach.message}</p>
      {coach.delta !== null && coach.delta !== 0 && (
        <div className="coach-delta-pill" style={{color:coach.color,borderColor:coach.border,background:coach.color+"14"}}>
          <span style={{fontSize:"1rem"}}>{coach.delta > 0 ? "⬆" : "⬇"}</span>
          {coach.delta > 0 ? `+${coach.delta}` : coach.delta} kcal/día
          {coach.newKcal && <span style={{opacity:.7,fontWeight:400}}>→ {coach.newKcal.toLocaleString()} kcal</span>}
        </div>
      )}
      {coach.reasoning && (
        <p className="coach-reasoning" style={{color:"var(--text-muted)"}}>
          <strong>Datos:</strong> {coach.reasoning}
        </p>
      )}
      {coach.canApply && !applied && (
        <button className="coach-apply-btn" onClick={onApply} style={{background:coach.color,color:"#faf7f2"}}>
          Aplicar ajuste — {coach.newKcal?.toLocaleString()} kcal
        </button>
      )}
      {coach.canApply && applied && (
        <div style={{marginTop:16,fontFamily:"var(--font-mono)",fontSize:".72rem",color:"#5a8a4a",background:"rgba(90,138,74,.1)",padding:"8px 14px",borderRadius:"var(--r)",border:"1px solid rgba(90,138,74,.2)"}}>
          ✓ Ajuste aplicado y guardado en historial
        </div>
      )}
    </div>
  );
}

function WeeklyCheckinForm({ onSubmit, existingCheckin }) {
  const [hunger, setHunger] = useState(existingCheckin?.hunger || null);
  const [energy, setEnergy] = useState(existingCheckin?.energy || null);
  const [notes,  setNotes]  = useState(existingCheckin?.notes  || "");
  const [saved,  setSaved]  = useState(!!existingCheckin);

  const submit = () => {
    const data = { hunger, energy, notes, date: new Date().toISOString().slice(0,10) };
    onSubmit(data);
    setSaved(true);
  };

  const labels = {
    hunger: { 1:"Nada", 2:"Poco", 3:"Normal", 4:"Bastante", 5:"Mucho" },
    energy: { 1:"Muy baja", 2:"Baja", 3:"Normal", 4:"Alta", 5:"Muy alta" },
  };

  return (
    <div className="checkin-card">
      <div className="checkin-title">
        Check-in semanal (opcional)
        {saved && <span className="checkin-already">✓ Completado</span>}
      </div>
      {[
        {key:"hunger", label:"¿Cuánta hambre tienes durante el día?",  state:hunger, set:setHunger},
        {key:"energy", label:"¿Cómo está tu energía y rendimiento?",   state:energy, set:setEnergy},
      ].map(item => (
        <div key={item.key} className="checkin-row">
          <div className="checkin-row-label">
            {item.label}
            {item.state && <span>{labels[item.key][item.state]}</span>}
          </div>
          <div className="rating-btns">
            {[1,2,3,4,5].map(v => (
              <button key={v} className={`rating-btn ${item.state===v?"sel":""}`}
                onClick={()=>{item.set(v); setSaved(false);}}>
                {v}
              </button>
            ))}
          </div>
          <div className="rating-labels">
            <span>{labels[item.key][1]}</span>
            <span>{labels[item.key][5]}</span>
          </div>
        </div>
      ))}
      <div className="checkin-row">
        <div className="checkin-row-label">Notas de la semana (opcional)</div>
        <textarea className="checkin-notes" rows={2}
          placeholder="¿Algo relevante esta semana? Viaje, estrés, lesión..."
          value={notes} onChange={e=>{setNotes(e.target.value);setSaved(false);}}/>
      </div>
      <button className="checkin-submit" onClick={submit}
        disabled={hunger===null && energy===null && !notes.trim()}>
        {saved ? "✓ Check-in guardado" : "Guardar check-in"}
      </button>
    </div>
  );
}

function AdjustmentHistory({ history, onClear }) {
  if (history.length === 0) {
    return (
      <div className="adj-history">
        <div className="adj-history-header">Historial de ajustes</div>
        <div className="adj-empty">Sin ajustes aplicados aún. El sistema registrará aquí cada cambio calórico.</div>
      </div>
    );
  }
  const typeColor = { reduce:"#d94f2b", increase:"#3a6e9e", maintain:"#5a8a4a" };
  return (
    <div className="adj-history">
      <div className="adj-history-header">
        Historial de ajustes
        <button className="adj-history-clear" onClick={onClear}>Limpiar</button>
      </div>
      {history.map(adj => (
        <div key={adj.id} className="adj-entry">
          <div className="adj-entry-dot" style={{background:typeColor[adj.type]||"#8a6a50"}}/>
          <div className="adj-entry-body">
            <div className="adj-entry-date">{formatDateShort(adj.date)}</div>
            <div className="adj-entry-kcal" style={{color:typeColor[adj.type]||"var(--text)"}}>
              {adj.prevKcal.toLocaleString()} → {adj.newKcal.toLocaleString()} kcal
              <span style={{fontFamily:"var(--font-mono)",fontSize:".7rem",marginLeft:8,opacity:.7}}>
                ({adj.delta > 0 ? "+" : ""}{adj.delta})
              </span>
            </div>
            <div className="adj-entry-reason">{adj.reason}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalysisPage({ onNavigate }) {
  const pesoEntries = useMemo(() => loadPeso(), []);
  const calendar    = useMemo(() => loadCalendar(), []);
  const [checkins,     setCheckins]     = useState(loadCheckins);
  const [adjustments,  setAdjustments]  = useState(loadAdjustments);
  const [applied,      setApplied]      = useState(false);

  const currentKcal = useMemo(() => {
    const plan = loadPlan();
    if (plan?.kcalObj) return plan.kcalObj;
    try {
      const hist = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
      return hist[0]?.kcalObj || null;
    } catch { return null; }
  }, []);

  const thisWeek = getISOWeek(new Date());
  const existingCheckin = checkins.find(c => {
    const d = new Date(c.date + "T12:00:00");
    return getISOWeek(d) === thisWeek;
  });

  const analysis = useMemo(() =>
    runAnalysis({ pesoEntries, calendar, currentKcal, checkins }),
    [pesoEntries, calendar, currentKcal, checkins]
  );

  const coach = useMemo(() =>
    buildCoachMessage(analysis, currentKcal, existingCheckin),
    [analysis, currentKcal, existingCheckin]
  );

  const handleCheckin = (data) => {
    const updated = [
      ...checkins.filter(c => getISOWeek(new Date(c.date + "T12:00:00")) !== thisWeek),
      { ...data, week: thisWeek }
    ];
    setCheckins(updated);
    saveCheckins(updated);
  };

  const handleApply = () => {
    if (!coach?.canApply || !coach.newKcal) return;
    const adj = {
      id: Date.now(),
      date: new Date().toISOString().slice(0,10),
      week: thisWeek,
      type: coach.delta < 0 ? "reduce" : "increase",
      prevKcal: currentKcal,
      newKcal: coach.newKcal,
      delta: coach.delta,
      reason: coach.title,
    };
    const updatedAdj = [adj, ...adjustments].slice(0, 24);
    setAdjustments(updatedAdj);
    saveAdjustments(updatedAdj);
    const plan = loadPlan();
    if (plan) { savePlan({ ...plan, kcalObj: coach.newKcal }); }
    try {
      const hist = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
      if (hist[0]) { hist[0].kcalObj = coach.newKcal; }
      localStorage.setItem(HIST_KEY, JSON.stringify(hist));
    } catch {}
    setApplied(true);
  };

  const clearAdjustments = () => { setAdjustments([]); saveAdjustments([]); };

  const now = new Date();
  const prevDate = new Date(now); prevDate.setDate(now.getDate() - 7);
  const lastWeek = getISOWeek(prevDate);
  const thisAvg  = weekAvgWeight(pesoEntries, thisWeek);
  const lastAvg  = weekAvgWeight(pesoEntries, lastWeek);
  const adherence = weekAdherence(calendar, lastWeek) || weekAdherence(calendar, thisWeek);
  const totalAdjustments = adjustments.length;
  const kcalSaved = adjustments.reduce((s,a) => s + Math.abs(a.delta), 0);

  const chips = [];
  if (adherence !== null) {
    chips.push({  label:`${adherence}% adherencia`, color:adherence>=75?"#5a8a4a":"#c8860a" });
  }
  if (thisAvg && lastAvg) {
    const d = thisAvg - lastAvg;
    chips.push({ icon:d<0?"📉":d>0.1?"📈":"➡️", label:`${d>0?"+":""}${d.toFixed(1)} kg vs semana anterior`, color:d<0?"#5a8a4a":d>0.1?"#d94f2b":"#8a6a50" });
  }
  if (currentKcal) {
    chips.push({  label:`${currentKcal.toLocaleString()} kcal objetivo actual`, color:"var(--accent)" });
  }

  const hasEnoughData = analysis.type !== "no_data";

  return (
    <div className="analysis-page">
      <div className="page-header">
        <h1>Mi <em>Análisis</em></h1>
        <p>Sistema inteligente de ajuste calórico basado en tu progreso real semana a semana</p>
      </div>

      {!hasEnoughData && (
        <div className="analysis-empty">
          <div className="analysis-empty-icon">🧠</div>
          <div className="analysis-empty-title">El sistema está listo para <em>analizar</em></div>
          <p className="analysis-empty-body">
            Para generar tu primer análisis necesito datos de al menos 2 semanas. Empieza por completar estos pasos:
          </p>
          <div className="analysis-empty-steps">
            {[
              { n:"1", text:"Calcula tu TDEE en la Calculadora y guarda el resultado" },
              { n:"2", text:"Registra tu peso al menos 2-3 veces por semana en Mi Peso" },
              { n:"3", text:"Marca tus hábitos diarios en Mi Calendario" },
              { n:"4", text:"Vuelve aquí en 1-2 semanas — el sistema detectará tendencias automáticamente" },
            ].map(s => (
              <div key={s.n} className="analysis-empty-step">
                <div className="analysis-empty-step-num">{s.n}</div>
                <div className="analysis-empty-step-text">{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {chips.length > 0 && (
        <div className="insight-chips">
          {chips.map((chip,i) => (
            <div key={i} className="insight-chip"
              style={{color:chip.color,background:chip.color+"12",borderColor:chip.color+"30"}}>
              <span>{chip.icon}</span> {chip.label}
            </div>
          ))}
        </div>
      )}

      <div className="analysis-layout">
        <div>
          {coach && <CoachCard coach={coach} onApply={handleApply} applied={applied}/>}
          <WeeklyCheckinForm onSubmit={handleCheckin} existingCheckin={existingCheckin}/>
          <AdjustmentHistory history={adjustments} onClear={clearAdjustments}/>
        </div>

        <div className="analysis-stats">
          <div className="weight-trend-card">
            <div className="weight-trend-title">Tendencia de peso — 14 días</div>
            <WeightTrend2W pesoEntries={pesoEntries}/>
          </div>

          {currentKcal && (
            <div className="analysis-stat-card">
              <div className="analysis-stat-lbl">Objetivo calórico actual</div>
              <div className="analysis-stat-val" style={{color:"var(--accent)"}}>{currentKcal.toLocaleString()}</div>
              <div className="analysis-stat-sub">kcal/día</div>
            </div>
          )}

          {thisAvg && (
            <div className="analysis-stat-card">
              <div className="analysis-stat-lbl">Peso medio esta semana</div>
              <div className="analysis-stat-val" style={{color:"var(--text)"}}>{thisAvg.toFixed(1)}</div>
              <div className="analysis-stat-sub">kg{lastAvg ? ` (vs ${lastAvg.toFixed(1)} la semana pasada)` : ""}</div>
            </div>
          )}

          {adherence !== null && (
            <div className="analysis-stat-card">
              <div className="analysis-stat-lbl">Adherencia al plan</div>
              <div className="analysis-stat-val"
                style={{color:adherence>=75?"#5a8a4a":adherence>=50?"#c8860a":"#d94f2b"}}>
                {adherence}%
              </div>
              <div className="analysis-stat-sub">hábitos cumplidos esta semana</div>
            </div>
          )}

          {totalAdjustments > 0 && (
            <div className="analysis-stat-card">
              <div className="analysis-stat-lbl">Ajustes realizados</div>
              <div className="analysis-stat-val" style={{color:"var(--text)"}}>{totalAdjustments}</div>
              <div className="analysis-stat-sub">{kcalSaved} kcal de diferencia acumulada</div>
            </div>
          )}

          <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"16px 18px"}}>
            <div style={{fontFamily:"var(--font-mono)",fontSize:".55rem",letterSpacing:".15em",color:"var(--text-muted)",textTransform:"uppercase",marginBottom:12}}>Cómo funciona</div>
            {[
              {text:"Pérdida ideal: 0.5–1% del peso corporal/semana"},
              {text:"Demasiado rápido (>1.2%): subimos calorías"},
              {text:"Estancamiento con alta adherencia: bajamos calorías"},
              {text:"Baja adherencia: sin ajuste, primero el hábito"},
            ].map((item,i) => (
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:9}}>
                <span style={{fontSize:".72rem",color:"var(--text-muted)",lineHeight:1.5}}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
// ─── PROFILE + TRANSFER HELPERS ──────────────────────────────────────────────
function loadProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)||"null"); } catch { return null; } }
function saveProfileData(d) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(d)); } catch {} }

const TRANSFER_KEYS = [
  "tdee_form_v1","tdee_hist","tdee_macro_plan_v1","tdee_calendar_v1",
  "tdee_peso_v1","tdee_checkins_v1","tdee_adjustments_v1","tdee_profile_v1",
  "tdee_nutrition_v1","tdee_quick_foods_v1","tdee_dark",
];

function generateTransferCode() {
  const snapshot = {};
  TRANSFER_KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v !== null) snapshot[k] = v; } catch {} });
  try { return btoa(unescape(encodeURIComponent(JSON.stringify({ v:1, data:snapshot, ts:Date.now() })))); }
  catch { return null; }
}

function applyTransferCode(raw, onOk, onErr) {
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(raw.trim()))));
    if (!payload.v || !payload.data) { onErr("Código inválido o corrupto."); return; }
    Object.entries(payload.data).forEach(([k,v]) => { try { localStorage.setItem(k,v); } catch {} });
    onOk();
  } catch { onErr("No se pudo leer el código. Cópialo completo sin espacios."); }
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
const AVATAR_EMOJIS = ["💪","🔥","⚡","🏆","🎯","🦁","🐺","🦊","🌟","⭐","🚀","🎽","🥊","🏋️","🧠","❤️","💚","🌊","🦅","🐉"];
const STRATEGY_LABELS = { deficit:"Pérdida de grasa", recomp:"Recomposición", superavit:"Superávit", lean_bulk:"Lean Bulk" };
const DIRECTION_LABELS = { deficit:"Déficit", mantenimiento:"Mantenimiento", superavit:"Superávit" };
const TRABAJO_LABELS = { sedentario:"Sedentario", ligero:"Ligero", moderado:"Moderado", activo:"Activo", muy_activo:"Muy activo" };

function ProfilePage({ onNavigate }){
  const [profile, setProfile] = useState(() => loadProfile() || { name:"", avatar:"💪", since: new Date().toISOString().slice(0,10) });
  const [pickerOpen, setPickerOpen]   = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft]     = useState(profile.name);
  const fileInputRef = useRef(null);
  const [xferTab, setXferTab]         = useState("export"); // export | import
  const [xferCode, setXferCode]       = useState("");
  const [importInput, setImportInput] = useState("");
  const [copied, setCopied]           = useState(false);
  const [xferErr, setXferErr]         = useState("");
  const [xferOk, setXferOk]           = useState("");
  const [cleared, setCleared]         = useState({});

  // Live data from all modules
  const form        = useMemo(() => { try { return JSON.parse(localStorage.getItem(FORM_KEY)||"null"); } catch { return null; } }, []);
  const hist        = useMemo(() => { try { return JSON.parse(localStorage.getItem(HIST_KEY)||"[]"); } catch { return []; } }, []);
  const plan        = useMemo(() => loadPlan(), []);
  const pesoData    = useMemo(() => loadPeso(), []);
  const calendar    = useMemo(() => loadCalendar(), []);
  const adjustments = useMemo(() => { try { return JSON.parse(localStorage.getItem(ADJUST_KEY)||"[]"); } catch { return []; } }, []);
  const quickFoods  = useMemo(() => loadQuickFoods(), []);
  const calStats    = useMemo(() => getCalStats(calendar), [calendar]);

  const pesoChange = pesoData.length >= 2 ? pesoData[pesoData.length-1].weight - pesoData[0].weight : null;
  const ficha      = form || {};
  const imc        = ficha.peso && ficha.altura ? (ficha.peso/((ficha.altura/100)**2)).toFixed(1) : null;
  const planIcon   = { deficit:"🔥", recomp:"⚖️", superavit:"💪", lean_bulk:"🎯" }[plan?.strategy] || "🎯";
  const latestTdee = hist[0]?.tdee ?? null;

  const daysActive = useMemo(() => {
    if (!profile.since) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(profile.since).getTime()) / 86400000));
  }, [profile.since]);

  const updateProfile = patch => {
    const next = { ...profile, ...patch };
    setProfile(next); saveProfileData(next);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) { alert("La imagen no debe superar 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      updateProfile({ photoUrl: ev.target.result });
      setPickerOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearPhoto = () => { updateProfile({ photoUrl: null }); };

  const saveName = () => { updateProfile({ name: nameDraft.trim() }); setEditingName(false); };

  const doExport = () => {
    const c = generateTransferCode();
    if (c) { setXferCode(c); setXferErr(""); }
    else setXferErr("No se pudo generar el código.");
  };

  const doCopy = () => {
    if (!xferCode) return;
    navigator.clipboard?.writeText(xferCode)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2400); })
      .catch(() => { const el = document.querySelector(".xfer-code-box"); el?.focus(); document.execCommand?.("selectAll"); });
  };

  const doImport = () => {
    setXferErr(""); setXferOk("");
    if (!importInput.trim()) { setXferErr("Pega tu código primero."); return; }
    applyTransferCode(importInput,
      () => { setXferOk("✓ Datos importados. Recarga la página para ver los cambios."); setImportInput(""); },
      msg => setXferErr(msg)
    );
  };

  const clearSection = (key, label) => {
    if (!window.confirm(`¿Limpiar "${label}"? No se puede deshacer.`)) return;
    try { localStorage.removeItem(key); } catch {}
    setCleared(c => ({ ...c, [key]: true }));
  };

  const displayName = profile.name || "Tu nombre";

  return (
    <div className="profile-page" onClick={() => setPickerOpen(false)}>
      <div className="page-header">
        <h1>Mi <em>Perfil</em></h1>
        <p>Personaliza tu perfil, ve tus logros y transfiere tus datos a cualquier dispositivo</p>
      </div>

      <div className="profile-layout">

        {/* ── LEFT: avatar + ficha ── */}
        <div>
          <div className="profile-card">
            <div className="profile-card-top">

              {/* Avatar */}
              <div className="profile-avatar-wrap" onClick={e => { e.stopPropagation(); setPickerOpen(v => !v); }}>
                <div className="profile-avatar">
                  {profile.photoUrl
                    ? <img src={profile.photoUrl} alt="avatar"/>
                    : profile.avatar}
                </div>
                <div className="profile-avatar-overlay"><span>📷</span></div>
                <div className="profile-avatar-badge">✏</div>
              </div>

              {/* Hidden file input */}
              <input ref={fileInputRef} type="file" accept="image/*"
                style={{display:"none"}} onChange={handlePhotoUpload}/>

              {pickerOpen && (
                <div className="profile-emoji-picker" onClick={e => e.stopPropagation()}>
                  <div className="profile-emoji-grid">
                    {AVATAR_EMOJIS.map(e => (
                      <button key={e} className={`profile-emoji-btn ${!profile.photoUrl&&profile.avatar===e?"sel":""}`}
                        onClick={() => { updateProfile({ avatar: e, photoUrl: null }); setPickerOpen(false); }}>{e}</button>
                    ))}
                  </div>
                  <div className="profile-photo-row">
                    <button className="profile-photo-btn"
                      onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                      📷 Subir foto
                    </button>
                    {profile.photoUrl && (
                      <button className="profile-photo-btn danger"
                        onClick={e => { e.stopPropagation(); clearPhoto(); setPickerOpen(false); }}>
                        🗑 Quitar foto
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Name */}
              {editingName ? (
                <input className="profile-name-input" autoFocus value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={e => { if (e.key==="Enter") saveName(); if (e.key==="Escape") setEditingName(false); }}
                  placeholder="Tu nombre..." maxLength={28}/>
              ) : (
                <div className="profile-name-wrap" onClick={() => { setNameDraft(profile.name); setEditingName(true); }}>
                  <div className="profile-name-display"><em>{displayName}</em></div>
                  <div className="profile-edit-hint">✏ Pulsa para editar</div>
                </div>
              )}

              <div className="profile-since">
                {daysActive > 0 ? `${daysActive} día${daysActive!==1?"s":""} usando Calculadora` : "Bienvenido a la Calculadora"}
              </div>
            </div>

            {/* Ficha */}
            <div className="profile-ficha">
              {[
                { lbl:"⚧ Sexo",      val: ficha.sexo==="mujer" ? "Mujer" : ficha.sexo ? "Hombre" : "—" },
                { lbl:"📅 Edad",     val: ficha.edad   ? `${ficha.edad} años` : "—" },
                { lbl:"📏 Altura",   val: ficha.altura ? `${ficha.altura} cm`  : "—" },
                { lbl:"⚖️ Peso",     val: pesoData.length ? `${pesoData[pesoData.length-1].weight.toFixed(1)} kg` : ficha.peso ? `${ficha.peso} kg` : "—", accent: true },
                { lbl:"📊 IMC",      val: imc || "—" },
                { lbl:"💧 Grasa",    val: ficha.grasa ? `${ficha.grasa}%` : "—" },
                { lbl:"🚶 Pasos",    val: ficha.pasos ? ficha.pasos.toLocaleString() : "—" },
                { lbl:"🏃 Trabajo",  val: TRABAJO_LABELS[ficha.trabajo] || "—" },
              ].map(r => (
                <div key={r.lbl} className="ficha-row">
                  <span className="ficha-lbl">{r.lbl}</span>
                  <span className={`ficha-val ${r.accent?"accent":""}`}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="profile-right">

          {/* Objetivo activo */}
          {(plan || ficha.direction) && (
            <div className="objetivo-card">
              <div className="objetivo-text">
                <div className="objetivo-label">Objetivo actual</div>
                <div className="objetivo-value">
                  <em>{plan ? STRATEGY_LABELS[plan.strategy] : DIRECTION_LABELS[ficha.direction] || "—"}</em>
                </div>
                <div className="objetivo-sub">
                  {plan ? `${plan.kcalObj?.toLocaleString()} kcal/día · P${plan.pPct}% G${plan.fPct}% C${plan.cPct}%`
                        : latestTdee ? `TDEE: ${latestTdee.toLocaleString()} kcal/día` : "Calcula tu TDEE para empezar"}
                </div>
              </div>
              {plan && <button className="today-banner-cta" onClick={() => onNavigate("calculator")} style={{flexShrink:0}}>Editar →</button>}
            </div>
          )}

          {/* Logros */}
          <div>
            <div className="profile-section-title">Tus logros</div>
            <div className="logros-grid">
              {[
                {  val: calStats.streak,            label:"Racha",          sub:"días seguidos", color:"accent"  },
                {  val: calStats.full,               label:"Días perfectos", sub:"3/3 hábitos",   color:"green"   },
                {  val: Object.keys(calendar).length,label:"Días registrados",sub:"en calendario", color:"blue"   },
                {  val: pesoData.length,            label:"Pesajes",        sub: pesoChange!==null ? `${pesoChange>0?"+":""}${pesoChange.toFixed(1)} kg total` : "registros", color:"yellow" },
                {  val: adjustments.length,          label:"Ajustes",        sub:"por Mi Análisis",color:"purple"  },
                {  val: quickFoods.length,           label:"Alimentos",      sub:"en biblioteca",  color:"accent"  },
              ].map((l,i) => (
                <div key={i} className="logro-card">
                  <div className={`logro-val ${l.color}`}>{l.val}</div>
                  <div className="logro-lbl">{l.label}</div>
                  <div className="logro-sub">{l.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan de macros */}
          {plan && (
            <div className="plan-activo-card">
              <div className="plan-activo-header">
                <div className="plan-activo-title">Plan de <em>macros</em> activo</div>
                <div className="plan-activo-badge" style={{color:"#5a8a4a",background:"rgba(90,138,74,.08)",borderColor:"rgba(90,138,74,.25)"}}>✓ Activo</div>
              </div>
              <div className="plan-activo-body">
                {[{name:"Proteína",g:plan.protG,pct:plan.pPct,color:"#d94f2b"},{name:"Grasa",g:plan.fatG,pct:plan.fPct,color:"#e8793a"},{name:"Carbos",g:plan.carbG,pct:plan.cPct,color:"#3a6e9e"}].map(m=>(
                  <div key={m.name} className="plan-macro-row">
                    <span style={{fontFamily:"var(--font-mono)",fontSize:".67rem",color:"var(--text-muted)",width:62}}>{m.name}</span>
                    <div className="plan-macro-bar-wrap"><div className="plan-macro-bar-fill" style={{width:`${m.pct}%`,background:m.color}}/></div>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:".67rem",minWidth:58,textAlign:"right"}}>
                      <span style={{color:m.color,fontWeight:500}}>{m.g}g</span>
                      <span style={{color:"var(--text-dim)",marginLeft:3}}>{m.pct}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── IMPORTAR / EXPORTAR ── */}
          <div className="transfer-card">
            <div className="transfer-card-header">
              <div className="transfer-card-title">Mis datos en otro <em>dispositivo</em></div>
            </div>
            <div className="xfer-tabs">
              <button className={`xfer-tab ${xferTab==="export"?"active":""}`} onClick={()=>{setXferTab("export");setXferErr("");setXferOk("");}}>Exportar</button>
              <button className={`xfer-tab ${xferTab==="import"?"active":""}`} onClick={()=>{setXferTab("import");setXferErr("");setXferOk("");}}>Importar</button>
            </div>
            <div className="xfer-body">
              {xferTab === "export" && (
                <>
                  <div className="xfer-note">
                    <strong>Cómo funciona:</strong> genera un código con todos tus datos (peso, calendario, nutrición, macros…).
                    Cópialo, ve al otro dispositivo, abre Mi Perfil → Importar y pégalo. Tus datos aparecerán al instante.
                  </div>
                  {xferCode ? (
                    <>
                      <div className="xfer-code-box" tabIndex={0}>{xferCode}</div>
                      <div className="xfer-row">
                        <button className={`xfer-btn ${copied?"ok":""}`} onClick={doCopy}>
                          {copied ? "✓ Copiado" : "Copiar código"}
                        </button>
                        <button className="xfer-btn" onClick={doExport}>Regenerar</button>
                      </div>
                    </>
                  ) : (
                    <button className="xfer-btn primary" onClick={doExport}>Generar código de exportación</button>
                  )}
                  {xferErr && <div className="xfer-error">{xferErr}</div>}
                </>
              )}
              {xferTab === "import" && (
                <>
                  <div className="xfer-note">
                    <strong>Cómo funciona:</strong> en el dispositivo de origen ve a Mi Perfil → Exportar, genera el código y cópialo.
                    Pégalo aquí y pulsa Importar. Se restaurarán todos tus datos.
                  </div>
                  {xferOk && <div className="xfer-success">{xferOk}</div>}
                  {xferErr && <div className="xfer-error">{xferErr}</div>}
                  <div className="xfer-row">
                    <input className="xfer-input" placeholder="Pega tu código aquí..."
                      value={importInput} onChange={e=>{setImportInput(e.target.value);setXferErr("");setXferOk("");}}
                      onKeyDown={e=>e.key==="Enter"&&doImport()}/>
                    <button className="xfer-btn primary" onClick={doImport}>Importar</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Gestión de datos */}
          <div>
            <div className="profile-section-title">Gestión de datos</div>
            <div className="datos-card">
              {[
                { key:CAL_KEY,          label:"Calendario y hábitos",   desc:"Registros diarios" },
                { key:PESO_KEY,         label:"Registros de peso",       desc:`${pesoData.length} pesaje${pesoData.length!==1?"s":""}` },
                { key:NUTR_KEY,         label:"Diario de nutrición",     desc:"Alimentos del día" },
                { key:QUICK_FOODS_KEY,  label:"Biblioteca de alimentos", desc:`${quickFoods.length} alimento${quickFoods.length!==1?"s":""}` },
                { key:HIST_KEY,         label:"Historial de cálculos",   desc:`${hist.length} cálculo${hist.length!==1?"s":""}` },
                { key:ADJUST_KEY,       label:"Historial de ajustes",    desc:`${adjustments.length} ajuste${adjustments.length!==1?"s":""}` },
              ].map(item => (
                <div key={item.key} className="datos-item">
                  <div className="datos-item-left">
                    <div className="datos-item-info">
                      <strong>{item.label}</strong>
                      <span>{cleared[item.key] ? "✓ Limpiado" : item.desc}</span>
                    </div>
                  </div>
                  <button className="datos-clear-btn" onClick={() => clearSection(item.key, item.label)} disabled={!!cleared[item.key]}>
                    {cleared[item.key] ? "Limpiado" : "Limpiar"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"13px 16px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:"1rem"}}></span>
            <div>
              <div style={{fontSize:".74rem",fontWeight:500,color:"var(--text)",marginBottom:1}}>Tus datos son solo tuyos</div>
              <div style={{fontSize:".67rem",color:"var(--text-muted)"}}>Todo se guarda en tu navegador. Nada se envía a servidores externos.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


// ─── DAY MODAL ───────────────────────────────────────────────────────────────
function DayModal({ dateKey, calendar, onSave, onClose }) {
  const existing = calendar[dateKey] || {};
  const [draft, setDraft] = useState({training:false,diet:false,sleep:false,note:"",...existing});
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
        <textarea className="modal-notes" rows={2} placeholder="Nota del día (opcional)..."
          value={draft.note||""} onChange={e=>setDraft(d=>({...d,note:e.target.value}))}/>
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
  const [toast, setToast] = useState(null);
  const now = new Date();
  const stats = getCalStats(calendar, viewYear);
  const prevStreak = useRef(stats.streak);
  useEffect(() => {
    const milestones = [3,7,14,21,30,60,100];
    if (stats.streak > prevStreak.current && milestones.includes(stats.streak)) {
      setToast(stats.streak);
    }
    prevStreak.current = stats.streak;
  }, [stats.streak]);

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
          {val:stats.streak,  lbl:"Racha actual",    color:"#d94f2b"},
          {val:stats.full,    lbl:"Días perfectos",   color:"#5a8a4a"},
          {val:stats.partial, lbl:"Días parciales",   color:"#c8860a"},
          {val:stats.full+stats.partial+stats.failed,lbl:"Días registrados", color:"#3a6e9e"},
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
      {toast && <StreakToast streak={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}

// ─── CALCULATOR PAGE ─────────────────────────────────────────────────────────
function CalculatorPage({ onNavigate }) {
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
        <p>Basado en la fórmula Mifflin-St Jeor · Katch-McArdle · Factor de actividad calibrado · Evidencia actualizada</p>
      </div>

      <TodayBanner onNavigate={onNavigate}/>
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
                  {[{text:"Gasto calórico real en 4 componentes"},{text:"Macros adaptados a tu objetivo personalizado"},{text:"Composición corporal e IMC contextualizado"},{text:"Comparación de escenarios e historial"},].map(item=>(
                    <div key={item.text} style={{display:"flex",alignItems:"flex-start",gap:11,background:"var(--bg-warm)",borderRadius:"var(--r)",padding:"9px 13px",border:"1px solid var(--border)"}}>
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
                    <p className="res-label">Mantenimiento · {resultado.usandoKatch?"Katch-McArdle":"Mifflin-St Jeor · factor calibrado"}</p>
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
              <p className="note">Estimación ±10–15%. El IMC es una referencia estadística poblacional. No sustituye consulta con dietista/nutricionista colegiado.</p>
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
        <p>Mifflin-St Jeor (1990) · Katch-McArdle · Factor de actividad ajustado por intensidad · IoM DRI</p>
        <p>No sustituye consulta con dietista/nutricionista colegiado</p>
      </div>
    </>
  );
}


// ─── NUTRITION PAGE ──────────────────────────────────────────────────────────
const NUTR_KEY = "tdee_nutrition_v1";

const MEAL_DEFS = [
  { id:"breakfast", name:"Desayuno",     },
  { id:"midmorning",name:"Media mañana", },
  { id:"lunch",     name:"Almuerzo",     },
  { id:"snack",     name:"Merienda",     },
  { id:"dinner",    name:"Cena",         },
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
          <span style={{fontFamily:"var(--font-mono)",fontSize:".58rem",color:"var(--text-dim)"}}>Edita en Calculadora → Nutrición</span>
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

// ─── SIDEBAR USER ─────────────────────────────────────────────────────────────
function SidebarUser({ onNavigate }) {
  const prof = useMemo(() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)||"null"); } catch { return null; } }, []);
  if (!prof?.name) return null;
  return (
    <button onClick={() => onNavigate("profile")}
      style={{display:"flex",alignItems:"center",gap:9,padding:"7px 14px",borderRadius:"var(--r)",
        border:"1px solid var(--border)",background:"transparent",cursor:"pointer",
        width:"100%",transition:"var(--tr)",color:"var(--text-muted)"}}>
      <div style={{width:26,height:26,borderRadius:"50%",background:"var(--accent-dim)",
        border:"1.5px solid var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:"1rem",flexShrink:0,overflow:"hidden"}}>
        {prof.photoUrl
          ? <img src={prof.photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : (prof.avatar || "💪")}
      </div>
      <span style={{fontFamily:"var(--font-mono)",fontSize:".65rem",overflow:"hidden",
        textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{prof.name}</span>
    </button>
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
        {id:"calculator",  label:"Calculadora"},
        {id:"calendar",    label:"Calendario"},
        {id:"nutrition",   label:"Nutrición"},
        {id:"peso",        label:"Peso"},
        {id:"analisis",    label:"Análisis"},
        {id:"profile",     label:"Perfil"},
      ]
    },
    {
      section: "Próximamente",
      items: [
        {id:"progress",   label:"Progreso",    badge:"Soon"},
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
            <p>TDEE CALCULATOR <span className="sidebar-v-badge">v5.0</span></p>
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
                    <span>{item.label}</span>
                    {item.badge&&<span className="nav-badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <SidebarUser onNavigate={navigate}/>
            <button className="dark-toggle" onClick={()=>setDarkMode(d=>!d)}>
              <span>{darkMode?"☀️":"🌙"}</span>
              <span>{darkMode?"Modo claro":"Modo oscuro"}</span>
            </button>
            {autoSaveTs&&<div className="autosave-badge">✓ Guardado automático {autoSaveTs}</div>}
          </div>
        </nav>

        <div className="main-content">
          {page==="calculator" && <CalculatorPage onNavigate={navigate}/>}
          {page==="calendar"   && <CalendarPage/>}
          {page==="nutrition"  && <NutritionPage/>}
          {page==="peso"       && <PesoPage/>}
          {page==="analisis"   && <AnalysisPage onNavigate={navigate}/>}
          {page==="profile"    && <ProfilePage onNavigate={navigate}/>}
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