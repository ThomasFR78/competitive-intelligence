let currentPopup = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'show-capture-popup') {
    showCapturePopup(message.data);
  }
  if (message.action === 'show-add-offer-popup') {
    showAddOfferPopup(message.data);
  }
  if (message.action === 'show-update-offer-popup') {
    showUpdateOfferPopup(message.data);
  }
});

async function showUpdateOfferPopup(data) {
  closePopup();

  const offers = await new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'get-offers' }, resolve);
  });

  if (offers.error) {
    showNotification('Error: Price Tracker server not accessible', 'error');
    return;
  }

  const popup = document.createElement('div');
  popup.className = 'pt-popup';
  popup.innerHTML = `
    <div class="pt-popup-header">
      <h3>Update Offer Price</h3>
      <button class="pt-close" onclick="this.closest('.pt-popup').remove()">×</button>
    </div>
    <div class="pt-popup-body">
      ${data.selectedText ? `<p class="pt-selected">"${data.selectedText}"</p>` : ''}

      <div class="pt-field">
        <label>Select offer to update</label>
        <select id="pt-offer-update-select">
          <option value="">-- Select an offer --</option>
          ${offers.map(o => {
    const icon = o.payment_method === 'paypal' ? '🅿️' : '💳';
    return `<option value="${o.id}" data-url="${o.url}" data-name="${o.name}" data-store="${o.store}" data-region="${o.region}" data-method="${o.payment_method}">
              ${icon} ${o.name} (${o.store}) - ${o.displayed_price}€
            </option>`;
  }).join('')}
        </select>
      </div>

      <div class="pt-field">
        <label>New Displayed Price (€)</label>
        <input type="text" id="pt-update-price" value="${data.price || ''}" placeholder="0.00">
      </div>

      <div class="pt-field">
        <label>
          <input type="checkbox" id="pt-update-screenshot" checked>
          Update screenshot
        </label>
        ${data.screenshot ? `<img src="${data.screenshot}" class="pt-screenshot-preview">` : ''}
      </div>

      <div class="pt-actions">
        <button class="pt-btn pt-btn-secondary" onclick="this.closest('.pt-popup').remove()">Cancel</button>
        <button class="pt-btn pt-btn-primary" id="pt-update-btn">Update</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  currentPopup = popup;

  popup.querySelector('#pt-update-btn').addEventListener('click', async () => {
    const select = popup.querySelector('#pt-offer-update-select');
    const offerId = select.value;
    const option = select.selectedOptions[0];

    let priceInput = popup.querySelector('#pt-update-price').value;
    priceInput = priceInput.replace(/€/g, '').replace(/\s/g, '').replace(',', '.');
    const priceValue = parseFloat(priceInput);

    const updateScreenshot = popup.querySelector('#pt-update-screenshot').checked;

    if (!offerId) {
      showNotification('Select an offer', 'warning');
      return;
    }

    if (isNaN(priceValue)) {
      showNotification('Invalid price', 'warning');
      return;
    }

    let screenshotPath = null;
    if (updateScreenshot && data.screenshot) {
      const uploadResult = await new Promise(resolve => {
        chrome.runtime.sendMessage({
          action: 'upload-screenshot',
          data: data.screenshot
        }, resolve);
      });
      screenshotPath = uploadResult.path;
    }

    const offerData = {
      id: parseInt(offerId),
      url: option.getAttribute('data-url'),
      name: option.getAttribute('data-name'),
      store: option.getAttribute('data-store'),
      region: option.getAttribute('data-region'),
      payment_method: option.getAttribute('data-method'),
      displayed_price: priceValue,
      displayed_price_screenshot: screenshotPath
    };

    const result = await new Promise(resolve => {
      chrome.runtime.sendMessage({
        action: 'update-offer',
        data: offerData
      }, resolve);
    });

    if (result.error) {
      showNotification('Error: ' + result.error, 'error');
    } else {
      showNotification('Offer updated!', 'success');
      closePopup();
    }
  });
}

async function showCapturePopup(data) {
  closePopup();

  const offers = await new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'get-offers' }, resolve);
  });

  if (offers.error) {
    showNotification('Error: Price Tracker server not accessible', 'error');
    return;
  }

  const popup = document.createElement('div');
  popup.className = 'pt-popup';
  popup.innerHTML = `
    <div class="pt-popup-header">
      <h3>Capture Price</h3>
      <button class="pt-close" onclick="this.closest('.pt-popup').remove()">×</button>
    </div>
    <div class="pt-popup-body">
      ${data.selectedText ? `<p class="pt-selected">"${data.selectedText}"</p>` : ''}

      <div class="pt-field">
        <label>Related Offer</label>
        <select id="pt-offer-select">
          <option value="">-- Select an offer --</option>
          ${offers.map(o => {
    const icon = o.payment_method === 'paypal' ? '🅿️' : '💳';
    return `<option value="${o.id}" data-method="${o.payment_method || 'card'}">${icon} ${o.name} (${o.store})</option>`;
  }).join('')}
        </select>
      </div>

      <div class="pt-field">
        <label class="pt-section-label">COMPARATOR</label>
        <div class="pt-radio-group">
          <label class="pt-radio-pill">
            <input type="radio" name="pt-source" value="aks" checked>
            <span>AllKeyShop</span>
          </label>
          <label class="pt-radio-pill">
            <input type="radio" name="pt-source" value="ggdeals">
            <span>GGDeals</span>
          </label>
        </div>
      </div>

      <div class="pt-field" id="pt-coupon-field" style="display: none;">
        <label>Coupon Code (Optional)</label>
        <input type="text" id="pt-coupon-value" placeholder="e.g. AKS8, -5%...">
      </div>

      <div class="pt-field" id="pt-payment-field">
        <label class="pt-section-label">PAYMENT METHOD</label>
        <div class="pt-radio-group">
          <label class="pt-radio-pill">
            <input type="radio" name="pt-method" value="card" checked>
            <span>Card</span>
          </label>
          <label class="pt-radio-pill">
            <input type="radio" name="pt-method" value="paypal">
            <span>PayPal</span>
          </label>
        </div>
      </div>

      <div class="pt-field">
        <label>Price (€)</label>
        <input type="text" id="pt-price-value" value="${data.price || ''}" placeholder="0.00">
      </div>

      <div class="pt-field">
        <label>
          <input type="checkbox" id="pt-include-screenshot" checked>
          Include screenshot
        </label>
        ${data.screenshot ? `<img src="${data.screenshot}" class="pt-screenshot-preview">` : ''}
      </div>

      <div class="pt-actions">
        <button class="pt-btn pt-btn-secondary" onclick="this.closest('.pt-popup').remove()">Cancel</button>
        <button class="pt-btn pt-btn-primary" id="pt-save-btn">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  currentPopup = popup;

  const offerSelect = popup.querySelector('#pt-offer-select');
  const paymentField = popup.querySelector('#pt-payment-field');

  function updatePaymentMethod() {
    const selectedOption = offerSelect.selectedOptions[0];
    const method = selectedOption.getAttribute('data-method');

    if (method) {
      const radio = popup.querySelector(`input[name="pt-method"][value="${method}"]`);
      if (radio) radio.checked = true;
      paymentField.style.display = 'none';
    } else {
      paymentField.style.display = 'block';
    }
  }

  offerSelect.addEventListener('change', updatePaymentMethod);

  const couponField = popup.querySelector('#pt-coupon-field');
  const sourceRadios = popup.querySelectorAll('input[name="pt-source"]');

  function toggleCoupon() {
    const source = popup.querySelector('input[name="pt-source"]:checked').value;
    if (source === 'aks' || source === 'ggdeals') {
      couponField.style.display = 'block';
    } else {
      couponField.style.display = 'none';
    }
  }

  toggleCoupon();
  sourceRadios.forEach(r => r.addEventListener('change', toggleCoupon));

  popup.querySelector('#pt-save-btn').addEventListener('click', async () => {
    const offerId = popup.querySelector('#pt-offer-select').value;
    const source = popup.querySelector('input[name="pt-source"]:checked').value;
    const method = popup.querySelector('input[name="pt-method"]:checked').value;
    let priceInput = popup.querySelector('#pt-price-value').value;

    priceInput = priceInput.replace(/€/g, '').replace(/\s/g, '').replace(',', '.');
    const priceValue = parseFloat(priceInput);

    const includeScreenshot = popup.querySelector('#pt-include-screenshot').checked;
    const couponValue = popup.querySelector('#pt-coupon-value').value;

    if (!offerId) {
      showNotification('Select an offer', 'warning');
      return;
    }

    if (!priceValue || isNaN(priceValue)) {
      showNotification('Enter a valid price', 'warning');
      return;
    }

    let screenshotPath = null;
    if (includeScreenshot && data.screenshot) {
      const uploadResult = await new Promise(resolve => {
        chrome.runtime.sendMessage({
          action: 'upload-screenshot',
          data: data.screenshot
        }, resolve);
      });
      screenshotPath = uploadResult.path;
    }

    let priceKey = '';
    let couponKey = '';

    if (source === 'real') {
      priceKey = `price_${method}`;
    } else if (source === 'ggdeals') {
      priceKey = `price_ggdeals_${method}`;
      couponKey = 'coupon_ggdeals';
    } else if (source === 'aks') {
      priceKey = `price_aks_${method}`;
      couponKey = 'coupon_aks';
    }

    const checkData = {
      offerId: parseInt(offerId),
      [priceKey]: priceValue,
      [`screenshot_${source === 'real' ? method : source}`]: screenshotPath,
      [couponKey]: couponValue || null,
      notes: `Captured from: ${data.url}`
    };

    const result = await new Promise(resolve => {
      chrome.runtime.sendMessage({
        action: 'save-price-check',
        data: checkData
      }, resolve);
    });

    if (result.error) {
      showNotification('Error: ' + result.error, 'error');
    } else {
      showNotification('Price saved!', 'success');
      closePopup();
    }
  });
}

