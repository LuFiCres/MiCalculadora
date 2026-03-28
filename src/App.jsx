import { useState, useEffect } from "react";

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
    --shadow-btn: 0 2px 8px rgba(180,80,20,0.18);
    --transition-btn: all 0.12s cubic-bezier(0.34,1.2,0.64,1);
  }

  /* ── DARK MODE ── */
  body.dark {
    --bg: #0d0d14; --bg-warm: #13131e; --surface: #17172a; --surface-2: #1e1e30;
    --border: rgba(60,110,210,0.2); --border-strong: rgba(60,110,210,0.4);
    --accent: #4a8fd4; --accent-2: #5fa8f0;
    --accent-dim: rgba(74,143,212,0.13); --accent-glow: rgba(74,143,212,0.28);
    --text: #e8e8f8; --text-muted: #7878a8; --text-dim: #44446a;
    --green: #3a8a6a; --green-dim: rgba(58,138,106,0.12);
    --blue: #4a8fd4; --blue-dim: rgba(74,143,212,0.12);
    --yellow: #c8a020; --yellow-dim: rgba(200,160,32,0.12);
    --purple: #8a6ab8;
    --shadow-btn: 0 2px 12px rgba(30,60,160,0.28);
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; -webkit-font-smoothing: antialiased; overflow-x: hidden; transition: background .3s, color .3s; }

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

  /* ── Dark toggle button ── */
  .dark-toggle {
    display: flex; align-items: center; gap: 7px;
    padding: 7px 14px; border-radius: 100px;
    border: 1.5px solid var(--border); background: var(--surface);
    color: var(--text-muted); font-family: var(--font-mono); font-size: .65rem;
    cursor: pointer; letter-spacing: .06em; transition: var(--transition-btn);
    box-shadow: var(--shadow-btn);
  }
  .dark-toggle:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); transform: translateY(-1px); box-shadow: 0 4px 14px var(--accent-glow); }
  .dark-toggle:active { transform: scale(0.96) translateY(0); box-shadow: 0 1px 4px var(--accent-glow); }

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
  body.dark .styled-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237878a8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  }
  .styled-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .styled-select option { background: var(--surface); color: var(--text); }

  /* ── Toggle ── */
  .sex-toggle { display: grid; grid-template-columns: 1fr 1fr; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); overflow: hidden; }
  .sex-btn { padding: 12px; text-align: center; cursor: pointer; font-size: 0.8rem; color: var(--text-muted); border: none; background: transparent; font-family: var(--font-body); transition: var(--transition-btn); }
  .sex-btn:active { transform: scale(0.96); }
  .sex-btn.active { background: var(--accent-dim); color: var(--accent); font-weight: 500; }

  .info-box { background: var(--accent-dim); border: 1px solid rgba(217,79,43,.2); border-radius: var(--r); padding: 12px 16px; font-size: 0.75rem; color: var(--text-muted); line-height: 1.6; margin-top: 4px; }
  .info-box strong { color: var(--accent); font-weight: 500; }

  /* ── CTA button with physics ── */
  .cta {
    width: 100%; padding: 17px; background: var(--accent); color: #faf7f2;
    border: none; border-radius: 12px; font-family: var(--font-body); font-size: 0.9rem;
    font-weight: 500; cursor: pointer; letter-spacing: .03em; margin-top: 8px;
    transition: var(--transition-btn);
    box-shadow: var(--shadow-btn), 0 4px 0 rgba(0,0,0,0.15);
  }
  .cta:hover { background: var(--accent-2); transform: translateY(-2px); box-shadow: var(--shadow-btn), 0 6px 0 rgba(0,0,0,0.12), 0 8px 20px var(--accent-glow); }
  .cta:active { transform: translateY(2px) scale(0.985); box-shadow: 0 1px 0 rgba(0,0,0,0.15), 0 2px 6px var(--accent-glow); }

  /* ── Slider ── */
  .slider-field { display: flex; flex-direction: column; gap: 10px; }
  .slider-top { display: flex; justify-content: space-between; align-items: center; }
  .slider-top label { font-size: .73rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
  .slider-value { font-family: var(--font-mono); font-size: .85rem; color: var(--accent); font-weight: 500; }
  .slider-wrap { position: relative; padding-bottom: 18px; }
  input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; border: none; cursor: pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--accent); cursor: pointer; box-shadow: 0 0 10px var(--accent-glow); transition: transform .12s; border: 3px solid var(--surface); }
  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.25); }
  input[type=range]::-webkit-slider-thumb:active { transform: scale(1.1); box-shadow: 0 0 16px var(--accent-glow); }
  .slider-mark { position: absolute; bottom: 0; transform: translateX(-50%); font-family: var(--font-mono); font-size: .58rem; color: var(--text-dim); white-space: nowrap; }
  .slider-hint { font-size: .68rem; color: var(--text-dim); font-style: italic; }

  /* ── Tooltip ── */
  .tip-wrap { position: relative; display: inline-flex; align-items: center; }
  .tip-icon { width: 15px; height: 15px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border); font-size: .6rem; color: var(--text-muted); cursor: help; display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-mono); flex-shrink: 0; transition: var(--transition-btn); }
  .tip-icon:hover { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
  .tip-box { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: #1a1a2e; color: #e8e8f8; font-family: var(--font-body); font-size: .72rem; line-height: 1.55; padding: 10px 14px; border-radius: 8px; width: 230px; z-index: 200; pointer-events: none; opacity: 0; transition: opacity .15s; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
  .tip-wrap:hover .tip-box { opacity: 1; }

  /* ── Welcome panel ── */
  .welcome-panel { border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; background: var(--surface); }
  @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .wel-line { animation: fadeSlideIn .4s ease both; }
  .wel-l1{animation-delay:.0s} .wel-l2{animation-delay:.08s} .wel-l3{animation-delay:.16s} .wel-l4{animation-delay:.24s} .wel-l5{animation-delay:.32s}
  @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
  .wel-dot { animation: pulse 2s ease-in-out infinite; }

  /* ── Results panel ── */
  .results-panel { border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; background: var(--surface); animation: fadeUp .4s ease; box-shadow: 0 4px 40px rgba(180,100,40,.08); }
  body.dark .results-panel { box-shadow: 0 4px 40px rgba(30,60,160,.12); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Error box ── */
  .error-box { background: rgba(217,79,43,.08); border: 1.5px solid rgba(217,79,43,.35); border-radius: var(--r); padding: 14px 16px; display: flex; gap: 12px; align-items: flex-start; }
  .error-icon { font-size: 1.2rem; flex-shrink: 0; line-height: 1.3; }
  .error-title { font-size: .8rem; font-weight: 500; color: var(--accent); margin-bottom: 4px; }
  .error-msg { font-size: .73rem; color: var(--text-muted); line-height: 1.55; }

  /* ── Results header ── */
  .results-header { padding: 24px 28px 20px; border-bottom: 1px solid var(--border); background: linear-gradient(135deg, var(--surface) 0%, var(--bg-warm) 100%); }
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
  .tab-btn { flex: 1; padding: 10px 4px; text-align: center; cursor: pointer; font-size: .65rem; font-family: var(--font-mono); color: var(--text-muted); border: none; background: transparent; border-bottom: 2px solid transparent; transition: var(--transition-btn); letter-spacing: .06em; text-transform: uppercase; }
  .tab-btn:active { transform: scale(0.95); }
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
  .target-row { background: var(--bg-warm); border-radius: var(--r); padding: 11px 14px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); transition: var(--transition-btn); }
  .target-row:active { transform: scale(0.98); }
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
  .meal-btn { padding: 5px 14px; border-radius: 6px; font-size: .68rem; font-family: var(--font-mono); cursor: pointer; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-muted); transition: var(--transition-btn); box-shadow: 0 2px 0 var(--border); }
  .meal-btn:hover { border-color: var(--accent); color: var(--accent); }
  .meal-btn:active { transform: translateY(2px); box-shadow: none; }
  .meal-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent-dim); box-shadow: 0 2px 0 rgba(217,79,43,.2); }
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
  .save-btn { width: 100%; padding: 12px; background: var(--surface); color: var(--text-muted); border: 1.5px solid var(--border); border-radius: var(--r); font-family: var(--font-body); font-size: .8rem; cursor: pointer; transition: var(--transition-btn); box-shadow: 0 2px 0 var(--border); }
  .save-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); transform: translateY(-1px); box-shadow: 0 4px 0 rgba(217,79,43,.15); }
  .save-btn:active { transform: translateY(2px); box-shadow: none; }
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
  .hist-clear { font-family: var(--font-mono); font-size: .68rem; color: var(--text-muted); background: none; border: 1px solid var(--border); border-radius: 6px; padding: 6px 14px; cursor: pointer; transition: var(--transition-btn); box-shadow: 0 2px 0 var(--border); }
  .hist-clear:hover { color: var(--accent); border-color: var(--accent-dim); }
  .hist-clear:active { transform: translateY(2px); box-shadow: none; }
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

  /* ── Autosave indicator ── */
  .autosave-badge { font-family: var(--font-mono); font-size: .58rem; color: var(--green); background: var(--green-dim); border: 1px solid rgba(90,138,74,.2); padding: 3px 9px; border-radius: 100px; letter-spacing: .06em; transition: opacity .4s; }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .page { grid-template-columns: 1fr; padding: 0 20px; gap: 0; width: 100%; }
    .header {
      grid-column: 1; flex-direction: row; align-items: flex-start;
      justify-content: space-between; padding: 24px 0 22px; margin-bottom: 32px;
    }
    .header-left { flex: 1; padding-right: 12px; }
    .header-left h1 { font-size: 2rem; }
    .header-left p { font-size: .75rem; margin-top: 6px; }
    .header-right { flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
    .header-badges { display: none; }
    .autosave-badge { font-size: .52rem; padding: 2px 7px; }
    .left-col, .right-col, .historial, .footer { grid-column: 1; grid-row: auto; }
    .right-col { position: static; max-height: none; overflow-y: visible; margin-top: 32px; }
    .input-grid.cols-3 { grid-template-columns: 1fr 1fr; }
    .footer { flex-direction: column; gap: 8px; text-align: center; }
    .compare-cards { grid-template-columns: 1fr; }
    .tip-box { left: auto; right: 0; top: 130%; transform: none; }
  }

  @media (max-width: 480px) {
    .page { padding: 0 16px; }
    .header-left h1 { font-size: 1.65rem; }
    .input-grid.cols-3 { grid-template-columns: 1fr; }
    .macros-grid { grid-template-columns: 1fr 1fr 1fr; }
    .tabs { overflow-x: auto; }
    .tab-btn { font-size: .58rem; padding: 10px 2px; }
    .dark-toggle { padding: 6px 10px; font-size: .6rem; gap: 5px; }
  }
  /* ── App navigation ── */
  .app-nav { grid-column: 1/-1; display: flex; align-items: center; gap: 4px; margin-bottom: 40px; border-bottom: 1.5px solid var(--border); padding-bottom: 0; }
  .app-nav-tab {
    padding: 10px 22px; font-family: var(--font-mono); font-size: .72rem; letter-spacing: .08em;
    color: var(--text-muted); border: none; background: transparent; cursor: pointer;
    border-bottom: 2.5px solid transparent; margin-bottom: -1.5px;
    transition: var(--transition-btn); text-transform: uppercase;
  }
  .app-nav-tab:hover { color: var(--accent); }
  .app-nav-tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 500; }
  .app-nav-tab:active { transform: scale(0.97); }
  .nav-beta { font-family: var(--font-mono); font-size: .55rem; padding: 2px 7px; border-radius: 100px; background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent-dim); margin-left: 6px; letter-spacing: .06em; vertical-align: middle; }

  /* ── Progress page ── */
  .progress-page { grid-column: 1/-1; grid-row: 2; padding-bottom: 80px; }

  /* Level card */
  .level-card {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: var(--r-lg); padding: 28px 32px; margin-bottom: 24px;
    display: flex; align-items: center; gap: 28px;
    box-shadow: 0 4px 32px var(--accent-glow);
    position: relative; overflow: hidden;
  }
  .level-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--accent-dim) 0%, transparent 60%);
    pointer-events: none;
  }
  .level-icon { font-size: 3rem; flex-shrink: 0; line-height: 1; }
  .level-info { flex: 1; min-width: 0; }
  .level-num { font-family: var(--font-mono); font-size: .65rem; color: var(--accent); letter-spacing: .15em; text-transform: uppercase; margin-bottom: 4px; }
  .level-name { font-family: var(--font-display); font-size: 2rem; color: var(--text); line-height: 1.1; margin-bottom: 12px; }
  .level-name em { font-style: italic; color: var(--accent); }
  .xp-bar-wrap { position: relative; }
  .xp-bar-track { height: 8px; background: var(--surface-2); border-radius: 4px; overflow: hidden; }
  .xp-bar-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .8s cubic-bezier(.34,1.2,.64,1); }
  .xp-labels { display: flex; justify-content: space-between; margin-top: 6px; font-family: var(--font-mono); font-size: .6rem; color: var(--text-muted); }
  .level-xp-total { text-align: right; flex-shrink: 0; }
  .xp-big { font-family: var(--font-display); font-size: 2.8rem; color: var(--accent); line-height: 1; }
  .xp-lbl { font-family: var(--font-mono); font-size: .6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .1em; }

  /* Stats row */
  .stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-bottom: 28px; }
  .stat-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); padding: 16px 18px; text-align: center; }
  .stat-val { font-family: var(--font-display); font-size: 2rem; line-height: 1; margin-bottom: 3px; }
  .stat-lbl { font-family: var(--font-mono); font-size: .58rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; line-height: 1.4; }

  /* Calendar */
  .cal-wrap { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; margin-bottom: 24px; }
  .cal-header { padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
  .cal-month { font-family: var(--font-display); font-size: 1.3rem; }
  .cal-month em { font-style: italic; color: var(--accent); }
  .cal-nav-btn { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-muted); cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: var(--transition-btn); box-shadow: 0 2px 0 var(--border); }
  .cal-nav-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .cal-nav-btn:active { transform: translateY(2px); box-shadow: none; }
  .cal-weekdays { display: grid; grid-template-columns: repeat(7,1fr); padding: 10px 16px 4px; }
  .cal-wd { text-align: center; font-family: var(--font-mono); font-size: .6rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: .06em; }
  .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; padding: 8px 16px 16px; }
  .cal-day {
    aspect-ratio: 1; border-radius: 10px; border: 1.5px solid transparent;
    cursor: pointer; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 3px; transition: var(--transition-btn);
    position: relative; background: var(--bg-warm); min-height: 52px;
  }
  .cal-day:hover { border-color: var(--accent); transform: scale(1.04); }
  .cal-day:active { transform: scale(0.97); }
  .cal-day.empty { background: transparent; cursor: default; border-color: transparent; }
  .cal-day.empty:hover { transform: none; }
  .cal-day.today { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
  .cal-day.future { opacity: .4; cursor: not-allowed; }
  .cal-day.future:hover { transform: none; border-color: transparent; }
  .cal-day.tracked-full { background: rgba(90,138,74,.15); border-color: rgba(90,138,74,.3); }
  .cal-day.tracked-partial { background: rgba(200,134,10,.1); border-color: rgba(200,134,10,.25); }
  .cal-day.tracked-none { background: rgba(217,79,43,.06); border-color: rgba(217,79,43,.15); }
  .cal-day-num { font-family: var(--font-mono); font-size: .72rem; color: var(--text-muted); font-weight: 500; line-height: 1; }
  .cal-day.today .cal-day-num { color: var(--accent); font-weight: 700; }
  .cal-dots { display: flex; gap: 2px; }
  .cal-dot { width: 6px; height: 6px; border-radius: 50%; }

  /* Day modal */
  .day-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); animation: fadeIn .15s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .day-modal { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 28px; width: 100%; max-width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,.3); animation: slideUp .2s ease; }
  @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .modal-title { font-family: var(--font-display); font-size: 1.3rem; margin-bottom: 6px; }
  .modal-title em { font-style: italic; color: var(--accent); }
  .modal-sub { font-size: .75rem; color: var(--text-muted); margin-bottom: 22px; font-family: var(--font-mono); }
  .cat-btn {
    width: 100%; display: flex; align-items: center; gap: 14px; padding: 14px 16px;
    border-radius: var(--r); border: 1.5px solid var(--border); background: var(--bg-warm);
    cursor: pointer; margin-bottom: 10px; transition: var(--transition-btn);
    box-shadow: 0 2px 0 var(--border); text-align: left; font-family: var(--font-body);
  }
  .cat-btn:hover { border-color: var(--accent); transform: translateY(-1px); box-shadow: 0 4px 0 rgba(217,79,43,.15); }
  .cat-btn:active { transform: translateY(2px); box-shadow: none; }
  .cat-btn.done { border-color: transparent; box-shadow: 0 2px 0 rgba(0,0,0,.08); }
  .cat-icon { font-size: 1.4rem; flex-shrink: 0; }
  .cat-text { flex: 1; }
  .cat-name { font-size: .85rem; font-weight: 500; margin-bottom: 1px; }
  .cat-desc { font-size: .7rem; color: var(--text-muted); }
  .cat-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: .75rem; flex-shrink: 0; transition: var(--transition-btn); }
  .cat-btn.done .cat-check { border-color: transparent; }
  .modal-actions { display: flex; gap: 10px; margin-top: 18px; }
  .modal-save { flex: 1; padding: 13px; background: var(--accent); color: #faf7f2; border: none; border-radius: var(--r); font-family: var(--font-body); font-size: .85rem; font-weight: 500; cursor: pointer; transition: var(--transition-btn); box-shadow: 0 4px 0 rgba(0,0,0,.15); }
  .modal-save:hover { background: var(--accent-2); transform: translateY(-2px); box-shadow: 0 6px 0 rgba(0,0,0,.12); }
  .modal-save:active { transform: translateY(2px); box-shadow: none; }
  .modal-cancel { padding: 13px 18px; background: var(--surface); color: var(--text-muted); border: 1.5px solid var(--border); border-radius: var(--r); font-family: var(--font-body); font-size: .85rem; cursor: pointer; transition: var(--transition-btn); box-shadow: 0 2px 0 var(--border); }
  .modal-cancel:hover { border-color: var(--accent); color: var(--accent); }
  .modal-cancel:active { transform: translateY(2px); box-shadow: none; }

  /* Calendar legend */
  .cal-legend { display: flex; gap: 16px; flex-wrap: wrap; padding: 0 0 4px; }
  .leg-item { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: .62rem; color: var(--text-muted); }
  .leg-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

  /* Streak fire animation */
  @keyframes fireFlicker { 0%,100%{transform:scale(1) rotate(-2deg)} 50%{transform:scale(1.08) rotate(2deg)} }
  .fire-icon { display: inline-block; animation: fireFlicker 1.4s ease-in-out infinite; }

  @media (max-width: 960px) {
    .stats-row { grid-template-columns: 1fr 1fr; }
    .level-card { flex-direction: column; align-items: flex-start; gap: 16px; }
    .level-xp-total { align-self: flex-start; }
    .cal-day { min-height: 44px; }
  }
  @media (max-width: 480px) {
    .stats-row { grid-template-columns: 1fr 1fr; }
    .level-card { padding: 20px; }
    .cal-day { min-height: 38px; border-radius: 8px; }
    .cal-dot { width: 5px; height: 5px; }
    .day-modal { padding: 20px; }
  }

`;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TIPS = {
  bmr: "Metabolismo Basal: calorías que tu cuerpo gasta para mantenerse vivo en reposo absoluto. Respirar, temperatura corporal, función orgánica.",
  eat: "Exercise Activity Thermogenesis: calorías quemadas durante el ejercicio planificado (pesas, cardio).",
  neat: "Non-Exercise Activity Thermogenesis: calorías quemadas en todo lo que no es ejercicio. Caminar, gesticular, levantarte de la silla. Muy variable entre personas.",
  tef: "Thermic Effect of Food: energía que gasta tu cuerpo digiriendo alimentos. Equivale a ~10% de tu ingesta calórica total.",
  rir: "Repeticiones en Reserva: cuántas reps quedan antes del fallo muscular. RIR 0 = fallo total. RIR 3 = trabajo moderado.",
  imc: "Índice de Masa Corporal: relación peso/altura². Orientativo — no distingue músculo de grasa.",
  katch: "Fórmula de Katch-McArdle: más precisa que Mifflin-St Jeor porque usa la masa magra real en lugar de estimarla por sexo, peso y altura.",
};

const MEAL_PLANS = {
  3: [{ name:"Desayuno",emoji:"☕",pct:.30},{name:"Almuerzo",emoji:"🍽️",pct:.40},{name:"Cena",emoji:"🌙",pct:.30}],
  4: [{ name:"Desayuno",emoji:"☕",pct:.25},{name:"Almuerzo",emoji:"🍽️",pct:.35},{name:"Merienda",emoji:"🍎",pct:.15},{name:"Cena",emoji:"🌙",pct:.25}],
  5: [{ name:"Desayuno",emoji:"☕",pct:.20},{name:"Media mañana",emoji:"🍎",pct:.12},{name:"Almuerzo",emoji:"🍽️",pct:.35},{name:"Merienda",emoji:"🫐",pct:.13},{name:"Cena",emoji:"🌙",pct:.20}],
};

const FORM_KEY = "tdee_form_v1";
const HIST_KEY = "tdee_hist";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function markPos(val, min, max) {
  const pct = (val - min) / (max - min);
  return `calc(${pct * 100}% - ${9 * (2 * pct - 1)}px)`;
}

function imcInfo(v) {
  if (v < 18.5) return { label:"IMC bajo",        color:"#3a6e9e", bg:"rgba(58,110,158,.1)",  note:"Un IMC bajo puede indicar poca masa corporal total, pero el contexto individual siempre importa." };
  if (v < 25)   return { label:"Rango habitual",  color:"#5a8a4a", bg:"rgba(90,138,74,.1)",   note:"IMC dentro del rango estadísticamente más común. Recuerda que es solo una referencia poblacional." };
  if (v < 30)   return { label:"IMC elevado",     color:"#c8860a", bg:"rgba(200,134,10,.1)",  note:"Un IMC alto no significa necesariamente exceso de grasa. En personas con mucha masa muscular es completamente normal superar este umbral." };
  return               { label:"IMC muy elevado", color:"#d94f2b", bg:"rgba(217,79,43,.1)",   note:"El IMC es una métrica poblacional muy limitada. No distingue músculo de grasa ni tiene en cuenta la distribución corporal." };
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
  const pPerKg = r.proteinG / r.peso;
  const deficit = r.mantenimiento - r.kcalObj;
  if (r.kcalObj < r.bmr * 0.85) return { label:"⚠ Riesgo",        color:"#d94f2b", bg:"rgba(217,79,43,.1)", msg:"Ingesta por debajo del 85% del BMR. Riesgo serio de pérdida muscular y carencias nutricionales." };
  if (deficit > 500)             return { label:"⚠ Agresivo",      color:"#c8860a", bg:"rgba(200,134,10,.1)",msg:"Déficit elevado. Asegura proteína alta y considera una semana de mantenimiento cada 6-8 semanas." };
  if (pPerKg < 1.6 && deficit > 0) return { label:"⚠ Proteína baja",color:"#c8860a", bg:"rgba(200,134,10,.1)",msg:"Con déficit calórico la proteína debería ser ≥1.6 g/kg para preservar masa muscular." };
  if (deficit <= 0)              return { label:"✓ Óptimo",        color:"#5a8a4a", bg:"rgba(90,138,74,.1)", msg:"Plan equilibrado. Monitorea el peso cada semana en las mismas condiciones." };
  return                               { label:"✓ Correcto",       color:"#5a8a4a", bg:"rgba(90,138,74,.1)", msg:"Plan sostenible. Ajusta cada 2-3 semanas según evolución real del peso." };
}

function recompViability(bf, sexo, dias, met) {
  if (!bf || Number(bf) <= 0) return null;
  const bfN = Number(bf);
  const highBf = sexo === "hombre" ? bfN > 20 : bfN > 27;
  const goodTraining = dias >= 3 && met >= 4.5;
  if (highBf && goodTraining) return { viable:true,  msg:"Con tu % de grasa y nivel de entreno, la recomposición corporal es viable. Mantén un déficit mínimo (~150-200 kcal) y proteína muy alta (2.2+ g/kg)." };
  if (!goodTraining)          return { viable:false, msg:"Para recomposición necesitas ≥3 días/semana con intensidad moderada-alta. Sube el volumen, el esfuerzo o la frecuencia." };
  return                             { viable:false, msg:"Con tu % de grasa actual, un déficit moderado + proteína alta dará resultados más rápidos que intentar recomp." };
}

function computeMET(rir, series, descanso) {
  const rirScore      = { "0":2.0,"1-2":1.5,"3-4":1.0,"5+":0.5 }[rir]      ?? 1.5;
  const seriesScore   = { "1-2":-0.5,"3":0,"4-5":0.4,"6+":0.8 }[series]    ?? 0;
  const descansoScore = { "menos60":0.8,"60-90":0.4,"90-120":0,"2-3min":-0.2,"mas3min":-0.5 }[descanso] ?? 0;
  return Math.min(Math.max(2.0 + rirScore + seriesScore + descansoScore, 2.5), 9.0);
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
    bmr = sexo === "hombre" ? 10*peso + 6.25*altura - 5*edad + 5 : 10*peso + 6.25*altura - 5*edad - 161;
  }
  const met = computeMET(rir, series, descanso);
  const eat = ((met * peso * 3.5) / 200) * duracion * diasFuerza / 7
    + { ninguno:0, poco:300, moderado:900, bastante:2000, mucho:3250 }[cardio] / 7;
  const neat = pasos * (peso * 0.00055) + { sedentario:0,ligero:200,moderado:400,activo:700,muy_activo:1000 }[trabajo];
  const tef = bmr * 0.1;
  return { bmr:Math.round(bmr), eat:Math.round(eat), neat:Math.round(neat), tef:Math.round(tef), tdee:Math.round(bmr+eat+neat+tef) };
}

// ─── VALIDATION ──────────────────────────────────────────────────────────────
function validateCalc(base, kcalObj, proteinG, fatG, carbG, peso) {
  const errors = [];
  if (kcalObj < 800)        errors.push({ title:"Objetivo calórico peligrosamente bajo", msg:`${kcalObj} kcal/día es demasiado poco para cualquier persona. Reduce el déficit o revisa tus datos biométricos.` });
  if (kcalObj < base.bmr * 0.75) errors.push({ title:"Ingesta por debajo del 75% del BMR", msg:"Comer por debajo de ese umbral puede causar pérdida muscular severa, fatiga crónica y carencias nutricionales." });
  if (carbG < 0)            errors.push({ title:"Carbohidratos negativos — objetivo imposible", msg:"La combinación de proteína alta + déficit agresivo no deja espacio para carbohidratos. Reduce el déficit o la proteína objetivo." });
  if (fatG < 20)            errors.push({ title:"Grasa demasiado baja", msg:`Solo ${fatG}g de grasa al día. El mínimo recomendado son 20-25g para absorción de vitaminas liposolubles y función hormonal.` });
  if (peso <= 0 || isNaN(peso)) errors.push({ title:"Peso inválido", msg:"Introduce un peso corporal válido (entre 40 y 200 kg)." });
  return errors;
}

// ─── DEFAULT FORM STATE ───────────────────────────────────────────────────────
const DEFAULT_FORM = {
  sexo:"hombre", peso:75, altura:175, edad:22, grasa:"",
  diasF:5, duracion:60, rir:"1-2", series:"3", descanso:"90-120",
  cardio:"ninguno", pasos:7000, trabajo:"sedentario",
  direction:"deficit", customDelta:300, pesoObj:"",
};

function loadForm() {
  try { const s = localStorage.getItem(FORM_KEY); return s ? { ...DEFAULT_FORM, ...JSON.parse(s) } : DEFAULT_FORM; }
  catch { return DEFAULT_FORM; }
}


// ─── PROGRESS CONSTANTS & HELPERS ───────────────────────────────────────────
const PROG_KEY = "tdee_progress_v1";

const LEVELS = [
  { n:1, name:"Novato",       icon:"🌱", xpMin:0,    xpMax:29   },
  { n:2, name:"Constante",    icon:"⚡", xpMin:30,   xpMax:89   },
  { n:3, name:"Disciplinado", icon:"🔥", xpMin:90,   xpMax:209  },
  { n:4, name:"Dedicado",     icon:"💪", xpMin:210,  xpMax:419  },
  { n:5, name:"Atleta",       icon:"🏆", xpMin:420,  xpMax:839  },
  { n:6, name:"Élite",        icon:"⭐", xpMin:840,  xpMax:1679 },
  { n:7, name:"Leyenda",      icon:"👑", xpMin:1680, xpMax:Infinity },
];

const CATS = [
  { key:"training", icon:"💪", name:"Entrenamiento", desc:"¿Has entrenado hoy?",   color:"#d94f2b", bg:"rgba(217,79,43,.12)"  },
  { key:"diet",     icon:"🥗", name:"Dieta",         desc:"¿Has cumplido tu plan alimentario?", color:"#5a8a4a", bg:"rgba(90,138,74,.12)"   },
  { key:"sleep",    icon:"😴", name:"Sueño",         desc:"¿Has dormido 7-9 horas?", color:"#3a6e9e", bg:"rgba(58,110,158,.12)"  },
];

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROG_KEY) || "{}"); }
  catch { return {}; }
}

function saveProgress(data) {
  try { localStorage.setItem(PROG_KEY, JSON.stringify(data)); } catch {}
}

function dayKey(date) {
  return date.toISOString().slice(0,10);
}

function today() { return dayKey(new Date()); }

function dayXP(entry) {
  if (!entry) return 0;
  const done = CATS.filter(c => entry[c.key]).length;
  if (done === 3) return 7;
  if (done === 2) return 3;
  if (done === 1) return 1;
  return 0;
}

function calcStats(progress) {
  const keys = Object.keys(progress).sort();
  let totalXP = 0, currentStreak = 0, bestStreak = 0, streak = 0, totalDays = 0, perfectDays = 0;
  const todayStr = today();

  keys.forEach(k => {
    const xp = dayXP(progress[k]);
    totalXP += xp;
    if (xp > 0) totalDays++;
    if (dayXP(progress[k]) === 7) perfectDays++;
  });

  // Calculate current streak (consecutive days going backwards from today)
  const cur = new Date();
  let checking = new Date(cur);
  currentStreak = 0;
  while (true) {
    const k = dayKey(checking);
    const entry = progress[k];
    if (entry && dayXP(entry) > 0) {
      currentStreak++;
      checking.setDate(checking.getDate() - 1);
    } else { break; }
    if (currentStreak > 500) break;
  }

  // Calculate best streak
  let runStreak = 0;
  keys.forEach((k, i) => {
    if (dayXP(progress[k]) > 0) {
      if (i === 0) { runStreak = 1; }
      else {
        const prev = new Date(keys[i-1]);
        const cur2 = new Date(k);
        const diff = (cur2 - prev) / 86400000;
        runStreak = diff === 1 ? runStreak + 1 : 1;
      }
      bestStreak = Math.max(bestStreak, runStreak);
    } else { runStreak = 0; }
  });

  const level = LEVELS.find(l => totalXP >= l.xpMin && totalXP <= l.xpMax) || LEVELS[LEVELS.length-1];
  const nextLevel = LEVELS.find(l => l.n === level.n + 1);
  const xpInLevel = totalXP - level.xpMin;
  const xpNeeded = nextLevel ? nextLevel.xpMin - level.xpMin : 1;
  const pct = nextLevel ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  return { totalXP, currentStreak, bestStreak, totalDays, perfectDays, level, nextLevel, xpInLevel, xpNeeded, pct };
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  let d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday = 0
}

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WEEKDAYS = ["L","M","X","J","V","S","D"];

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
  const pct = (value - min) / (max - min);
  const grad = `linear-gradient(to right, var(--accent) ${pct*100}%, var(--surface-2) ${pct*100}%)`;
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
        {marks.map(m => <span key={m.val} className="slider-mark" style={{ left: markPos(m.val,min,max) }}>{m.label}</span>)}
      </div>
      {hint && <span className="slider-hint">{hint}</span>}
    </div>
  );
}

function DonutChart({ leanKg, fatKg }) {
  const r=52, cx=70, cy=70, sw=22, circ=2*Math.PI*r, total=leanKg+fatKg;
  const fatDash=(fatKg/total)*circ, leanDash=(leanKg/total)*circ, fatDeg=(fatKg/total)*360;
  return (
    <div className="donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={sw}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8793a" strokeWidth={sw} strokeDasharray={`${fatDash} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} style={{transition:"stroke-dasharray .6s"}}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d94f2b" strokeWidth={sw} strokeDasharray={`${leanDash} ${circ}`} transform={`rotate(${-90+fatDeg} ${cx} ${cy})`} style={{transition:"stroke-dasharray .6s"}}/>
        <text x={cx} y={cy-5}  textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-muted)">TOTAL</text>
        <text x={cx} y={cy+11} textAnchor="middle" fontFamily="var(--font-display)" fontSize="15" fill="var(--text)">{total.toFixed(1)}kg</text>
      </svg>
      <div className="donut-legend">
        {[{label:"Masa magra",val:`${leanKg.toFixed(1)} kg`,color:"#d94f2b"},{label:"Masa grasa",val:`${fatKg.toFixed(1)} kg`,color:"#e8793a"},{label:"% Grasa",val:`${((fatKg/total)*100).toFixed(1)}%`,color:"var(--text-muted)"}]
          .map(item => (
            <div className="dleg" key={item.label}>
              <div className="dleg-dot" style={{background:item.color}}/>
              <span>{item.label}</span>
              <span className="dleg-val" style={{color:item.color}}>{item.val}</span>
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
        {[3,4,5].map(v => <button key={v} className={`meal-btn ${n===v?"active":""}`} onClick={()=>setN(v)}>{v} comidas</button>)}
      </div>
      <div className="meal-grid">
        {MEAL_PLANS[n].map(m => {
          const mk=Math.round(kcal*m.pct), mp=Math.round(proteinG*m.pct), mf=Math.round(fatG*m.pct), mc=Math.round(carbG*m.pct);
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


// ─── PROGRESS PAGE ───────────────────────────────────────────────────────────
function ProgressPage({ darkMode, setDarkMode }) {
  const [progress, setProgress] = useState(loadProgress);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null); // "YYYY-MM-DD"
  const [modalDraft, setModalDraft] = useState({});

  const stats = calcStats(progress);
  const todayStr = today();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y=>y-1); setViewMonth(11); }
    else setViewMonth(m=>m-1);
  };
  const nextMonth = () => {
    const now = new Date();
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewYear(y=>y+1); setViewMonth(0); }
    else setViewMonth(m=>m+1);
  };

  const openDay = (dayNum) => {
    const k = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
    const now = new Date(); now.setHours(23,59,59,999);
    const dayDate = new Date(viewYear, viewMonth, dayNum);
    if (dayDate > now) return;
    setSelectedDay(k);
    setModalDraft(progress[k] ? { ...progress[k] } : { training:false, diet:false, sleep:false });
  };

  const saveDay = () => {
    const updated = { ...progress, [selectedDay]: modalDraft };
    setProgress(updated);
    saveProgress(updated);
    setSelectedDay(null);
  };

  const toggleCat = (key) => setModalDraft(d => ({ ...d, [key]: !d[key] }));

  const getDayClass = (dayNum) => {
    const k = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
    const now = new Date(); now.setHours(23,59,59,999);
    const dayDate = new Date(viewYear, viewMonth, dayNum);
    let cls = "cal-day";
    if (k === todayStr) cls += " today";
    if (dayDate > now) cls += " future";
    else if (progress[k]) {
      const done = CATS.filter(c => progress[k][c.key]).length;
      if (done === 3) cls += " tracked-full";
      else if (done > 0) cls += " tracked-partial";
      else cls += " tracked-none";
    }
    return cls;
  };

  const getDayDots = (dayNum) => {
    const k = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
    const entry = progress[k];
    if (!entry) return null;
    return CATS.map(c => (
      <div key={c.key} className="cal-dot" style={{ background: entry[c.key] ? c.color : "var(--border)" }}/>
    ));
  };

  // Format selected day for modal title
  const formatSelectedDay = () => {
    if (!selectedDay) return "";
    const d = new Date(selectedDay + "T12:00:00");
    return d.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" });
  };

  return (
    <div className="progress-page">

      {/* Level card */}
      <div className="level-card">
        <div className="level-icon">{stats.level.icon}</div>
        <div className="level-info">
          <div className="level-num">Nivel {stats.level.n} · {stats.totalXP} XP totales</div>
          <div className="level-name"><em>{stats.level.name}</em></div>
          <div className="xp-bar-wrap">
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${stats.pct}%` }}/>
            </div>
            <div className="xp-labels">
              <span>{stats.nextLevel ? `${stats.xpInLevel} / ${stats.xpNeeded} XP para nivel ${stats.level.n+1}` : "¡Nivel máximo alcanzado!"}</span>
              <span>{stats.pct}%</span>
            </div>
          </div>
        </div>
        <div className="level-xp-total">
          <div className="xp-big">{stats.totalXP}</div>
          <div className="xp-lbl">XP totales</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        {[
          { val: <><span className="fire-icon">🔥</span> {stats.currentStreak}</>, lbl: "Racha
actual", color: "#d94f2b" },
          { val: `⭐ ${stats.bestStreak}`,   lbl: "Mejor
racha",   color: "#c8860a" },
          { val: `💪 ${stats.totalDays}`,    lbl: "Días
cumplidos", color: "#5a8a4a" },
          { val: `✨ ${stats.perfectDays}`,  lbl: "Días
perfectos", color: "#7a5a9e" },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-val" style={{color:s.color}}>{s.val}</div>
            <div className="stat-lbl" style={{whiteSpace:"pre-line"}}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* XP info */}
      <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"12px 18px",marginBottom:24,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontFamily:"var(--font-mono)",fontSize:".65rem",color:"var(--text-muted)",letterSpacing:".08em",textTransform:"uppercase"}}>Sistema de XP:</span>
        {[{t:"1 hábito",v:"1 XP"},{t:"2 hábitos",v:"3 XP"},{t:"3 hábitos ✨",v:"7 XP"}].map(item=>(
          <div key={item.t} style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontFamily:"var(--font-mono)",fontSize:".68rem",color:"var(--text-muted)"}}>{item.t}</span>
            <span style={{fontFamily:"var(--font-mono)",fontSize:".72rem",fontWeight:500,color:"var(--accent)",background:"var(--accent-dim)",padding:"2px 8px",borderRadius:100}}>{item.v}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="cal-wrap">
        <div className="cal-header">
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <div className="cal-month">
            <em>{MONTH_NAMES[viewMonth]}</em> {viewYear}
          </div>
          <button className="cal-nav-btn" onClick={nextMonth}
            style={{opacity: (viewYear === new Date().getFullYear() && viewMonth >= new Date().getMonth()) ? .3 : 1}}>›</button>
        </div>
        <div className="cal-weekdays">
          {WEEKDAYS.map(d => <div key={d} className="cal-wd">{d}</div>)}
        </div>
        <div className="cal-grid">
          {Array(firstDay).fill(null).map((_,i) => <div key={`e${i}`} className="cal-day empty"/>)}
          {Array(daysInMonth).fill(null).map((_,i) => (
            <div key={i+1} className={getDayClass(i+1)} onClick={()=>openDay(i+1)}>
              <span className="cal-day-num">{i+1}</span>
              <div className="cal-dots">{getDayDots(i+1)}</div>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 20px 16px",borderTop:"1px solid var(--border)"}}>
          <div className="cal-legend">
            {[
              {color:"rgba(90,138,74,.5)",    label:"Todo cumplido"},
              {color:"rgba(200,134,10,.4)",   label:"Parcial"},
              {color:"rgba(217,79,43,.2)",    label:"Sin cumplir"},
              {color:"var(--accent)",         label:"Hoy"},
            ].map(l=>(
              <div key={l.label} className="leg-item">
                <div className="leg-dot" style={{background:l.color}}/>
                {l.label}
              </div>
            ))}
            <div className="leg-item">
              {CATS.map(c=><div key={c.key} className="leg-dot" style={{background:c.color}}/>)}
              💪 🥗 😴
            </div>
          </div>
        </div>
      </div>

      {/* Levels guide */}
      <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",fontFamily:"var(--font-mono)",fontSize:".62rem",letterSpacing:".15em",color:"var(--text-muted)",textTransform:"uppercase"}}>
          Tabla de niveles
        </div>
        <div style={{padding:"12px 8px"}}>
          {LEVELS.map((l,i) => {
            const isCurrentLevel = stats.level.n === l.n;
            const isPast = stats.level.n > l.n;
            return (
              <div key={l.n} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 12px",borderRadius:"var(--r)",marginBottom:4,background:isCurrentLevel?"var(--accent-dim)":"transparent",border:`1px solid ${isCurrentLevel?"var(--accent-dim)":"transparent"}`}}>
                <span style={{fontSize:"1.3rem",width:28,textAlign:"center"}}>{l.icon}</span>
                <div style={{flex:1}}>
                  <span style={{fontFamily:"var(--font-display)",fontSize:".95rem",color:isCurrentLevel?"var(--accent)":isPast?"var(--text-muted)":"var(--text)"}}>{l.name}</span>
                  {isCurrentLevel && <span style={{fontFamily:"var(--font-mono)",fontSize:".58rem",color:"var(--accent)",marginLeft:8,background:"var(--accent-dim)",padding:"1px 7px",borderRadius:100}}>← tú</span>}
                </div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:".65rem",color:"var(--text-dim)",textAlign:"right"}}>
                  {l.n < 7 ? `${l.xpMin}–${l.xpMax} XP` : `${l.xpMin}+ XP`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day modal */}
      {selectedDay && (
        <div className="day-modal-overlay" onClick={e=>{ if(e.target===e.currentTarget)setSelectedDay(null); }}>
          <div className="day-modal">
            <div className="modal-title">¿Cómo fue el <em>día</em>?</div>
            <div className="modal-sub">{formatSelectedDay()}</div>
            {CATS.map(cat => (
              <button
                key={cat.key}
                className={`cat-btn ${modalDraft[cat.key]?"done":""}`}
                style={modalDraft[cat.key]?{background:cat.bg,borderColor:cat.color}:{}}
                onClick={()=>toggleCat(cat.key)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <div className="cat-text">
                  <div className="cat-name" style={{color:modalDraft[cat.key]?cat.color:"var(--text)"}}>{cat.name}</div>
                  <div className="cat-desc">{cat.desc}</div>
                </div>
                <div className="cat-check" style={modalDraft[cat.key]?{background:cat.color}:{}}>
                  {modalDraft[cat.key] && <span style={{color:"#fff",fontSize:".9rem"}}>✓</span>}
                </div>
              </button>
            ))}
            <div style={{marginTop:12,padding:"10px 14px",background:"var(--bg-warm)",borderRadius:"var(--r)",border:"1px solid var(--border)"}}>
              <div style={{fontFamily:"var(--font-mono)",fontSize:".65rem",color:"var(--text-muted)",marginBottom:4}}>XP que ganarás este día:</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"1.6rem",color:"var(--accent)"}}>
                {dayXP(modalDraft)} <span style={{fontFamily:"var(--font-mono)",fontSize:".75rem",color:"var(--text-muted)"}}>XP</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={()=>setSelectedDay(null)}>Cancelar</button>
              <button className="modal-save" onClick={saveDay}>Guardar día</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const saved0 = loadForm();

  // ── Form state (loaded from localStorage)
  const [sexo,       setSexo]       = useState(saved0.sexo);
  const [peso,       setPeso]       = useState(saved0.peso);
  const [altura,     setAltura]     = useState(saved0.altura);
  const [edad,       setEdad]       = useState(saved0.edad);
  const [grasa,      setGrasa]      = useState(saved0.grasa);
  const [diasF,      setDiasF]      = useState(saved0.diasF);
  const [duracion,   setDuracion]   = useState(saved0.duracion);
  const [rir,        setRir]        = useState(saved0.rir);
  const [series,     setSeries]     = useState(saved0.series);
  const [descanso,   setDescanso]   = useState(saved0.descanso);
  const [cardio,     setCardio]     = useState(saved0.cardio);
  const [pasos,      setPasos]      = useState(saved0.pasos);
  const [trabajo,    setTrabajo]    = useState(saved0.trabajo);
  const [direction,  setDirection]  = useState(saved0.direction);
  const [customDelta,setCustomDelta]= useState(saved0.customDelta);
  const [pesoObj,    setPesoObj]    = useState(saved0.pesoObj);

  // ── App routing
  const [appPage, setAppPage] = useState('calculator'); // 'calculator' | 'progress'

  // ── Compare
  const [compareOn,  setCompareOn]  = useState(false);
  const [bDias,      setBDias]      = useState(5);
  const [bDuracion,  setBDuracion]  = useState(60);
  const [bCardio,    setBCardio]    = useState("ninguno");
  const [bPasos,     setBPasos]     = useState(7000);

  // ── UI state
  const [resultado,  setResultado]  = useState(null);
  const [calcErrors, setCalcErrors] = useState([]);
  const [tab,        setTab]        = useState(0);
  const [savedOk,    setSavedOk]    = useState(false);
  const [darkMode,   setDarkMode]   = useState(() => { try { return localStorage.getItem("tdee_dark")==="1"; } catch { return false; } });
  const [autoSaveTs, setAutoSaveTs] = useState(null);

  const [historial, setHistorial]   = useState(() => { try { return JSON.parse(localStorage.getItem(HIST_KEY)||"[]"); } catch { return []; } });

  // ── Apply dark mode class
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    try { localStorage.setItem("tdee_dark", darkMode ? "1" : "0"); } catch {}
  }, [darkMode]);

  // ── Auto-save form state on every change
  useEffect(() => {
    const state = { sexo,peso,altura,edad,grasa,diasF,duracion,rir,series,descanso,cardio,pasos,trabajo,direction,customDelta,pesoObj };
    try {
      localStorage.setItem(FORM_KEY, JSON.stringify(state));
      setAutoSaveTs(new Date().toLocaleTimeString("es-ES", {hour:"2-digit",minute:"2-digit"}));
    } catch {}
  }, [sexo,peso,altura,edad,grasa,diasF,duracion,rir,series,descanso,cardio,pasos,trabajo,direction,customDelta,pesoObj]);

  // ── Calculate
  const calcular = () => {
    const params = { sexo,peso,altura,edad,grasa,diasFuerza:diasF,duracion,rir,series,descanso,cardio,pasos,trabajo };
    const base = calcTDEE(params);
    const mant=base.tdee, def_mod=mant-300, def_agr=mant-500, sup_lig=mant+250, sup_agr=mant+500;
    const cat = getCategory(direction, customDelta);
    let kcalObj, proteinG;
    if (direction === "mantenimiento") { kcalObj=mant; proteinG=Math.round(peso*1.8); }
    else if (direction === "deficit")  { kcalObj=mant-customDelta; proteinG=Math.round(peso*cat.prot); }
    else                               { kcalObj=mant+customDelta; proteinG=Math.round(peso*cat.prot); }
    const fatG  = Math.round((kcalObj * 0.28) / 9);
    const carbG = Math.round((kcalObj - proteinG*4 - fatG*9) / 4);
    const errors = validateCalc(base, kcalObj, proteinG, fatG, carbG, peso);
    setCalcErrors(errors);
    if (errors.length > 0) { setResultado(null); return; }
    const horasEj=(duracion/60*diasF)/7;
    const agua=Math.round((peso*35+horasEj*500)/100)/10;
    const fibra=sexo==="hombre"?38:25;
    const imc=+(peso/((altura/100)**2)).toFixed(1);
    setResultado({ ...base, mantenimiento:mant, def_mod, def_agr, sup_lig, sup_agr, kcalObj, proteinG, fatG, carbG, agua, fibra, imc, peso, sexo, direction, customDelta, usandoKatch:!!(grasa&&Number(grasa)>0) });
    setSavedOk(false); setTab(0);
  };

  const calcB = () => resultado ? calcTDEE({ sexo,peso,altura,edad,grasa,diasFuerza:bDias,duracion:bDuracion,rir,series,descanso,cardio:bCardio,pasos:bPasos,trabajo }) : null;

  const guardar = () => {
    if (!resultado) return;
    const entry = { date:new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}), tdee:resultado.mantenimiento, kcalObj:resultado.kcalObj, peso:resultado.peso, imc:resultado.imc, objetivo:resultado.direction==="mantenimiento"?"Mantenimiento":`${resultado.direction==="deficit"?"−":"+"}${resultado.customDelta} kcal · ${getCategory(resultado.direction,resultado.customDelta).label}` };
    const next = [entry,...historial].slice(0,12);
    setHistorial(next);
    try { localStorage.setItem(HIST_KEY, JSON.stringify(next)); } catch {}
    setSavedOk(true); setTimeout(()=>setSavedOk(false), 2000);
  };

  const limpiarHistorial = () => { setHistorial([]); try { localStorage.removeItem(HIST_KEY); } catch {} };

  // ── Derived
  const total       = resultado ? resultado.bmr+resultado.eat+resultado.neat+resultado.tef : 1;
  const bResult     = compareOn && resultado ? calcB() : null;
  const health      = resultado ? healthStatus(resultado) : null;
  const currentMET  = computeMET(rir, series, descanso);
  const currentCat  = getCategory(direction, customDelta);
  const recomp      = recompViability(grasa, sexo, diasF, currentMET);

  const getProyeccion = () => {
    if (!resultado) return null;
    const def = resultado.mantenimiento - resultado.kcalObj;
    if (def <= 0) return null;
    const kgSem = (def*7)/7700;
    const semanas = (pesoObj&&Number(pesoObj)>0&&Number(pesoObj)<resultado.peso) ? Math.round((resultado.peso-Number(pesoObj))/kgSem) : null;
    return { kgSem:kgSem.toFixed(2), semanas };
  };
  const proy = getProyeccion();

  const targets = resultado ? [
    {label:"Déficit agresivo",   desc:"−500 kcal/día", val:resultado.def_agr,      color:"#d94f2b"},
    {label:"Déficit moderado",   desc:"−300 kcal/día", val:resultado.def_mod,      color:"#e8793a"},
    {label:"Mantenimiento",      desc:"Sin cambios",   val:resultado.mantenimiento, color:"#8a6a50"},
    {label:"Superávit ligero",   desc:"+250 kcal/día", val:resultado.sup_lig,      color:"#3a6e9e"},
    {label:"Superávit agresivo", desc:"+500 kcal/día", val:resultado.sup_agr,      color:"#5a8a4a"},
    ...([resultado.def_agr,resultado.def_mod,resultado.mantenimiento,resultado.sup_lig,resultado.sup_agr].includes(resultado.kcalObj)?[]:[{
      label:`${resultado.direction==="deficit"?"Déficit":resultado.direction==="superavit"?"Superávit":""} personalizado`,
      desc:`${resultado.direction==="deficit"?"−":"+"}${resultado.customDelta} kcal/día · ${getCategory(resultado.direction,resultado.customDelta).label}`,
      val:resultado.kcalObj, color:getCategory(resultado.direction,resultado.customDelta).color,
    }]),
  ] : [];

  const objLabel = resultado ? resultado.direction==="mantenimiento" ? "Mantenimiento" : `${resultado.direction==="deficit"?"Déficit":"Superávit"} ${resultado.customDelta} kcal · ${getCategory(resultado.direction,resultado.customDelta).label}` : "";

  const numField = (label, val, set, min, max, unit) => (
    <div className="field" key={label}>
      <label>{label}</label>
      <div className="num-input-wrap">
        <input type="number" value={val} min={min} max={max} onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))set(v);}}/>
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
            <button className="dark-toggle" onClick={()=>setDarkMode(d=>!d)}>
              <span>{darkMode?"☀":"🌙"}</span>
              <span>{darkMode?"Modo claro":"Modo oscuro"}</span>
            </button>
            <div className="header-badges">
              <span className="badge badge-neutral">TDEE CALCULATOR v3.1</span>
              <span className="badge badge-accent">Basado en evidencia científica</span>
            </div>
            {autoSaveTs && <span className="autosave-badge">✓ Guardado {autoSaveTs}</span>}
          </div>
        </header>

        {/* ── NAV TABS ── */}
        <nav className="app-nav" style={{gridColumn:"1/-1"}}>
          {[
            {id:"calculator", label:"Calculadora"},
            {id:"progress",   label:<>Mi Progreso <span className="nav-beta">BETA</span></>},
          ].map(tab=>(
            <button key={tab.id} className={`app-nav-tab ${appPage===tab.id?"active":""}`} onClick={()=>setAppPage(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── PROGRESS PAGE ── */}
        {appPage === "progress" && <ProgressPage darkMode={darkMode} setDarkMode={setDarkMode}/>}

        {/* ── LEFT COL ── */}
        {appPage === "calculator" && <>
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
              <label>% Grasa corporal <span style={{color:"var(--text-dim)"}}>— opcional, mejora la precisión</span> <Tip text={TIPS.katch}/></label>
              <div className="num-input-wrap">
                <input type="number" value={grasa} min={3} max={60} placeholder="Ej: 18" onChange={e=>setGrasa(e.target.value)}/>
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
              <Slider label="Días por semana" value={diasF} onChange={setDiasF} min={1} max={7} unit="días" marks={[1,2,3,4,5,6,7].map(d=>({val:d,label:String(d)}))}/>
              <Slider label="Duración por sesión" value={duracion} onChange={setDuracion} min={20} max={180} step={5} unit="min" marks={[20,45,60,90,120,150,180].map(d=>({val:d,label:d+"'"}))}/>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div className="field">
                  <label>Esfuerzo — proximidad al fallo <Tip text={TIPS.rir}/></label>
                  <select className="styled-select" value={rir} onChange={e=>setRir(e.target.value)}>
                    <option value="0">RIR 0 — Fallo muscular total, no puedes hacer una rep más</option>
                    <option value="1-2">RIR 1-2 — Quedan 1-2 reps en el depósito, trabajo duro</option>
                    <option value="3-4">RIR 3-4 — Trabajo moderado, margen amplio antes del fallo</option>
                    <option value="5+">RIR 5+ — Esfuerzo ligero, lejos del fallo</option>
                  </select>
                </div>
                <div className="field">
                  <label>Volumen — series por ejercicio (media)</label>
                  <select className="styled-select" value={series} onChange={e=>setSeries(e.target.value)}>
                    <option value="1-2">1-2 series — Volumen muy bajo o trabajo de activación</option>
                    <option value="3">3 series — Volumen estándar</option>
                    <option value="4-5">4-5 series — Volumen alto</option>
                    <option value="6+">6+ series — Volumen muy alto (especialización)</option>
                  </select>
                </div>
                <div className="field">
                  <label>Densidad — descanso entre series</label>
                  <select className="styled-select" value={descanso} onChange={e=>setDescanso(e.target.value)}>
                    <option value="menos60">&lt;60 s — Circuitos, HIIT con pesas, alta densidad</option>
                    <option value="60-90">60-90 s — Hipertrofia clásica, descanso corto-moderado</option>
                    <option value="90-120">90-120 s — Hipertrofia/fuerza, descanso moderado</option>
                    <option value="2-3min">2-3 min — Fuerza, cargas altas, buena recuperación</option>
                    <option value="mas3min">3+ min — Powerlifting, máximas, descanso largo</option>
                  </select>
                </div>
                <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <p style={{fontSize:".68rem",color:"var(--text-muted)",marginBottom:3}}>Intensidad calculada de tu entreno:</p>
                    <p style={{fontSize:".72rem",color:"var(--text-dim)",fontStyle:"italic"}}>
                      MET estimado: <strong style={{color:metLabel(currentMET).color,fontStyle:"normal"}}>{currentMET.toFixed(1)}</strong>
                    </p>
                  </div>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:".75rem",fontWeight:500,padding:"5px 14px",borderRadius:100,color:metLabel(currentMET).color,background:metLabel(currentMET).color+"18",border:`1px solid ${metLabel(currentMET).color}44`}}>
                    {metLabel(currentMET).label}
                  </span>
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
            <div className="section-label">04 · Actividad diaria (NEAT) <Tip text={TIPS.neat}/></div>
            <div style={{display:"flex",flexDirection:"column",gap:28}}>
              <Slider label="Pasos diarios promedio" value={pasos} onChange={setPasos} min={1000} max={30000} step={500} unit="pasos"
                marks={[1000,5000,10000,15000,20000,25000,30000].map(d=>({val:d,label:(d/1000)+"k"}))}
                hint="Sin contar el entrenamiento — solo movimiento cotidiano"/>
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
              <div className="field">
                <label>Dirección del objetivo</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",overflow:"hidden"}}>
                  {[{val:"deficit",label:"Pérdida de grasa"},{val:"mantenimiento",label:"Mantenimiento"},{val:"superavit",label:"Ganancia muscular"}].map(opt => (
                    <button key={opt.val} className={`sex-btn ${direction===opt.val?"active":""}`}
                      style={{fontSize:".72rem",padding:"13px 6px",lineHeight:1.3}}
                      onClick={()=>{ setDirection(opt.val); if(opt.val==="mantenimiento")setCustomDelta(0); else if(customDelta===0)setCustomDelta(300); }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {direction !== "mantenimiento" && (
                <div style={{background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"16px"}}>
                  <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
                    <span style={{fontSize:".68rem",color:"var(--text-muted)",alignSelf:"center",marginRight:2}}>Presets:</span>
                    {(direction==="deficit"
                      ? [{v:100,l:"Mínimo"},{v:200,l:"Ligero"},{v:300,l:"Moderado"},{v:400,l:"Mod/Agres."},{v:500,l:"Agresivo"},{v:600,l:"Muy agresivo"}]
                      : [{v:100,l:"Mínimo"},{v:150,l:"Ligero"},{v:250,l:"Moderado"},{v:350,l:"Mod/Agres."},{v:500,l:"Agresivo"}]
                    ).map(p => (
                      <button key={p.v} onClick={()=>setCustomDelta(p.v)} style={{padding:"4px 10px",borderRadius:6,fontSize:".66rem",fontFamily:"var(--font-mono)",cursor:"pointer",border:"1.5px solid",transition:"var(--transition-btn)",boxShadow:customDelta===p.v?"none":"0 2px 0 var(--border)",background:customDelta===p.v?"var(--accent-dim)":"transparent",color:customDelta===p.v?"var(--accent)":"var(--text-muted)",borderColor:customDelta===p.v?"var(--accent-dim)":"var(--border)"}}>
                        {p.l}
                      </button>
                    ))}
                  </div>
                  <Slider label={direction==="deficit"?"Déficit calórico":"Superávit calórico"} value={customDelta} onChange={setCustomDelta}
                    min={50} max={700} step={25} unit="kcal"
                    marks={[{val:50,label:"50"},{val:200,label:"200"},{val:300,label:"300"},{val:500,label:"500"},{val:700,label:"700"}]}/>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginTop:14,paddingTop:12,borderTop:"1px solid var(--border)"}}>
                    <span style={{fontSize:".72rem",color:"var(--text-muted)"}}>Categoría automática:</span>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:".72rem",fontWeight:500,padding:"3px 12px",borderRadius:100,color:currentCat.color,background:currentCat.color+"18",border:`1px solid ${currentCat.color}44`}}>
                      {currentCat.label}
                    </span>
                  </div>
                  <p style={{fontSize:".68rem",color:"var(--text-dim)",fontStyle:"italic",marginTop:8,lineHeight:1.55}}>
                    Proteína recomendada para este nivel: <strong style={{color:"var(--accent)",fontStyle:"normal"}}>{currentCat.prot} g/kg</strong>
                  </p>
                </div>
              )}
              {direction === "deficit" && (
                <div className="field">
                  <label>Peso objetivo <span style={{color:"var(--text-dim)"}}>— para calcular tiempo estimado</span></label>
                  <div className="num-input-wrap">
                    <input type="number" value={pesoObj} min={30} max={peso} placeholder={`Ej: ${Math.round(peso*0.9)}`} onChange={e=>setPesoObj(e.target.value)}/>
                    <span className="num-input-unit">kg</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="cta" onClick={calcular}>Calcular mi gasto calórico total</button>

          {/* Error display */}
          {calcErrors.length > 0 && (
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>
              {calcErrors.map((e,i) => (
                <div key={i} className="error-box">
                  <span className="error-icon">⚠️</span>
                  <div><div className="error-title">{e.title}</div><div className="error-msg">{e.msg}</div></div>
                </div>
              ))}
            </div>
          )}

          {/* Compare toggle */}
          {resultado && (
            <>
              <div className="compare-toggle">
                <label className="tog-switch">
                  <input type="checkbox" checked={compareOn} onChange={e=>setCompareOn(e.target.checked)}/>
                  <span className="tog-slider"/>
                </label>
                <span className="tog-lbl" onClick={()=>setCompareOn(v=>!v)}>Comparar escenario B</span>
              </div>
              {compareOn && (
                <div className="compare-form">
                  <div className="compare-form-title">Escenario B — modifica los parámetros clave</div>
                  <div style={{display:"flex",flexDirection:"column",gap:22}}>
                    <Slider label="Días de fuerza" value={bDias} onChange={setBDias} min={1} max={7} unit="días" marks={[1,2,3,4,5,6,7].map(d=>({val:d,label:String(d)}))}/>
                    <Slider label="Duración/sesión" value={bDuracion} onChange={setBDuracion} min={20} max={180} step={5} unit="min" marks={[20,60,120,180].map(d=>({val:d,label:d+"'"}))}/>
                    <Slider label="Pasos diarios" value={bPasos} onChange={setBPasos} min={1000} max={30000} step={500} unit="pasos" marks={[1000,5000,10000,20000,30000].map(d=>({val:d,label:(d/1000)+"k"}))}/>
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
            <div className="welcome-panel">
              <div style={{background:"linear-gradient(90deg, var(--accent), var(--accent-2), #ffd166)",height:4}}/>
              <div style={{padding:"36px 32px 32px"}}>
                <div className="wel-line wel-l1" style={{fontFamily:"var(--font-mono)",fontSize:".62rem",letterSpacing:".18em",color:"var(--accent)",textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                  <span className="wel-dot" style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"inline-block"}}/>
                  Calculadora de gasto calórico
                </div>
                <div className="wel-line wel-l2" style={{fontFamily:"var(--font-display)",fontSize:"2rem",lineHeight:1.15,color:"var(--text)",marginBottom:20,letterSpacing:"-.02em"}}>
                  Descubre exactamente<br/><em style={{color:"var(--accent)"}}>lo que necesita</em><br/>tu cuerpo
                </div>
                <div className="wel-line wel-l3" style={{height:1,background:"var(--border)",marginBottom:20}}/>
                <div className="wel-line wel-l3" style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
                  {[{icon:"⚡",text:"Gasto calórico real desglosado en 4 componentes"},{icon:"🎯",text:"Macros adaptados a tu objetivo y nivel de déficit personalizado"},{icon:"📊",text:"Composición corporal, IMC contextualizado y recomposición"},{icon:"🔄",text:"Compara escenarios, historial y guardado automático"},].map(item => (
                    <div key={item.text} style={{display:"flex",alignItems:"flex-start",gap:12,background:"var(--bg-warm)",borderRadius:"var(--r)",padding:"10px 14px",border:"1px solid var(--border)"}}>
                      <span style={{fontSize:"1rem",lineHeight:1.4,flexShrink:0}}>{item.icon}</span>
                      <span style={{fontSize:".78rem",color:"var(--text-muted)",lineHeight:1.5}}>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="wel-line wel-l5" style={{background:"var(--accent-dim)",border:"1px solid rgba(217,79,43,.25)",borderRadius:"var(--r)",padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"var(--accent)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",color:"#fff"}}>←</div>
                  <div>
                    <p style={{fontSize:".78rem",color:"var(--accent)",fontWeight:500,marginBottom:2}}>¿Por dónde empiezo?</p>
                    <p style={{fontSize:".72rem",color:"var(--text-muted)",lineHeight:1.5}}>Rellena el formulario y pulsa <strong style={{color:"var(--accent)"}}>Calcular</strong>. Menos de un minuto.</p>
                  </div>
                </div>
              </div>
              <div className="wel-line wel-l5" style={{borderTop:"1px solid var(--border)",display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
                {[{val:"4",label:"componentes\ndel gasto"},{val:"5",label:"pestañas de\nresultados"},{val:"100%",label:"basado en\nevidencia"}].map((s,i) => (
                  <div key={s.label} style={{padding:"14px 10px",textAlign:"center",borderRight:i<2?"1px solid var(--border)":"none"}}>
                    <div style={{fontFamily:"var(--font-display)",fontSize:"1.4rem",color:"var(--accent)",lineHeight:1}}>{s.val}</div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:".58rem",color:"var(--text-muted)",marginTop:4,lineHeight:1.4,whiteSpace:"pre-line"}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
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
                  {health && <div className="health-pill" style={{color:health.color,background:health.bg,borderColor:health.color+"44"}}>{health.label}</div>}
                </div>
                {health && <p className="health-msg">{health.msg}</p>}
                <div className="imc-row">
                  <span className="imc-lbl">IMC <Tip text={TIPS.imc}/></span>
                  <span className="imc-val" style={{color:imcInfo(resultado.imc).color}}>{resultado.imc}</span>
                  <span className="imc-cat" style={{color:imcInfo(resultado.imc).color,background:imcInfo(resultado.imc).bg}}>{imcInfo(resultado.imc).label}</span>
                </div>
              </div>

              <div className="tabs">
                {["Resultados","Nutrición","Composición","Proyección"].map((t,i) => (
                  <button key={t} className={`tab-btn ${tab===i?"active":""}`} onClick={()=>setTab(i)}>{t}</button>
                ))}
              </div>

              {/* TAB 0 */}
              <div className={`tab-content ${tab===0?"active":""}`}>
                <div className="bar-wrap">
                  <div className="bar-track">
                    {[{v:resultado.bmr,c:"#c4a882"},{v:resultado.eat,c:"#3a6e9e"},{v:resultado.neat,c:"#e8793a"},{v:resultado.tef,c:"#7a5a9e"}]
                      .map((s,i)=><div key={i} className="bar-seg" style={{flex:s.v/total,background:s.c}}/>)}
                  </div>
                </div>
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
                {compareOn && bResult && (
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
                <div className="psec">
                  <div className="psec-title">Macros recomendados · {objLabel}</div>
                  {resultado.carbG < 0 ? (
                    <div className="error-box">
                      <span className="error-icon">⚠️</span>
                      <div><div className="error-title">Distribución de macros imposible</div><div className="error-msg">La proteína objetivo supera el total calórico disponible. Reduce el déficit o la proteína para obtener una distribución válida.</div></div>
                    </div>
                  ) : (
                    <div className="macros-grid">
                      {[{name:"Proteína",val:resultado.proteinG,color:"#d94f2b",kcal:resultado.proteinG*4},{name:"Grasa",val:resultado.fatG,color:"#e8793a",kcal:resultado.fatG*9},{name:"Carbohidrato",val:resultado.carbG,color:"#3a6e9e",kcal:resultado.carbG*4}]
                        .map(m=>(
                          <div className="macro-card" key={m.name}>
                            <div className="macro-val" style={{color:m.color}}>{m.val}g</div>
                            <div className="macro-name">{m.name}</div>
                            <div className="macro-kcal">{m.kcal} kcal</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                {resultado.carbG >= 0 && (
                  <div className="psec">
                    <div className="psec-title">Distribución por comidas</div>
                    <MealPlan kcal={resultado.kcalObj} proteinG={resultado.proteinG} fatG={resultado.fatG} carbG={resultado.carbG}/>
                  </div>
                )}
                <div className="psec">
                  <div className="psec-title">Otros objetivos diarios</div>
                  <div className="xrow"><span className="xrow-lbl">💧 Agua recomendada</span><span className="xrow-val" style={{color:"#3a6e9e"}}>{resultado.agua} L</span></div>
                  <div className="xrow"><span className="xrow-lbl">🌾 Fibra mínima diaria</span><span className="xrow-val" style={{color:"#5a8a4a"}}>{resultado.fibra} g</span></div>
                  <div className="xrow"><span className="xrow-lbl">🎯 Objetivo calórico</span><span className="xrow-val" style={{color:"var(--accent)"}}>{resultado.kcalObj.toLocaleString()} kcal</span></div>
                </div>
              </div>

              {/* TAB 2 */}
              <div className={`tab-content ${tab===2?"active":""}`}>
                {grasa && Number(grasa) > 0 ? (
                  <>
                    <div className="psec">
                      <div className="psec-title">Composición corporal estimada</div>
                      <DonutChart fatKg={+(resultado.peso*Number(grasa)/100).toFixed(1)} leanKg={+(resultado.peso*(1-Number(grasa)/100)).toFixed(1)}/>
                    </div>
                    <div className="psec">
                      <div className="psec-title">Viabilidad de recomposición corporal</div>
                      {recomp && (
                        <div className="recomp-card" style={{color:recomp.viable?"#5a8a4a":"#8a6a50",background:recomp.viable?"rgba(90,138,74,.08)":"var(--bg-warm)",borderColor:recomp.viable?"rgba(90,138,74,.3)":"var(--border)"}}>
                          <strong>{recomp.viable?"✓ Recomp viable":"⊘ Recomp no óptima"}</strong>{recomp.msg}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="psec" style={{textAlign:"center",padding:"32px 28px"}}>
                    <div style={{fontSize:"2rem",marginBottom:12,opacity:.3}}>📊</div>
                    <p style={{fontSize:".83rem",color:"var(--text-muted)",lineHeight:1.7}}>Introduce tu % de grasa corporal en el formulario para ver la composición corporal y la viabilidad de recomposición.</p>
                  </div>
                )}
                <div className="psec">
                  <div className="psec-title">IMC — contexto e interpretación</div>
                  <div className="proy-card">
                    {[{l:"Valor IMC",v:resultado.imc,c:imcInfo(resultado.imc).color},{l:"Clasificación",v:imcInfo(resultado.imc).label,c:"var(--text)"},{l:"Rango habitual",v:"18.5 – 24.9",c:"var(--text-muted)"}]
                      .map(r=><div className="proy-row" key={r.l}><span className="proy-lbl">{r.l}</span><span className="proy-val" style={{color:r.c}}>{r.v}</span></div>)}
                  </div>
                  <p style={{fontSize:".7rem",color:"var(--text-muted)",lineHeight:1.65,marginTop:10,background:"var(--bg-warm)",padding:"10px 14px",borderRadius:"var(--r)",border:"1px solid var(--border)"}}>💡 {imcInfo(resultado.imc).note}</p>
                </div>
              </div>

              {/* TAB 3 */}
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
                    {!pesoObj && <p style={{fontSize:".72rem",color:"var(--text-muted)",fontStyle:"italic",marginTop:6}}>Introduce un peso objetivo en el formulario para ver el tiempo estimado.</p>}
                  </div>
                ) : (
                  <div className="psec" style={{textAlign:"center",padding:"24px 28px"}}>
                    <p style={{fontSize:".83rem",color:"var(--text-muted)",lineHeight:1.6}}>La proyección está disponible cuando el objetivo es déficit calórico.</p>
                  </div>
                )}
                <div className="psec">
                  <div className="psec-title">Guardar en historial</div>
                  <button className={`save-btn ${savedOk?"saved":""}`} onClick={guardar}>
                    {savedOk?"✓ Guardado correctamente":"Guardar este cálculo"}
                  </button>
                  <p style={{fontSize:".68rem",color:"var(--text-dim)",marginTop:8,lineHeight:1.6,fontStyle:"italic"}}>Guarda periódicamente para ver cómo evoluciona tu TDEE al perder o ganar peso.</p>
                </div>
              </div>

              <p className="note">Estimación con margen ±10–15%. Ajusta cada 2-3 semanas según evolución real del peso. El IMC es una referencia estadística poblacional. No sustituye consulta con dietista-nutricionista colegiado.</p>
            </div>
          )}
        </aside>

        </> /* end calculator pages */}

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
              {historial.map((h,i) => (
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