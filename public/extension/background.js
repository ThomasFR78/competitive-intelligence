// Production URL - Competitive Intelligence API
const API_URL = 'https://competitive-intelligence-pearl.vercel.app';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'capture-price',
        title: 'Capture this price: "%s"',
        contexts: ['selection']
    });
    chrome.contextMenus.create({
        id: 'create-offer-price',
        title: 'Create offer with price: "%s"',
        contexts: ['selection']
    });
    chrome.contextMenus.create({
        id: 'capture-price-manual',
        title: 'Capture price (Manual)',
        contexts: ['page', 'link']
    });
    chrome.contextMenus.create({
        id: 'capture-page',
        title: 'Capture this page',
        contexts: ['page']
    });
    chrome.contextMenus.create({
        id: 'add-offer',
        title: 'Add as offer to track',
        contexts: ['page', 'link']
    });
    chrome.contextMenus.create({
        id: 'update-offer-price',
        title: 'Update offer price: "%s"',
        contexts: ['selection']
    });
});

async function safeSendMessage(tabId, message) {
    try {
        await chrome.tabs.sendMessage(tabId, message);
    } catch (e) {
        console.warn('Cannot send message to content script.', e);
    }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        return;
    }

    if (info.menuItemId === 'capture-price') {
        const price = extractPrice(info.selectionText);
        const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

        safeSendMessage(tab.id, {
            action: 'show-capture-popup',
            data: {
                price: price,
                url: tab.url,
                title: tab.title,
                screenshot: screenshot,
                selectedText: info.selectionText
            }
        });
    }

    if (info.menuItemId === 'capture-price-manual') {
        const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

        safeSendMessage(tab.id, {
            action: 'show-capture-popup',
            data: {
                price: '',
                url: tab.url,
                title: tab.title,
                screenshot: screenshot,
                selectedText: null
            }
        });
    }

    if (info.menuItemId === 'create-offer-price') {
        const price = extractPrice(info.selectionText);
        handleCreateOffer(tab, tab.url, price);
    }

    if (info.menuItemId === 'capture-page') {
        const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

        safeSendMessage(tab.id, {
            action: 'show-capture-popup',
            data: {
                url: tab.url,
                title: tab.title,
                screenshot: screenshot
            }
        });
    }

    if (info.menuItemId === 'add-offer') {
        const url = info.linkUrl || tab.url;
        handleCreateOffer(tab, url);
    }

    if (info.menuItemId === 'update-offer-price') {
        const price = extractPrice(info.selectionText);
        const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

        safeSendMessage(tab.id, {
            action: 'show-update-offer-popup',
            data: {
                price: price,
                url: tab.url,
                title: tab.title,
                screenshot: screenshot,
                selectedText: info.selectionText
            }
        });
    }
});

async function handleCreateOffer(tab, url, price = null) {
    try {
        const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

        safeSendMessage(tab.id, {
            action: 'show-add-offer-popup',
            data: {
                url: url,
                title: tab.title,
                screenshot: screenshot,
                price: price
            }
        });
    } catch (e) {
        safeSendMessage(tab.id, {
            action: 'show-add-offer-popup',
            data: {
                url: url,
                title: tab.title,
                price: price
            }
        });
    }
}

function extractPrice(text) {
    if (!text) return null;
    const patterns = [
        /(\d+[.,]\d{2})\s*€/,
        /€\s*(\d+[.,]\d{2})/,
        /EUR\s*(\d+[.,]\d{2})/i,
        /(\d+[.,]\d{2})\s*EUR/i,
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'save-price-check') {
        savePriceCheck(message.data).then(sendResponse);
        return true;
    }
    if (message.action === 'save-offer') {
        saveOffer(message.data).then(sendResponse);
        return true;
    }
    if (message.action === 'update-offer') {
        updateOffer(message.data).then(sendResponse);
        return true;
    }
    if (message.action === 'get-offers') {
        getOffers().then(sendResponse);
        return true;
    }
    if (message.action === 'upload-screenshot') {
        uploadScreenshot(message.data).then(sendResponse);
        return true;
    }
});

async function getOffers() {
    try {
        const response = await fetch(`${API_URL}/api/offers`);
        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
}

async function saveOffer(data) {
    try {
        const response = await fetch(`${API_URL}/api/offers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
}

async function updateOffer(data) {
    try {
        const response = await fetch(`${API_URL}/api/offers/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
}

async function uploadScreenshot(base64Data) {
    try {
        const response = await fetch(`${API_URL}/api/upload-base64`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: base64Data })
        });
        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
}

async function savePriceCheck(data) {
    try {
        const response = await fetch(`${API_URL}/api/offers/${data.offerId}/checks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
}
