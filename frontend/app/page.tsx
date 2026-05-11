"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// PALETTE — TEAL → BLUE → INDIGO ANALOGOUS TRIO
// ═══════════════════════════════════════════════════════════════
const C = {
  // Teal family
  t50:"#E0FAF5", t100:"#A8EEE0", t200:"#5DD8BE", t300:"#22C4A4",
  t400:"#0FA896", t500:"#0C8A7C", t600:"#086B61", t700:"#054D46",
  // Blue family
  b50:"#E3F1FD", b100:"#B2D6F8", b200:"#6DB5F1", b300:"#2D96E8",
  b400:"#1278CC", b500:"#0D5DA6", b600:"#094480", b700:"#05295A",
  // Indigo family
  i50:"#ECEEFF", i100:"#C8CDFA", i200:"#9BA5F3", i300:"#6B7AEA",
  i400:"#4857D8", i500:"#3440B8", i600:"#232C96", i700:"#141A70",
  // Neutrals
  ink:"#080E1E", inkSoft:"#141C30", ink2:"#1E2840",
  glass:"rgba(255,255,255,0.06)", glassMid:"rgba(255,255,255,0.12)",
  glassBright:"rgba(255,255,255,0.18)",
  border:"rgba(109,181,241,0.14)", borderMed:"rgba(109,181,241,0.25)",
  borderBright:"rgba(109,181,241,0.4)",
  muted:"#7A8BAA", mutedLight:"#9BAFC8",
  surface:"#0D1525", surfaceUp:"#111D30", surfaceCard:"#162035",
  white:"#FFFFFF",
  // Gradient strings
  grad:"linear-gradient(135deg,#0FA896,#1278CC,#4857D8)",
  gradText:"linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA)",
  gradSubtle:"linear-gradient(135deg,rgba(15,168,150,0.15),rgba(18,120,204,0.15),rgba(72,87,216,0.15))",
  gradHero:"linear-gradient(160deg,#080E1E 0%,#0D1A2E 50%,#101524 100%)",
};

const LOAD_STEPS = [
  "Parsing resume structure & semantic layers",
  "Running ATS keyword extraction engine",
  "Cross-referencing 2,400+ job descriptions",
  "Simulating 6-second recruiter scan",
  "Calculating multi-dimensional score",
  "Generating project recommendations",
  "Building personalized career roadmap",
  "Finalizing intelligence report",
];

const API_URL = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : "http://127.0.0.1:8000";

// ═══════════════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@300;400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}

:root{
  --t:${C.t400};--b:${C.b400};--i:${C.i400};
  --ink:${C.ink};--surface:${C.surface};--card:${C.surfaceCard};
  --border:${C.border};--muted:${C.muted};
  --grad:${C.grad};
  --grad-text:${C.gradText};
  --grad-hero:${C.gradHero};
  --font-ui: ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif;
  --font-display: "DM Serif Display",Georgia,"Times New Roman",serif;
  --font-mono: "JetBrains Mono","Fira Code","Cascadia Code",ui-monospace,monospace;
}

body{
  background:${C.surface};color:${C.white};
  font-family:var(--font-ui);
  font-size:18px;line-height:1.7;overflow-x:hidden;
  letter-spacing:-0.01em;
}

::selection{background:${C.b300}40;color:${C.b100};}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:${C.ink};}
::-webkit-scrollbar-thumb{background:${C.b500};border-radius:99px;}

/* ── NAV ── */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:1000;
  height:72px;display:flex;align-items:center;
  justify-content:space-between;padding:0 56px;
  background:rgba(8,14,30,0.85);
  border-bottom:1px solid ${C.border};
  backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);
  transition:background .4s;
}
.nav-logo{
  display:flex;align-items:center;gap:12px;
  text-decoration:none;cursor:pointer;
}
.nav-logo-mark{
  width:42px;height:42px;border-radius:12px;
  background:${C.grad};
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-ui);font-weight:800;font-size:17px;
  color:white;letter-spacing:-0.02em;
  box-shadow:0 0 24px ${C.t400}40;
}
.nav-logo-text{
  font-family:var(--font-ui);font-weight:700;font-size:20px;
  letter-spacing:-0.03em;color:white;
}
.nav-logo-text span{
  background:${C.gradText};
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.nav-chip{
  font-family:var(--font-mono);font-size:10px;
  letter-spacing:.18em;text-transform:uppercase;
  color:${C.t300};background:${C.t400}18;
  border:1px solid ${C.t400}35;
  padding:3px 10px;border-radius:99px;margin-left:2px;
}
.nav-links{display:flex;gap:40px;list-style:none;}
.nav-links a{
  font-family:var(--font-ui);
  font-size:16px;font-weight:400;color:${C.muted};
  text-decoration:none;transition:color .25s;letter-spacing:-.01em;
}
.nav-links a:hover{color:${C.b200};}
.nav-cta{
  font-family:var(--font-ui);
  font-size:16px;font-weight:600;letter-spacing:-.01em;
  background:${C.grad};color:white;border:none;
  padding:12px 30px;border-radius:99px;cursor:pointer;
  transition:opacity .2s,transform .2s,box-shadow .3s;
  box-shadow:0 0 24px ${C.b400}40;
}
.nav-cta:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 0 40px ${C.b400}60;}

/* ── HERO ── */
.hero{
  min-height:100vh;padding-top:72px;
  display:flex;align-items:center;justify-content:center;
  position:relative;overflow:hidden;
  background:${C.gradHero};
}
.hero-bg-grid{
  position:absolute;inset:0;pointer-events:none;z-index:0;
  background-image:
    linear-gradient(${C.b400}06 1px,transparent 1px),
    linear-gradient(90deg,${C.b400}06 1px,transparent 1px);
  background-size:56px 56px;
}
.hero-bg-glow{
  position:absolute;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 60% 55% at 15% 25%,${C.t400}18 0%,transparent 65%),
    radial-gradient(ellipse 50% 50% at 85% 15%,${C.i400}18 0%,transparent 65%),
    radial-gradient(ellipse 70% 40% at 60% 85%,${C.b400}14 0%,transparent 65%);
}
.hero-orbs{position:absolute;inset:0;pointer-events:none;z-index:0;}
.orb{
  position:absolute;border-radius:50%;filter:blur(100px);
  pointer-events:none;opacity:.22;
  animation:orb-drift 12s ease-in-out infinite alternate;
}
@keyframes orb-drift{0%{transform:translate(0,0)scale(1);}100%{transform:translate(30px,20px)scale(1.08);}}
.hero-inner{
  position:relative;z-index:2;
  text-align:center;max-width:940px;
  padding:80px 48px;
}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:10px;
  font-family:var(--font-mono);font-size:11px;
  letter-spacing:.22em;text-transform:uppercase;
  color:${C.t300};
  background:${C.t400}12;border:1px solid ${C.t400}30;
  padding:10px 22px;border-radius:99px;margin-bottom:52px;
  animation:float-badge 5s ease-in-out infinite;
}
@keyframes float-badge{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
.eye-dot{
  width:7px;height:7px;border-radius:50%;
  background:${C.gradText};
  background-size:200%;
  animation:eye-pulse 2.4s ease-in-out infinite;
}
@keyframes eye-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.65);}}
.hero-h1{
  font-family:var(--font-display);
  font-size:clamp(72px,11vw,148px);
  font-weight:400;line-height:.88;
  letter-spacing:-.03em;color:white;
  margin-bottom:36px;
}
.hero-h1-grad{
  display:block;font-style:italic;
  background:${C.gradText};
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.hero-sub{
  font-size:21px;font-weight:400;line-height:1.8;
  color:${C.mutedLight};max-width:560px;margin:0 auto 60px;
  letter-spacing:-.01em;
}
.hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
.btn-primary{
  font-family:var(--font-ui);
  font-size:17px;font-weight:600;letter-spacing:-.015em;
  background:${C.grad};color:white;border:none;
  padding:18px 42px;border-radius:99px;
  cursor:pointer;transition:all .3s;
  box-shadow:0 0 40px ${C.b400}50;
}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 0 60px ${C.b400}70,0 24px 48px rgba(0,0,0,.4);}
.btn-ghost{
  font-family:var(--font-ui);
  font-size:17px;font-weight:400;letter-spacing:-.015em;
  background:transparent;color:${C.b200};
  border:1.5px solid ${C.b400}45;
  padding:16px 38px;border-radius:99px;
  cursor:pointer;transition:all .3s;
}
.btn-ghost:hover{border-color:${C.b300};background:${C.b400}12;color:${C.b100};}

