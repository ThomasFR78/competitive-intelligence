const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Thomas Chartrain';
pres.title = 'True Price Authority - Pitch Investisseur';

// Color palette - Coral Energy (bold, attention-grabbing for investors)
const COLORS = {
  primary: "F96167",      // coral
  secondary: "F9E795",    // gold
  accent: "2F3C7E",       // navy
  dark: "1A1A2E",         // dark bg
  light: "FAFAFA",        // light bg
  text: "2D2D2D",
  muted: "6B7280"
};

// ============ SLIDE 1: Title ============
let slide1 = pres.addSlide();
slide1.background = { color: COLORS.dark };

// Big bold title
slide1.addText("TRUE PRICE", {
  x: 0.5, y: 1.8, w: 9, h: 1,
  fontSize: 72, fontFace: "Arial Black", color: COLORS.primary, bold: true
});
slide1.addText("AUTHORITY", {
  x: 0.5, y: 2.6, w: 9, h: 0.8,
  fontSize: 48, fontFace: "Arial", color: "FFFFFF"
});

slide1.addText("La Source de Vérité sur les Prix du Gaming", {
  x: 0.5, y: 3.8, w: 9, h: 0.5,
  fontSize: 20, fontFace: "Arial", color: COLORS.secondary, italic: true
});

// Tagline
slide1.addText("Audit • Transparence • Confiance", {
  x: 0.5, y: 4.8, w: 9, h: 0.4,
  fontSize: 16, fontFace: "Arial", color: COLORS.muted
});

// ============ SLIDE 2: Le Problème ============
let slide2 = pres.addSlide();
slide2.background = { color: COLORS.light };

slide2.addText("Le Problème", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 36, fontFace: "Arial Black", color: COLORS.accent
});

// Stat callouts - big numbers
slide2.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.2, w: 2.8, h: 1.8, fill: { color: COLORS.primary }
});
slide2.addText("73%", {
  x: 0.5, y: 1.3, w: 2.8, h: 0.9,
  fontSize: 48, fontFace: "Arial Black", color: "FFFFFF", align: "center"
});
slide2.addText("des prix barrés\nsont FAUX", {
  x: 0.5, y: 2.1, w: 2.8, h: 0.8,
  fontSize: 12, fontFace: "Arial", color: "FFFFFF", align: "center"
});

slide2.addShape(pres.shapes.RECTANGLE, {
  x: 3.6, y: 1.2, w: 2.8, h: 1.8, fill: { color: COLORS.accent }
});
slide2.addText("€2.3M", {
  x: 3.6, y: 1.3, w: 2.8, h: 0.9,
  fontSize: 48, fontFace: "Arial Black", color: "FFFFFF", align: "center"
});
slide2.addText("perdus par les\nconsommateurs/an", {
  x: 3.6, y: 2.1, w: 2.8, h: 0.8,
  fontSize: 12, fontFace: "Arial", color: "FFFFFF", align: "center"
});

slide2.addShape(pres.shapes.RECTANGLE, {
  x: 6.7, y: 1.2, w: 2.8, h: 1.8, fill: { color: "E74C3C" }
});
slide2.addText("0", {
  x: 6.7, y: 1.3, w: 2.8, h: 0.9,
  fontSize: 48, fontFace: "Arial Black", color: "FFFFFF", align: "center"
});
slide2.addText("solution de\nvérification existe", {
  x: 6.7, y: 2.1, w: 2.8, h: 0.8,
  fontSize: 12, fontFace: "Arial", color: "FFFFFF", align: "center"
});

// Problem description
slide2.addText([
  { text: "Les comparateurs de prix de jeux vidéo (Allkeyshop, GG.deals) affichent des prix incorrects.", options: { breakLine: true, bullet: true } },
  { text: "Les marchands gonflent les 'prix barrés' pour simuler de fausses promotions.", options: { breakLine: true, bullet: true } },
  { text: "Les frais cachés (PayPal, protection acheteur) ne sont pas inclus.", options: { breakLine: true, bullet: true } },
  { text: "Les consommateurs ne peuvent pas vérifier l'honnêteté des vendeurs.", options: { bullet: true } }
], {
  x: 0.5, y: 3.3, w: 9, h: 2,
  fontSize: 14, fontFace: "Arial", color: COLORS.text
});

