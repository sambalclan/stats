/**
 * Rendering Module
 * Responsible for generating all dynamic HTML content for the dashboard.
 */
import {  parseCoCDate } from './constants.js';

/**
 * Renders the member roster list with league icons and donation stats.
 */
export function renderMembers(list) {}
/**
 * Returns a simple string label for TH differentials.
 */
function getDifficultyLabel(targetTH, actorTH) {}


function getCountdown(endTimeStr) {
    const end = parseCoCDate(endTimeStr);
    if (!end) return "00:00:00";
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) return "00:00:00";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Global state for war detail filters
let countdownInterval = null;
let currentWarFilters = {
    attacks: 'all',
    difficulty: 'all',
    performance: 'all',
    sortBy: 'mapPosition',
    selectedClan: 'clan',
    viewType: 'attacks', 
    strategy: 'Mirror'
};

export function renderWarHistory(warHistory) {
    const container = document.getElementById('warHistoryList');
    if (!container) return;
    if (warHistory.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-600 italic py-10 font-light text-sm">No wars found for this range.</p>`;
        return;
    }
    const now = new Date();
    const sorted = [...warHistory].sort((a, b) => {
        const aEnd = parseCoCDate(a.endTime);
        const bEnd = parseCoCDate(b.endTime);
        const aActive = now < aEnd ? 1 : 0;
        const bActive = now < bEnd ? 1 : 0;
        if (aActive !== bActive) return bActive - aActive;
        return b.startTime.localeCompare(a.startTime);
    });
    if (countdownInterval) clearInterval(countdownInterval);
    
    container.innerHTML = sorted.map(war => `
        <div onclick="window.loadWarDetail('${war.filename}')" class="cursor-pointer hover:border-gold group">
            ${getWarSummaryHtml(war, now)}
        </div>
    `).join('');
    
    countdownInterval = setInterval(() => {
        document.querySelectorAll('[id^="cd-"]').forEach(el => {
            const warFile = el.id.replace('cd-', '');
            const warObj = (warFile === 'detail' && window.activeWarData) ? window.activeWarData : warHistory.find(w => w.filename === warFile);
            if (warObj) {
                const startT = parseCoCDate(warObj.startTime);
                const target = now < startT ? warObj.startTime : warObj.endTime;
                el.innerText = getCountdown(target);
            }
        });
    }, 1000);
}

/**
 * Generates a member card showing either Attacks or Defenses.


/**
 * MATH: Win Probability Logic with Resource-Weighted Simulation
 */


/**
 * Main War Detail View
 */
export function renderWarDetail(warData, history = []) {}