/* ── STATS STRIP ── */
.stats-row{
  display:flex;gap:0;margin-top:80px;
  background:${C.glassMid};
  border:1px solid ${C.border};border-radius:20px;
  backdrop-filter:blur(24px);overflow:hidden;
}
.stat-box{
  flex:1;padding:32px 24px;text-align:center;
  border-right:1px solid ${C.border};
  transition:background .25s;
}
.stat-box:hover{background:${C.b400}12;}
.stat-box:last-child{border-right:none;}
.stat-val{
  font-family:var(--font-display);font-weight:400;
  font-size:52px;line-height:1;
  background:${C.gradText};
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;margin-bottom:10px;
}
.stat-label{
  font-family:var(--font-mono);font-size:10px;
  letter-spacing:.16em;text-transform:uppercase;color:${C.muted};
}

/* ── SECTION SHARED ── */
.section-label{
  font-family:var(--font-mono);font-size:11px;
  letter-spacing:.22em;text-transform:uppercase;
  color:${C.b300};margin-bottom:16px;
  display:flex;align-items:center;gap:12px;
}
.section-label::before{
  content:'';display:inline-block;
  width:22px;height:2px;
  background:${C.gradText};border-radius:99px;
}
.section-title{
  font-family:var(--font-display);font-weight:400;
  font-size:clamp(44px,6vw,80px);line-height:1.0;
  letter-spacing:-.025em;color:white;
}

/* ── UPLOAD SECTION ── */
.upload-section{
  padding:110px 56px;
  display:grid;grid-template-columns:1fr 1fr;
  gap:72px;border-bottom:1px solid ${C.border};
  align-items:center;
  background:${C.surfaceUp};
}
.drop-zone{
  border:2px dashed ${C.b400}40;
  padding:60px 36px;text-align:center;
  cursor:pointer;border-radius:24px;
  background:${C.glass};
  transition:all .35s cubic-bezier(.16,1,.3,1);
  position:relative;overflow:hidden;
}
.drop-zone::before{
  content:'';position:absolute;inset:0;
  background:${C.gradSubtle};opacity:0;
  transition:opacity .35s;pointer-events:none;
}
.drop-zone:hover::before,.drop-zone.drag::before{opacity:1;}
.drop-zone:hover,.drop-zone.drag{
  border-color:${C.b300};border-style:solid;
  box-shadow:0 0 60px ${C.b400}25,inset 0 0 40px ${C.b400}08;
  transform:scale(1.015);
}
.drop-icon{
  width:72px;height:72px;border-radius:18px;
  background:${C.grad};
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 22px;font-size:30px;
  box-shadow:0 0 40px ${C.b400}50;
  transition:transform .35s cubic-bezier(.16,1,.3,1);
}
.drop-zone:hover .drop-icon{transform:translateY(-5px) rotate(-8deg);}
.drop-title{
  font-family:var(--font-display);font-weight:400;
  font-size:30px;color:white;margin-bottom:8px;letter-spacing:-.02em;
}
.drop-sub{
  font-family:var(--font-mono);font-size:11px;
  letter-spacing:.16em;text-transform:uppercase;
  color:${C.muted};margin-bottom:30px;
}
.upload-meta{
  display:flex;justify-content:center;gap:32px;
  margin-top:20px;padding-top:20px;
  border-top:1px solid ${C.border};
}
.meta-item{
  font-family:var(--font-mono);font-size:10px;
  letter-spacing:.16em;text-transform:uppercase;
  color:${C.muted};text-align:center;
}
.meta-item span{
  display:block;font-size:14px;margin-top:5px;
  font-weight:600;color:${C.b300};font-family:var(--font-ui);letter-spacing:0;
}

/* ── FEATURES ── */
.features{
  padding:110px 56px;
  background:${C.surface};
  border-bottom:1px solid ${C.border};
}
.features-header{
  display:flex;justify-content:space-between;
  align-items:flex-end;margin-bottom:60px;gap:40px;flex-wrap:wrap;
}
.feat-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:20px;
}
.feat-card{
  background:${C.surfaceCard};border:1px solid ${C.border};
  padding:36px 28px;border-radius:20px;
  transition:all .35s cubic-bezier(.16,1,.3,1);cursor:default;
  position:relative;overflow:hidden;
}
.feat-card::after{
  content:'';position:absolute;inset:0;
  background:${C.gradSubtle};opacity:0;
  transition:opacity .35s;pointer-events:none;
}
.feat-card:hover{
  border-color:${C.b400}45;
  transform:translateY(-6px);
  box-shadow:0 24px 64px rgba(0,0,0,.4),0 0 40px ${C.b400}15;
}
.feat-card:hover::after{opacity:1;}
.feat-icon{
  width:50px;height:50px;border-radius:14px;
  background:${C.grad};
  display:flex;align-items:center;justify-content:center;
  margin-bottom:22px;font-size:22px;
  box-shadow:0 0 24px ${C.b400}40;
  transition:transform .35s cubic-bezier(.16,1,.3,1);
  position:relative;z-index:1;
}
.feat-card:hover .feat-icon{transform:scale(1.12) rotate(-6deg);}
.feat-num{
  font-family:var(--font-mono);font-size:10px;
  letter-spacing:.2em;color:${C.muted};margin-bottom:12px;
  position:relative;z-index:1;
}
.feat-name{
  font-family:var(--font-ui);font-weight:700;
  font-size:19px;color:white;margin-bottom:12px;
  position:relative;z-index:1;letter-spacing:-.02em;
}
.feat-desc{
  font-size:16px;font-weight:400;
  color:${C.mutedLight};line-height:1.78;
  position:relative;z-index:1;
}

/* ── HOW IT WORKS ── */
.how-section{
  display:grid;grid-template-columns:360px 1fr;
  border-bottom:1px solid ${C.border};
}
.how-sidebar{
  border-right:1px solid ${C.border};padding:88px 56px;
  background:${C.surfaceCard};
  display:flex;flex-direction:column;justify-content:space-between;
}
.how-content{padding:88px 56px;background:${C.surfaceUp};}
.how-step{
  display:grid;grid-template-columns:60px 1fr;
  border-bottom:1px solid ${C.border};
  padding:30px 0;gap:22px;
  transition:all .3s;cursor:default;
}
.how-step:last-child{border-bottom:none;}
.how-step:hover{padding-left:10px;}
.how-num{
  font-family:var(--font-mono);font-size:10px;
  letter-spacing:.15em;color:${C.b300};
  background:${C.b400}14;border:1px solid ${C.b400}30;
  border-radius:99px;padding:5px 11px;
  display:inline-flex;align-items:center;
  justify-content:center;height:fit-content;margin-top:3px;
}
.how-step-title{
  font-family:var(--font-ui);font-weight:700;
  font-size:21px;color:white;margin-bottom:10px;letter-spacing:-.02em;
}
.how-step-body{
  font-size:17px;font-weight:400;
  color:${C.mutedLight};line-height:1.8;
}

