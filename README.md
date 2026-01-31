# 🎯 Intelligence Concurrentielle

> Surveillance stratégique du marché des clés de jeux vidéo

## 📋 Vue d'ensemble

Ce projet est le **moteur de collecte de données** qui alimente True Price Authority. Il surveille automatiquement les changements sur les sites concurrents, principalement via l'analyse des sitemaps.

### Philosophie
*"You must know the market better than they know themselves."* — Hormozi / Peter Thiel

**Split opérationnel :** 80% Automatisé (Agents) / 20% Analyse Stratégique (Humain)

---

## 🏗️ Structure du Projet

```
Competitive intelligence/
├── docs/                    # Documentation et plans
│   ├── PLAN.md             # Cahier des charges détaillé
│   └── last meeting with boss.png
├── presentations/           # Présentations
│   └── Intelligence Concurrentielle... V3.pptx
├── assets/                  # Ressources visuelles
│   └── n8n_sitemap_diff.bmp
├── data/                    # Données collectées
├── reports/                 # Rapports générés
└── tools/                   # Outils techniques
    ├── page-checker/        # Outil de suivi des prix (existant)
    └── sitemap-monitor/     # Surveillance des sitemaps (nouveau)
```

---

## 🔧 Outils Disponibles

### 1. Sitemap Monitor (Serverless)

Surveillance des changements de sitemap avec support des **sitemaps imbriqués** (comme GG.deals).

**Fonctionnalités :**
- Détection automatique des nouvelles pages
- Support des sitemap index (sitemaps dans sitemaps)
- Catégorisation automatique (game, dlc, bundle, deals, etc.)
- Historique des scans
- Dashboard de visualisation

**Déploiement :**
```bash
cd tools/sitemap-monitor
npm install
cp .env.example .env  # Configurer Supabase
vercel dev            # Local
vercel --prod         # Production
```

**APIs disponibles :**
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/competitors` | GET/POST | Gestion des concurrents |
| `/api/competitors/:id/history` | GET | Historique d'un concurrent |
| `/api/scan/trigger` | POST | Déclencher un scan |
| `/api/alerts` | GET | Alertes et changements récents |
| `/api/dashboard/feed` | GET | Données pour le dashboard |

### 2. Page Checker (Existant)

Outil de capture des prix avec extension navigateur.

**Stack :** Vercel + Supabase + Browser Extension

---

## 📊 Radars de Surveillance

### A. Product Radar
- Surveillance des nouvelles pages produits
- Détection des lancements discrets (PWA, Apps)
- Scraping quotidien des sitemaps

### B. Media Radar
- Surveillance de l'empreinte médiatique
- Google Discover, YouTube, TikTok
- Mentions de marques

### C. SEO Watch
- Keyword gap analysis
- Backlinks monitoring
- Core Web Vitals

### D. Community Monitor
- Discord/Reddit tracking
- Sentiment analysis (Trustpilot)
- Détection des signaux faibles

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Compte Supabase (gratuit)
- Vercel CLI (`npm i -g vercel`)

### Installation

```bash
# 1. Configurer Supabase
# Créer les tables avec tools/sitemap-monitor/scripts/schema.sql

# 2. Configurer l'environnement
cd tools/sitemap-monitor
cp .env.example .env
# Éditer .env avec vos clés Supabase

# 3. Installer les dépendances
npm install

# 4. Générer des données démo (optionnel)
npm run seed

# 5. Lancer en local
npm run dev
```

### Ajouter un concurrent à surveiller

```bash
curl -X POST http://localhost:3000/api/competitors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GG.deals",
    "domain": "gg.deals",
    "sitemap_url": "https://gg.deals/sitemap.xml",
    "category": "comparator"
  }'
```

### Déclencher un scan

```bash
curl -X POST http://localhost:3000/api/scan/trigger \
  -H "Content-Type: application/json" \
  -d '{"competitor_id": 1}'
```

---

## 📈 Livrables

### Rapport Hebdomadaire "War Room"

Format PDF synthétique contenant :
- **Radar SEO** : Gains/pertes de trafic des concurrents
- **Radar Produit** : Nouveaux lancements détectés
- **Radar Social** : Campagnes marketing identifiées
- **Actions recommandées** : Contre-mesures suggérées

---

## 🔗 Lien avec True Price Authority

```
┌─────────────────────────┐     ┌─────────────────────────┐
│  COMPETITIVE INTEL      │     │  TRUE PRICE AUTHORITY   │
│  (Collecte de données)  │────▶│  (Analyse & Actions)    │
│                         │     │                         │
│  • Sitemap monitoring   │     │  • Baromètre menteurs   │
│  • Price tracking       │     │  • Leaderboard vendeurs │
│  • Change detection     │     │  • Audit coupons        │
└─────────────────────────┘     └─────────────────────────┘
```

---

## 📝 Notes Techniques

### Gestion des sitemaps imbriqués

GG.deals utilise un sitemap index. Le scanner gère automatiquement :
1. Détection du type (urlset vs sitemapindex)
2. Récursion jusqu'à profondeur 3
3. Traitement par lots (5 sous-sitemaps en parallèle)
4. Gestion des erreurs par sous-sitemap

### Base de données Supabase

Tables principales :
- `competitors` : Concurrents surveillés
- `sitemap_scans` : Historique des scans
- `sitemap_changes` : Changements détectés

---

## 📞 Contact

**Lead :** Thomas Chartrain
**Deadline 1er Rapport :** 24 Janvier 2026