// ============ SLIDE 3: La Solution ============
let slide3 = pres.addSlide();
slide3.background = { color: COLORS.dark };

slide3.addText("Notre Solution", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 36, fontFace: "Arial Black", color: COLORS.primary
});

// 3 pillars
const pillars = [
  { title: "AUDIT", desc: "Vérification terrain des prix réels vs affichés", icon: "🔍" },
  { title: "SCORING", desc: "Classement d'intégrité des vendeurs", icon: "⭐" },
  { title: "MÉDIA", desc: "Publication des résultats (infographies, vidéos)", icon: "📊" }
];

pillars.forEach((p, i) => {
  const x = 0.5 + i * 3.2;
  slide3.addShape(pres.shapes.RECTANGLE, {
    x: x, y: 1.2, w: 2.9, h: 3.5, fill: { color: COLORS.accent }
  });
  slide3.addText(p.icon, {
    x: x, y: 1.4, w: 2.9, h: 0.8,
    fontSize: 40, align: "center"
  });
  slide3.addText(p.title, {
    x: x, y: 2.2, w: 2.9, h: 0.5,
    fontSize: 24, fontFace: "Arial Black", color: COLORS.secondary, align: "center"
  });
  slide3.addText(p.desc, {
    x: x + 0.2, y: 2.9, w: 2.5, h: 1.5,
    fontSize: 14, fontFace: "Arial", color: "FFFFFF", align: "center"
  });
});

slide3.addText("Le 'Baromètre des Menteurs' - Taux de mensonge calculé en temps réel", {
  x: 0.5, y: 5, w: 9, h: 0.4,
  fontSize: 16, fontFace: "Arial", color: COLORS.secondary, italic: true, align: "center"
});

// ============ SLIDE 4: Business Model ============
let slide4 = pres.addSlide();
slide4.background = { color: COLORS.light };

slide4.addText("Business Model", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 36, fontFace: "Arial Black", color: COLORS.accent
});

// Revenue streams
const revenues = [
  { name: "Affiliation", value: "40%", desc: "Commission sur redirections qualifiées" },
  { name: "API MCP", value: "30%", desc: "Licence pour IA/assistants (Trust Score)" },
  { name: "Média", value: "20%", desc: "Sponsoring, partenariats éditoriaux" },
  { name: "Data", value: "10%", desc: "Rapports sectoriels premium" }
];

revenues.forEach((r, i) => {
  const y = 1.2 + i * 1;
  slide4.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: y, w: 1.2, h: 0.8, fill: { color: COLORS.primary }
  });
  slide4.addText(r.value, {
    x: 0.5, y: y + 0.15, w: 1.2, h: 0.5,
    fontSize: 24, fontFace: "Arial Black", color: "FFFFFF", align: "center"
  });
  slide4.addText(r.name, {
    x: 1.9, y: y + 0.1, w: 3, h: 0.4,
    fontSize: 18, fontFace: "Arial", color: COLORS.accent, bold: true
  });
  slide4.addText(r.desc, {
    x: 1.9, y: y + 0.45, w: 7, h: 0.3,
    fontSize: 12, fontFace: "Arial", color: COLORS.muted
  });
});

// ============ SLIDE 5: Traction & Roadmap ============
let slide5 = pres.addSlide();
slide5.background = { color: COLORS.light };

slide5.addText("Traction & Roadmap", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 36, fontFace: "Arial Black", color: COLORS.accent
});

// Timeline
const milestones = [
  { date: "Jan 2026", title: "POC Live", status: "done" },
  { date: "Fév 2026", title: "MVP Dashboard", status: "current" },
  { date: "Mar 2026", title: "API MCP Beta", status: "future" },
  { date: "Q2 2026", title: "Media Launch", status: "future" }
];

milestones.forEach((m, i) => {
  const x = 0.8 + i * 2.3;
  const color = m.status === "done" ? "27AE60" : (m.status === "current" ? COLORS.primary : COLORS.muted);

  slide5.addShape(pres.shapes.OVAL, {
    x: x + 0.8, y: 1.5, w: 0.4, h: 0.4, fill: { color: color }
  });
  slide5.addText(m.date, {
    x: x, y: 2.1, w: 2, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: color, bold: true, align: "center"
  });
  slide5.addText(m.title, {
    x: x, y: 2.5, w: 2, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: COLORS.text, align: "center"
  });
});