function showAddOfferPopup(data) {
  closePopup();

  let productName = '';
  try {
    const urlObj = new URL(data.url);
    const pathSegments = urlObj.pathname.split('/').filter(s => s.length > 0);
    if (pathSegments.length > 0) {
      let slug = pathSegments[pathSegments.length - 1];
      productName = slug.replace(/[-_]/g, ' ');
      productName = productName.replace(/^\d+\s+/, '');
      productName = productName.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
    } else {
      productName = data.title || '';
      productName = productName.split(' - ')[0].split(' | ')[0].trim();
    }
  } catch (e) {
    productName = data.title || '';
  }

  let store = '';
  try {
    const url = new URL(data.url);
    store = url.hostname.replace('www.', '').split('.')[0];
    store = store.charAt(0).toUpperCase() + store.slice(1);
  } catch (e) { }

  const popup = document.createElement('div');
  popup.className = 'pt-popup';
  popup.innerHTML = `
    <div class="pt-popup-header">
      <h3>Add Offer</h3>
      <button class="pt-close" onclick="this.closest('.pt-popup').remove()">×</button>
    </div>
    <div class="pt-popup-body">
      <div class="pt-field">
        <label>URL</label>
        <input type="url" id="pt-offer-url" value="${data.url}">
      </div>

      <div class="pt-field">
        <label>Product Name</label>
        <input type="text" id="pt-offer-name" value="${productName}" placeholder="Game name...">
      </div>

      <div class="pt-field">
        <label>Store</label>
        <input type="text" id="pt-offer-store" value="${store}" placeholder="Driffle, Kinguin...">
      </div>

      <div class="pt-field">
        <label>Region</label>
        <select id="pt-offer-region">
          <option value="global">🌍 Global</option>
          <option value="europe">🇪🇺 Europe</option>
        </select>
      </div>

      <div class="pt-field">
        <label>Payment Method</label>
        <div class="pt-radio-group">
          <label class="pt-radio-pill">
            <input type="radio" name="pt-offer-method" value="card" checked>
            <span>💳 Card</span>
          </label>
          <label class="pt-radio-pill">
            <input type="radio" name="pt-offer-method" value="paypal">
            <span>🅿️ PayPal</span>
          </label>
        </div>
      </div>

      <div class="pt-field">
        <label>Displayed Price (€)</label>
        <input type="number" step="0.01" id="pt-offer-price" placeholder="0.00" value="${data.price || ''}">
      </div>

      <div class="pt-field">
        <label>
          <input type="checkbox" id="pt-offer-screenshot" checked>
          Include screenshot
        </label>
        ${data.screenshot ? `<img src="${data.screenshot}" class="pt-screenshot-preview">` : ''}
      </div>

      <div class="pt-actions">
        <button class="pt-btn pt-btn-secondary" onclick="this.closest('.pt-popup').remove()">Cancel</button>
        <button class="pt-btn pt-btn-primary" id="pt-save-offer-btn">Add</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  currentPopup = popup;

  popup.querySelector('#pt-save-offer-btn').addEventListener('click', async () => {
    const includeScreenshot = popup.querySelector('#pt-offer-screenshot').checked;

    let screenshotPath = null;
    if (includeScreenshot && data.screenshot) {
      const uploadResult = await new Promise(resolve => {
        chrome.runtime.sendMessage({
          action: 'upload-screenshot',
          data: data.screenshot
        }, resolve);
      });
      screenshotPath = uploadResult.path;
    }

    const offerData = {
      url: popup.querySelector('#pt-offer-url').value,
      name: popup.querySelector('#pt-offer-name').value,
      store: popup.querySelector('#pt-offer-store').value,
      region: popup.querySelector('#pt-offer-region').value,
      displayed_price: parseFloat(popup.querySelector('#pt-offer-price').value),
      displayed_price_screenshot: screenshotPath,
      payment_method: popup.querySelector('input[name="pt-offer-method"]:checked').value
    };

    if (!offerData.name) {
      showNotification('Enter a product name', 'warning');
      return;
    }

    if (isNaN(offerData.displayed_price)) {
      showNotification('Displayed price is required', 'warning');
      return;
    }

    const result = await new Promise(resolve => {
      chrome.runtime.sendMessage({
        action: 'save-offer',
        data: offerData
      }, resolve);
    });

    if (result.error) {
      showNotification('Error: ' + result.error, 'error');
    } else {
      showNotification('Offer added!', 'success');
      closePopup();
    }
  });
}

function closePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
}

function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `pt-notification pt-notification-${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.classList.add('pt-notification-hide');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();

    const selectedText = window.getSelection().toString().trim();

    if (selectedText) {
      showCapturePopup({
        selectedText: selectedText,
        price: extractPriceFromText(selectedText),
        url: window.location.href,
        title: document.title
      });
    } else {
      showAddOfferPopup({
        url: window.location.href,
        title: document.title
      });
    }
  }
});

function extractPriceFromText(text) {
  const patterns = [
    /(\d+[.,]\d{2})\s*€/,
    /€\s*(\d+[.,]\d{2})/,
    /(\d+[.,]\d{2})/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }
  return null;
}