export function renderAbout(clanData) {
    const container = document.getElementById('aboutContent'); if (!container || !clanData) return;
    const labelsHtml = (clanData.labels || []).map(l => `<div class="flex items-center gap-1.5 bg-[#252525] px-2 py-1 rounded border border-gray-800"><img src="${l.iconUrls.small}" class="w-3.5 h-3.5"><span class="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase">${l.name}</span></div>`).join('');
    container.innerHTML = `<div class="panel p-4 md:p-6 space-y-6 md:space-y-8">
        <div class="bg-[#1a1a1a] p-4 md:p-6 rounded-xl border border-gray-800">
            <div class="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                <div class="flex-1 space-y-4 w-full">
                    <div class="flex items-center gap-4">
                        <img src="${clanData.badgeUrls.medium}" class="w-16 h-16 md:w-20 md:h-20">
                        <div>
                            <h2 class="medieval text-xl md:text-2xl font-bold gold">${clanData.name}</h2>
                            <div class="flex items-center gap-2 mt-1"><span class="text-[10px] md:text-xs font-mono text-gray-500">${clanData.tag}</span></div>
                        </div>
                    </div>
                    <p class="text-[11px] md:text-sm text-gray-300 leading-relaxed italic">${clanData.description}</p>
                </div>
                <div class="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 w-full md:w-auto md:min-w-[350px]">
                    <div><p class="stat-label">Location</p><p class="stat-value text-[11px] md:text-xs">${clanData.location?.name || 'Unknown'}</p></div>
                    <div><p class="stat-label">Language</p><p class="stat-value text-[11px] md:text-xs">${clanData.chatLanguage?.name || 'English'}</p></div>
                    <div><p class="stat-label">Clan Level</p><p class="stat-value text-gold text-[11px] md:text-xs">${clanData.clanLevel}</p></div>
                    <div><p class="stat-label">Family Friendly</p><p class="stat-value text-[11px] md:text-xs">${clanData.isFamilyFriendly ? 'Yes' : 'No'}</p></div>
                    <div class="col-span-2"><p class="stat-label mb-2">Clan Labels</p><div class="flex flex-wrap gap-2">${labelsHtml}</div></div>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-[#1a1a1a] p-4 md:p-5 rounded-xl border border-gray-800 flex flex-col justify-between min-h-[250px] md:min-h-[300px]">
                <div class="flex-1 flex flex-col">
                    <h3 class="medieval text-xs md:text-sm font-bold gold mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        War Performance
                    </h3>
                    <div class="space-y-3 md:space-y-4 flex-1">
                        <div class="p-3 bg-[#252525] rounded-lg h-[58px] flex flex-col justify-center"><p class="stat-label">War League</p><p class="stat-value text-white text-[11px] md:text-xs">${clanData.warLeague?.name || 'Unranked'}</p></div>
                        <div class="grid grid-cols-3 gap-2">
                            <div class="text-center p-2 bg-[#252525] rounded-lg h-[58px] flex flex-col justify-center"><p class="stat-label">Victories</p><p class="text-green-500 font-bold text-[11px] md:text-xs">${clanData.warWins}</p></div>
                            <div class="text-center p-2 bg-[#252525] rounded-lg h-[58px] flex flex-col justify-center"><p class="stat-label">Defeats</p><p class="text-red-500 font-bold text-[11px] md:text-xs">${clanData.warLosses}</p></div>
                            <div class="text-center p-2 bg-[#252525] rounded-lg h-[58px] flex flex-col justify-center"><p class="stat-label">DRAWS</p><p class="text-gray-500 font-bold text-[11px] md:text-xs">${clanData.warTies}</p></div>
                        </div>
                        <button id="viewWarHistoryBtn" class="w-full py-2 bg-[#252525] border border-gray-700 rounded h-[58px] text-[9px] md:text-[10px] font-bold uppercase hover:border-gold transition-colors">View War History <span class="ml-1 opacity-70">›</span></button>
                    </div>
                </div>
            </div>
            <div class="bg-[#1a1a1a] p-4 md:p-5 rounded-xl border border-gray-800 flex flex-col justify-between min-h-[250px] md:min-h-[300px]">
                <div>
                    <h3 class="medieval text-xs md:text-sm font-bold gold mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4m0 10V4m-2 4h1m1 4h1m-3 10a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3z" /></svg>
                        Clan Capital
                    </h3>
                    <div class="space-y-3 md:space-y-4">
                        <div class="p-3 bg-[#252525] rounded-lg h-[58px] flex flex-col justify-center"><p class="stat-label">Capital League</p><p class="stat-value text-white text-[11px] md:text-xs">${clanData.capitalLeague?.name || 'Unranked'}</p></div>
                        <div class="p-3 bg-[#252525] rounded-lg h-[58px] flex flex-col justify-center"><p class="stat-label">Capital Hall Level</p><p class="stat-value text-white text-[11px] md:text-xs">Level ${clanData.clanCapital?.capitalHallLevel || 'Unknown'}</p></div>
                        <div class="p-3 bg-[#252525] rounded-lg h-[58px] flex flex-col justify-center"><p class="stat-label">Districts Unlocked</p><p class="stat-value text-white text-[11px] md:text-xs">${(clanData.clanCapital?.districts || []).length} Districts</p></div>
                    </div>
                </div>
            </div>
            <div class="bg-[#1a1a1a] p-4 md:p-5 rounded-xl border border-gray-800 flex flex-col justify-between min-h-[250px] md:min-h-[300px]">
                <div>
                    <h3 class="medieval text-xs md:text-sm font-bold gold mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Join Requirements
                    </h3>
                    <div class="space-y-3 md:space-y-4">
                        <div class="p-3 bg-[#252525] rounded-lg flex justify-between items-center h-[58px]"><p class="stat-label">Required Trophies</p><p class="stat-value text-white text-[11px] md:text-xs">${clanData.requiredTrophies.toLocaleString()}</p></div>
                        <div class="p-3 bg-[#252525] rounded-lg flex justify-between items-center h-[58px]"><p class="stat-label">Min. Town Hall</p><p class="stat-value text-white text-[11px] md:text-xs">TH${clanData.requiredTownhallLevel}</p></div>
                        <div class="p-3 bg-[#252525] rounded-lg flex justify-between items-center h-[58px]"><p class="stat-label">Builder Trophies</p><p class="stat-value text-white text-[11px] md:text-xs">${clanData.requiredBuilderBaseTrophies.toLocaleString()}</p></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}