// Line connecting milestones
slide5.addShape(pres.shapes.LINE, {
  x: 1.2, y: 1.7, w: 8, h: 0, line: { color: COLORS.muted, width: 2 }
});

// Current metrics
slide5.addText("Métriques Actuelles", {
  x: 0.5, y: 3.3, w: 9, h: 0.5,
  fontSize: 20, fontFace: "Arial", color: COLORS.accent, bold: true
});

const metrics = [
  { label: "Vendeurs audités", value: "6" },
  { label: "Prix vérifiés", value: "156" },
  { label: "Taux de mensonge moyen", value: "26.9%" }
];

metrics.forEach((m, i) => {
  const x = 0.5 + i * 3.2;
  slide5.addText(m.value, {
    x: x, y: 3.9, w: 3, h: 0.7,
    fontSize: 36, fontFace: "Arial Black", color: COLORS.primary
  });
  slide5.addText(m.label, {
    x: x, y: 4.5, w: 3, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: COLORS.muted
  });
});

// ============ SLIDE 6: Ask ============
let slide6 = pres.addSlide();
slide6.background = { color: COLORS.dark };

slide6.addText("Notre Demande", {
  x: 0.5, y: 0.5, w: 9, h: 0.6,
  fontSize: 36, fontFace: "Arial Black", color: COLORS.primary
});

slide6.addShape(pres.shapes.RECTANGLE, {
  x: 2.5, y: 1.5, w: 5, h: 2.5, fill: { color: COLORS.accent }
});

slide6.addText("€150K", {
  x: 2.5, y: 1.8, w: 5, h: 1,
  fontSize: 64, fontFace: "Arial Black", color: COLORS.secondary, align: "center"
});
slide6.addText("Seed Round", {
  x: 2.5, y: 2.8, w: 5, h: 0.5,
  fontSize: 20, fontFace: "Arial", color: "FFFFFF", align: "center"
});
slide6.addText("pour 12 mois de runway", {
  x: 2.5, y: 3.3, w: 5, h: 0.4,
  fontSize: 14, fontFace: "Arial", color: COLORS.muted, align: "center"
});

// Use of funds
slide6.addText("Utilisation des fonds:", {
  x: 0.5, y: 4.3, w: 9, h: 0.4,
  fontSize: 16, fontFace: "Arial", color: "FFFFFF", bold: true
});

slide6.addText([
  { text: "60% Tech & Produit (scraping, IA, dashboards)", options: { breakLine: true, bullet: true } },
  { text: "25% Marketing & Média (acquisition, content)", options: { breakLine: true, bullet: true } },
  { text: "15% Ops & Legal (VA, juridique)", options: { bullet: true } }
], {
  x: 0.5, y: 4.7, w: 9, h: 1,
  fontSize: 14, fontFace: "Arial", color: COLORS.muted
});

// ============ SLIDE 7: Contact ============
let slide7 = pres.addSlide();
slide7.background = { color: COLORS.primary };

slide7.addText("Merci", {
  x: 0.5, y: 1.5, w: 9, h: 1,
  fontSize: 72, fontFace: "Arial Black", color: "FFFFFF", align: "center"
});

slide7.addText("Thomas Chartrain", {
  x: 0.5, y: 3, w: 9, h: 0.5,
  fontSize: 24, fontFace: "Arial", color: "FFFFFF", align: "center"
});

slide7.addText("tcha78@gmail.com", {
  x: 0.5, y: 3.6, w: 9, h: 0.4,
  fontSize: 18, fontFace: "Arial", color: COLORS.dark, align: "center"
});

slide7.addText("true-price-authority.vercel.app", {
  x: 0.5, y: 4.2, w: 9, h: 0.4,
  fontSize: 16, fontFace: "Arial", color: COLORS.dark, align: "center", italic: true
});

// Save
pres.writeFile({ fileName: "/sessions/great-eager-brahmagupta/mnt/Lprojects/True Price Authority/slides/TruePriceAuthority-Pitch-Investisseur.pptx" })
  .then(() => console.log("✅ Pitch Investisseur créé!"))
  .catch(err => console.error(err));
