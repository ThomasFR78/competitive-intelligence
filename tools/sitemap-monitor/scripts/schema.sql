-- ============================================
-- SCHEMA: Sitemap Monitor - Intelligence Concurrentielle
-- Base de données Supabase
-- ============================================

-- Table: Concurrents surveillés
CREATE TABLE IF NOT EXISTS competitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    sitemap_url VARCHAR(500),
    category VARCHAR(50) DEFAULT 'general',
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Historique des scans de sitemap
CREATE TABLE IF NOT EXISTS sitemap_scans (
    id SERIAL PRIMARY KEY,
    competitor_id INTEGER REFERENCES competitors(id) ON DELETE CASCADE,
    scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_urls INTEGER DEFAULT 0,
    new_urls INTEGER DEFAULT 0,
    removed_urls INTEGER DEFAULT 0,
    urls_snapshot JSONB DEFAULT '[]',
    scan_duration_ms INTEGER,
    error_message TEXT
);

-- Table: Changements détectés
CREATE TABLE IF NOT EXISTS sitemap_changes (
    id SERIAL PRIMARY KEY,
    scan_id INTEGER REFERENCES sitemap_scans(id) ON DELETE CASCADE,
    competitor_id INTEGER REFERENCES competitors(id) ON DELETE CASCADE,
    url VARCHAR(2000) NOT NULL,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('added', 'removed', 'modified')),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    page_title VARCHAR(500),
    category VARCHAR(50) DEFAULT 'other',
    meta_description TEXT,
    priority VARCHAR(10) DEFAULT 'normal'
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_scans_competitor ON sitemap_scans(competitor_id);
CREATE INDEX IF NOT EXISTS idx_scans_date ON sitemap_scans(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_changes_competitor ON sitemap_changes(competitor_id);
CREATE INDEX IF NOT EXISTS idx_changes_date ON sitemap_changes(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_changes_type ON sitemap_changes(change_type);
CREATE INDEX IF NOT EXISTS idx_changes_category ON sitemap_changes(category);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour competitors
DROP TRIGGER IF EXISTS trigger_competitors_updated ON competitors;
CREATE TRIGGER trigger_competitors_updated
    BEFORE UPDATE ON competitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Vue: Résumé par concurrent
CREATE OR REPLACE VIEW competitor_summary AS
SELECT
    c.id,
    c.name,
    c.domain,
    c.category,
    c.active,
    COUNT(DISTINCT s.id) as total_scans,
    MAX(s.scan_date) as last_scan,
    SUM(CASE WHEN ch.change_type = 'added' THEN 1 ELSE 0 END) as total_pages_added,
    SUM(CASE WHEN ch.change_type = 'removed' THEN 1 ELSE 0 END) as total_pages_removed
FROM competitors c
LEFT JOIN sitemap_scans s ON c.id = s.competitor_id
LEFT JOIN sitemap_changes ch ON c.id = ch.competitor_id
GROUP BY c.id, c.name, c.domain, c.category, c.active;
