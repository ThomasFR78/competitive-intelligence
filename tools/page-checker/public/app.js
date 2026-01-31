let offers = [];
let currentDropZone = null;

document.addEventListener('DOMContentLoaded', () => {
    loadOffers();
    setupPasteHandlers();
    setupUrlAutoFill();
});

// ==================== URL AUTO-FILL ====================

function setupUrlAutoFill() {
    const urlInput = document.getElementById('offerUrl');
    const nameInput = document.getElementById('offerName');

    urlInput.addEventListener('blur', () => {
        if (urlInput.value && !nameInput.value) {
            nameInput.value = extractSlugFromUrl(urlInput.value);
        }
    });
}

function extractSlugFromUrl(url) {
    const parts = url.split('/').filter(p => p && !p.includes('.') && !p.includes(':'));
    const slug = parts[parts.length - 1] || '';
    return slug
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

// ==================== OFFERS ====================

async function loadOffers() {
    const response = await fetch('/api/offers');
    offers = await response.json();
    renderOffers();
}

function renderOffers() {
    const grid = document.getElementById('offersGrid');

    if (offers.length === 0) {
        grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3>No offers</h3>
        <p>Click "New Offer" to start tracking</p>
      </div>
    `;
        return;
    }

    grid.innerHTML = offers.map(offer => `
    <div class="offer-card">
        <div class="offer-header">
            <div>
                <div class="offer-name">${escapeHtml(offer.name)}</div>
                <div class="offer-badges">
                    <span class="offer-store">🏪 ${escapeHtml(offer.store || 'Not specified')}</span>
                    <span class="offer-region">${offer.region === 'europe' ? '🇪🇺 Europe' : '🌍 Global'}</span>
                    <span class="offer-method">${offer.payment_method === 'paypal' ? '🅿️ PayPal' : '💳 Card'}</span>
                </div>
                <div class="offer-price-badge">
                    Reference: ${offer.displayed_price ? offer.displayed_price.toFixed(2) + ' €' : 'N/A'}
                </div>
            </div>
            <div class="offer-menu">
                <button class="btn btn-secondary btn-sm" onclick="editOffer(${offer.id})" title="Edit">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteOffer(${offer.id})" title="Delete">🗑️</button>
            </div>
        </div>
        <a href="${escapeHtml(offer.url)}" target="_blank" class="offer-url">${escapeHtml(offer.url)}</a>

        <div class="offer-history-preview">
            <h4>Latest Checks</h4>
            ${renderMiniHistory(offer)}
        </div>

        <div class="offer-actions">
            <button class="btn btn-primary btn-sm" onclick="openCheckModal(${offer.id})">
                📊 New Check
            </button>
            <button class="btn btn-secondary btn-sm" onclick="showHistory(${offer.id})">
                📈 Full History
            </button>
        </div>
    </div >
                `).join('');
}

function renderMiniHistory(offer) {
    if (!offer.history || offer.history.length === 0) {
        return '<div class="mini-history-empty">No recent checks</div>';
    }

    const latest = offer.history.slice(0, 3);

    return `
    <table class="mini-history-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>GGDeals</th>
                <th>AKS</th>
            </tr>
        </thead>
        <tbody>
            ${latest.map(check => {
        const date = new Date(check.check_date).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const refPrice = check.reference_price || offer.displayed_price;

        const showP = (p, coupon) => {
            if (!p) return '-';

            let diffHtml = '';
            if (refPrice) {
                const diff = p - refPrice;
                const color = diff > 0 ? 'text-red' : (diff < 0 ? 'text-green' : 'text-gray');
                const sign = diff > 0 ? '+' : '';
                diffHtml = `<span class="price-diff ${color}">(${sign}${diff.toFixed(2)})</span>`;
            }

            const couponHtml = coupon ? `<span class="coupon-badge" title="Code: ${coupon}">🏷️ ${coupon}</span>` : '';

            return `
                        <div class="price-cell">
                            <span>${p.toFixed(2)}€ ${couponHtml}</span>
                            ${diffHtml}
                        </div>
                    `;
        };

        const refDisplay = refPrice ? refPrice.toFixed(2) + '€' : '-';

        const ggP = check.price_ggdeals_card || check.price_ggdeals_paypal || check.price_ggdeals;
        const aksP = check.price_aks_card || check.price_aks_paypal || check.price_allkeyshop;

        return `
                <tr>
                    <td>${date}</td>
                    <td>${refDisplay}</td>
                    <td>${showP(ggP, check.coupon_ggdeals)}</td>
                    <td>${showP(aksP, check.coupon_aks)}</td>
                </tr>
                `;
    }).join('')}
        </tbody>
    </table>
    `;
}

function openOfferModal(offerId = null) {
    const modal = document.getElementById('offerModal');
    const title = document.getElementById('offerModalTitle');
    const form = document.getElementById('offerForm');

    resetScreenshotZone('Displayed');

    if (offerId) {
        const offer = offers.find(o => o.id === offerId);
        if (offer) {
            title.textContent = 'Edit Offer';
            document.getElementById('offerId').value = offer.id;
            document.getElementById('offerUrl').value = offer.url;
            document.getElementById('offerName').value = offer.name;
            document.getElementById('offerStore').value = offer.store || '';
            document.getElementById('offerRegion').value = offer.region || 'global';
            document.getElementById('displayedPrice').value = offer.displayed_price || '';

            const pm = offer.payment_method || 'card';
            const radio = document.querySelector(`input[name = "offerPaymentMethod"][value = "${pm}"]`);
            if (radio) radio.checked = true;

            if (offer.displayed_price_screenshot) {
                setScreenshotPreview('Displayed', offer.displayed_price_screenshot);
            }
        }
    } else {
        title.textContent = 'New Offer';
        form.reset();
        document.getElementById('offerId').value = '';
    }

    modal.classList.add('active');
}

function closeOfferModal() {
    document.getElementById('offerModal').classList.remove('active');
}

function editOffer(id) {
    openOfferModal(id);
}

async function saveOffer(event) {
    event.preventDefault();

    const id = document.getElementById('offerId').value;
    const data = {
        url: document.getElementById('offerUrl').value,
        name: document.getElementById('offerName').value,
        store: document.getElementById('offerStore').value,
        region: document.getElementById('offerRegion').value,
        displayed_price: parseFloat(document.getElementById('displayedPrice').value) || null,
        displayed_price_screenshot: document.getElementById('screenshotDisplayed').value || null,
        payment_method: document.querySelector('input[name="offerPaymentMethod"]:checked').value
    };

    if (id) {
        await fetch(`/api/offers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } else {
        await fetch('/api/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    closeOfferModal();
    loadOffers();
}

async function deleteOffer(id) {
    if (!confirm('Delete this offer and all its checks?')) return;
    await fetch(`/api/offers/${id}`, { method: 'DELETE' });
    loadOffers();
}

// ==================== PRICE CHECKS ====================

function openCheckModal(offerId) {
    const modal = document.getElementById('checkModal');
    const form = document.getElementById('checkForm');

    form.reset();
    document.getElementById('checkOfferId').value = offerId;

    ['Paypal', 'Card', 'Ggdeals', 'Allkeyshop'].forEach(type => {
        resetScreenshotZone(type);
    });

    modal.classList.add('active');
}

function closeCheckModal() {
    document.getElementById('checkModal').classList.remove('active');
}

async function saveCheck(event) {
    event.preventDefault();

    const offerId = document.getElementById('checkOfferId').value;
    const data = {
        price_paypal: parseFloat(document.getElementById('pricePaypal').value) || null,
        price_card: parseFloat(document.getElementById('priceCard').value) || null,
        price_ggdeals: parseFloat(document.getElementById('priceGgdeals').value) || null,
        price_allkeyshop: parseFloat(document.getElementById('priceAllkeyshop').value) || null,
        coupon_ggdeals: document.getElementById('couponGgdeals').value || null,
        coupon_aks: document.getElementById('couponAllkeyshop').value || null,
        screenshot_paypal: document.getElementById('screenshotPaypal').value || null,
        screenshot_card: document.getElementById('screenshotCard').value || null,
        screenshot_ggdeals: document.getElementById('screenshotGgdeals').value || null,
        screenshot_allkeyshop: document.getElementById('screenshotAllkeyshop').value || null,
        notes: document.getElementById('checkNotes').value
    };

    await fetch(`/api/offers/${offerId}/checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    closeCheckModal();
    loadOffers();
}

// ==================== HISTORY ====================

async function showHistory(offerId) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    const response = await fetch(`/api/offers/${offerId}/checks`);
    const checks = await response.json();

    const modal = document.getElementById('historyModal');
    const title = document.getElementById('historyTitle');
    const content = document.getElementById('historyContent');

    title.textContent = `History - ${offer.name}`;

    if (checks.length === 0) {
        content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <h3>No checks</h3>
          <p>Click "New Check" to add data</p>
        </div>
      `;
    } else {
        content.innerHTML = checks.map(check => {
            const refPrice = check.reference_price || offer.displayed_price;
            const refDisplay = refPrice ? refPrice.toFixed(2) + ' €' : 'N/A';

            const ggPrice = check.price_ggdeals_card || check.price_ggdeals_paypal || check.price_ggdeals;
            const aksPrice = check.price_aks_card || check.price_aks_paypal || check.price_allkeyshop;

            const ggDealsGap = refPrice && ggPrice ? (ggPrice - refPrice).toFixed(2) : null;
            const aksGap = refPrice && aksPrice ? (aksPrice - refPrice).toFixed(2) : null;

            return `
        <div class="history-item">
          <div class="history-date">📅 ${formatDate(check.check_date)}</div>

          <div class="history-comparison">
            <div class="history-section">
              <div class="history-section-title">🏷️ Offer Reference</div>
              <div class="history-prices" style="grid-template-columns: 1fr;">
                <div class="history-price">
                  <div class="history-price-label">Merchant Price</div>
                  <div class="history-price-value">
                    ${refDisplay}
                  </div>
                </div>
              </div>
            </div>

            <div class="history-section">
              <div class="history-section-title">📊 Comparator Prices</div>
              <div class="history-prices" style="grid-template-columns: 1fr 1fr;">
                <div class="history-price">
                  <div class="history-price-label">GGDeals ${ggDealsGap ? `(${ggDealsGap > 0 ? '+' : ''}${ggDealsGap}€)` : ''}</div>
                  <div class="history-price-value ${check.price_ggdeals || check.price_ggdeals_paypal || check.price_ggdeals_card ? '' : 'empty'}">
                    ${(check.price_ggdeals_card || check.price_ggdeals_paypal || check.price_ggdeals || 0).toFixed(2)} €
                    ${check.coupon_ggdeals ? `<div class="coupon-tag">🏷️ ${check.coupon_ggdeals}</div>` : ''}
                  </div>
                </div>
                <div class="history-price">
                  <div class="history-price-label">AllKeyShop ${aksGap ? `(${aksGap > 0 ? '+' : ''}${aksGap}€)` : ''}</div>
                  <div class="history-price-value ${check.price_allkeyshop || check.price_aks_paypal || check.price_aks_card ? '' : 'empty'}">
                    ${(check.price_aks_card || check.price_aks_paypal || check.price_allkeyshop || 0).toFixed(2)} €
                    ${check.coupon_aks ? `<div class="coupon-tag">🏷️ ${check.coupon_aks}</div>` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          ${renderScreenshots(check)}
          ${check.notes ? `<div class="history-notes">📝 ${escapeHtml(check.notes)}</div>` : ''}
          <div class="history-actions">
            <button class="btn btn-danger btn-sm" onclick="deleteCheck(${check.id}, ${offerId})">🗑️ Delete</button>
          </div>
        </div>
      `}).join('');
    }

    modal.classList.add('active');
}

function renderScreenshots(check) {
    const screenshots = [];
    if (check.screenshot_paypal) screenshots.push({ label: 'PayPal', src: check.screenshot_paypal });
    if (check.screenshot_card) screenshots.push({ label: 'Card', src: check.screenshot_card });
    if (check.screenshot_ggdeals) screenshots.push({ label: 'GGDeals', src: check.screenshot_ggdeals });
    if (check.screenshot_allkeyshop) screenshots.push({ label: 'AllKeyShop', src: check.screenshot_allkeyshop });

    if (screenshots.length === 0) return '';

    return `
    <div class="history-screenshots">
      ${screenshots.map(s => `
        <img src="${s.src}" alt="${s.label}" class="history-screenshot"
             onclick="window.open('${s.src}', '_blank')" title="${s.label}">
      `).join('')}
    </div>
  `;
}

function closeHistoryModal() {
    document.getElementById('historyModal').classList.remove('active');
}

async function deleteCheck(checkId, offerId) {
    if (!confirm('Delete this check?')) return;
    await fetch(`/api/checks/${checkId}`, { method: 'DELETE' });
    showHistory(offerId);
}

// ==================== PASTE HANDLERS ====================

function setupPasteHandlers() {
    const dropZones = ['Displayed', 'Paypal', 'Card', 'Ggdeals', 'Allkeyshop'];

    dropZones.forEach(type => {
        const drop = document.getElementById('drop' + type);
        if (!drop) return;

        drop.addEventListener('click', () => {
            currentDropZone = type;
            drop.focus();
        });

        drop.addEventListener('focus', () => {
            currentDropZone = type;
        });

        drop.addEventListener('paste', handlePaste);
    });

    document.addEventListener('paste', (e) => {
        if (currentDropZone && document.activeElement.classList.contains('screenshot-drop')) {
            handlePaste(e);
        }
    });
}

async function handlePaste(event) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
        if (item.type.startsWith('image/')) {
            event.preventDefault();

            const blob = item.getAsFile();
            const reader = new FileReader();

            reader.onload = async (e) => {
                const base64 = e.target.result;

                const response = await fetch('/api/upload-base64', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: base64 })
                });

                const result = await response.json();

                if (result.path && currentDropZone) {
                    setScreenshotPreview(currentDropZone, result.path);
                }
            };

            reader.readAsDataURL(blob);
            break;
        }
    }
}

function setScreenshotPreview(type, path) {
    const drop = document.getElementById('drop' + type);
    const preview = document.getElementById('preview' + type);
    const input = document.getElementById('screenshot' + type);

    if (drop && preview && input) {
        drop.classList.add('has-image');
        preview.src = path;
        input.value = path;
    }
}

function resetScreenshotZone(type) {
    const drop = document.getElementById('drop' + type);
    const preview = document.getElementById('preview' + type);
    const input = document.getElementById('screenshot' + type);

    if (drop && preview && input) {
        drop.classList.remove('has-image');
        preview.src = '';
        input.value = '';
    }
}

// ==================== UTILITIES ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
