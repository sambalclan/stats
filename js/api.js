/**
 * API Service
 * Mengambil data Clash of Clans
 */

// Mengambil data JSON
export async function fetchData(path) {
    const response = await fetch(`${path}?t=${Date.now()}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${path}`);
    }

    return response.json();
}

// Mengambil data clan terbaru
export async function fetchClanData() {
    const index = await fetchData('data/clan_stats_index.json');

    if (!index?.length) {
        throw new Error('Clan data not found');
    }

    return fetchData(`data/clan_stats/${index[0]}`);
}