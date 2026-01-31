const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Thomas Chartrain';
pres.title = 'Competitive Intelligence - War Room Report';

// Color palette - Midnight Executive (serious, intelligence, military)
const COLORS = {
  primary: "1E2761",      // navy
  secondary: "CADCFC",    // ice blue
  accent: "DC3545",       // alert red
  success: "28A745",      // green
  warning: "FFC107",      // yellow
  dark: "0D1117",         // github dark
  light: "F6F8FA",
  text: "24292F",
  muted: "57606A"
};

// ============ SLIDE 1: Title - War Room ============
let slide1 = pres.addSlide();
slide1.background = { color: COLORS.dark };

slide1.addText("WAR ROOM", {
  x: 0.5, y: 1.2, w: 9, h: 1,
  fontSize: 64, fontFace: "Arial Black", color: COLORS.accent
});

slide1.addText("COMPETITIVE INTELLIGENCE REPORT", {
  x: 0.5, y: 2.2, w: 9, h: 0.5,
  fontSize: 20, fontFace: "Arial", color: COLORS.secondary
});

slide1.addText("Semaine du 27 Janvier 2026", {
  x: 0.5, y: 3, w: 9, h: 0.4,
  fontSize: 16, fontFace: "Arial", color: COLORS.muted
});

// Target logo placeholder
slide1.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 4, w: 2, h: 0.8, fill: { color: COLORS.primary }
});
slide1.addText("GG.deals", {
  x: 0.5, y: 4.15, w: 2, h: 0.5,
  fontSize: 16, fontFace: "Arial Black", color: "FFFFFF", align: "center"
});

slide1.addText("Cible Principale", {
  x: 2.7, y: 4.25, w: 3, h: 0.3,
  fontSize: 12, fontFace: "Arial", color: COLORS.muted
});

// ============ SLIDE 2: Executive Summary ============
let slide2 = pres.addSlide();
slide2.background = { color: COLORS.light };

slide2.addText("Executive Summary", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 32, fontFace: "Arial Black", color: COLORS.primary
});

// Alert level
slide2.addShape(pres.shapes.RECTANGLE, {
  x: 7, y: 0.3, w: 2.5, h: 0.6, fill: { color: COLORS.warning }
});
slide2.addText("⚠️ MEDIUM", {
  x: 7, y: 0.4, w: 2.5, h: 0.4,
  fontSize: 14, fontFace: "Arial Black", color: COLORS.dark, align: "center"
});

// Key findings
const findings = [
  { icon: "🔴", title: "Nouvelles pages détectées", value: "+127", desc: "Expansion catalogue jeux AAA" },
  { icon: "🟡", title: "Changements sitemap", value: "3", desc: "Restructuration sections deals" },
  { icon: "🟢", title: "Uptime concurrent", value: "99.8%", desc: "Infrastructure stable" },
  { icon: "🔵", title: "Mentions sociales", value: "+45%", desc: "Campagne Reddit active" }
];

findings.forEach((f, i) => {
  const y = 1.1 + i * 1;

  slide2.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: y, w: 9, h: 0.85, fill: { color: "FFFFFF" }, line: { color: "E1E4E8", width: 1 }
  });

  slide2.addText(f.icon + " " + f.title, {
    x: 0.7, y: y + 0.15, w: 4, h: 0.3,
    fontSize: 14, fontFace: "Arial", color: COLORS.text, bold: true
  });

  slide2.addText(f.value, {
    x: 5, y: y + 0.1, w: 1.5, h: 0.4,
    fontSize: 24, fontFace: "Arial Black", color: COLORS.primary, align: "center"
  });

  slide2.addText(f.desc, {
    x: 6.5, y: y + 0.25, w: 2.8, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: COLORS.muted
  });
});

// ============ SLIDE 3: Sitemap Radar ============
let slide3 = pres.addSlide();
slide3.background = { color: COLORS.light };

slide3.addText("📡 Sitemap Radar", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 28, fontFace: "Arial Black", color: COLORS.primary
});

slide3.addText("Surveillance automatique du sitemap GG.deals", {
  x: 0.5, y: 0.8, w: 9, h: 0.3,
  fontSize: 12, fontFace: "Arial", color: COLORS.muted, italic: true
});

// Stats boxes
const sitemapStats = [
  { label: "URLs Totales", value: "45,892", change: "+127" },
  { label: "Nouvelles", value: "127", change: "cette semaine" },
  { label: "Supprimées", value: "23", change: "pages mortes" }
];

