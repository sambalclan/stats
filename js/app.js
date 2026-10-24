/**
 * Main Application
 * Sambal Balado Clan
 */

import { fetchClanData } from './api.js';
import { renderAbout } from './render.js';

// Mengambil dan menampilkan data clan
async function init() {
    const container = document.getElementById('aboutContent');

    try {
        const clan = await fetchClanData();

        renderAbout(clan);

        // Update header
        const title = document.getElementById('pageTitle');
        const badge = document.getElementById('clanBadge');

        if (title) title.textContent = clan.name;

        if (badge) {
            badge.src = clan.badgeUrls?.medium || '';
        }

    } catch (error) {
        console.error('Failed to load clan:', error);

        if (container) {
            container.innerHTML = `
                <p class="text-center text-red-400">
                    Failed to load clan data.
                </p>
            `;
        }
    }
}

// Refresh data
async function syncData() {
    const buttons = document.querySelectorAll('.sync-btn');

    buttons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50');
    });

    try {
        await init();
    } finally {
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('opacity-50');
        });
    }
}

// Inisialisasi website
document.addEventListener('DOMContentLoaded', () => {
    init();

    document.querySelectorAll('.sync-btn').forEach(btn => {
        btn.addEventListener('click', syncData);
    });
});