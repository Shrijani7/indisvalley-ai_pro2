"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const LOAD_STEPS = [
  "Parsing resume structure & semantic layers",
  "Running ATS keyword extraction engine",
  "Cross-referencing 2,400+ job descriptions",
  "Simulating 6-second recruiter scan",
  "Detecting seniority level & career maturity",
  "Analyzing bullet strength & impact signals",
  "Running AI content authenticity check",
  "Simulating FAANG / Startup / HR personas",
  "Calculating salary intelligence",
  "Generating interview question bank",
  "Building personalized career roadmap",
  "Finalizing 20-dimension intelligence report",
];

const API_URL =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://127.0.0.1:8000";

// ── CDN script loader ─────────────────────────────────────────────────────────
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = () => resolve(); s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── Fixed PDF download ────────────────────────────────────────────────────────
async function downloadReportAsPDF(fileName: string) {
  const el = document.getElementById("analysis-report-root");
  if (!el) return;

  const btn = document.getElementById("pdf-download-btn") as HTMLButtonElement | null;
  if (btn) { btn.textContent = "⏳ Generating PDF…"; btn.disabled = true; }

  // Hide fixed nav so it doesn't bleed into capture
  const nav = document.querySelector(".nav") as HTMLElement | null;
  if (nav) nav.style.cssText += ";display:none!important;";

  // Ensure page starts at top
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 350));

  try {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

    const w = window as any;
    const { jsPDF } = w.jspdf;

    const canvas = await w.html2canvas(el, {
      scale: 1.6,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#0D1525",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      width: el.scrollWidth,
      height: el.scrollHeight,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
      onclone: (doc: Document) => {
        doc.querySelectorAll(".pdf-hide").forEach((n: any) => (n.style.display = "none"));
        const root = doc.getElementById("analysis-report-root") as HTMLElement | null;
        if (root) root.style.paddingTop = "0";
      },
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.93);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH  = (canvas.height * pageW) / canvas.width;

    let yOffset = 0, remaining = imgH;
    while (remaining > 0) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, -yOffset, pageW, imgH);
      yOffset += pageH;
      remaining -= pageH;
    }

    const safe = (fileName || "resume").replace(/\.pdf$/i, "");
    pdf.save(`IndisValley_Report_${safe}.pdf`);
  } catch (err: any) {
    alert("PDF generation failed: " + (err?.message ?? err));
  } finally {
    if (nav) nav.style.display = "";
    if (btn) { btn.textContent = "⬇ Download PDF Report"; btn.disabled = false; }
  }
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;}
:root{
  --font-ui:'Inter',ui-sans-serif,system-ui,-apple-system,sans-serif;
  --font-display:"DM Serif Display",Georgia,"Times New Roman",serif;
  --font-mono:"JetBrains Mono","Fira Code",ui-monospace,monospace;
}
body{background:#0D1525;color:#fff;font-family:var(--font-ui);font-size:18px;line-height:1.7;overflow-x:hidden;letter-spacing:-0.01em;}
::selection{background:#2D96E840;color:#B2D6F8;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:#080E1E;}
::-webkit-scrollbar-thumb{background:#0D5DA6;border-radius:99px;}

/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:1000;height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 56px;background:rgba(8,14,30,0.85);border-bottom:1px solid rgba(109,181,241,0.14);backdrop-filter:blur(32px);}
.nav-logo{display:flex;align-items:center;gap:12px;cursor:pointer;}
.nav-logo-mark{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;color:white;box-shadow:0 0 24px #0FA89640;}
.nav-logo-text{font-weight:800;font-size:20px;letter-spacing:-0.03em;color:white;}
.nav-logo-text span{background:linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.nav-chip{font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#22C4A4;background:#0FA89618;border:1px solid #0FA89635;padding:3px 10px;border-radius:99px;margin-left:2px;}
.nav-links{display:flex;gap:40px;list-style:none;}
.nav-links a{font-size:16px;font-weight:500;color:#7A8BAA;text-decoration:none;transition:color .25s;}
.nav-links a:hover{color:#6DB5F1;}
.nav-cta{font-size:16px;font-weight:700;background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);color:white;border:none;padding:12px 30px;border-radius:99px;cursor:pointer;transition:all .2s;box-shadow:0 0 24px #1278CC40;}
.nav-cta:hover{opacity:.9;transform:translateY(-1px);}

/* HERO */
.hero{min-height:100vh;padding-top:72px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:linear-gradient(160deg,#080E1E 0%,#0D1A2E 50%,#101524 100%);}
.hero-bg-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(#1278CC06 1px,transparent 1px),linear-gradient(90deg,#1278CC06 1px,transparent 1px);background-size:56px 56px;}
.hero-bg-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 55% at 15% 25%,#0FA89618 0%,transparent 65%),radial-gradient(ellipse 50% 50% at 85% 15%,#4857D818 0%,transparent 65%);}
.orb{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;opacity:.22;animation:orb-drift 12s ease-in-out infinite alternate;}
@keyframes orb-drift{0%{transform:translate(0,0)scale(1);}100%{transform:translate(30px,20px)scale(1.08);}}
.hero-inner{position:relative;z-index:2;text-align:center;max-width:960px;padding:80px 48px;}
.hero-eyebrow{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-mono);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#22C4A4;background:#0FA89612;border:1px solid #0FA89630;padding:10px 22px;border-radius:99px;margin-bottom:52px;animation:float-badge 5s ease-in-out infinite;}
@keyframes float-badge{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
.eye-dot{width:7px;height:7px;border-radius:50%;background:linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA);animation:eye-pulse 2.4s ease-in-out infinite;}
@keyframes eye-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.65);}}
.hero-h1{font-family:var(--font-display);font-size:clamp(72px,11vw,148px);font-weight:400;line-height:.88;letter-spacing:-.03em;color:white;margin-bottom:36px;}
.hero-h1-grad{display:block;font-style:italic;background:linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.hero-sub{font-size:21px;font-weight:400;color:#9BAFC8;max-width:580px;margin:0 auto 60px;line-height:1.8;}
.hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
.btn-primary{font-size:17px;font-weight:700;background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);color:white;border:none;padding:18px 42px;border-radius:99px;cursor:pointer;transition:all .3s;box-shadow:0 0 40px #1278CC50;}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 0 60px #1278CC70;}
.btn-ghost{font-size:17px;font-weight:600;background:transparent;color:#6DB5F1;border:1.5px solid #1278CC45;padding:16px 38px;border-radius:99px;cursor:pointer;transition:all .3s;}
.btn-ghost:hover{border-color:#2D96E8;background:#1278CC12;color:#B2D6F8;}
.btn-pdf{font-size:15px;font-weight:700;background:transparent;color:#22C4A4;border:1.5px solid #0FA89645;padding:13px 28px;border-radius:99px;cursor:pointer;transition:all .3s;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;}
.btn-pdf:hover{background:#0FA89618;border-color:#0FA896;transform:translateY(-2px);}
.btn-pdf:disabled{opacity:.5;cursor:not-allowed;transform:none;}

.stats-row{display:flex;margin-top:80px;background:rgba(255,255,255,0.12);border:1px solid rgba(109,181,241,0.14);border-radius:20px;backdrop-filter:blur(24px);overflow:hidden;}
.stat-box{flex:1;padding:32px 24px;text-align:center;border-right:1px solid rgba(109,181,241,0.14);transition:background .25s;}
.stat-box:hover{background:#1278CC12;}
.stat-box:last-child{border-right:none;}
.stat-val{font-family:var(--font-display);font-size:52px;line-height:1;background:linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;}
.stat-label{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#7A8BAA;}

.section-label{font-family:var(--font-mono);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#2D96E8;margin-bottom:16px;display:flex;align-items:center;gap:12px;}
.section-label::before{content:'';display:inline-block;width:22px;height:2px;background:linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA);border-radius:99px;}
.section-title{font-family:var(--font-display);font-size:clamp(44px,6vw,80px);line-height:1.0;letter-spacing:-.025em;color:white;}
.col-heading{font-family:var(--font-ui);font-size:22px;font-weight:800;letter-spacing:-0.03em;color:white;margin-bottom:24px;display:flex;align-items:center;gap:12px;}
.col-heading::before{content:'';display:inline-block;width:4px;height:22px;background:linear-gradient(180deg,#22C4A4,#2D96E8,#6B7AEA);border-radius:99px;flex-shrink:0;}

/* UPLOAD */
.upload-section{padding:110px 56px;display:grid;grid-template-columns:1fr 1fr;gap:72px;border-bottom:1px solid rgba(109,181,241,0.14);align-items:center;background:#111D30;}
.drop-zone{border:2px dashed #1278CC40;padding:60px 36px;text-align:center;cursor:pointer;border-radius:24px;background:rgba(255,255,255,0.06);transition:all .35s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;}
.drop-zone::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(15,168,150,0.15),rgba(18,120,204,0.15),rgba(72,87,216,0.15));opacity:0;transition:opacity .35s;pointer-events:none;}
.drop-zone:hover::before,.drop-zone.drag::before{opacity:1;}
.drop-zone:hover,.drop-zone.drag{border-color:#2D96E8;border-style:solid;box-shadow:0 0 60px #1278CC25;transform:scale(1.015);}
.drop-icon{width:72px;height:72px;border-radius:18px;background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;font-size:30px;box-shadow:0 0 40px #1278CC50;transition:transform .35s;}
.drop-zone:hover .drop-icon{transform:translateY(-5px) rotate(-8deg);}
.drop-title{font-family:var(--font-ui);font-size:28px;font-weight:800;color:white;margin-bottom:8px;letter-spacing:-0.03em;}
.drop-sub{font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7A8BAA;margin-bottom:30px;}
.upload-meta{display:flex;justify-content:center;gap:32px;margin-top:20px;padding-top:20px;border-top:1px solid rgba(109,181,241,0.14);}
.meta-item{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#7A8BAA;text-align:center;}
.meta-item span{display:block;font-size:14px;margin-top:5px;font-weight:700;color:#2D96E8;font-family:var(--font-ui);}

/* FEATURES */
.features{padding:110px 56px;background:#0D1525;border-bottom:1px solid rgba(109,181,241,0.14);}
.features-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:60px;gap:40px;flex-wrap:wrap;}
.feat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
.feat-card{background:#162035;border:1px solid rgba(109,181,241,0.14);padding:36px 28px;border-radius:20px;transition:all .35s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;}
.feat-card:hover{border-color:#1278CC45;transform:translateY(-6px);box-shadow:0 24px 64px rgba(0,0,0,.4);}
.feat-icon{width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);display:flex;align-items:center;justify-content:center;margin-bottom:22px;font-size:22px;transition:transform .35s;}
.feat-card:hover .feat-icon{transform:scale(1.12) rotate(-6deg);}
.feat-num{font-family:var(--font-mono);font-size:10px;letter-spacing:.2em;color:#7A8BAA;margin-bottom:12px;}
.feat-name{font-weight:800;font-size:20px;color:white;margin-bottom:12px;letter-spacing:-.03em;}
.feat-desc{font-size:16px;font-weight:400;color:#9BAFC8;line-height:1.78;}

/* HOW */
.how-section{display:grid;grid-template-columns:360px 1fr;border-bottom:1px solid rgba(109,181,241,0.14);}
.how-sidebar{border-right:1px solid rgba(109,181,241,0.14);padding:88px 56px;background:#162035;display:flex;flex-direction:column;justify-content:space-between;}
.how-content{padding:88px 56px;background:#111D30;}
.how-step{display:grid;grid-template-columns:60px 1fr;border-bottom:1px solid rgba(109,181,241,0.14);padding:30px 0;gap:22px;transition:all .3s;}
.how-step:last-child{border-bottom:none;}
.how-step:hover{padding-left:10px;}
.how-num{font-family:var(--font-mono);font-size:10px;letter-spacing:.15em;color:#2D96E8;background:#1278CC14;border:1px solid #1278CC30;border-radius:99px;padding:5px 11px;display:inline-flex;align-items:center;justify-content:center;height:fit-content;margin-top:3px;}
.how-step-title{font-weight:800;font-size:22px;color:white;margin-bottom:10px;letter-spacing:-0.03em;}
.how-step-body{font-size:17px;font-weight:400;color:#9BAFC8;line-height:1.8;}

/* MANIFESTO */
.manifesto{padding:130px 56px;text-align:center;border-bottom:1px solid rgba(109,181,241,0.14);background:#0D1525;position:relative;overflow:hidden;}
.manifesto-bg{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 60% at 50% 50%,#1278CC09 0%,transparent 70%);}
.manifesto-text{font-family:var(--font-display);font-size:clamp(32px,5vw,64px);line-height:1.2;letter-spacing:-.025em;color:white;max-width:860px;margin:24px auto 56px;position:relative;z-index:1;}
.manifesto-text .highlight{background:linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

/* LOADING */
.loading-page{min-height:100vh;padding-top:72px;display:flex;align-items:center;justify-content:center;flex-direction:column;background:linear-gradient(160deg,#080E1E 0%,#0D1A2E 50%,#101524 100%);position:relative;overflow:hidden;}
.loading-inner{position:relative;z-index:2;width:100%;max-width:800px;padding:0 32px;display:flex;flex-direction:column;align-items:center;}
.loading-spinner-wrap{position:relative;width:130px;height:130px;margin-bottom:48px;}
.spin-track{fill:none;stroke:#05295A;stroke-width:3;}
.spin-arc{fill:none;stroke-width:3;stroke-linecap:round;stroke-dasharray:28 320;transform-origin:65px 65px;}
.spin-arc-1{animation:spin1 1.8s linear infinite;}
.spin-arc-2{animation:spin2 1.8s linear infinite;animation-delay:-.6s;opacity:.55;}
@keyframes spin1{to{transform:rotate(360deg);}}
@keyframes spin2{to{transform:rotate(-360deg);}}
.loading-title{font-family:var(--font-ui);font-size:clamp(38px,6vw,68px);font-weight:800;letter-spacing:-.04em;color:white;text-align:center;margin-bottom:12px;}
.loading-file{font-family:var(--font-mono);font-size:13px;letter-spacing:.1em;color:#2D96E8;background:#1278CC14;border:1px solid #1278CC30;padding:8px 20px;border-radius:99px;margin-bottom:52px;}
.terminal-card{width:100%;background:#080E1E;border:1px solid rgba(109,181,241,0.14);border-radius:22px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.6);}
.terminal-hdr{display:flex;align-items:center;gap:8px;padding:14px 20px;background:#141C30;border-bottom:1px solid rgba(109,181,241,0.14);}
.t-dot{width:12px;height:12px;border-radius:50%;}
.terminal-title{font-family:var(--font-mono);font-size:12px;letter-spacing:.1em;color:#7A8BAA;margin-left:10px;}
.terminal-body{padding:24px;font-family:var(--font-mono);font-size:13px;line-height:2.1;}
.t-line{display:flex;align-items:center;gap:12px;}
.t-prompt{color:#0FA896;}
.t-text-pending{color:#1E2840;}
.t-text-active{background:linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.t-text-done{color:#094480;}
.t-check{color:#0FA896;}
.t-cursor{display:inline-block;width:8px;height:18px;background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);margin-left:4px;border-radius:2px;animation:blink 1s step-end infinite;}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
.progress-bar-wrap{width:100%;height:3px;background:#080E1E;border-radius:99px;overflow:hidden;margin-top:24px;}
.progress-bar-fill{height:100%;background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);border-radius:99px;transition:width .8s cubic-bezier(.16,1,.3,1);}
.progress-label{font-family:var(--font-mono);font-size:11px;letter-spacing:.15em;color:#7A8BAA;margin-top:10px;text-align:center;}

/* ANALYSIS PAGE */
.analysis-page{min-height:100vh;padding-top:72px;background:#0D1525;}
.analysis-hero{padding:56px;background:linear-gradient(160deg,#080E1E 0%,#0D1A2E 50%,#101524 100%);border-bottom:1px solid rgba(109,181,241,0.14);display:flex;align-items:flex-end;justify-content:space-between;gap:32px;flex-wrap:wrap;position:relative;overflow:hidden;}
.analysis-breadcrumb{font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#2D96E8;cursor:pointer;margin-bottom:20px;transition:color .25s;display:flex;align-items:center;gap:8px;position:relative;z-index:1;}
.analysis-breadcrumb:hover{color:#22C4A4;}
.analysis-title{font-family:var(--font-display);font-size:clamp(48px,8vw,100px);line-height:.9;letter-spacing:-.035em;color:white;position:relative;z-index:1;}
.analysis-title em{font-style:italic;background:linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.analysis-file{font-family:var(--font-mono);font-size:12px;letter-spacing:.1em;color:#7A8BAA;margin-top:18px;position:relative;z-index:1;}
.analysis-file span{color:#2D96E8;}
.analysis-hero-actions{display:flex;gap:14px;align-items:center;flex-wrap:wrap;}

/* SCORE OVERVIEW */
.score-overview{padding:56px;background:#111D30;border-bottom:1px solid rgba(109,181,241,0.14);display:grid;grid-template-columns:240px 1fr;gap:72px;align-items:center;}
.score-ring-wrap{position:relative;width:220px;height:220px;}
.score-ring-wrap svg{width:100%;height:100%;transform:rotate(-90deg);}
.score-ring-track{fill:none;stroke:#1E2840;stroke-width:14;}
.score-ring-fill{fill:none;stroke-width:14;stroke-linecap:round;transition:stroke-dashoffset 2s cubic-bezier(.16,1,.3,1);}
.score-num-wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.score-big{font-family:var(--font-ui);font-size:74px;font-weight:900;line-height:1;color:white;letter-spacing:-0.04em;}
.score-lbl{font-family:var(--font-mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#7A8BAA;margin-top:6px;}
.score-verdict{font-family:var(--font-ui);font-size:clamp(28px,4vw,48px);font-weight:900;line-height:1.08;letter-spacing:-.04em;color:white;margin-bottom:16px;}
.score-summary{font-size:19px;font-weight:400;line-height:1.85;color:#9BAFC8;max-width:580px;}
.score-explanation{font-size:16px;font-weight:400;line-height:1.75;color:#7A8BAA;margin-top:18px;max-width:580px;font-style:italic;border-left:3px solid #1278CC35;padding-left:16px;}

/* SENIORITY BANNER */
.seniority-banner{padding:36px 56px;background:#162035;border-bottom:1px solid rgba(109,181,241,0.14);display:flex;align-items:center;gap:48px;flex-wrap:wrap;}
.seniority-badge{font-family:var(--font-ui);font-size:32px;font-weight:900;letter-spacing:-0.04em;color:white;padding:12px 28px;border-radius:16px;border:2px solid;display:inline-block;}
.seniority-fresher{border-color:#0FA89645;color:#22C4A4;background:#0FA89612;}
.seniority-junior{border-color:#1278CC45;color:#6DB5F1;background:#1278CC12;}
.seniority-mid{border-color:#4857D845;color:#9BA5F3;background:#4857D812;}
.seniority-senior{border-color:#FFB84045;color:#FFD080;background:#FFB84012;}
.seniority-lead{border-color:#FF6B6B45;color:#FF9999;background:#FF6B6B12;}
.seniority-detail{flex:1;min-width:220px;}
.seniority-title{font-weight:800;font-size:20px;color:white;margin-bottom:8px;letter-spacing:-0.02em;}
.seniority-note{font-size:15px;color:#9BAFC8;line-height:1.7;}
.seniority-bars{display:flex;gap:16px;margin-top:16px;flex-wrap:wrap;}
.seniority-mini-bar{display:flex;flex-direction:column;gap:5px;min-width:120px;}
.seniority-mini-label{font-family:var(--font-mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8BAA;}
.seniority-mini-track{height:6px;background:#1E2840;border-radius:99px;overflow:hidden;}
.seniority-mini-fill{height:100%;background:linear-gradient(90deg,#22C4A4,#2D96E8);border-radius:99px;transition:width 1.4s cubic-bezier(.16,1,.3,1);}

/* SCORE BARS */
.score-bars-section{background:#0D1525;border-bottom:1px solid rgba(109,181,241,0.14);padding:52px 56px;}
.bars-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:8px;}
.bar-row{margin-bottom:22px;}
.bar-label-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
.bar-label{font-size:16px;font-weight:700;color:#fff;letter-spacing:-0.02em;}
.bar-note{font-size:12px;color:#7A8BAA;margin-top:4px;font-family:var(--font-mono);letter-spacing:.04em;}
.bar-val{font-family:var(--font-ui);font-size:20px;font-weight:900;letter-spacing:-0.03em;color:white;}
.bar-track{width:100%;height:18px;background:#1E2840;border-radius:99px;position:relative;overflow:hidden;cursor:pointer;transition:transform 0.2s;}
.bar-track:hover{transform:scaleY(1.18);}
.bar-fill{position:absolute;left:0;top:0;bottom:0;border-radius:99px;transition:width 1.6s cubic-bezier(.16,1,.3,1);display:flex;align-items:center;justify-content:flex-end;padding-right:10px;}
.bar-fill-inner{font-size:10px;font-weight:700;color:rgba(255,255,255,0.85);white-space:nowrap;}
.bar-sublabel{font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;color:#7A8BAA;margin-top:5px;text-transform:uppercase;}
.bar-wrap{position:relative;}

/* HIRING */
.hiring-section{padding:56px;background:#111D30;border-bottom:1px solid rgba(109,181,241,0.14);display:grid;grid-template-columns:auto 1fr auto;gap:60px;align-items:center;}
.hiring-pct{font-family:var(--font-ui);font-size:110px;font-weight:900;line-height:1;letter-spacing:-0.05em;background:linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.hiring-pct sup{font-size:44px;}
.hiring-meter-label{font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7A8BAA;margin-bottom:14px;display:flex;justify-content:space-between;}
.hiring-track{height:14px;background:#1E2840;border-radius:99px;overflow:hidden;}
.hiring-fill{height:100%;background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);border-radius:99px;transition:width 2s cubic-bezier(.16,1,.3,1);}
.hiring-title{font-weight:900;font-size:26px;color:white;margin-bottom:12px;letter-spacing:-0.03em;}
.hiring-detail{font-size:17px;font-weight:400;color:#9BAFC8;line-height:1.75;}

/* 2-COL */
.analysis-2col{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid rgba(109,181,241,0.14);}
.analysis-col{padding:52px 56px;border-right:1px solid rgba(109,181,241,0.14);background:#162035;}
.analysis-col:last-child{border-right:none;background:#0D1525;}

/* FEEDBACK */
.feedback-item{border:1px solid rgba(109,181,241,0.14);padding:20px 22px;margin-bottom:12px;display:flex;align-items:flex-start;gap:14px;border-radius:16px;background:rgba(255,255,255,0.06);transition:all .3s;cursor:pointer;}
.feedback-item:hover{border-color:#1278CC40;background:#1278CC08;transform:translateX(6px);}
.f-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:10px;}
.f-title{font-weight:800;font-size:16px;color:white;margin-bottom:6px;letter-spacing:-0.02em;}
.f-body{font-size:14px;font-weight:400;color:#9BAFC8;line-height:1.72;}
.f-toggle{font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#2D96E8;margin-top:8px;cursor:pointer;}
.f-detail-extra{overflow:hidden;max-height:0;transition:max-height .3s ease;}
.f-detail-extra.open{max-height:300px;}
.severity-badge{font-family:var(--font-mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:3px 10px;border-radius:99px;border:1px solid;margin-left:8px;vertical-align:middle;}
.sev-critical{border-color:#FF6B6B60;color:#FF9999;background:#FF6B6B12;}
.sev-high{border-color:#FFB84060;color:#FFD080;background:#FFB84012;}
.sev-medium{border-color:#1278CC45;color:#6DB5F1;background:#1278CC12;}

/* KEYWORDS */
.keywords-section{background:#111D30;border-bottom:1px solid rgba(109,181,241,0.14);display:grid;grid-template-columns:1fr 1fr;}
.keywords-col{padding:52px 56px;border-right:1px solid rgba(109,181,241,0.14);}
.keywords-col:last-child{border-right:none;}
.tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;}
.tag{font-family:var(--font-ui);font-size:13px;font-weight:600;padding:8px 16px;border-radius:99px;border:1.5px solid;transition:all .25s;cursor:pointer;letter-spacing:-0.01em;}
.tag:hover{transform:translateY(-2px) scale(1.05);}
.tag-present{border-color:#0FA89645;color:#22C4A4;background:#0FA89612;}
.tag-present:hover{background:#0FA89222;border-color:#0FA896;}
.tag-missing{border-color:rgba(109,181,241,0.14);color:#7A8BAA;background:rgba(255,255,255,0.06);}
.tag-missing:hover{color:#9BAFC8;border-color:rgba(109,181,241,0.3);}
.tag-critical{border-color:#4857D845;color:#6B7AEA;background:#4857D812;}
.tag-critical:hover{background:#4857D822;border-color:#4857D8;}
.tag-role{border-color:#1278CC45;color:#6DB5F1;background:#1278CC12;}
.tag-role:hover{background:#1278CC22;border-color:#1278CC;}
.keyword-sublabel{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7A8BAA;margin-bottom:10px;margin-top:20px;}

/* ATS */
.ats-section{padding:52px 56px;background:#162035;border-bottom:1px solid rgba(109,181,241,0.14);}
.ats-issue{border-left:4px solid #4857D850;padding:18px 22px;margin-bottom:12px;background:#4857D808;border-radius:0 14px 14px 0;transition:all .25s;cursor:pointer;}
.ats-issue:hover{border-left-color:#4857D8;background:#4857D812;}
.ats-issue-title{font-weight:800;font-size:16px;color:#6B7AEA;margin-bottom:6px;letter-spacing:-0.02em;}
.ats-issue-fix{font-size:14px;font-weight:400;color:#9BAFC8;line-height:1.65;}

/* BULLET ANALYSIS */
.bullet-section{padding:52px 56px;background:#0D1525;border-bottom:1px solid rgba(109,181,241,0.14);}
.bullet-stats{display:flex;gap:32px;margin-bottom:32px;flex-wrap:wrap;}
.bullet-stat{text-align:center;padding:20px 28px;border-radius:16px;border:1px solid rgba(109,181,241,0.14);background:#162035;flex:1;min-width:100px;}
.bullet-stat-num{font-family:var(--font-display);font-size:40px;line-height:1;margin-bottom:6px;}
.bullet-stat-label{font-family:var(--font-mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#7A8BAA;}
.rewrite-card{border:1px solid rgba(109,181,241,0.14);border-radius:16px;overflow:hidden;margin-bottom:14px;background:#162035;}
.rewrite-original{padding:16px 20px;background:#1E2840;font-size:14px;color:#7A8BAA;border-bottom:1px solid rgba(109,181,241,0.14);}
.rewrite-original::before{content:"BEFORE  ";font-family:var(--font-mono);font-size:9px;letter-spacing:.14em;color:#4857D8;margin-right:8px;}
.rewrite-improved{padding:16px 20px;font-size:14px;color:#22C4A4;line-height:1.65;}
.rewrite-improved::before{content:"AFTER  ";font-family:var(--font-mono);font-size:9px;letter-spacing:.14em;color:#0FA896;margin-right:8px;}

/* RISK FLAGS */
.risk-section{padding:52px 56px;background:#162035;border-bottom:1px solid rgba(109,181,241,0.14);}
.risk-item{padding:16px 20px;margin-bottom:10px;border-radius:14px;border:1px solid;display:flex;align-items:flex-start;gap:14px;transition:all .25s;}
.risk-high{border-color:#FF6B6B30;background:#FF6B6B08;}
.risk-high:hover{background:#FF6B6B14;}
.risk-medium{border-color:#FFB84030;background:#FFB84008;}
.risk-medium:hover{background:#FFB84014;}
.risk-low{border-color:rgba(109,181,241,0.14);background:rgba(255,255,255,0.03);}
.risk-icon{font-size:18px;flex-shrink:0;margin-top:2px;}
.risk-flag{font-weight:800;font-size:15px;color:white;margin-bottom:4px;letter-spacing:-0.02em;}
.risk-detail{font-size:13px;color:#9BAFC8;line-height:1.65;}

/* AI DETECTION */
.ai-detection-section{padding:52px 56px;background:#111D30;border-bottom:1px solid rgba(109,181,241,0.14);}
.ai-score-row{display:flex;align-items:center;gap:32px;margin-bottom:28px;flex-wrap:wrap;}
.ai-score-big{font-family:var(--font-display);font-size:72px;line-height:1;background:linear-gradient(90deg,#6B7AEA,#4857D8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.ai-score-label{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#7A8BAA;margin-top:6px;}
.ai-detail-col{flex:1;}
.ai-buzzword-badge{font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:6px 16px;border-radius:99px;border:1.5px solid;display:inline-block;margin-bottom:12px;}
.buzz-low{border-color:#0FA89645;color:#22C4A4;background:#0FA89612;}
.buzz-medium{border-color:#FFB84045;color:#FFD080;background:#FFB84012;}
.buzz-high{border-color:#FF6B6B45;color:#FF9999;background:#FF6B6B12;}

/* RECRUITER PERSONAS */
.personas-section{padding:52px 56px;background:#0D1525;border-bottom:1px solid rgba(109,181,241,0.14);}
.personas-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:8px;}
.persona-card{border:1px solid rgba(109,181,241,0.14);padding:28px;border-radius:20px;background:#162035;transition:all .3s;}
.persona-card:hover{border-color:#1278CC45;transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.4);}
.persona-header{display:flex;align-items:center;gap:14px;margin-bottom:16px;}
.persona-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.persona-name{font-weight:800;font-size:18px;color:white;letter-spacing:-0.02em;}
.persona-verdict{font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#2D96E8;margin-top:3px;}
.persona-pass-track{height:8px;background:#1E2840;border-radius:99px;overflow:hidden;margin:12px 0;}
.persona-pass-fill{height:100%;background:linear-gradient(90deg,#22C4A4,#2D96E8);border-radius:99px;transition:width 1.6s cubic-bezier(.16,1,.3,1);}
.persona-note{font-size:14px;color:#9BAFC8;line-height:1.65;}

/* SALARY INTELLIGENCE */
.salary-section{padding:52px 56px;background:#162035;border-bottom:1px solid rgba(109,181,241,0.14);display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
.salary-range{font-family:var(--font-display);font-size:clamp(28px,4vw,52px);line-height:1.1;color:white;margin-bottom:12px;}
.salary-position{display:inline-block;font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;padding:6px 16px;border-radius:99px;border:1.5px solid;margin-bottom:18px;}
.sal-below{border-color:#FF6B6B45;color:#FF9999;background:#FF6B6B12;}
.sal-at{border-color:#FFB84045;color:#FFD080;background:#FFB84012;}
.sal-above{border-color:#0FA89645;color:#22C4A4;background:#0FA89612;}
.salary-tip{font-size:15px;color:#9BAFC8;line-height:1.7;padding:16px 20px;border-left:3px solid #1278CC45;background:#1278CC08;border-radius:0 12px 12px 0;}

/* SKILL GAP */
.skill-gap-section{padding:52px 56px;background:#111D30;border-bottom:1px solid rgba(109,181,241,0.14);}
.skill-gap-item{border:1px solid rgba(109,181,241,0.14);padding:22px 24px;border-radius:16px;background:#162035;margin-bottom:14px;transition:all .3s;}
.skill-gap-item:hover{border-color:#1278CC45;background:#1278CC08;transform:translateX(6px);}
.sg-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;}
.sg-skill{font-weight:800;font-size:18px;color:white;letter-spacing:-0.02em;}
.sg-salary{font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;color:#22C4A4;background:#0FA89612;border:1px solid #0FA89630;padding:4px 12px;border-radius:99px;flex-shrink:0;}
.sg-importance-track{height:6px;background:#1E2840;border-radius:99px;overflow:hidden;margin:8px 0;}
.sg-importance-fill{height:100%;background:linear-gradient(90deg,#4857D8,#1278CC);border-radius:99px;transition:width 1.4s cubic-bezier(.16,1,.3,1);}
.sg-why{font-size:14px;color:#9BAFC8;line-height:1.65;}

/* PROJECTS */
.projects-section{padding:56px;border-bottom:1px solid rgba(109,181,241,0.14);background:#0D1525;}
.project-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px;}
.project-card{border:1px solid rgba(109,181,241,0.14);padding:28px;border-radius:20px;background:#162035;transition:all .35s cubic-bezier(.16,1,.3,1);cursor:pointer;}
.project-card:hover{border-color:#1278CC45;background:#1278CC08;transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,.4);}
.project-header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px;}
.project-name{font-weight:800;font-size:20px;color:white;letter-spacing:-0.03em;}
.project-badge{font-family:var(--font-mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;padding:5px 12px;border-radius:99px;border:1.5px solid;flex-shrink:0;font-weight:600;}
.badge-high{border-color:#0FA89645;color:#22C4A4;background:#0FA89612;}
.badge-medium{border-color:#1278CC45;color:#6DB5F1;background:#1278CC12;}
.project-desc{font-size:15px;font-weight:400;color:#9BAFC8;line-height:1.72;margin-bottom:10px;}
.project-why{font-size:13px;color:#6B7AEA;font-style:italic;margin-bottom:14px;padding-left:12px;border-left:2px solid #4857D840;}
.stack{display:flex;flex-wrap:wrap;gap:8px;}
.stack-tag{font-family:var(--font-mono);font-size:11px;font-weight:500;padding:5px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(109,181,241,0.14);color:#7A8BAA;border-radius:10px;transition:all .2s;}
.stack-tag:hover{background:#1278CC12;color:#6DB5F1;border-color:#1278CC30;}

/* ROADMAP */
.roadmap-grid{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid rgba(109,181,241,0.14);}
.roadmap-col{padding:52px 56px;border-right:1px solid rgba(109,181,241,0.14);background:#162035;}
.roadmap-col:last-child{border-right:none;background:#111D30;}
.roadmap-heading{font-family:var(--font-ui);font-size:48px;font-weight:900;color:white;margin-bottom:6px;letter-spacing:-0.04em;}
.roadmap-sub{font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7A8BAA;margin-bottom:30px;}
.roadmap-item{display:flex;gap:16px;margin-bottom:22px;align-items:flex-start;padding-bottom:22px;border-bottom:1px solid rgba(109,181,241,0.14);transition:all .25s;cursor:pointer;}
.roadmap-item:last-child{border-bottom:none;}
.roadmap-item:hover{padding-left:8px;}
.roadmap-week{font-family:var(--font-mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);color:white;padding:6px 12px;border-radius:99px;flex-shrink:0;margin-top:3px;white-space:nowrap;font-weight:600;}
.roadmap-task{font-weight:800;font-size:17px;color:white;margin-bottom:6px;letter-spacing:-0.02em;}
.roadmap-detail{font-size:14px;font-weight:400;color:#9BAFC8;line-height:1.65;}
.priority-chip{font-family:var(--font-mono);font-size:8px;letter-spacing:.14em;text-transform:uppercase;padding:2px 8px;border-radius:99px;border:1px solid;margin-left:8px;vertical-align:middle;}
.prio-critical{border-color:#FF6B6B45;color:#FF9999;background:#FF6B6B12;}
.prio-high{border-color:#FFB84045;color:#FFD080;background:#FFB84012;}
.prio-medium{border-color:#1278CC45;color:#6DB5F1;background:#1278CC12;}

/* CERTIFICATIONS */
.cert-section{padding:52px 56px;background:#0D1525;border-bottom:1px solid rgba(109,181,241,0.14);}
.cert-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:8px;}
.cert-card{border:1px solid rgba(109,181,241,0.14);padding:22px 24px;border-radius:16px;background:#162035;transition:all .3s;}
.cert-card:hover{border-color:#1278CC45;background:#1278CC08;}
.cert-name{font-weight:800;font-size:17px;color:white;margin-bottom:4px;letter-spacing:-0.02em;}
.cert-provider{font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;color:#2D96E8;text-transform:uppercase;margin-bottom:10px;}
.cert-urgency{font-family:var(--font-mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:99px;border:1px solid;display:inline-block;margin-bottom:10px;}
.cert-immediate{border-color:#FF6B6B45;color:#FF9999;background:#FF6B6B12;}
.cert-3m{border-color:#FFB84045;color:#FFD080;background:#FFB84012;}
.cert-6m{border-color:#0FA89645;color:#22C4A4;background:#0FA89612;}
.cert-impact{font-size:13px;color:#9BAFC8;line-height:1.6;}

/* INTERVIEW QUESTIONS */
.interview-section{padding:52px 56px;background:#162035;border-bottom:1px solid rgba(109,181,241,0.14);}
.interview-tabs{display:flex;gap:8px;margin-bottom:28px;flex-wrap:wrap;}
.interview-tab{font-family:var(--font-ui);font-size:13px;font-weight:600;padding:7px 18px;border-radius:99px;border:1.5px solid rgba(109,181,241,0.2);color:#7A8BAA;background:transparent;cursor:pointer;transition:all .2s;}
.interview-tab.active{background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);color:white;border-color:transparent;}
.interview-tab:hover:not(.active){border-color:#1278CC50;color:#9BAFC8;}
.question-item{padding:16px 20px;margin-bottom:10px;border-radius:14px;border:1px solid rgba(109,181,241,0.14);background:rgba(255,255,255,0.04);display:flex;gap:14px;align-items:flex-start;transition:all .25s;cursor:pointer;}
.question-item:hover{border-color:#1278CC40;background:#1278CC08;transform:translateX(5px);}
.q-num{font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;color:#2D96E8;background:#1278CC14;border:1px solid #1278CC30;padding:4px 10px;border-radius:99px;flex-shrink:0;margin-top:2px;}
.q-text{font-size:15px;color:#9BAFC8;line-height:1.65;}

/* 6-SEC SCAN */
.scan-section{padding:52px 56px;background:#111D30;border-bottom:1px solid rgba(109,181,241,0.14);}
.scan-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:8px;}
.scan-score-box{padding:32px;border-radius:20px;border:1px solid rgba(109,181,241,0.14);background:#162035;text-align:center;}
.scan-score-num{font-family:var(--font-display);font-size:64px;line-height:1;margin-bottom:8px;}
.scan-score-lbl{font-family:var(--font-mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#7A8BAA;}
.missed-item{padding:12px 16px;border-left:3px solid #1278CC50;margin-bottom:10px;font-size:14px;color:#9BAFC8;background:#1278CC08;border-radius:0 10px 10px 0;}

/* BENCHMARK */
.benchmark-section{padding:52px 56px;background:#0D1525;border-bottom:1px solid rgba(109,181,241,0.14);}
.benchmark-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:8px;}
.benchmark-card{padding:28px;border-radius:18px;border:1px solid rgba(109,181,241,0.14);background:#162035;text-align:center;transition:all .3s;}
.benchmark-card:hover{border-color:#1278CC45;transform:translateY(-4px);}
.bm-num{font-family:var(--font-display);font-size:52px;line-height:1;background:linear-gradient(90deg,#22C4A4,#2D96E8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px;}
.bm-label{font-family:var(--font-mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#7A8BAA;margin-bottom:12px;}
.bm-verdict{font-size:14px;font-weight:700;color:white;}

/* APPLICATION SUCCESS */
.app-success-section{padding:52px 56px;background:#162035;border-bottom:1px solid rgba(109,181,241,0.14);}
.app-success-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:8px;}
.app-stat{padding:28px 24px;border-radius:18px;border:1px solid rgba(109,181,241,0.14);background:#0D1525;text-align:center;transition:all .3s;}
.app-stat:hover{border-color:#1278CC45;background:#1278CC08;}
.app-stat-num{font-family:var(--font-display);font-size:52px;line-height:1;margin-bottom:8px;}
.app-stat-label{font-family:var(--font-mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#7A8BAA;margin-bottom:8px;}
.app-stat-note{font-size:12px;color:#9BAFC8;line-height:1.5;}

/* TIPS */
.tips-section{padding:52px 56px;background:#111D30;border-bottom:1px solid rgba(109,181,241,0.14);display:grid;grid-template-columns:1fr 1fr;gap:48px;}
.tip-item{display:flex;gap:14px;align-items:flex-start;margin-bottom:14px;padding:14px 18px;border-radius:14px;border:1px solid rgba(109,181,241,0.14);background:rgba(255,255,255,0.04);transition:all .25s;}
.tip-item:hover{border-color:#1278CC40;background:#1278CC08;}
.tip-icon{font-size:18px;flex-shrink:0;}
.tip-text{font-size:14px;color:#9BAFC8;line-height:1.65;}

/* TARGET / RECRUITER */
.target-section{padding:56px;background:#0D1525;border-bottom:1px solid rgba(109,181,241,0.14);display:grid;grid-template-columns:1fr 1fr;gap:40px;}
.recruiter-section{padding:56px;background:#162035;border-bottom:1px solid rgba(109,181,241,0.14);position:relative;overflow:hidden;}
.recruiter-quote{font-style:italic;font-size:clamp(22px,3vw,38px);line-height:1.45;color:white;max-width:800px;padding-left:32px;border-left:4px solid #1278CC60;position:relative;z-index:1;font-family:var(--font-display);font-weight:400;}
.recruiter-attr{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#7A8BAA;margin-top:22px;padding-left:32px;}

/* SCORE TABS */
.score-tabs{display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;}
.score-tab{font-family:var(--font-ui);font-size:13px;font-weight:600;padding:7px 18px;border-radius:99px;border:1.5px solid rgba(109,181,241,0.2);color:#7A8BAA;background:transparent;cursor:pointer;transition:all .2s;}
.score-tab.active{background:linear-gradient(135deg,#0FA896,#1278CC,#4857D8);color:white;border-color:transparent;}
.score-tab:hover:not(.active){border-color:#1278CC50;color:#9BAFC8;}

/* IMPACT ANALYSIS */
.impact-section{padding:52px 56px;background:#0D1525;border-bottom:1px solid rgba(109,181,241,0.14);}
.impact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:28px;}
.impact-stat{padding:24px;border-radius:16px;border:1px solid rgba(109,181,241,0.14);background:#162035;text-align:center;}
.impact-stat-num{font-family:var(--font-display);font-size:44px;line-height:1;background:linear-gradient(90deg,#22C4A4,#2D96E8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:6px;}
.impact-stat-label{font-family:var(--font-mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#7A8BAA;}
.signal-list{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;}
.signal-tag{font-size:13px;font-weight:600;padding:7px 15px;border-radius:99px;border:1px solid #0FA89640;color:#22C4A4;background:#0FA89610;}

/* PROJECT QUALITY */
.pq-section{padding:52px 56px;background:#162035;border-bottom:1px solid rgba(109,181,241,0.14);}
.pq-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:24px;}
.pq-stat{padding:22px;border-radius:14px;border:1px solid rgba(109,181,241,0.14);background:#0D1525;text-align:center;}
.pq-num{font-family:var(--font-display);font-size:40px;line-height:1;margin-bottom:6px;}
.pq-label{font-family:var(--font-mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#7A8BAA;}
.pq-flag{padding:10px 16px;margin-bottom:8px;border-radius:10px;font-size:13px;color:#FFD080;background:#FFB84008;border:1px solid #FFB84030;}
.pq-flag::before{content:"⚠ ";}

/* FOOTER */
.footer{background:#080E1E;border-top:1px solid rgba(109,181,241,0.14);}
.footer-top{display:grid;grid-template-columns:1.2fr 1fr 1fr;border-bottom:1px solid rgba(255,255,255,.06);}
.footer-col{padding:52px 56px;border-right:1px solid rgba(255,255,255,.06);}
.footer-col:last-child{border-right:none;}
.footer-brand{font-weight:900;font-size:22px;color:white;margin-bottom:14px;letter-spacing:-0.03em;}
.footer-brand span{background:linear-gradient(90deg,#22C4A4,#2D96E8,#6B7AEA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.footer-tagline{font-size:14px;font-weight:400;color:rgba(255,255,255,.4);line-height:1.8;}
.footer-pow{font-family:var(--font-mono);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#22C4A4;margin-top:28px;display:flex;align-items:center;gap:10px;}
.footer-heading{font-family:var(--font-mono);font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:22px;}
.footer-links{list-style:none;}
.footer-links li{margin-bottom:14px;}
.footer-links a{font-size:15px;font-weight:400;color:rgba(255,255,255,.6);text-decoration:none;transition:color .2s;}
.footer-links a:hover{color:#22C4A4;}
.footer-bottom{padding:20px 56px;display:flex;justify-content:space-between;align-items:center;}
.footer-copy{font-family:var(--font-mono);font-size:10px;color:rgba(255,255,255,.25);}

/* ERROR */
.error-page{min-height:100vh;padding-top:72px;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#080E1E 0%,#0D1A2E 50%,#101524 100%);}
.error-card{max-width:540px;padding:48px;border-radius:24px;border:1px solid #4857D835;background:#162035;box-shadow:0 0 60px #4857D815;}
.error-title{font-weight:900;font-size:30px;color:#6B7AEA;margin-bottom:14px;letter-spacing:-0.03em;}
.error-body{font-size:16px;font-weight:400;color:#9BAFC8;line-height:1.75;margin-bottom:30px;}

/* TOAST */
.toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#162035;color:white;font-size:14px;font-weight:600;padding:15px 30px;border-radius:99px;border:1px solid rgba(109,181,241,0.14);opacity:0;pointer-events:none;z-index:9999;transition:opacity .3s;box-shadow:0 8px 40px rgba(0,0,0,.4);white-space:nowrap;}
.toast.visible{opacity:1;}

.reveal{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s ease;}
.reveal.visible{opacity:1;transform:translateY(0);}

@media(max-width:960px){
  .feat-grid,.personas-grid,.cert-grid,.app-success-grid,.benchmark-grid,.impact-grid,.pq-grid{grid-template-columns:1fr 1fr;}
  .bars-grid,.score-overview,.analysis-2col,.hiring-section,.roadmap-grid,.target-section,.footer-top,.how-section,.upload-section,.project-grid,.keywords-section,.salary-section,.tips-section,.scan-grid{grid-template-columns:1fr;}
  .keywords-col,.analysis-col,.roadmap-col,.footer-col{border-right:none;border-bottom:1px solid rgba(109,181,241,0.14);}
  .how-sidebar{border-right:none;border-bottom:1px solid rgba(109,181,241,0.14);}
  .hiring-section{display:flex;flex-direction:column;gap:28px;}
  .nav-links{display:none;}
  .nav{padding:0 20px;}
  .hero-inner,.analysis-hero,.recruiter-section,.target-section,.manifesto,.upload-section,.projects-section,.ats-section,.score-bars-section,.keywords-section,.bullet-section,.risk-section,.ai-detection-section,.personas-section,.salary-section,.skill-gap-section,.cert-section,.interview-section,.scan-section,.benchmark-section,.app-success-section,.tips-section,.impact-section,.pq-section,.seniority-banner{padding:36px 20px;}
  .analysis-col,.roadmap-col,.footer-col,.how-content,.how-sidebar,.score-overview,.hiring-section,.keywords-col{padding:30px 20px;}
  .features{padding:70px 20px;}
  .analysis-hero-actions{margin-top:16px;}
  .personas-grid,.cert-grid,.benchmark-grid,.app-success-grid{grid-template-columns:1fr;}
}
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function scoreGrad(n: number) {
  if (n >= 75) return "linear-gradient(90deg,#22C4A4,#0C8A7C)";
  if (n >= 50) return "linear-gradient(90deg,#2D96E8,#0D5DA6)";
  return "linear-gradient(90deg,#6B7AEA,#3440B8)";
}
function scoreStroke(n: number) {
  if (n >= 75) return "#0FA896";
  if (n >= 50) return "#1278CC";
  return "#4857D8";
}
function scoreLabel(n: number) {
  if (n >= 85) return "Excellent";
  if (n >= 70) return "Good";
  if (n >= 50) return "Average";
  if (n >= 30) return "Needs Work";
  return "Poor";
}
function seniorityClass(level: string) {
  const l = (level || "").toLowerCase();
  if (l.includes("fresher")) return "seniority-fresher";
  if (l.includes("junior")) return "seniority-junior";
  if (l.includes("mid")) return "seniority-mid";
  if (l.includes("senior")) return "seniority-senior";
  if (l.includes("lead") || l.includes("staff")) return "seniority-lead";
  return "seniority-junior";
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Navbar({ onCta, onHome }: { onCta: () => void; onHome: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={onHome} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && onHome()}>
        <div className="nav-logo-mark">IV</div>
        <div className="nav-logo-text">Indis<span>Valley</span> AI</div>
        <span className="nav-chip">Beta</span>
      </div>
      <ul className="nav-links">
        {["features", "how-it-works", "about", "upload"].map(id => (
          <li key={id}><a href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>{id === "how-it-works" ? "How It Works" : id.charAt(0).toUpperCase() + id.slice(1)}</a></li>
        ))}
      </ul>
      <button className="nav-cta" onClick={onCta}>Analyze Resume →</button>
    </nav>
  );
}

function ScoreRing({ score, animated }: { score: number; animated: boolean }) {
  const r = 95, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="score-ring-wrap">
      <svg viewBox="0 0 220 220">
        <circle cx="110" cy="110" r={r} className="score-ring-track" />
        <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={scoreStroke(score)} /><stop offset="100%" stopColor="#2D96E8" />
        </linearGradient></defs>
        <circle cx="110" cy="110" r={r} className="score-ring-fill" stroke="url(#scoreGrad)"
          strokeDasharray={circ} strokeDashoffset={animated ? offset : circ} />
      </svg>
      <div className="score-num-wrap">
        <span className="score-big">{animated ? score : "—"}</span>
        <span className="score-lbl">ATS Score</span>
      </div>
    </div>
  );
}

function ChunkyBar({ label, value, note, animated, delay = 0 }: { label: string; value: number; note?: string; animated: boolean; delay?: number }) {
  const grade = scoreLabel(value);
  return (
    <div className="bar-row">
      <div className="bar-label-row">
        <span className="bar-label">{label}</span>
        <span className="bar-val" style={{ background: scoreGrad(value), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{animated ? value : 0}</span>
      </div>
      <div className="bar-wrap">
        <div className="bar-track">
          <div className="bar-fill" style={{ width: animated ? `${value}%` : "0%", background: scoreGrad(value), transitionDelay: `${delay}s` }}>
            {animated && value > 20 && <span className="bar-fill-inner">{grade}</span>}
          </div>
        </div>
      </div>
      {note && <div className="bar-note">{note}</div>}
      <div className="bar-sublabel">out of 100</div>
    </div>
  );
}

function FeedbackItem({ item, dotColor, shadow }: { item: any; dotColor: string; shadow: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="feedback-item" onClick={() => setOpen(o => !o)}>
      <div className="f-dot" style={{ background: dotColor, boxShadow: `0 0 8px ${shadow}` }} />
      <div style={{ flex: 1 }}>
        <div className="f-title">
          {item.title}
          {item.severity && <span className={`severity-badge sev-${(item.severity || "").toLowerCase()}`}>{item.severity}</span>}
        </div>
        <div className="f-body">{(item.detail || "").slice(0, 120)}{(item.detail || "").length > 120 && !open ? "…" : ""}</div>
        {(item.detail || "").length > 120 && (
          <>
            <div className={`f-detail-extra ${open ? "open" : ""}`}>
              <div className="f-body" style={{ paddingTop: 8 }}>{item.detail.slice(120)}</div>
            </div>
            <div className="f-toggle">{open ? "▲ Show less" : "▼ Read more"}</div>
          </>
        )}
      </div>
    </div>
  );
}

function PdfDownloadBtn({ fileName, className = "btn-pdf" }: { fileName: string; className?: string }) {
  return (
    <button id="pdf-download-btn" className={`${className} pdf-hide`} onClick={() => downloadReportAsPDF(fileName)}>
      ⬇ Download PDF Report
    </button>
  );
}

// ── MAIN ANALYSIS PAGE ────────────────────────────────────────────────────────
function AnalysisPage({ result, fileName, onBack, animated }: { result: any; fileName: string; onBack: () => void; animated: boolean }) {
  const [activeScoreTab, setActiveScoreTab] = useState("all");
  const [activeInterviewTab, setActiveInterviewTab] = useState("technical");

  const scoreTabs = ["all", "keywords", "impact", "formatting", "clarity"];
  const half = Math.ceil((result.subScores || []).length / 2);

  const interviewMap: Record<string, any[]> = {
    technical:    result.interviewQuestions?.technical    || [],
    hr:           result.interviewQuestions?.hr           || [],
    resumeBased:  result.interviewQuestions?.resumeBased  || [],
    systemDesign: result.interviewQuestions?.systemDesign || [],
  };

  const buzzClass = (d: string) => {
    if (d === "High") return "buzz-high";
    if (d === "Medium") return "buzz-medium";
    return "buzz-low";
  };

  return (
    <div className="analysis-page" id="analysis-report-root">
      {/* ── HERO ── */}
      <div className="analysis-hero">
        <div>
          <div className="analysis-breadcrumb pdf-hide" onClick={onBack} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && onBack()}>
            ← IndisValley AI / Analysis Report
          </div>
          <h1 className="analysis-title">Your resume,<br /><em>decoded.</em></h1>
          <div className="analysis-file">Analyzing: <span>{fileName}</span></div>
        </div>
        <div className="analysis-hero-actions">
          <PdfDownloadBtn fileName={fileName} />
          <button className="btn-ghost pdf-hide" onClick={onBack}>← New Analysis</button>
        </div>
      </div>

      {/* ── SCORE OVERVIEW ── */}
      <div className="score-overview">
        <ScoreRing score={result.overallScore} animated={animated} />
        <div>
          <div className="score-verdict">{result.verdict}</div>
          <p className="score-summary">{result.summary}</p>
          {result.scoreBreakdownExplanation && <p className="score-explanation">{result.scoreBreakdownExplanation}</p>}
        </div>
      </div>

      {/* ── SENIORITY DETECTION ── */}
      {result.seniorityLevel && (
        <div className="seniority-banner">
          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Seniority Detection</div>
            <span className={`seniority-badge ${seniorityClass(result.seniorityLevel)}`}>{result.seniorityLevel}</span>
          </div>
          <div className="seniority-detail">
            <div className="seniority-title">Career Maturity Analysis</div>
            <div className="seniority-note">{result.seniorityNotes}</div>
            <div className="seniority-bars">
              {[
                { label: "Seniority Confidence", val: result.seniorityConfidence },
                { label: "Career Maturity", val: result.careerMaturityScore },
              ].map(b => (
                <div className="seniority-mini-bar" key={b.label}>
                  <div className="seniority-mini-label">{b.label}</div>
                  <div className="seniority-mini-track">
                    <div className="seniority-mini-fill" style={{ width: animated ? `${b.val}%` : "0%" }} />
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#2D96E8", marginTop: 3 }}>{animated ? b.val : 0}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SCORE BARS ── */}
      <div className="score-bars-section">
        <div className="col-heading">Score Breakdown — 12 Dimensions</div>
        <div className="score-tabs pdf-hide">
          {scoreTabs.map(t => (
            <button key={t} className={`score-tab ${activeScoreTab === t ? "active" : ""}`} onClick={() => setActiveScoreTab(t)}>
              {t === "all" ? "All Dimensions" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="bars-grid">
          <div>{(result.subScores || []).slice(0, half).map((s: any, i: number) => (
            <ChunkyBar key={i} label={s.label} value={s.value} note={s.note} animated={animated} delay={i * 0.08} />
          ))}</div>
          <div>{(result.subScores || []).slice(half).map((s: any, i: number) => (
            <ChunkyBar key={i} label={s.label} value={s.value} note={s.note} animated={animated} delay={(i + half) * 0.08} />
          ))}</div>
        </div>
      </div>

      {/* ── HIRING PROBABILITY ── */}
      <div className="hiring-section">
        <div>
          <div className="hiring-pct">{animated ? result.hiringProbability : 0}<sup>%</sup></div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "#7A8BAA", marginTop: 6 }}>Hire Probability</div>
        </div>
        <div style={{ flex: 2, minWidth: 200 }}>
          <div className="hiring-meter-label">
            <span>Recruiter Screen Pass Rate</span>
            <span style={{ color: "#2D96E8", fontWeight: 700 }}>{animated ? result.hiringProbability : 0}%</span>
          </div>
          <div className="hiring-track"><div className="hiring-fill" style={{ width: animated ? `${result.hiringProbability}%` : "0%" }} /></div>
        </div>
        <div style={{ maxWidth: 280 }}>
          <div className="hiring-title">{result.hiringVerdict}</div>
          <div className="hiring-detail">{result.hiringDetail}</div>
        </div>
      </div>

      {/* ── STRENGTHS & GAPS ── */}
      <div className="analysis-2col">
        <div className="analysis-col">
          <div className="col-heading">Strengths</div>
          {(result.strengths || []).map((s: any, i: number) => (
            <FeedbackItem key={i} item={s} dotColor="#0FA896" shadow="#0FA89660" />
          ))}
        </div>
        <div className="analysis-col">
          <div className="col-heading">Critical Gaps</div>
          {(result.gaps || []).map((g: any, i: number) => (
            <FeedbackItem key={i} item={g} dotColor={i === 0 ? "#FF6B6B" : "#4857D8"} shadow={i === 0 ? "#FF6B6B60" : "#4857D860"} />
          ))}
        </div>
      </div>

      {/* ── IMPACT ANALYSIS ── */}
      {result.impactAnalysis && (
        <div className="impact-section">
          <div className="col-heading">Impact & Achievement Analysis</div>
          <div className="impact-grid">
            {[
              { num: result.impactAnalysis.measurableAchievements, label: "Measurable Achievements" },
              { num: result.impactAnalysis.totalAchievements, label: "Total Achievements" },
              { num: `${result.impactAnalysis.totalAchievements > 0 ? Math.round((result.impactAnalysis.measurableAchievements / result.impactAnalysis.totalAchievements) * 100) : 0}%`, label: "Quantification Rate" },
            ].map((s, i) => (
              <div className="impact-stat" key={i}>
                <div className="impact-stat-num">{animated ? s.num : "—"}</div>
                <div className="impact-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          {result.impactAnalysis.leadershipSignals?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div className="keyword-sublabel" style={{ marginTop: 0 }}>Leadership Signals Detected</div>
              <div className="signal-list">{result.impactAnalysis.leadershipSignals.map((s: string, i: number) => <span className="signal-tag" key={i}>{s}</span>)}</div>
            </div>
          )}
          {result.impactAnalysis.missingMetrics?.length > 0 && (
            <div>
              <div className="keyword-sublabel">Areas Missing Metrics</div>
              <div className="tags">{result.impactAnalysis.missingMetrics.map((m: string, i: number) => <span className="tag tag-critical" key={i}>{m}</span>)}</div>
            </div>
          )}
        </div>
      )}

      {/* ── BULLET ANALYSIS ── */}
      {result.bulletAnalysis && (
        <div className="bullet-section">
          <div className="col-heading">Bullet Point Analysis & Rewrites</div>
          <div className="bullet-stats">
            {[
              { num: result.bulletAnalysis.totalBullets, label: "Total Bullets", color: "#2D96E8" },
              { num: result.bulletAnalysis.strongBullets, label: "Strong Bullets", color: "#22C4A4" },
              { num: result.bulletAnalysis.weakBullets, label: "Weak Bullets", color: "#FF9999" },
            ].map((s, i) => (
              <div className="bullet-stat" key={i}>
                <div className="bullet-stat-num" style={{ background: `linear-gradient(90deg,${s.color},#1278CC)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{animated ? s.num : "—"}</div>
                <div className="bullet-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          {(result.bulletAnalysis.rewrites || []).map((rw: any, i: number) => (
            <div className="rewrite-card" key={i}>
              <div className="rewrite-original">{rw.original}</div>
              <div className="rewrite-improved">{rw.improved}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── PROJECT QUALITY ── */}
      {result.projectQuality && (
        <div className="pq-section">
          <div className="col-heading">Project Quality Analysis</div>
          <div className="pq-grid">
            {[
              { num: result.projectQuality.totalProjects, label: "Total Projects", color: "#2D96E8" },
              { num: result.projectQuality.deployedProjectCount, label: "Deployed Projects", color: "#22C4A4" },
              { num: result.projectQuality.tutorialProjectCount, label: "Tutorial Projects", color: "#FF9999" },
            ].map((s, i) => (
              <div className="pq-stat" key={i}>
                <div className="pq-num" style={{ background: `linear-gradient(90deg,${s.color},#1278CC)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{animated ? s.num : "—"}</div>
                <div className="pq-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            {[
              { label: "Complexity Score", val: result.projectQuality.complexityScore },
              { label: "Real-World Relevance", val: result.projectQuality.realWorldRelevance },
              { label: "Architecture Maturity", val: result.projectQuality.architectureMaturity },
            ].map((b, i) => (
              <div className="bar-row" key={i} style={{ marginBottom: 14 }}>
                <div className="bar-label-row">
                  <span className="bar-label" style={{ fontSize: 14 }}>{b.label}</span>
                  <span className="bar-val" style={{ fontSize: 16, background: scoreGrad(b.val), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{animated ? b.val : 0}</span>
                </div>
                <div className="bar-wrap"><div className="bar-track"><div className="bar-fill" style={{ width: animated ? `${b.val}%` : "0%", background: scoreGrad(b.val) }} /></div></div>
              </div>
            ))}
          </div>
          {(result.projectQuality.projectFlags || []).map((f: string, i: number) => <div className="pq-flag" key={i}>{f}</div>)}
        </div>
      )}

      {/* ── RISK FLAGS ── */}
      {(result.riskFlags || []).length > 0 && (
        <div className="risk-section">
          <div className="col-heading">Resume Risk Analysis</div>
          {result.riskFlags.map((r: any, i: number) => (
            <div className={`risk-item risk-${(r.severity || "low").toLowerCase()}`} key={i}>
              <div className="risk-icon">{r.severity === "High" ? "🚨" : r.severity === "Medium" ? "⚠️" : "ℹ️"}</div>
              <div>
                <div className="risk-flag">{r.flag} <span className={`severity-badge sev-${(r.severity || "low").toLowerCase()}`}>{r.severity}</span></div>
                <div className="risk-detail">{r.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── AI CONTENT DETECTION ── */}
      {result.aiContentDetection && (
        <div className="ai-detection-section">
          <div className="col-heading">AI Content Authenticity Check</div>
          <div className="ai-score-row">
            <div style={{ textAlign: "center" }}>
              <div className="ai-score-big">{animated ? result.aiContentDetection.aiWritingScore : "—"}</div>
              <div className="ai-score-label">AI Writing Score</div>
            </div>
            <div className="ai-detail-col">
              <span className={`ai-buzzword-badge ${buzzClass(result.aiContentDetection.buzzwordDensity)}`}>
                Buzzword Density: {result.aiContentDetection.buzzwordDensity}
              </span>
              {result.aiContentDetection.genericPhrases?.length > 0 && (
                <>
                  <div className="keyword-sublabel" style={{ marginTop: 12 }}>Generic Phrases Detected</div>
                  <div className="tags">{result.aiContentDetection.genericPhrases.map((p: string, i: number) => <span className="tag tag-critical" key={i}>{p}</span>)}</div>
                </>
              )}
            </div>
          </div>
          {result.aiContentDetection.humanizationSuggestions?.length > 0 && (
            <>
              <div className="keyword-sublabel">Humanization Suggestions</div>
              {result.aiContentDetection.humanizationSuggestions.map((s: string, i: number) => (
                <div className="tip-item" key={i}><div className="tip-icon">✏️</div><div className="tip-text">{s}</div></div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── RECRUITER PERSONAS ── */}
      {result.recruiterPersonas && (
        <div className="personas-section">
          <div className="col-heading">Recruiter Persona Simulation</div>
          <div className="personas-grid">
            {[
              { key: "faang", icon: "⬡", name: "FAANG Recruiter", data: result.recruiterPersonas.faang },
              { key: "startup", icon: "◎", name: "Startup Recruiter", data: result.recruiterPersonas.startup },
              { key: "hr_screen", icon: "△", name: "HR Screener", data: result.recruiterPersonas.hr_screen },
              { key: "tech_lead", icon: "◈", name: "Tech Lead Eval", data: result.recruiterPersonas.tech_lead },
            ].map(p => p.data && (
              <div className="persona-card" key={p.key}>
                <div className="persona-header">
                  <div className="persona-icon">{p.icon}</div>
                  <div>
                    <div className="persona-name">{p.name}</div>
                    <div className="persona-verdict">{p.data.verdict}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#7A8BAA", marginBottom: 6 }}>
                  Pass Rate: <span style={{ color: "#2D96E8", fontWeight: 700 }}>{animated ? p.data.passRate : 0}%</span>
                </div>
                <div className="persona-pass-track">
                  <div className="persona-pass-fill" style={{ width: animated ? `${p.data.passRate}%` : "0%" }} />
                </div>
                <div className="persona-note">{p.data.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── KEYWORDS ── */}
      <div className="keywords-section">
        <div className="keywords-col">
          <div className="col-heading">Keywords Detected</div>
          <div className="tags">
            {(result.keywordsPresent || []).map((k: string, i: number) => (
              <span className="tag tag-present" key={i} title="Click to copy" onClick={() => navigator.clipboard?.writeText(k)}>{k}</span>
            ))}
          </div>
        </div>
        <div className="keywords-col">
          <div className="col-heading">Missing Keywords</div>
          <div className="keyword-sublabel">Critical — add these first</div>
          <div className="tags">{(result.keywordsCritical || []).map((k: string, i: number) => <span className="tag tag-critical" key={i} onClick={() => navigator.clipboard?.writeText(k)}>{k}</span>)}</div>
          <div className="keyword-sublabel">Recommended</div>
          <div className="tags">{(result.keywordsMissing || []).map((k: string, i: number) => <span className="tag tag-missing" key={i}>{k}</span>)}</div>
        </div>
      </div>

      {/* ── ATS ISSUES ── */}
      {(result.atsIssues || []).length > 0 && (
        <div className="ats-section">
          <div className="col-heading">ATS Parsing Issues</div>
          {result.atsIssues.map((issue: any, i: number) => (
            <div className="ats-issue" key={i}>
              <div className="ats-issue-title">⚠ {issue.issue} {issue.severity && <span className={`severity-badge sev-${(issue.severity || "").toLowerCase()}`}>{issue.severity}</span>}</div>
              <div className="ats-issue-fix">Fix: {issue.fix}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── SALARY INTELLIGENCE ── */}
      {result.salaryIntelligence && (
        <div className="salary-section">
          <div>
            <div className="section-label">Salary Intelligence</div>
            <div className="salary-range">{result.salaryIntelligence.estimatedRange}</div>
            <span className={`salary-position ${result.salaryIntelligence.marketPosition === "Above Market" ? "sal-above" : result.salaryIntelligence.marketPosition === "Below Market" ? "sal-below" : "sal-at"}`}>
              {result.salaryIntelligence.marketPosition}
            </span>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#7A8BAA", marginTop: 8 }}>
              Top Skill Value: <span style={{ color: "#22C4A4", fontWeight: 700 }}>{result.salaryIntelligence.topSkillValue}</span>
            </div>
          </div>
          <div>
            <div className="col-heading">Growth Tip</div>
            <div className="salary-tip">{result.salaryIntelligence.salaryGrowthTip}</div>
          </div>
        </div>
      )}

      {/* ── SKILL GAP INTELLIGENCE ── */}
      {(result.skillGapIntelligence || []).length > 0 && (
        <div className="skill-gap-section">
          <div className="col-heading">Skill Gap Intelligence</div>
          {result.skillGapIntelligence.map((sg: any, i: number) => (
            <div className="skill-gap-item" key={i}>
              <div className="sg-header">
                <span className="sg-skill">{sg.skill}</span>
                <span className="sg-salary">{sg.salaryImpact}</span>
              </div>
              <div className="sg-importance-track">
                <div className="sg-importance-fill" style={{ width: animated ? `${sg.marketImportance}%` : "0%" }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7A8BAA", marginBottom: 6 }}>Market Importance: {animated ? sg.marketImportance : 0}/100</div>
              <div className="sg-why">{sg.whyItMatters}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── PROJECTS ── */}
      <div className="projects-section">
        <div className="col-heading">Recommended Projects</div>
        <div className="project-grid">
          {(result.projects || []).map((p: any, i: number) => (
            <div className="project-card" key={i}>
              <div className="project-header">
                <div className="project-name">{p.name}</div>
                <div className={`project-badge ${p.impact === "High" ? "badge-high" : "badge-medium"}`}>{p.impact} Impact</div>
              </div>
              <div className="project-desc">{p.description}</div>
              {p.whyThisProject && <div className="project-why">{p.whyThisProject}</div>}
              <div className="stack">{(p.stack || []).map((s: string, j: number) => <span className="stack-tag" key={j}>{s}</span>)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROADMAP ── */}
      <div className="roadmap-grid">
        <div className="roadmap-col">
          <div className="roadmap-heading">30 Days</div>
          <div className="roadmap-sub">Immediate action plan</div>
          {(result.roadmap30 || []).map((item: any, i: number) => (
            <div className="roadmap-item" key={i}>
              <div className="roadmap-week">{item.week}</div>
              <div>
                <div className="roadmap-task">{item.task}{item.priority && <span className={`priority-chip prio-${(item.priority || "").toLowerCase()}`}>{item.priority}</span>}</div>
                <div className="roadmap-detail">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="roadmap-col">
          <div className="roadmap-heading">90 Days</div>
          <div className="roadmap-sub">Compounding growth</div>
          {(result.roadmap90 || []).map((item: any, i: number) => (
            <div className="roadmap-item" key={i}>
              <div className="roadmap-week">{item.week}</div>
              <div>
                <div className="roadmap-task">{item.task}{item.priority && <span className={`priority-chip prio-${(item.priority || "").toLowerCase()}`}>{item.priority}</span>}</div>
                <div className="roadmap-detail">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CERTIFICATIONS ── */}
      {(result.certificationRoadmap || []).length > 0 && (
        <div className="cert-section">
          <div className="col-heading">Certification Roadmap</div>
          <div className="cert-grid">
            {result.certificationRoadmap.map((c: any, i: number) => (
              <div className="cert-card" key={i}>
                <div className="cert-name">{c.cert}</div>
                <div className="cert-provider">{c.provider}</div>
                <span className={`cert-urgency ${c.urgency === "Immediate" ? "cert-immediate" : c.urgency === "3-months" ? "cert-3m" : "cert-6m"}`}>{c.urgency}</span>
                <div className="cert-impact">{c.impact}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INTERVIEW QUESTIONS ── */}
      {result.interviewQuestions && (
        <div className="interview-section">
          <div className="col-heading">AI-Generated Interview Questions</div>
          <div className="interview-tabs pdf-hide">
            {[
              { key: "technical", label: "Technical" },
              { key: "hr", label: "HR" },
              { key: "resumeBased", label: "Resume-Based" },
              { key: "systemDesign", label: "System Design" },
            ].map(t => (
              <button key={t.key} className={`interview-tab ${activeInterviewTab === t.key ? "active" : ""}`} onClick={() => setActiveInterviewTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <div>
            {(interviewMap[activeInterviewTab] || []).map((q: string, i: number) => (
              <div className="question-item" key={i}>
                <div className="q-num">Q{i + 1}</div>
                <div className="q-text">{q}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6-SECOND SCAN ── */}
      {result.sixSecondScan && (
        <div className="scan-section">
          <div className="col-heading">6-Second Recruiter Scan Simulation</div>
          <div className="scan-grid">
            <div>
              <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
                {[
                  { num: result.sixSecondScan.scannabilityScore, label: "Scannability" },
                  { num: result.sixSecondScan.hierarchyScore, label: "Visual Hierarchy" },
                ].map((s, i) => (
                  <div className="scan-score-box" key={i} style={{ flex: 1 }}>
                    <div className="scan-score-num" style={{ background: scoreGrad(s.num), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{animated ? s.num : "—"}</div>
                    <div className="scan-score-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="keyword-sublabel">First Impression</div>
              <div style={{ fontSize: 15, color: "#9BAFC8", lineHeight: 1.65, padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(109,181,241,0.14)", background: "rgba(255,255,255,0.04)", marginBottom: 16 }}>
                {result.sixSecondScan.firstImpression}
              </div>
            </div>
            <div>
              <div className="keyword-sublabel">Missed Opportunities</div>
              {(result.sixSecondScan.missedOpportunities || []).map((m: string, i: number) => (
                <div className="missed-item" key={i}>{m}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INDUSTRY BENCHMARK ── */}
      {result.industryBenchmark && (
        <div className="benchmark-section">
          <div className="col-heading">Industry Benchmarking</div>
          <div className="benchmark-grid">
            <div className="benchmark-card">
              <div className="bm-num">{animated ? result.industryBenchmark.percentileRank : "—"}<span style={{ fontSize: "0.4em" }}>th</span></div>
              <div className="bm-label">Percentile Rank</div>
              <div className="bm-verdict">vs All Candidates</div>
            </div>
            <div className="benchmark-card">
              <div className="bm-num" style={{ fontSize: 28 }}>{result.industryBenchmark.comparedToFresher}</div>
              <div className="bm-label">vs Fresher Pool</div>
              <div className="bm-verdict">{result.industryBenchmark.comparedToFresher}</div>
            </div>
            <div className="benchmark-card">
              <div className="bm-num" style={{ fontSize: 28 }}>{result.industryBenchmark.comparedToFAANG}</div>
              <div className="bm-label">vs FAANG Bar</div>
              <div className="bm-verdict">{result.industryBenchmark.comparedToFAANG}</div>
            </div>
          </div>
          <div style={{ marginTop: 20, fontSize: 15, color: "#9BAFC8", lineHeight: 1.7, padding: "16px 20px", borderRadius: 12, border: "1px solid rgba(109,181,241,0.14)", background: "#162035" }}>
            {result.industryBenchmark.competitivenessNote}
          </div>
        </div>
      )}

      {/* ── APPLICATION SUCCESS ── */}
      {result.applicationSuccess && (
        <div className="app-success-section">
          <div className="col-heading">Application Success Prediction</div>
          <div className="app-success-grid">
            {[
              { num: result.applicationSuccess.interviewCallbackProbability, label: "Interview Callback", note: "Probability of getting an interview call" },
              { num: result.applicationSuccess.oaClearingLikelihood, label: "OA Clearing Likelihood", note: "Based on current technical depth" },
              { num: result.applicationSuccess.hiringReadinessScore, label: "Hiring Readiness", note: "Overall job-market readiness score" },
            ].map((s, i) => (
              <div className="app-stat" key={i}>
                <div className="app-stat-num" style={{ background: scoreGrad(s.num), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{animated ? `${s.num}%` : "—"}</div>
                <div className="app-stat-label">{s.label}</div>
                <div className="app-stat-note">{s.note}</div>
              </div>
            ))}
          </div>
          {result.applicationSuccess.readinessNote && (
            <div style={{ marginTop: 20, fontSize: 15, color: "#9BAFC8", lineHeight: 1.7, padding: "16px 20px", borderRadius: 12, border: "1px solid rgba(109,181,241,0.14)", background: "#0D1525" }}>
              {result.applicationSuccess.readinessNote}
            </div>
          )}
        </div>
      )}

      {/* ── TARGET ROLES ── */}
      {((result.targetRoles || []).length > 0 || (result.targetCompanies || []).length > 0) && (
        <div className="target-section">
          <div>
            <div className="col-heading">Best-Fit Roles</div>
            <div className="tags">{(result.targetRoles || []).map((r: string, i: number) => <span className="tag tag-role" key={i}>{r}</span>)}</div>
          </div>
          <div>
            <div className="col-heading">Target Company Types</div>
            <div className="tags">{(result.targetCompanies || []).map((c: string, i: number) => <span className="tag tag-missing" key={i}>{c}</span>)}</div>
          </div>
        </div>
      )}

      {/* ── LINKEDIN & GITHUB TIPS ── */}
      {((result.linkedinTips || []).length > 0 || (result.githubTips || []).length > 0) && (
        <div className="tips-section">
          <div>
            <div className="col-heading">LinkedIn Optimization</div>
            {(result.linkedinTips || []).map((t: string, i: number) => (
              <div className="tip-item" key={i}><div className="tip-icon">💼</div><div className="tip-text">{t}</div></div>
            ))}
          </div>
          <div>
            <div className="col-heading">GitHub Improvement</div>
            {(result.githubTips || []).map((t: string, i: number) => (
              <div className="tip-item" key={i}><div className="tip-icon">⚙️</div><div className="tip-text">{t}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* ── RECRUITER NOTE ── */}
      <div className="recruiter-section">
        <div className="col-heading">Recruiter Simulation</div>
        <blockquote className="recruiter-quote">"{result.recruiterNote}"</blockquote>
        <div className="recruiter-attr">— Senior Technical Recruiter, AI Simulation</div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{ padding: "52px 56px", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", background: "#0D1525", borderBottom: "1px solid rgba(109,181,241,0.14)" }}>
        <PdfDownloadBtn fileName={fileName} className="btn-pdf pdf-hide" />
        <button className="btn-primary pdf-hide" onClick={onBack}>← Analyze Another Resume</button>
      </div>
    </div>
  );
}

function Footer({ onNavigate }: { onNavigate: () => void }) {
  const scrollTo = (id: string) => { onNavigate(); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100); };
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col">
          <div className="footer-brand">Indis<span>Valley</span> AI</div>
          <div className="footer-tagline">Career intelligence for ambitious engineers. Powered by brutal honesty and real AI.</div>
          <div className="footer-pow">Powered by Grok AI · 20+ Analysis Dimensions</div>
        </div>
        <div className="footer-col">
          <div className="footer-heading">Product</div>
          <ul className="footer-links">
            {["Resume Analyzer", "ATS Scoring", "Career Roadmaps", "Interview Prep", "Salary Intelligence"].map(l => (
              <li key={l}><a href="#upload" onClick={e => { e.preventDefault(); scrollTo("upload"); }}>{l}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <div className="footer-heading">Navigate</div>
          <ul className="footer-links">
            {[{ label: "Features", id: "features" }, { label: "How It Works", id: "how-it-works" }, { label: "About", id: "about" }, { label: "Analyze Resume", id: "upload" }].map(l => (
              <li key={l.id}><a href={`#${l.id}`} onClick={e => { e.preventDefault(); scrollTo(l.id); }}>{l.label}</a></li>
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

// ── ROOT COMPONENT ────────────────────────────────────────────────────────────
export default function IndisValleyAI() {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [view, setView] = useState<"home" | "loading" | "results" | "error">("home");
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [animated, setAnimated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState({ visible: false, text: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (view === "results") { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }
    else setAnimated(false);
  }, [view]);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }), { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [view]);

  const pop = useCallback((text: string) => {
    setToast({ visible: true, text });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const analyze = useCallback(async (file: File) => {
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
    }, 750);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 300_000);
      const response = await fetch(`${API_URL}/upload-resume`, { method: "POST", body: formData, signal: ctrl.signal });
      clearTimeout(tid);
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
    } catch (err: any) {
      clearInterval(stepInterval);
      const msg = err?.name === "AbortError" ? "Request timed out — please try again." : (err?.message || "An unexpected error occurred");
      setErrorMsg(msg);
      setView("error");
    }
  }, [pop]);

  const handleFile = useCallback((f: File | undefined | null) => { if (f) analyze(f); }, [analyze]);

  // ── LOADING VIEW ──
  if (view === "loading") {
    const progress = Math.round((loadStep / LOAD_STEPS.length) * 100);
    return (
      <>
        <style>{CSS}</style>
        <Navbar onCta={() => { }} onHome={() => setView("home")} />
        <div className="loading-page">
          <div className="orb" style={{ width: 560, height: 560, top: "-100px", left: "-80px", background: "#22C4A4" }} />
          <div className="orb" style={{ width: 420, height: 420, bottom: "-80px", right: "-80px", background: "#6B7AEA", animationDelay: "3s" }} />
          <div className="loading-inner">
            <div className="loading-spinner-wrap">
              <svg viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="56" className="spin-track" />
                <defs>
                  <linearGradient id="arc1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0FA896" /><stop offset="100%" stopColor="#1278CC" /></linearGradient>
                  <linearGradient id="arc2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1278CC" /><stop offset="100%" stopColor="#4857D8" /></linearGradient>
                </defs>
                <circle cx="65" cy="65" r="56" className="spin-arc spin-arc-1" stroke="url(#arc1)" />
                <circle cx="65" cy="65" r="56" className="spin-arc spin-arc-2" stroke="url(#arc2)" />
              </svg>
            </div>
            <h1 className="loading-title">Deep Analysis Running</h1>
            <div className="loading-file">{fileName}</div>
            <div className="terminal-card">
              <div className="terminal-hdr">
                <div className="t-dot" style={{ background: "#FC615D" }} />
                <div className="t-dot" style={{ background: "#FDBC40" }} />
                <div className="t-dot" style={{ background: "#34C749" }} />
                <div className="terminal-title">indisvalley_ai_engine_v4.exe — 20-dimension analysis</div>
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
            <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
            <div className="progress-label">{progress}% complete · 20 dimensions</div>
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
        <AnalysisPage result={result} fileName={fileName ?? "resume.pdf"} onBack={() => { setView("home"); setResult(null); }} animated={animated} />
        <Footer onNavigate={() => { setView("home"); setResult(null); }} />
      </>
    );
  }

  // ── HOME VIEW ──
  return (
    <>
      <style>{CSS}</style>
      <div className={`toast ${toast.visible ? "visible" : ""}`}>{toast.text}</div>
      <Navbar onCta={() => scrollTo("upload")} onHome={() => { }} />

      <section className="hero" id="home">
        <div className="hero-bg-grid" />
        <div className="hero-bg-glow" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div className="orb" style={{ width: 620, height: 540, top: "5%", left: "-80px", background: "#22C4A4" }} />
          <div className="orb" style={{ width: 480, height: 480, top: "20%", right: "0%", background: "#6B7AEA", animationDelay: "4s" }} />
          <div className="orb" style={{ width: 360, height: 360, bottom: "15%", left: "35%", background: "#2D96E8", animationDelay: "8s" }} />
        </div>
        <div className="hero-inner">
          <div className="hero-eyebrow"><span className="eye-dot" />Est. 2026 — AI Career Intelligence · 20 Dimensions</div>
          <h1 className="hero-h1">Get Hired.<br /><span className="hero-h1-grad">Not Filtered.</span></h1>
          <p className="hero-sub">IndisValley AI runs 20 analysis dimensions on your resume — ATS score, hiring probability, seniority detection, bullet rewrites, AI detection, salary intelligence, recruiter personas, and a full career roadmap.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => scrollTo("upload")}>Upload Resume →</button>
            <button className="btn-ghost" onClick={() => scrollTo("how-it-works")}>How It Works</button>
          </div>
          <div className="stats-row">
            {[{ val: "20+", label: "Dimensions" }, { val: "98%", label: "ATS Precision" }, { val: "~30s", label: "Analysis Speed" }, { val: "24/7", label: "Always On" }].map((s, i) => (
              <div className="stat-box" key={i}>
                <div className="stat-val">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="upload-section" id="upload">
        <div>
          <div className="section-label">Upload & Analyze</div>
          <h2 className="section-title reveal">Drop your<br />resume.<br />Get the truth.</h2>
          <p className="reveal" style={{ fontSize: 18, fontWeight: 400, color: "#9BAFC8", lineHeight: 1.85, marginTop: 24, maxWidth: 420 }}>
            20-dimension AI analysis: ATS score, seniority detection, bullet rewrites, salary intelligence, persona simulation, interview questions, risk flags, and a 30/90-day roadmap — in one brutal report.
          </p>
          <div style={{ marginTop: 44, display: "flex", gap: 40, flexWrap: "wrap" }}>
            {[{ label: "Format", val: "PDF only" }, { label: "Speed", val: "~30 sec" }, { label: "Dimensions", val: "20+" }].map(m => (
              <div key={m.label}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#7A8BAA", marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontWeight: 800, fontSize: 24, color: "#fff", letterSpacing: "-0.03em" }}>{m.val}</div>
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
            role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
            aria-label="Upload resume PDF"
          >
            <div className="drop-icon">↑</div>
            <div className="drop-title">Drop Resume Here</div>
            <div className="drop-sub">PDF only · drag or click to upload</div>
            <button className="btn-primary" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>Choose File & Analyze →</button>
          </div>
          <div className="upload-meta">
            <div className="meta-item">Format <span>PDF</span></div>
            <div className="meta-item">Max Size <span>10 MB</span></div>
            <div className="meta-item">Analysis <span>~30s</span></div>
          </div>
          <input type="file" accept=".pdf" ref={fileRef} style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0])} />
        </div>
      </section>

      <section className="features" id="features">
        <div className="features-header">
          <div>
            <div className="section-label">What You Get</div>
            <h2 className="section-title">20 layers.<br />Zero BS.</h2>
          </div>
          <p style={{ fontSize: 18, fontWeight: 400, color: "#9BAFC8", maxWidth: 340, lineHeight: 1.85 }}>
            Built for engineers navigating a talent market where ATS filters reject 75% of resumes before a human ever sees them.
          </p>
        </div>
        <div className="feat-grid">
          {[
            { icon: "⬡", title: "ATS Intelligence", desc: "12 scoring dimensions. Enterprise-grade parsing against real ATS systems. See exactly where you score and why." },
            { icon: "◎", title: "Recruiter Personas", desc: "FAANG, startup, HR, and tech-lead modes. Each recruiter sees your resume differently — know all their verdicts." },
            { icon: "△", title: "Bullet Rewrites", desc: "AI rewrites every weak bullet into STAR-format with quantified impact. Copy-paste ready improvements." },
            { icon: "◈", title: "Salary Intelligence", desc: "Estimated range, market position, top skill value, and a specific tip to increase your market worth." },
            { icon: "⬢", title: "Risk Analysis", desc: "Employment gaps, AI writing detection, buzzword inflation, unverifiable claims — flagged before a recruiter finds them." },
            { icon: "◉", title: "Interview Prep", desc: "AI-generated technical, HR, resume-based, and system design questions tailored to your specific resume." },
            { icon: "⊕", title: "Career Roadmap", desc: "30-day and 90-day action plans with priority rankings, certification roadmap, and skill gap intelligence." },
            { icon: "◐", title: "Benchmarking", desc: "Percentile rank vs all candidates and FAANG bar. Application success probability across 3 metrics." },
          ].map((f, i) => (
            <div className="feat-card reveal" key={i} style={{ transitionDelay: `${i * 0.07}s` }}>
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-num">0{i + 1}</div>
              <div className="feat-name">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-sidebar">
          <div>
            <div className="section-label">How It Works</div>
            <h2 className="section-title" style={{ fontSize: "clamp(36px,4vw,56px)" }}>Simple.<br />Brutal.<br />Honest.</h2>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "#7A8BAA", lineHeight: 3.2 }}>
            No account needed<br />No email required<br />No data stored<br />Just your resume
          </div>
        </div>
        <div className="how-content">
          {[
            { num: "01", title: "Upload Your PDF", body: "Drop your resume. Our parser extracts every line, section, heading, and formatting detail in milliseconds." },
            { num: "02", title: "20-Dimension AI Analysis", body: "The engine cross-references your resume against 2,400+ job descriptions, ATS patterns, real recruiter heuristics, and salary benchmarks." },
            { num: "03", title: "Full Intelligence Report", body: "ATS score, seniority detection, bullet rewrites, risk flags, salary intel, recruiter personas, interview questions, and application success prediction — all at once." },
            { num: "04", title: "Follow Your Roadmap", body: "Get personalized project recommendations, certification roadmap, and a prioritized 30/90-day improvement plan. Act on it. Get hired." },
          ].map((s, i) => (
            <div className="how-step reveal" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
              <div><div className="how-num">{s.num}</div></div>
              <div><div className="how-step-title">{s.title}</div><div className="how-step-body">{s.body}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="manifesto" id="about">
        <div className="manifesto-bg" />
        <div className="section-label" style={{ justifyContent: "center" }}>The IndisValley Commitment</div>
        <p className="manifesto-text reveal">
          In this grind, confusion is the real enemy. We exist so ambitious engineers stop guessing and start building careers with{" "}
          <span className="highlight">brutal clarity.</span>
        </p>
        <button className="btn-primary" onClick={() => scrollTo("upload")}>Analyze My Resume →</button>
      </section>

      <Footer onNavigate={() => { }} />
    </>
  );
}