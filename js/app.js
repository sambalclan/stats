/**
 * Main Application Module
 * Sambal Balado Clan
 */

import { fetchClanData, fetchWarIndex, fetchWarData } from './api.js';
import { renderAbout, renderMembers, renderWar, setWarData } from './render.js';

// Global state
let latestClanData = null;
let currentView = 'about';

// Halaman yang tersedia (id section: section-<nama>, id tab: tab-<nama>)
const VIEWS = ['about', 'members', 'war'];

// Mengatur halaman yang tampil (about / members / war)
function switchView(view = 'about') {
    const hasSection = document.getElementById('section-' + view);
    const target = VIEWS.includes(view) && hasSection ? view : 'about';
    currentView = target;

    document.querySelectorAll('[id^="section-"]').forEach(section => {
        const isTarget = section.id === 'section-' + target;
        section.classList.toggle('hidden-section', !isTarget);
        section.style.display = isTarget ? '' : 'none';
    });

    document.querySelectorAll('#bottomToolbar button').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById('tab-' + target)
        ?.classList.add('active');
}

// Tombol tab di navigasi bawah
function bindTabs() {
    VIEWS.forEach(view => {
        document.getElementById('tab-' + view)
            ?.addEventListener('click', () => switchView(view));
    });
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

function bindAboutPageEvents() {
    const btn = document.getElementById('viewWarHistoryBtn');
    if (btn) btn.onclick = () => { switchView('war'); };
}

// Mengambil data war terbaru
async function loadWarData() {
    try {
        const index = await fetchWarIndex();
        if (!index || index.length === 0) {
            renderWar(null);
            return;
        }
        const warData = await fetchWarData(index[0]);
        setWarData(warData);
        renderWar(warData);
    } catch (error) {
        console.warn('Gagal memuat data war:', error);
        renderWar(null);
    }
}

// Mengambil data clan
async function init() {
    try {
        const clanData = await fetchClanData();

        latestClanData = clanData;

        renderAbout(clanData);
        renderMembers(clanData);
        bindAboutPageEvents();

        updateHeader(
            clanData.name,
            clanData.badgeUrls?.medium || clanData.badgeUrls?.small
        );

        switchView(currentView);

        await loadWarData();

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

    // Tab About, Members & Competitive
    bindTabs();

    // Refresh buttons
    document.querySelectorAll('.sync-btn').forEach(btn => {
        btn.addEventListener('click', syncData);
    });
});
