/**
 * Main Application Module
 * Sambal Balado Clan
 */

import { fetchClanData } from './api.js';
import { renderAbout } from './render.js';

// Global state
let latestClanData = null;

// Mengatur tampilan About
function switchView() {
    document.querySelectorAll('[id^="section-"]').forEach(section => {
        section.classList.add('hidden-section');
    });

    document.getElementById('section-about')
        ?.classList.remove('hidden-section');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById('tab-about')
        ?.classList.add('active');
}

// Memperbarui header clan
function updateHeader(name, badgeUrl) {
    const title = document.getElementById('pageTitle');
    const badge = document.getElementById('clanBadge');

    if (title) title.textContent = name;

    if (badge && badgeUrl) {
        badge.src = badgeUrl;
        badge.classList.remove('hidden');
    }
}

// Mengambil data clan
async function init() {
    try {
        const clanData = await fetchClanData();

        latestClanData = clanData;

        renderAbout(clanData);

        updateHeader(
            clanData.name,
            clanData.badgeUrls?.medium || clanData.badgeUrls?.small
        );

        switchView();

    } catch (error) {
        console.error('Failed to load clan data:', error);
    }
}

// Refresh data
async function syncData() {
    const buttons = document.querySelectorAll('.sync-btn');

    buttons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('syncing');
    });

    try {
        await init();
    } finally {
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('syncing');
        });
    }
}

// Global refresh function
window.syncData = syncData;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    switchView();
    init();

    // About tab
    document.getElementById('tab-about')
        ?.addEventListener('click', switchView);

    // Refresh buttons
    document.querySelectorAll('.sync-btn').forEach(btn => {
        btn.addEventListener('click', syncData);
    });
});