/* ── MANIFESTO ── */
.manifesto{
  padding:130px 56px;text-align:center;
  border-bottom:1px solid ${C.border};
  background:${C.surface};position:relative;overflow:hidden;
}
.manifesto-bg{
  position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse 70% 60% at 50% 50%,${C.b400}09 0%,transparent 70%);
}
.manifesto-text{
  font-family:var(--font-display);font-weight:400;
  font-size:clamp(32px,5vw,64px);line-height:1.2;
  letter-spacing:-.025em;color:white;
  max-width:860px;margin:24px auto 56px;
  position:relative;z-index:1;
}
.manifesto-text .highlight{
  background:${C.gradText};
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}

/* ── LOADING ── */
.loading-page{
  min-height:100vh;padding-top:72px;
  display:flex;align-items:center;justify-content:center;
  flex-direction:column;
  background:${C.gradHero};
  position:relative;overflow:hidden;
}
.loading-inner{
  position:relative;z-index:2;
  width:100%;max-width:800px;
  padding:0 32px;
  display:flex;flex-direction:column;align-items:center;
}
.loading-spinner-wrap{
  position:relative;width:130px;height:130px;margin-bottom:48px;
}
.loading-spinner-wrap svg{width:100%;height:100%;}
.spin-track{fill:none;stroke:${C.b700};stroke-width:3;}
.spin-arc{
  fill:none;stroke-width:3;stroke-linecap:round;
  stroke-dasharray:28 320;
  transform-origin:65px 65px;
}
.spin-arc-1{animation:spin1 1.8s linear infinite;}
.spin-arc-2{animation:spin2 1.8s linear infinite;animation-delay:-.6s;opacity:.55;}
@keyframes spin1{to{transform:rotate(360deg);}}
@keyframes spin2{to{transform:rotate(-360deg);}}
.loading-title{
  font-family:var(--font-display);font-weight:400;
  font-size:clamp(38px,6vw,68px);
  letter-spacing:-.03em;color:white;
  text-align:center;margin-bottom:12px;
}
.loading-file{
  font-family:var(--font-mono);font-size:13px;
  letter-spacing:.1em;color:${C.b300};
  background:${C.b400}14;border:1px solid ${C.b400}30;
  padding:8px 20px;border-radius:99px;
  margin-bottom:52px;text-align:center;
}
.terminal-card{
  width:100%;background:${C.ink};
  border:1px solid ${C.border};border-radius:22px;
  overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.6),0 0 60px ${C.b400}10;
}
.terminal-hdr{
  display:flex;align-items:center;gap:8px;
  padding:14px 20px;background:${C.inkSoft};
  border-bottom:1px solid ${C.border};
}
.t-dot{width:12px;height:12px;border-radius:50%;}
.terminal-title{
  font-family:var(--font-mono);font-size:12px;
  letter-spacing:.1em;color:${C.muted};margin-left:10px;
}
.terminal-body{
  padding:24px;font-family:var(--font-mono);
  font-size:14px;line-height:2.3;
}
.t-line{display:flex;align-items:center;gap:12px;}
.t-prompt{color:${C.t400};}
.t-text-pending{color:${C.ink2};}
.t-text-active{
  background:${C.gradText};
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.t-text-done{color:${C.b600};}
.t-check{color:${C.t400};}
.t-cursor{
  display:inline-block;width:8px;height:18px;
  background:${C.grad};margin-left:4px;border-radius:2px;
  animation:blink 1s step-end infinite;
}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
.progress-bar-wrap{
  width:100%;height:3px;
  background:${C.ink};border-radius:99px;overflow:hidden;margin-top:24px;
}
.progress-bar-fill{
  height:100%;background:${C.grad};border-radius:99px;
  transition:width .8s cubic-bezier(.16,1,.3,1);
}
.progress-label{
  font-family:var(--font-mono);font-size:11px;
  letter-spacing:.15em;color:${C.muted};margin-top:10px;
  text-align:center;
}

/* ── ANALYSIS PAGE ── */
.analysis-page{min-height:100vh;padding-top:72px;background:${C.surface};}
.analysis-hero{
  padding:56px 56px;
  background:${C.gradHero};
  border-bottom:1px solid ${C.border};
  display:flex;align-items:flex-end;
  justify-content:space-between;gap:32px;flex-wrap:wrap;
  position:relative;overflow:hidden;
}
.analysis-hero::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(ellipse 50% 80% at 0% 50%,${C.t400}15 0%,transparent 65%),
    radial-gradient(ellipse 40% 70% at 100% 40%,${C.i400}15 0%,transparent 65%);
}
.analysis-breadcrumb{
  font-family:var(--font-mono);font-size:11px;
  letter-spacing:.16em;text-transform:uppercase;
  color:${C.b300};cursor:pointer;margin-bottom:20px;
  transition:color .25s;display:flex;align-items:center;gap:8px;
  position:relative;z-index:1;
}
.analysis-breadcrumb:hover{color:${C.t300};}
.analysis-title{
  font-family:var(--font-display);font-weight:400;
  font-size:clamp(48px,8vw,100px);line-height:.9;
  letter-spacing:-.035em;color:white;
  position:relative;z-index:1;
}
.analysis-title em{
  font-style:italic;
  background:${C.gradText};
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.analysis-file{
  font-family:var(--font-mono);font-size:12px;
  letter-spacing:.1em;color:${C.muted};margin-top:18px;
  position:relative;z-index:1;
}
.analysis-file span{color:${C.b300};}

/* ── SCORE OVERVIEW ── */
.score-overview{
  padding:56px 56px;background:${C.surfaceUp};
  border-bottom:1px solid ${C.border};
  display:grid;grid-template-columns:240px 1fr;
  gap:72px;align-items:center;
}
.score-ring-wrap{
  position:relative;width:220px;height:220px;flex-shrink:0;
}
.score-ring-wrap svg{width:100%;height:100%;transform:rotate(-90deg);}
.score-ring-track{fill:none;stroke:${C.ink2};stroke-width:10;}
.score-ring-fill{
  fill:none;stroke-width:10;stroke-linecap:round;
  transition:stroke-dashoffset 2s cubic-bezier(.16,1,.3,1);
}
.score-num-wrap{
  position:absolute;inset:0;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
}
.score-big{
  font-family:var(--font-display);font-weight:400;
  font-size:70px;line-height:1;color:white;
}
.score-lbl{
  font-family:var(--font-mono);font-size:10px;
  letter-spacing:.2em;text-transform:uppercase;color:${C.muted};
  margin-top:6px;
}
.score-verdict{
  font-family:var(--font-display);font-weight:400;
  font-size:clamp(30px,4vw,52px);line-height:1.08;
  letter-spacing:-.03em;color:white;margin-bottom:20px;
}
.score-summary{
  font-size:19px;font-weight:400;line-height:1.85;
  color:${C.mutedLight};max-width:580px;
}
.score-explanation{
  font-size:16px;font-weight:400;line-height:1.75;
  color:${C.muted};margin-top:18px;max-width:580px;
  font-style:italic;border-left:2px solid ${C.b400}35;
  padding-left:16px;
}

/* ── SCORE BARS ── */
.score-bars-grid{
  display:grid;grid-template-columns:1fr 1fr;
  border-bottom:1px solid ${C.border};
}
.score-bar-col{
  padding:52px 56px;border-right:1px solid ${C.border};
  background:${C.surfaceCard};
}
.score-bar-col:last-child{border-right:none;background:${C.surface};}
.col-heading{
  font-family:var(--font-mono);font-size:11px;
  letter-spacing:.22em;text-transform:uppercase;
  color:${C.b300};margin-bottom:30px;
  display:flex;align-items:center;gap:12px;
}
.col-heading::before{
  content:'';width:20px;height:2px;
  background:${C.gradText};border-radius:99px;display:inline-block;
}
.bar-row{
  display:flex;align-items:center;gap:16px;margin-bottom:20px;
}
.bar-label{
  font-size:15px;font-weight:400;color:${C.mutedLight};
  width:145px;flex-shrink:0;
}
.bar-track{
  flex:1;height:5px;background:${C.ink2};
  border-radius:99px;position:relative;overflow:hidden;
}
.bar-fill{
  position:absolute;left:0;top:0;bottom:0;border-radius:99px;
  transition:width 1.6s cubic-bezier(.16,1,.3,1);
}
.bar-val{
  font-family:var(--font-mono);font-size:15px;
  color:white;width:34px;text-align:right;flex-shrink:0;font-weight:500;
}

/* ── HIRING ── */
.hiring-section{
  padding:56px 56px;background:${C.surfaceUp};
  border-bottom:1px solid ${C.border};
  display:grid;grid-template-columns:auto 1fr auto;
  gap:60px;align-items:center;
}
.hiring-pct{
  font-family:var(--font-display);font-weight:400;
  font-size:110px;line-height:1;
  background:${C.gradText};
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.hiring-pct sup{font-size:44px;}
.hiring-meter-label{
  font-family:var(--font-mono);font-size:11px;
  letter-spacing:.16em;text-transform:uppercase;
  color:${C.muted};margin-bottom:14px;
  display:flex;justify-content:space-between;
}
.hiring-track{
  height:6px;background:${C.ink2};
  border-radius:99px;overflow:hidden;
}
.hiring-fill{
  height:100%;background:${C.grad};border-radius:99px;
  transition:width 2s cubic-bezier(.16,1,.3,1);
  box-shadow:0 0 12px ${C.b400}60;
}
.hiring-title{
  font-family:var(--font-ui);font-weight:700;
  font-size:24px;color:white;margin-bottom:12px;letter-spacing:-.02em;
}
.hiring-detail{
  font-size:17px;font-weight:400;color:${C.mutedLight};line-height:1.75;
}

/* ── 2-COL ANALYSIS ── */
.analysis-2col{
  display:grid;grid-template-columns:1fr 1fr;
  border-bottom:1px solid ${C.border};
}
.analysis-col{
  padding:52px 56px;border-right:1px solid ${C.border};
  background:${C.surfaceCard};
}
.analysis-col:last-child{border-right:none;background:${C.surface};}

/* ── FEEDBACK ITEMS ── */
.feedback-item{
  border:1px solid ${C.border};padding:20px 22px;
  margin-bottom:12px;display:flex;
  align-items:flex-start;gap:16px;border-radius:14px;
  background:${C.glass};
  transition:all .3s cubic-bezier(.16,1,.3,1);
}
.feedback-item:hover{
  border-color:${C.b400}40;background:${C.b400}08;
  transform:translateX(5px);
}
.f-dot{
  width:9px;height:9px;border-radius:50%;
  flex-shrink:0;margin-top:8px;
}
.f-title{font-family:var(--font-ui);font-weight:600;font-size:16px;color:white;margin-bottom:7px;letter-spacing:-.01em;}
.f-body{font-size:15px;font-weight:400;color:${C.mutedLight};line-height:1.72;}

/* ── ATS ISSUES ── */
.ats-section{
  padding:52px 56px;
  background:${C.surfaceCard};
  border-bottom:1px solid ${C.border};
}
.ats-issue{
  border-left:3px solid ${C.i400}50;padding:18px 22px;
  margin-bottom:12px;background:${C.i400}08;
  border-radius:0 12px 12px 0;transition:all .25s;
}
.ats-issue:hover{border-left-color:${C.i400};}
.ats-issue-title{
  font-family:var(--font-ui);font-weight:600;
  font-size:15px;color:${C.i300};margin-bottom:7px;letter-spacing:-.01em;
}
.ats-issue-fix{font-size:15px;font-weight:400;color:${C.mutedLight};line-height:1.65;}

/* ── TAGS ── */
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}
.tag{
  font-family:var(--font-mono);font-size:12px;
  letter-spacing:.06em;padding:7px 16px;
  border-radius:99px;border:1.5px solid;font-weight:400;
  transition:all .2s;
}
.tag:hover{transform:translateY(-1px);}
.tag-present{border-color:${C.t400}45;color:${C.t300};background:${C.t400}12;}
.tag-missing{border-color:${C.border};color:${C.muted};background:${C.glass};}
.tag-critical{border-color:${C.i400}45;color:${C.i300};background:${C.i400}12;}
.tag-role{border-color:${C.b400}45;color:${C.b200};background:${C.b400}12;}

/* ── PROJECTS ── */
.projects-section{
  padding:56px 56px;border-bottom:1px solid ${C.border};
  background:${C.surface};
}
.project-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px;}
.project-card{
  border:1px solid ${C.border};padding:26px;
  border-radius:18px;background:${C.surfaceCard};
  transition:all .35s cubic-bezier(.16,1,.3,1);
}
.project-card:hover{
  border-color:${C.b400}45;background:${C.b400}08;
  transform:translateY(-4px);
  box-shadow:0 16px 48px rgba(0,0,0,.4),0 0 30px ${C.b400}12;
}
.project-header{
  display:flex;align-items:flex-start;
  justify-content:space-between;gap:14px;margin-bottom:14px;
}
.project-name{font-family:var(--font-ui);font-weight:700;font-size:19px;color:white;letter-spacing:-.02em;}
.project-badge{
  font-family:var(--font-mono);font-size:10px;
  letter-spacing:.12em;text-transform:uppercase;
  padding:6px 13px;border-radius:99px;border:1.5px solid;flex-shrink:0;
}
.badge-high{border-color:${C.t400}45;color:${C.t300};background:${C.t400}12;}
.badge-medium{border-color:${C.b400}45;color:${C.b200};background:${C.b400}12;}
.project-desc{font-size:16px;font-weight:400;color:${C.mutedLight};line-height:1.72;margin-bottom:18px;}
.stack{display:flex;flex-wrap:wrap;gap:6px;}
.stack-tag{
  font-family:var(--font-mono);font-size:11px;
  letter-spacing:.06em;padding:5px 11px;
  background:${C.glass};border:1px solid ${C.border};
  color:${C.muted};border-radius:8px;
}