sitemapStats.forEach((s, i) => {
  const x = 0.5 + i * 3.2;
  slide3.addShape(pres.shapes.RECTANGLE, {
    x: x, y: 1.2, w: 2.9, h: 1.3, fill: { color: COLORS.primary }
  });
  slide3.addText(s.value, {
    x: x, y: 1.3, w: 2.9, h: 0.6,
    fontSize: 32, fontFace: "Arial Black", color: "FFFFFF", align: "center"
  });
  slide3.addText(s.label, {
    x: x, y: 1.9, w: 2.9, h: 0.3,
    fontSize: 12, fontFace: "Arial", color: COLORS.secondary, align: "center"
  });
  slide3.addText(s.change, {
    x: x, y: 2.2, w: 2.9, h: 0.2,
    fontSize: 10, fontFace: "Arial", color: COLORS.secondary, align: "center"
  });
});

// Recent changes table
slide3.addText("Dernières Détections", {
  x: 0.5, y: 2.8, w: 9, h: 0.4,
  fontSize: 16, fontFace: "Arial", color: COLORS.text, bold: true
});

const changes = [
  { type: "ADDED", url: "/game/elden-ring-shadow-of-the-erdtree", cat: "DLC" },
  { type: "ADDED", url: "/deals/steam-winter-sale-2026", cat: "Deals" },
  { type: "REMOVED", url: "/game/cyberpunk-2077-old-page", cat: "Game" },
  { type: "ADDED", url: "/store/instant-gaming-review", cat: "Content" }
];

changes.forEach((c, i) => {
  const y = 3.2 + i * 0.5;
  const typeColor = c.type === "ADDED" ? COLORS.success : COLORS.accent;

  slide3.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: y, w: 0.8, h: 0.4, fill: { color: typeColor }
  });
  slide3.addText(c.type, {
    x: 0.5, y: y + 0.05, w: 0.8, h: 0.3,
    fontSize: 9, fontFace: "Arial Black", color: "FFFFFF", align: "center"
  });

  slide3.addText(c.url, {
    x: 1.5, y: y + 0.05, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Consolas", color: COLORS.text
  });

  slide3.addShape(pres.shapes.RECTANGLE, {
    x: 7.8, y: y, w: 1.2, h: 0.4, fill: { color: COLORS.secondary }
  });
  slide3.addText(c.cat, {
    x: 7.8, y: y + 0.05, w: 1.2, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: COLORS.primary, align: "center"
  });
});

// ============ SLIDE 4: Category Breakdown ============
let slide4 = pres.addSlide();
slide4.background = { color: COLORS.dark };

slide4.addText("Répartition par Catégorie", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 28, fontFace: "Arial Black", color: COLORS.secondary
});

// Category bars
const categories = [
  { name: "Games", count: 78, pct: 61 },
  { name: "DLC", count: 23, pct: 18 },
  { name: "Deals", count: 15, pct: 12 },
  { name: "Content", count: 8, pct: 6 },
  { name: "Other", count: 3, pct: 3 }
];

categories.forEach((c, i) => {
  const y = 1.2 + i * 0.8;
  const barWidth = c.pct / 100 * 6;

  slide4.addText(c.name, {
    x: 0.5, y: y + 0.1, w: 1.5, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: "FFFFFF"
  });

  slide4.addShape(pres.shapes.RECTANGLE, {
    x: 2.2, y: y, w: 6, h: 0.5, fill: { color: "1F2937" }
  });

  slide4.addShape(pres.shapes.RECTANGLE, {
    x: 2.2, y: y, w: barWidth, h: 0.5, fill: { color: COLORS.secondary }
  });

  slide4.addText(c.count + " (" + c.pct + "%)", {
    x: 8.4, y: y + 0.1, w: 1.2, h: 0.3,
    fontSize: 12, fontFace: "Arial", color: COLORS.muted
  });
});

// ============ SLIDE 5: Competitive Actions ============
let slide5 = pres.addSlide();
slide5.background = { color: COLORS.light };

slide5.addText("🎯 Actions Recommandées", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 28, fontFace: "Arial Black", color: COLORS.primary
});

// Priority actions
const actions = [
  { priority: "P0", title: "Contre-campagne Reddit", desc: "GG.deals gagne en visibilité sur r/GameDeals. Lancer notre propre présence.", deadline: "Cette semaine" },
  { priority: "P1", title: "Audit DLC Elden Ring", desc: "127 nouvelles pages = opportunité de vérifier les prix avant eux.", deadline: "3 jours" },
  { priority: "P2", title: "Analyse deals Winter Sale", desc: "Documenter les écarts de prix pendant les soldes Steam.", deadline: "7 jours" }
];

