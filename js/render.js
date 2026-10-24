/**
 * Rendering Module
 * Menampilkan informasi Clan
 */

export function renderAbout(clan) {
    const container = document.getElementById('aboutContent');
    if (!container || !clan) return;

    const labels = (clan.labels || []).map(label => `
        <div class="flex items-center gap-2 bg-[#252525] px-3 py-2 rounded-lg">
            <img src="${label.iconUrls.small}" class="w-4 h-4">
            <span class="text-xs">${label.name}</span>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="space-y-6">

            <!-- Clan Information -->
            <div class="bg-[#1a1a1a] p-5 rounded-xl">

                <div class="flex items-center gap-4 mb-5">
                    <img src="${clan.badgeUrls?.medium || ''}"
                         class="w-16 h-16">

                    <div>
                        <h2 class="text-xl font-bold text-white">
                            ${clan.name}
                        </h2>
                        <p class="text-xs text-gray-500">
                            ${clan.tag}
                        </p>
                    </div>
                </div>

                <p class="text-sm text-gray-400 mb-5">
                    ${clan.description || ''}
                </p>

                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-500">Location</p>
                        <p>${clan.location?.name || '-'}</p>
                    </div>

                    <div>
                        <p class="text-gray-500">Language</p>
                        <p>${clan.chatLanguage?.name || '-'}</p>
                    </div>

                    <div>
                        <p class="text-gray-500">Clan Level</p>
                        <p>${clan.clanLevel || 0}</p>
                    </div>

                    <div>
                        <p class="text-gray-500">Members</p>
                        <p>${clan.members || 0}/50</p>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 mt-5">
                    ${labels}
                </div>
            </div>

            <!-- Join Requirements -->
            <div class="bg-[#1a1a1a] p-5 rounded-xl">
                <h3 class="font-bold text-white mb-4">
                    Join Requirements
                </h3>

                <div class="grid grid-cols-2 gap-4">
                    ${statCard('Required Trophies', clan.requiredTrophies)}
                    ${statCard('Minimum TH', clan.requiredTownhallLevel)}
                    ${statCard('Builder Trophies', clan.requiredBuilderBaseTrophies)}
                    ${statCard('Family Friendly', clan.isFamilyFriendly ? 'Yes' : 'No')}
                </div>
            </div>

        </div>
    `;
}

// Komponen statistik
function statCard(title, value) {
    return `
        <div class="bg-[#252525] p-4 rounded-lg">
            <p class="text-xs text-gray-500 mb-2">${title}</p>
            <p class="text-sm font-semibold text-white">
                ${value ?? '-'}
            </p>
        </div>
    `;
}