/* ── ROADMAP ── */
.roadmap-grid{
  display:grid;grid-template-columns:1fr 1fr;
  border-bottom:1px solid ${C.border};
}
.roadmap-col{
  padding:52px 56px;border-right:1px solid ${C.border};
  background:${C.surfaceCard};
}
.roadmap-col:last-child{border-right:none;background:${C.surfaceUp};}
.roadmap-heading{
  font-family:var(--font-display);font-weight:400;
  font-size:42px;color:white;margin-bottom:6px;letter-spacing:-.025em;
}
.roadmap-sub{
  font-family:var(--font-mono);font-size:11px;
  letter-spacing:.16em;text-transform:uppercase;
  color:${C.muted};margin-bottom:30px;
}
.roadmap-item{
  display:flex;gap:18px;margin-bottom:24px;
  align-items:flex-start;padding-bottom:24px;
  border-bottom:1px solid ${C.border};
}
.roadmap-item:last-child{border-bottom:none;}
.roadmap-week{
  font-family:var(--font-mono);font-size:9px;
  letter-spacing:.12em;text-transform:uppercase;
  background:${C.grad};color:white;
  padding:6px 13px;border-radius:99px;
  flex-shrink:0;margin-top:3px;white-space:nowrap;
  box-shadow:0 0 16px ${C.b400}30;
}
.roadmap-task{
  font-family:var(--font-ui);font-weight:600;
  font-size:17px;color:white;margin-bottom:6px;letter-spacing:-.01em;
}
.roadmap-detail{font-size:15px;font-weight:400;color:${C.mutedLight};line-height:1.65;}