actions.forEach((a, i) => {
  const y = 1.1 + i * 1.4;
  const prioColor = a.priority === "P0" ? COLORS.accent : (a.priority === "P1" ? COLORS.warning : COLORS.muted);

  slide5.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: y, w: 9, h: 1.2, fill: { color: "FFFFFF" }, line: { color: prioColor, width: 3 }
  });

  slide5.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: y, w: 0.6, h: 1.2, fill: { color: prioColor }
  });
  slide5.addText(a.priority, {
    x: 0.5, y: y + 0.4, w: 0.6, h: 0.4,
    fontSize: 14, fontFace: "Arial Black", color: "FFFFFF", align: "center"
  });

  slide5.addText(a.title, {
    x: 1.3, y: y + 0.15, w: 6, h: 0.4,
    fontSize: 16, fontFace: "Arial", color: COLORS.text, bold: true
  });

  slide5.addText(a.desc, {
    x: 1.3, y: y + 0.55, w: 6, h: 0.5,
    fontSize: 12, fontFace: "Arial", color: COLORS.muted
  });

  slide5.addText("⏰ " + a.deadline, {
    x: 7.5, y: y + 0.4, w: 1.8, h: 0.4,
    fontSize: 11, fontFace: "Arial", color: prioColor, bold: true
  });
});

// ============ SLIDE 6: Monitoring Dashboard ============
let slide6 = pres.addSlide();
slide6.background = { color: COLORS.dark };

slide6.addText("📊 Monitoring en Temps Réel", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 28, fontFace: "Arial Black", color: COLORS.secondary
});

// Dashboard preview mockup
slide6.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.1, w: 9, h: 4, fill: { color: "1F2937" }, line: { color: "374151", width: 1 }
});

// Fake dashboard elements
slide6.addText("🟢 Sitemap Monitor - ACTIVE", {
  x: 0.7, y: 1.3, w: 4, h: 0.4,
  fontSize: 14, fontFace: "Arial", color: COLORS.success
});

slide6.addText("Last scan: 2 minutes ago", {
  x: 5, y: 1.35, w: 4, h: 0.3,
  fontSize: 11, fontFace: "Arial", color: COLORS.muted
});

// Metric cards
const dashMetrics = [
  { label: "URLs Tracked", value: "45,892" },
  { label: "Changes Today", value: "+12" },
  { label: "Alerts", value: "3" }
];

dashMetrics.forEach((m, i) => {
  const x = 0.7 + i * 2.9;
  slide6.addShape(pres.shapes.RECTANGLE, {
    x: x, y: 2, w: 2.6, h: 1.2, fill: { color: "111827" }
  });
  slide6.addText(m.value, {
    x: x, y: 2.2, w: 2.6, h: 0.6,
    fontSize: 28, fontFace: "Arial Black", color: COLORS.secondary, align: "center"
  });
  slide6.addText(m.label, {
    x: x, y: 2.8, w: 2.6, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: COLORS.muted, align: "center"
  });
});

// Recent activity feed
slide6.addText("Recent Activity", {
  x: 0.7, y: 3.4, w: 4, h: 0.3,
  fontSize: 12, fontFace: "Arial", color: "FFFFFF", bold: true
});

const feed = [
  "14:32 - New page detected: /game/dragon-age-4",
  "14:28 - Price change: Elden Ring DLC (-12%)",
  "14:15 - Sitemap scan completed"
];

feed.forEach((f, i) => {
  slide6.addText(f, {
    x: 0.7, y: 3.75 + i * 0.35, w: 8, h: 0.3,
    fontSize: 10, fontFace: "Consolas", color: COLORS.muted
  });
});

// ============ SLIDE 7: Next Steps ============
let slide7 = pres.addSlide();
slide7.background = { color: COLORS.primary };

slide7.addText("NEXT STEPS", {
  x: 0.5, y: 1.5, w: 9, h: 0.8,
  fontSize: 48, fontFace: "Arial Black", color: "FFFFFF", align: "center"
});

slide7.addText([
  { text: "Déployer scraper automatique (cron toutes les 6h)", options: { breakLine: true, bullet: true } },
  { text: "Intégrer alertes Discord/Slack", options: { breakLine: true, bullet: true } },
  { text: "Ajouter monitoring concurrents secondaires", options: { breakLine: true, bullet: true } },
  { text: "Générer rapport PDF automatique hebdo", options: { bullet: true } }
], {
  x: 1.5, y: 2.8, w: 7, h: 2,
  fontSize: 16, fontFace: "Arial", color: COLORS.secondary
});

slide7.addText("Prochain rapport: Lundi 3 Février 2026", {
  x: 0.5, y: 5, w: 9, h: 0.4,
  fontSize: 14, fontFace: "Arial", color: COLORS.muted, align: "center"
});

// Save
pres.writeFile({ fileName: "/sessions/great-eager-brahmagupta/mnt/Lprojects/Competitive intelligence/slides/CI-WarRoom-Report.pptx" })
  .then(() => console.log("✅ War Room Report créé!"))
  .catch(err => console.error(err));