/* ── RECRUITER QUOTE ── */
.recruiter-section{
  padding:56px 56px;background:${C.surfaceCard};
  border-bottom:1px solid ${C.border};
  position:relative;overflow:hidden;
}
.recruiter-section::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse 60% 80% at 20% 50%,${C.b400}10 0%,transparent 65%);
}
.recruiter-quote{
  font-family:'Syne',sans-serif;font-style:italic;
  font-size:clamp(20px,3vw,36px);line-height:1.45;
  color:white;max-width:800px;
  padding-left:32px;
  border-left:3px solid ${C.b400}60;
  position:relative;z-index:1;
}
.recruiter-attr{
  font-family:'JetBrains Mono',monospace;font-size:10px;
  letter-spacing:.16em;text-transform:uppercase;
  color:${C.muted};margin-top:22px;padding-left:32px;
  position:relative;z-index:1;
}

/* ── TARGET SECTION ── */
.target-section{
  padding:56px 56px;background:${C.surfaceUp};
  border-bottom:1px solid ${C.border};
  display:grid;grid-template-columns:1fr 1fr;gap:40px;
}

/* ── FOOTER ── */
.footer{background:${C.ink};border-top:1px solid ${C.border};}
.footer-top{
  display:grid;grid-template-columns:1.2fr 1fr 1fr;
  border-bottom:1px solid rgba(255,255,255,.06);
}
.footer-col{
  padding:52px 56px;
  border-right:1px solid rgba(255,255,255,.06);
}
.footer-col:last-child{border-right:none;}
.footer-brand{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:22px;color:white;margin-bottom:14px;
  letter-spacing:-.02em;
}
.footer-brand span{
  background:${C.gradText};
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.footer-tagline{
  font-size:14px;font-weight:300;
  color:rgba(255,255,255,.4);line-height:1.8;
}
.footer-pow{
  font-family:'JetBrains Mono',monospace;font-size:9px;
  letter-spacing:.18em;text-transform:uppercase;
  color:${C.t300};margin-top:28px;
  display:flex;align-items:center;gap:10px;
}
.footer-pow::before{
  content:'';display:inline-block;width:14px;height:2px;
  background:${C.t400};border-radius:99px;
}
.footer-heading{
  font-family:'JetBrains Mono',monospace;font-size:9px;
  letter-spacing:.22em;text-transform:uppercase;
  color:rgba(255,255,255,.28);margin-bottom:22px;
}
.footer-links{list-style:none;}
.footer-links li{margin-bottom:14px;}
.footer-links a{
  font-size:15px;font-weight:300;color:rgba(255,255,255,.6);
  text-decoration:none;transition:color .2s;
}
.footer-links a:hover{color:${C.t300};}
.footer-bottom{
  padding:20px 56px;
  display:flex;justify-content:space-between;align-items:center;
}
.footer-copy{
  font-family:'JetBrains Mono',monospace;font-size:10px;
  letter-spacing:.08em;color:rgba(255,255,255,.25);
}

/* ── ERROR ── */
.error-page{
  min-height:100vh;padding-top:72px;
  display:flex;align-items:center;justify-content:center;
  background:${C.gradHero};
}
.error-card{
  max-width:540px;padding:48px;border-radius:24px;
  border:1px solid ${C.i400}35;background:${C.surfaceCard};
  box-shadow:0 0 60px ${C.i400}15;
}
.error-title{
  font-family:'Syne',sans-serif;font-weight:700;
  font-size:30px;color:${C.i300};margin-bottom:14px;
}
.error-body{font-size:16px;font-weight:300;color:${C.mutedLight};line-height:1.75;margin-bottom:30px;}

/* ── TOAST ── */
.toast{
  position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
  background:${C.surfaceCard};color:white;
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:14px;padding:15px 30px;border-radius:99px;
  border:1px solid ${C.border};
  opacity:0;pointer-events:none;z-index:9999;
  transition:opacity .3s;
  box-shadow:0 8px 40px rgba(0,0,0,.4);
  letter-spacing:-.01em;white-space:nowrap;
}
.toast.visible{opacity:1;}

/* ── REVEAL ANIMATION ── */
.reveal{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s ease;}
.reveal.visible{opacity:1;transform:translateY(0);}

/* ── RESPONSIVE ── */
@media(max-width:960px){
  .feat-grid{grid-template-columns:1fr 1fr;gap:14px;}
  .score-overview,.score-bars-grid,.analysis-2col,.hiring-section,
  .roadmap-grid,.target-section,.footer-top,.how-section,
  .upload-section,.project-grid{grid-template-columns:1fr;}
  .score-bar-col,.analysis-col,.roadmap-col,.footer-col{border-right:none;border-bottom:1px solid ${C.border};}
  .how-sidebar{border-right:none;border-bottom:1px solid ${C.border};}
  .hiring-section{display:flex;flex-direction:column;gap:28px;}
  .nav-links{display:none;}
  .nav{padding:0 20px;}
  .hero-inner,.analysis-hero,.recruiter-section,.target-section,
  .manifesto,.upload-section,.projects-section,.ats-section{padding:44px 20px;}
  .score-bar-col,.analysis-col,.roadmap-col,.footer-col,
  .how-content,.how-sidebar,.score-overview,.hiring-section{padding:36px 20px;}
  .features{padding:70px 20px;}
}
`;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function scoreGrad(n) {
  if (n >= 75) return `linear-gradient(90deg,${C.t300},${C.t500})`;
  if (n >= 50) return `linear-gradient(90deg,${C.b300},${C.b500})`;
  return `linear-gradient(90deg,${C.i300},${C.i500})`;
}
function scoreStroke(n) {
  if (n >= 75) return C.t400;
  if (n >= 50) return C.b400;
  return C.i400;
}

// ═══════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════
function Navbar({ onCta, onHome }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={onHome} role="button" tabIndex={0} onKeyDown={e => e.key==="Enter"&&onHome()}>
        <div className="nav-logo-mark">IV</div>
        <div className="nav-logo-text">
          Indis<span>Valley</span> AI
        </div>
        <span className="nav-chip">Beta</span>
      </div>
      <ul className="nav-links">
        <li><a href="#features" onClick={e=>{e.preventDefault();scrollTo("features");}}>Features</a></li>
        <li><a href="#how-it-works" onClick={e=>{e.preventDefault();scrollTo("how-it-works");}}>How It Works</a></li>
        <li><a href="#about" onClick={e=>{e.preventDefault();scrollTo("about");}}>About</a></li>
        <li><a href="#upload" onClick={e=>{e.preventDefault();scrollTo("upload");}}>Upload</a></li>
      </ul>
      <button className="nav-cta" onClick={onCta}>
        Analyze Resume →
      </button>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCORE RING
// ═══════════════════════════════════════════════════════════════
function ScoreRing({ score, animated }) {
  const r = 95;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="score-ring-wrap">
      <svg viewBox="0 0 220 220">
        <circle cx="110" cy="110" r={r} className="score-ring-track" />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={scoreStroke(score)} />
            <stop offset="100%" stopColor={C.b300} />
          </linearGradient>
        </defs>
        <circle
          cx="110" cy="110" r={r}
          className="score-ring-fill"
          stroke="url(#scoreGrad)"
          strokeDasharray={circ}
          strokeDashoffset={animated ? offset : circ}
          filter={`drop-shadow(0 0 8px ${scoreStroke(score)}80)`}
        />
      </svg>
      <div className="score-num-wrap">
        <span className="score-big">{animated ? score : "—"}</span>
        <span className="score-lbl">ATS Score</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANALYSIS PAGE
// ═══════════════════════════════════════════════════════════════
function AnalysisPage({ result, fileName, onBack, animated }) {
  const half = Math.ceil(result.subScores.length / 2);
  const hiringFill = animated ? result.hiringProbability : 0;

  return (
    <div className="analysis-page">
      {/* ── HERO ── */}
      <div className="analysis-hero">
        <div>
          <div className="analysis-breadcrumb" onClick={onBack} role="button" tabIndex={0} onKeyDown={e=>e.key==="Enter"&&onBack()}>
            ← IndisValley AI / Analysis Report
          </div>
          <h1 className="analysis-title">
            Your resume,<br /><em>decoded.</em>
          </h1>
          <div className="analysis-file">
            Analyzing: <span>{fileName}</span>
          </div>
        </div>
        <button className="btn-ghost" onClick={onBack}>← New Analysis</button>
      </div>

      {/* ── SCORE OVERVIEW ── */}
      <div className="score-overview">
        <ScoreRing score={result.overallScore} animated={animated} />
        <div>
          <div className="score-verdict">{result.verdict}</div>
          <p className="score-summary">{result.summary}</p>
          {result.scoreBreakdownExplanation && (
            <p className="score-explanation">{result.scoreBreakdownExplanation}</p>
          )}
        </div>
      </div>

      {/* ── SUB-SCORES ── */}
      <div className="score-bars-grid">
        <div className="score-bar-col">
          <div className="col-heading">Score Breakdown</div>
          {result.subScores.slice(0, half).map((s, i) => (
            <div className="bar-row" key={i}>
              <span className="bar-label">{s.label}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: animated ? `${s.value}%` : "0%", background: scoreGrad(s.value) }} />
              </div>
              <span className="bar-val">{animated ? s.value : 0}</span>
            </div>
          ))}
        </div>
        <div className="score-bar-col">
          <div className="col-heading">Continued</div>
          {result.subScores.slice(half).map((s, i) => (
            <div className="bar-row" key={i}>
              <span className="bar-label">{s.label}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: animated ? `${s.value}%` : "0%", background: scoreGrad(s.value) }} />
              </div>
              <span className="bar-val">{animated ? s.value : 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HIRING PROBABILITY ── */}
      <div className="hiring-section">
        <div>
          <div className="hiring-pct">{animated ? result.hiringProbability : 0}<sup>%</sup></div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: C.muted, marginTop: 6 }}>
            Hire Probability
          </div>
        </div>
        <div style={{ flex: 2, minWidth: 200 }}>
          <div className="hiring-meter-label">
            <span>Recruiter Screen Pass Rate</span>
            <span style={{ color: C.b300 }}>{animated ? result.hiringProbability : 0}%</span>
          </div>
          <div className="hiring-track">
            <div className="hiring-fill" style={{ width: `${hiringFill}%` }} />
          </div>
        </div>
        <div style={{ maxWidth: 280 }}>
          <div className="hiring-title">{result.hiringVerdict}</div>
          <div className="hiring-detail">{result.hiringDetail}</div>
        </div>
      </div>

      {/* ── STRENGTHS + GAPS ── */}
      <div className="analysis-2col">
        <div className="analysis-col">
          <div className="col-heading">Strengths</div>
          {result.strengths.map((s, i) => (
            <div className="feedback-item" key={i}>
              <div className="f-dot" style={{ background: C.t400, boxShadow: `0 0 8px ${C.t400}60` }} />
              <div><div className="f-title">{s.title}</div><div className="f-body">{s.detail}</div></div>
            </div>
          ))}
        </div>
        <div className="analysis-col">
          <div className="col-heading">Critical Gaps</div>
          {result.gaps.map((g, i) => (
            <div className="feedback-item" key={i}>
              <div className="f-dot" style={{ background: i === 0 ? C.i400 : C.b400, boxShadow: `0 0 8px ${i===0?C.i400:C.b400}60` }} />
              <div><div className="f-title">{g.title}</div><div className="f-body">{g.detail}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KEYWORDS ── */}
      <div className="analysis-2col">
        <div className="analysis-col">
          <div className="col-heading">Keywords Detected</div>
          <div className="tags">
            {result.keywordsPresent?.map((k, i) => <span className="tag tag-present" key={i}>{k}</span>)}
          </div>
        </div>
        <div className="analysis-col">
          <div className="col-heading">Missing Keywords</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: C.i300, marginBottom: 8 }}>Critical</div>
          <div className="tags">
            {result.keywordsCritical?.map((k, i) => <span className="tag tag-critical" key={i}>{k}</span>)}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: C.muted, marginTop: 20, marginBottom: 8 }}>Recommended</div>
          <div className="tags">
            {result.keywordsMissing?.map((k, i) => <span className="tag tag-missing" key={i}>{k}</span>)}
          </div>
        </div>
      </div>

      {/* ── ATS ISSUES ── */}
      {result.atsIssues?.length > 0 && (
        <div className="ats-section">
          <div className="col-heading">ATS Parsing Issues</div>
          {result.atsIssues.map((issue, i) => (
            <div className="ats-issue" key={i}>
              <div className="ats-issue-title">⚠ {issue.issue}</div>
              <div className="ats-issue-fix">Fix: {issue.fix}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── PROJECTS ── */}
      <div className="projects-section">
        <div className="col-heading">Recommended Projects</div>
        <div className="project-grid">
          {result.projects?.map((p, i) => (
            <div className="project-card" key={i}>
              <div className="project-header">
                <div className="project-name">{p.name}</div>
                <div className={`project-badge ${p.impact === "High" ? "badge-high" : "badge-medium"}`}>{p.impact} Impact</div>
              </div>
              <div className="project-desc">{p.description}</div>
              <div className="stack">{p.stack?.map((s, j) => <span className="stack-tag" key={j}>{s}</span>)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROADMAP ── */}
      <div className="roadmap-grid">
        <div className="roadmap-col">
          <div className="roadmap-heading">30 Days</div>
          <div className="roadmap-sub">Immediate action plan</div>
          {result.roadmap30?.map((item, i) => (
            <div className="roadmap-item" key={i}>
              <div className="roadmap-week">{item.week}</div>
              <div>
                <div className="roadmap-task">{item.task}</div>
                <div className="roadmap-detail">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="roadmap-col">
          <div className="roadmap-heading">90 Days</div>
          <div className="roadmap-sub">Compounding growth</div>
          {result.roadmap90?.map((item, i) => (
            <div className="roadmap-item" key={i}>
              <div className="roadmap-week">{item.week}</div>
              <div>
                <div className="roadmap-task">{item.task}</div>
                <div className="roadmap-detail">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TARGET ROLES ── */}
      {(result.targetRoles?.length > 0 || result.targetCompanies?.length > 0) && (
        <div className="target-section">
          <div>
            <div className="col-heading">Best-Fit Roles</div>
            <div className="tags">{result.targetRoles?.map((r, i) => <span className="tag tag-role" key={i}>{r}</span>)}</div>
          </div>
          <div>
            <div className="col-heading">Target Company Types</div>
            <div className="tags">{result.targetCompanies?.map((c, i) => <span className="tag tag-missing" key={i}>{c}</span>)}</div>
          </div>
        </div>
      )}

      {/* ── RECRUITER SIMULATION ── */}
      <div className="recruiter-section">
        <div className="col-heading">Recruiter Simulation</div>
        <blockquote className="recruiter-quote">"{result.recruiterNote}"</blockquote>
        <div className="recruiter-attr">— Senior Technical Recruiter, AI Simulation</div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: "52px 56px", display: "flex", justifyContent: "center", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <button className="btn-primary" onClick={onBack}>← Analyze Another Resume</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════
function Footer({ onNavigate }) {
  const scrollTo = (id) => {
    if (onNavigate) onNavigate();
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
  };
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col">
          <div className="footer-brand">Indis<span>Valley</span> AI</div>
          <div className="footer-tagline">Career intelligence for ambitious engineers. Powered by brutal honesty and real AI.</div>
          <div className="footer-pow">Powered by Gemini AI</div>
        </div>
        <div className="footer-col">
          <div className="footer-heading">Product</div>
          <ul className="footer-links">
            {["Resume Analyzer","ATS Scoring","Career Roadmaps","Project Recommender"].map(l => (
              <li key={l}><a href="#upload" onClick={e=>{e.preventDefault();scrollTo("upload");}}>{l}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <div className="footer-heading">Navigate</div>
          <ul className="footer-links">
            {[{label:"Features",id:"features"},{label:"How It Works",id:"how-it-works"},{label:"About",id:"about"},{label:"Analyze Resume",id:"upload"}].map(l => (
              <li key={l.id}><a href={`#${l.id}`} onClick={e=>{e.preventDefault();scrollTo(l.id);}}>{l.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2026 IndisValley AI — All rights reserved</span>
        <span className="footer-copy">Est. 2026 · Built for ambitious engineers</span>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function IndisValleyAI() {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [view, setView] = useState("home"); // home | loading | results | error
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState(null);
  const [animated, setAnimated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState({ visible: false, text: "" });
  const fileRef = useRef(null);

  // Animate results after mount
  useEffect(() => {
    if (view === "results") {
      const t = setTimeout(() => setAnimated(true), 400);
      return () => clearTimeout(t);
    } else setAnimated(false);
  }, [view]);

  // Intersection observer for reveal animations
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [view]);

  const pop = useCallback((text) => {
    setToast({ visible: true, text });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const analyze = useCallback(async (file) => {
    if (file.type !== "application/pdf") { pop("PDF files only — please upload a .pdf resume"); return; }
    if (file.size > 10 * 1024 * 1024) { pop("File too large — maximum 10MB"); return; }

    setFileName(file.name);
    setView("loading");
    setLoadStep(0);
    setResult(null);
    setErrorMsg("");

    let step = 0;
    const stepInterval = setInterval(() => {
      step += 1;
      setLoadStep(step);
      if (step >= LOAD_STEPS.length - 1) clearInterval(stepInterval);
    }, 900);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 90_000);

      const response = await fetch(`${API_URL}/upload-resume`, {
        method: "POST", body: formData, signal: abortController.signal,
      });
      clearTimeout(timeoutId);
      clearInterval(stepInterval);
      setLoadStep(LOAD_STEPS.length);

      if (!response.ok) {
        let detail = "Backend API error";
        try { const err = await response.json(); detail = err.detail || err.error || detail; } catch { /**/ }
        throw new Error(detail);
      }
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");
      setResult(data.analysis);
      setView("results");
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err instanceof Error
        ? err.name === "AbortError" ? "Request timed out — please try again." : err.message
        : "An unexpected error occurred";
      setErrorMsg(msg);
      setView("error");
    }
  }, [pop]);

  const handleFile = useCallback((f) => { if (f) analyze(f); }, [analyze]);

  // ── LOADING VIEW ──
  if (view === "loading") {
    const progress = Math.round((loadStep / LOAD_STEPS.length) * 100);
    return (
      <>
        <style>{CSS}</style>
        <Navbar onCta={() => {}} onHome={() => setView("home")} />
        <div className="loading-page">
          <div className="orb" style={{ width: 560, height: 560, top: "-100px", left: "-80px", background: C.t200 }} />
          <div className="orb" style={{ width: 420, height: 420, bottom: "-80px", right: "-80px", background: C.i200, animationDelay: "3s" }} />
          <div className="hero-bg-grid" />
          <div className="loading-inner">
            <div className="loading-spinner-wrap">
              <svg viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="56" className="spin-track" />
                <defs>
                  <linearGradient id="arc1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={C.t400} />
                    <stop offset="100%" stopColor={C.b400} />
                  </linearGradient>
                  <linearGradient id="arc2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={C.b400} />
                    <stop offset="100%" stopColor={C.i400} />
                  </linearGradient>
                </defs>
                <circle cx="65" cy="65" r="56" className="spin-arc spin-arc-1" stroke="url(#arc1)" />
                <circle cx="65" cy="65" r="56" className="spin-arc spin-arc-2" stroke="url(#arc2)" />
              </svg>
            </div>
            <h1 className="loading-title">Analyzing Resume</h1>
            <div className="loading-file">{fileName}</div>
            <div className="terminal-card">
              <div className="terminal-hdr">
                <div className="t-dot" style={{ background: "#FC615D" }} />
                <div className="t-dot" style={{ background: "#FDBC40" }} />
                <div className="t-dot" style={{ background: "#34C749" }} />
                <div className="terminal-title">indisvalley_ai_engine.exe</div>
              </div>
              <div className="terminal-body">
                {LOAD_STEPS.map((step, i) => {
                  const state = i < loadStep ? "done" : i === loadStep ? "active" : "pending";
                  return (
                    <div className="t-line" key={i}>
                      <span className="t-prompt">$</span>
                      <span className={`t-text-${state}`}>{step}</span>
                      {state === "done" && <span className="t-check">✓</span>}
                      {state === "active" && <span className="t-cursor" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-label">{progress}% complete</div>
          </div>
        </div>
      </>
    );
  }

  // ── ERROR VIEW ──
  if (view === "error") {
    return (
      <>
        <style>{CSS}</style>
        <Navbar onCta={() => setView("home")} onHome={() => setView("home")} />
        <div className="error-page">
          <div className="error-card">
            <div className="error-title">Analysis Failed</div>
            <div className="error-body">{errorMsg}</div>
            <button className="btn-primary" onClick={() => setView("home")}>← Try Again</button>
          </div>
        </div>
      </>
    );
  }

  // ── RESULTS VIEW ──
  if (view === "results" && result) {
    return (
      <>
        <style>{CSS}</style>
        <div className={`toast ${toast.visible ? "visible" : ""}`}>{toast.text}</div>
        <Navbar onCta={() => { setView("home"); setResult(null); }} onHome={() => { setView("home"); setResult(null); }} />
        <AnalysisPage
          result={result}
          fileName={fileName ?? "resume.pdf"}
          onBack={() => { setView("home"); setResult(null); }}
          animated={animated}
        />
        <Footer onNavigate={() => { setView("home"); setResult(null); }} />
      </>
    );
  }

  // ── HOME VIEW ──
  return (
    <>
      <style>{CSS}</style>
      <div className={`toast ${toast.visible ? "visible" : ""}`}>{toast.text}</div>
      <Navbar onCta={() => scrollTo("upload")} onHome={() => {}} />

      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="hero-bg-grid" />
        <div className="hero-bg-glow" />
        <div className="hero-orbs">
          <div className="orb" style={{ width: 620, height: 540, top: "5%", left: "-80px", background: C.t300 }} />
          <div className="orb" style={{ width: 480, height: 480, top: "20%", right: "0%", background: C.i300, animationDelay: "4s" }} />
          <div className="orb" style={{ width: 360, height: 360, bottom: "15%", left: "35%", background: C.b300, animationDelay: "8s" }} />
        </div>
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="eye-dot" />
            Est. 2026 — AI Career Intelligence
          </div>
          <h1 className="hero-h1">
            Get Hired.<br />
            <span className="hero-h1-grad">Not Filtered.</span>
          </h1>
          <p className="hero-sub">
            IndisValley AI gives you brutal, recruiter-grade analysis of your resume —
            ATS scores, hiring probability, critical gaps, and a personalized roadmap
            to fix everything. No sugarcoating.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => scrollTo("upload")}>Upload Resume →</button>
            <button className="btn-ghost" onClick={() => scrollTo("how-it-works")}>How It Works</button>
          </div>

          <div className="stats-row">
            {[
              { val: "98%", label: "ATS Precision" },
              { val: "30s",  label: "Analysis Speed" },
              { val: "8+",   label: "Score Dimensions" },
              { val: "24/7", label: "Always On" },
            ].map((s, i) => (
              <div className="stat-box" key={i}>
                <div className="stat-val">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPLOAD ── */}
      <section className="upload-section" id="upload">
        <div>
          <div className="section-label">Upload & Analyze</div>
          <h2 className="section-title reveal">Drop your<br />resume.<br />Get the truth.</h2>
          <p className="reveal" style={{ fontSize: 18, fontWeight: 300, color: C.mutedLight, lineHeight: 1.85, marginTop: 24, maxWidth: 400 }}>
            No sugarcoating. Enterprise-grade ATS analysis, recruiter simulation,
            hiring probability, and a full career roadmap — all in one report.
          </p>
          <div style={{ marginTop: 44, display: "flex", gap: 40, flexWrap: "wrap" }}>
            {[{ label: "Format", val: "PDF only" }, { label: "Speed", val: "~30 sec" }, { label: "Engine", val: "Gemini AI" }].map(m => (
              <div key={m.label}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 24, color: C.white }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div
            className={`drop-zone${dragging ? " drag" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
            aria-label="Upload resume PDF"
          >
            <div className="drop-icon">↑</div>
            <div className="drop-title">Drop Resume Here</div>
            <div className="drop-sub">PDF only · drag or click to upload</div>
            <button className="btn-primary" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
              Choose File & Analyze →
            </button>
          </div>
          <div className="upload-meta">
            <div className="meta-item">Format <span>PDF</span></div>
            <div className="meta-item">Max Size <span>10 MB</span></div>
            <div className="meta-item">Analysis <span>~30s</span></div>
          </div>
          <input type="file" accept=".pdf" ref={fileRef} style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0])} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <div className="features-header">
          <div>
            <div className="section-label">What You Get</div>
            <h2 className="section-title">Four layers.<br />Zero BS.</h2>
          </div>
          <p style={{ fontSize: 18, fontWeight: 300, color: C.mutedLight, maxWidth: 320, lineHeight: 1.85 }}>
            Built for engineers navigating a talent market where the bar is relentlessly high
            and ATS filters reject 75% of resumes before a human ever sees them.
          </p>
        </div>
        <div className="feat-grid">
          {[
            { icon: "⬡", title: "ATS Intelligence", desc: "Enterprise-grade parsing against real ATS systems. 8 scoring dimensions. See exactly where you score and why your resume passes or fails." },
            { icon: "◎", title: "Recruiter Simulation", desc: "6-second scan model trained on real hiring patterns. Know what stands out, what gets ignored, and what makes them move to the next candidate." },
            { icon: "△", title: "Hiring Probability", desc: "A precise 0–100% likelihood score with verdict labels — Strong Hire, Lean No Hire, and everything between. No vague feedback." },
            { icon: "◈", title: "Project Roadmap", desc: "Custom high-signal project ideas designed to close your specific skill gaps. Build proof of work before you get the offer letter." },
          ].map((f, i) => (
            <div className="feat-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-num">0{i + 1}</div>
              <div className="feat-name">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" id="how-it-works">
        <div className="how-sidebar">
          <div>
            <div className="section-label">How It Works</div>
            <h2 className="section-title" style={{ fontSize: "clamp(36px,4vw,56px)" }}>
              Simple.<br />Brutal.<br />Honest.
            </h2>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: C.muted, lineHeight: 3.2 }}>
            No account needed<br />No email required<br />No data stored<br />Just your resume
          </div>
        </div>
        <div className="how-content">
          {[
            { num: "01", title: "Upload Your PDF", body: "Drop your resume. Our parser extracts every line, section, heading, and formatting detail in milliseconds — nothing is missed." },
            { num: "02", title: "Gemini AI Deep Analysis", body: "Gemini 2.5 Flash cross-references your resume against 2,400+ job descriptions, ATS patterns, and real recruiter heuristics to score every dimension." },
            { num: "03", title: "Full Report Generated", body: "ATS score across 8 dimensions, hiring probability, keyword gaps, strengths, critical gaps, ATS parsing issues — all computed simultaneously." },
            { num: "04", title: "Follow Your Roadmap", body: "Get personalized project recommendations and a prioritized 30/90-day improvement plan tailored to your exact gaps. Act on it. Get hired." },
          ].map((s, i) => (
            <div className="how-step reveal" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
              <div><div className="how-num">{s.num}</div></div>
              <div>
                <div className="how-step-title">{s.title}</div>
                <div className="how-step-body">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="manifesto" id="about">
        <div className="manifesto-bg" />
        <div className="section-label" style={{ justifyContent: "center" }}>The IndisValley Commitment</div>
        <p className="manifesto-text reveal">
          In this grind, confusion is the real enemy.
          We exist so ambitious engineers stop guessing
          and start building careers with{" "}
          <span className="highlight">brutal clarity.</span>
        </p>
        <button className="btn-primary" onClick={() => scrollTo("upload")}>
          Analyze My Resume →
        </button>
      </section>

      <Footer />
    </>
  );
}