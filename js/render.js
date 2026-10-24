/**
 * render.js
 * Clan Clans Of Clash
 *
 * Isi file (dari atas ke bawah):
 *   1. Pengaturan laporan
 *   2. Data klan dan war
 *   3. Kolom tabel
 *   4. Menyusun isi laporan
 *   5. Menggambar laporan jadi gambar
 *   6. Halaman hasil gambar
 *   7. Halaman Settings
 *   8. Tampilan About & Komponen War
 *   9. Halaman Members
 */

import { roleMap, roleWeight, getTHImage } from './constants.js';


// =====================================================
// 1. PENGATURAN LAPORAN
// =====================================================
const BASE_STYLE = {
    Footer: '',
    Accent: '#d4a017',
    Theme: 'light',
    Scale: 3,
    Format: 'jpeg',
    Logo: true,
    Date: true,
    Zebra: true,
};

const REPORT_CONFIG = {
    war: {
        ...BASE_STYLE,
        Title: 'Laporan War',
        Cols: ['no', 'name', 'th', 'attacks', 'stars', 'destruction', 'defense'],
    },
    members: {
        ...BASE_STYLE,
        Title: 'Daftar Anggota Klan',
        Sort: 'rank',
        Cols: ['no', 'name', 'role', 'th', 'trophies', 'donations', 'received'],
    },
};


// =====================================================
// 2. DATA KLAN DAN WAR
// =====================================================
let clanData = null;
let warData = null;

export function setClanData(clan) {
    clanData = clan;
}

export function setWarData(war) {
    warData = war;
}


// =====================================================
// 3. KOLOM TABEL
// =====================================================
const ROLE_NAMES = {
    leader: 'Leader',
    coLeader: 'Co-leader',
    admin: 'Elder',
    member: 'Member',
};

const MEMBER_COLS = [
    { id: 'no',        label: 'No',       get: (m, i) => i + 1 },
    { id: 'name',      label: 'Name',     get: (m) => m.name },
    { id: 'tag',       label: 'Tag',      get: (m) => m.tag },
    { id: 'role',      label: 'Role',     get: (m) => ROLE_NAMES[m.role] || m.role || '-' },
    { id: 'th',        label: 'TH',       get: (m) => m.townHallLevel ?? '-' },
    { id: 'trophies',  label: 'Trofi',    get: (m) => m.trophies ?? '-' },
    { id: 'donations', label: 'Donasi',   get: (m) => m.donations ?? '-' },
    { id: 'received',  label: 'Diterima', get: (m) => m.donationsReceived ?? '-' },
];

// Kolom tabel war: serangan, bintang, destruksi, dan bintang saat bertahan
function totalStars(member) {
    return (member.attacks || []).reduce((sum, a) => sum + (a.stars || 0), 0);
}

function averageDestruction(member) {
    const attacks = member.attacks || [];
    if (attacks.length === 0) return '-';
    const total = attacks.reduce((sum, a) => sum + (a.destructionPercentage || 0), 0);
    return Math.round(total / attacks.length) + '%';
}

function attacksUsed(member) {
    const max = warData?.attacksPerMember || 2;
    return (member.attacks?.length || 0) + '/' + max;
}

function bestDefense(member) {
    return member.bestOpponentAttack ? member.bestOpponentAttack.stars : '-';
}

const WAR_COLS = [
    { id: 'no',          label: 'No',        get: (m, i) => i + 1 },
    { id: 'name',        label: 'Name',      get: (m) => m.name },
    { id: 'th',          label: 'TH',        get: (m) => m.townhallLevel ?? '-' },
    { id: 'attacks',     label: 'Serang',    get: (m) => attacksUsed(m) },
    { id: 'stars',       label: 'Bintang',   get: (m) => totalStars(m) },
    { id: 'destruction', label: 'Destruksi', get: (m) => averageDestruction(m) },
    { id: 'defense',     label: 'Bertahan',  get: (m) => bestDefense(m) },
];

const MEMBER_SORTS = {
    rank:      (a, b) => (a.clanRank || 0) - (b.clanRank || 0),
    trophies:  (a, b) => (b.trophies || 0) - (a.trophies || 0),
    donations: (a, b) => (b.donations || 0) - (a.donations || 0),
    received:  (a, b) => (b.donationsReceived || 0) - (a.donationsReceived || 0),
    th:        (a, b) => (b.townHallLevel || 0) - (a.townHallLevel || 0),
    name:      (a, b) => String(a.name).localeCompare(String(b.name)),
};


// =====================================================
// 4. MENYUSUN ISI LAPORAN
// =====================================================
function clanLabel() {
    if (!clanData?.name) return '';
    return clanData.tag ? clanData.name + ' (' + clanData.tag + ')' : clanData.name;
}

function safeColor(color) {
    return /^#[0-9a-f]{3,8}$/i.test(color) ? color : '#d4a017';
}

function makeReport({ config, allCols, items, subtitle, emptyNote }) {
    const cols = allCols.filter((c) => config.Cols.includes(c.id));
    const today = new Date().toLocaleDateString('id-ID', { dateStyle: 'long' });

    return {
        config,
        title: config.Title,
        subtitle,
        note: items.length ? '' : emptyNote,
        accent: safeColor(config.Accent),
        date: config.Date ? today : '',
        logoUrl: config.Logo ? (clanData?.badgeUrls?.medium || '') : '',
        headers: cols.map((c) => c.label),
        rows: items.map((item, i) => cols.map((c) => String(c.get(item, i) ?? ''))),
    };
}

function makeWarReport() {
    const members = [...(warData?.clan?.members || [])]
        .sort((a, b) => (a.mapPosition || 0) - (b.mapPosition || 0));

    const clanName = warData?.clan?.name || clanData?.name || '';
    const enemyName = warData?.opponent?.name || '';

    return makeReport({
        config: REPORT_CONFIG.war,
        allCols: WAR_COLS,
        items: members,
        subtitle: enemyName ? clanName + ' vs ' + enemyName : clanName,
        emptyNote: warData ? 'Tidak ada anggota di data war ini.' : 'Data war belum tersedia.',
    });
}

function makeMembersReport() {
    const config = REPORT_CONFIG.members;
    const sorter = MEMBER_SORTS[config.Sort] || MEMBER_SORTS.rank;
    const members = [...(clanData?.memberList || [])].sort(sorter);

    return makeReport({
        config,
        allCols: MEMBER_COLS,
        items: members,
        subtitle: clanLabel(),
        emptyNote: 'Data anggota belum tersedia.',
    });
}


// =====================================================
// 5. MENGGAMBAR LAPORAN JADI GAMBAR
// =====================================================
const FONT = 'Arial, Helvetica, sans-serif';

const LAYOUT = {
    pad: 24,
    cellPad: 12,
    rowH: 30,
    headH: 34,
    headBlock: 88,
    minWidth: 520,
};

const THEMES = {
    light: { bg: '#ffffff', text: '#111111', sub: '#555555', line: '#c4c4c4', zebra: '#f5f5f5', border: '#d1d5db' },
    dark:  { bg: '#121212', text: '#f2f2f2', sub: '#a0a0a0', line: '#3d3d3d', zebra: '#1b1b1b', border: '#3A3A3A' },
};

function loadImage(url) {
    return new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        setTimeout(() => resolve(null), 4000);
        img.src = url;
    });
}

function measureColumns(report) {
    const ctx = document.createElement('canvas').getContext('2d');

    return report.headers.map((header, col) => {
        ctx.font = 'bold 14px ' + FONT;
        let widest = ctx.measureText(header).width;

        ctx.font = '14px ' + FONT;
        report.rows.forEach((row) => {
            widest = Math.max(widest, ctx.measureText(row[col]).width);
        });

        return Math.ceil(widest) + LAYOUT.cellPad * 2;
    });
}

function pickScale(wanted, height) {
    let scale = Math.min(4, Math.max(1, Number(wanted) || 2));
    while (height * scale > 16000 && scale > 1) scale -= 1;
    return scale;
}

function drawHeader(ctx, report, width, logo, theme) {
    const { pad } = LAYOUT;
    let textX = pad;

    if (logo) {
        ctx.drawImage(logo, pad, pad, 56, 56);
        textX = pad + 70;
    }

    ctx.fillStyle = theme.text;
    ctx.font = 'bold 24px ' + FONT;
    ctx.fillText(report.title, textX, pad + 26);

    const parts = [report.subtitle, report.date].filter(Boolean);
    ctx.fillStyle = theme.sub;
    ctx.font = '14px ' + FONT;
    ctx.fillText(parts.join(' · '), textX, pad + 50);

    ctx.fillStyle = report.accent;
    ctx.fillRect(pad, pad + 66, width - pad * 2, 3);
}

function drawTable(ctx, report, widths, startY, theme) {
    const { pad, cellPad, rowH, headH } = LAYOUT;
    const tableW = widths.reduce((a, b) => a + b, 0);
    let y = startY;

    ctx.fillStyle = report.accent;
    ctx.fillRect(pad, y, tableW, headH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px ' + FONT;
    let x = pad;
    report.headers.forEach((header, col) => {
        ctx.fillText(header, x + cellPad, y + 22);
        x += widths[col];
    });
    y += headH;

    ctx.font = '14px ' + FONT;
    report.rows.forEach((row, rowIndex) => {
        if (report.config.Zebra && rowIndex % 2 === 1) {
            ctx.fillStyle = theme.zebra;
            ctx.fillRect(pad, y, tableW, rowH);
        }

        ctx.fillStyle = theme.line;
        ctx.fillRect(pad, y + rowH - 1, tableW, 1);

        ctx.fillStyle = theme.text;
        let cellX = pad;
        row.forEach((cell, col) => {
            ctx.fillText(cell, cellX + cellPad, y + 20);
            cellX += widths[col];
        });

        y += rowH;
    });

    drawTableLines(ctx, report, widths, startY, y, theme);
    return y;
}

// Garis penghalang: garis tegak antar kolom dan bingkai di sekeliling tabel
function drawTableLines(ctx, report, widths, topY, bottomY, theme) {
    const { pad, headH } = LAYOUT;
    const tableW = widths.reduce((a, b) => a + b, 0);
    const bodyTop = topY + headH;

    // garis tegak di bagian isi (termasuk tepi kiri dan kanan) - pakai warna border
    ctx.fillStyle = theme.border;
    let x = pad;
    widths.forEach((w) => {
        ctx.fillRect(x, bodyTop, 1, bottomY - bodyTop);
        x += w;
    });
    ctx.fillRect(pad + tableW - 1, bodyTop, 1, bottomY - bodyTop);

    // garis pemisah kolom di baris judul - pakai warna border juga
    ctx.fillStyle = theme.border;
    x = pad;
    widths.forEach((w, i) => {
        if (i > 0) ctx.fillRect(x, topY, 1, headH);
        x += w;
    });

    // bingkai luar - pakai warna border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad + 0.5, topY + 0.5, tableW - 1, bottomY - topY - 1);
}

function drawCenteredText(ctx, text, width, y, font, color) {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.fillText(text, width / 2, y);
    ctx.textAlign = 'left';
}

// Pilih laporan yang mau dibuat: 'members' atau 'war'
const REPORTS = {
    members: makeMembersReport,
    war: makeWarReport,
};

async function createReportImage(type) {
    const report = (REPORTS[type] || makeMembersReport)();
    const { config } = report;
    const theme = THEMES[config.Theme] || THEMES.light;
    const { pad, rowH, headH, headBlock, minWidth } = LAYOUT;

    const logo = await loadImage(report.logoUrl);
    const widths = measureColumns(report);

    const tableW = widths.reduce((a, b) => a + b, 0);
    const width = Math.max(minWidth, tableW + pad * 2);
    const tableH = report.rows.length ? headH + report.rows.length * rowH : 60;
    const footerH = config.Footer ? 44 : 12;
    const height = pad + headBlock + tableH + footerH + pad;
    const scale = pickScale(config.Scale, height);

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    drawHeader(ctx, report, width, logo, theme);

    let y = pad + headBlock;
    if (report.rows.length) {
        y = drawTable(ctx, report, widths, y, theme);
    } else {
        drawCenteredText(ctx, report.note, width, y + 30, '14px ' + FONT, theme.sub);
        y += 60;
    }

    if (config.Footer) {
        drawCenteredText(ctx, config.Footer, width, y + 28, '12px ' + FONT, theme.sub);
    }

    const mime = config.Format === 'jpeg' ? 'image/jpeg' : 'image/png';
    return { dataUrl: canvas.toDataURL(mime, 0.92), mime, title: report.title };
}


// =====================================================
// 6. HALAMAN HASIL GAMBAR
// =====================================================
function escapeHtml(value) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value ?? '').replace(/[&<>"']/g, (c) => map[c]);
}

function makeFileName(title) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return slug || 'laporan';
}

export async function createImagePage(type) {
    const { dataUrl, mime, title } = await createReportImage(type);
    const extension = mime === 'image/jpeg' ? 'jpg' : 'png';
    const fileName = makeFileName(title) + '.' + extension;

    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body { margin: 0; background: #121212; color: #fff; font-family: Arial, sans-serif; }
  .bar { position: sticky; top: 0; display: flex; align-items: center; gap: 10px;
         padding: 10px 12px; background: #1e1e1e; border-bottom: 1px solid #333; font-size: 12px; }
  .bar a { background: #f59e0b; color: #000; text-decoration: none; font-weight: bold;
           padding: 9px 14px; border-radius: 8px; }
  img { display: block; width: 100%; height: auto; }
</style>
</head>
<body>
  <div class="bar">
    <a href="${dataUrl}" download="${fileName}">Simpan Gambar</a>
    <span>Atau tekan lama gambar lalu pilih simpan.</span>
  </div>
  <img src="${dataUrl}" alt="${escapeHtml(title)}">
</body>
</html>`;
}

if (typeof window !== 'undefined') {
    window.buildImagePage = createImagePage;
}


// =====================================================
// 7. HALAMAN SETTINGS (MODAL INTERNAL)
// =====================================================
// Tombol laporan di modal Settings. Ketuk -> gambar langsung dibuat.
const SETTINGS_REPORTS = [
    { type: 'members', icon: '👥', title: 'Members Report', desc: 'Buat gambar daftar anggota' },
    { type: 'war',     icon: '🏆', title: 'War Report',     desc: 'Buat gambar laporan war' },
];

const reportButtonHtml = ({ type, icon, title, desc }) => `
    <button type="button" data-report="${type}" style="width: 100%; display: flex; align-items: center; gap: 12px;
            margin-top: 10px; padding: 14px; background: #282828; border: 1px solid #3a3a3a; border-radius: 12px;
            color: #fff; text-align: left; cursor: pointer;">
        <span style="font-size: 24px;">${icon}</span>
        <div>
            <strong style="display: block;">${title}</strong>
            <small style="color: #a0a0a0;">${desc}</small>
        </div>
    </button>
`;

async function generateReport(type, modal) {
    modal.remove();
    try {
        const { dataUrl, mime, title } = await createReportImage(type);
        const extension = mime === 'image/jpeg' ? 'jpg' : 'png';
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = makeFileName(title) + '.' + extension;
        link.click();
    } catch (err) {
        alert('Gagal membuat gambar: ' + err.message);
    }
}

export function openSettings() {
    document.getElementById('settingsModal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'settingsModal';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center; padding: 16px;
    `;

    modal.innerHTML = `
        <div style="background: #1e1e1e; border: 1px solid #3a3a3a; border-radius: 20px;
                    padding: 20px; width: 100%; max-width: 400px; color: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 18px; font-weight: bold;">Settings</h2>
                <button id="closeModalBtn" style="background: rgba(255,255,255,0.1); border: 0; color: #fff;
                                                 width: 36px; height: 36px; border-radius: 50%; cursor: pointer;">✕</button>
            </div>
            ${SETTINGS_REPORTS.map(reportButtonHtml).join('')}
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('closeModalBtn').onclick = () => modal.remove();

    modal.querySelectorAll('[data-report]').forEach((button) => {
        button.onclick = () => generateReport(button.dataset.report, modal);
    });
}


// =====================================================
// 8. TAMPILAN ABOUT & KARTU WAR
// =====================================================
const SOCIAL_LINKS = {
    whatsapp: {
        label: 'Whatsaap',
        url: 'https://chat.whatsapp.com/CLvfxE1XiRk64DQPmGDVfG?s=sh&p=a&mlu=4&ilr=4',
        icon: 'chat',
    },
    discord: {
        label: 'Discord',
        url: 'https://pin.it/5h7I6Ndwl',
        icon: 'forum',
    },
    telegram: {
        label: 'Telegram',
        url: 'https://t.me/Cstarts',
        icon: 'send',
    },
};

const renderLabel = (label) => `
    <div class="flex items-center gap-1 bg-[#252525] px-2 py-1 rounded-lg">
        <img src="${label.iconUrls?.small || ''}" class="w-4 h-4" alt="">
        <span class="text-[10px] text-gray-400">${label.name}</span>
    </div>
`;

const renderLinkButton = ({ label, url, icon }) => `
    <a
        href="${url}"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-1 items-center justify-center gap-2
               bg-[#252525] hover:bg-[#303030]
               text-white text-xs font-semibold
               px-4 py-2 rounded-lg transition-colors"
    >
        <span class="material-symbols-outlined text-[18px]">${icon}</span>
        ${label}
    </a>
`;

const renderSettingsButton = () => `
    <button
        id="settingsBtn"
        type="button"
        aria-label="Settings"
        class="flex items-center justify-center
               w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
               text-gray-200 transition-all duration-300
               hover:rotate-45 active:scale-95"
    >
        <span class="material-symbols-outlined text-[22px]">settings</span>
    </button>
`;


export function renderAbout(clan, war = typeof warData !== 'undefined' ? warData : null) {
    const container = document.getElementById('aboutContent');
    if (!container || !clan) return;
    setClanData(clan);

    const { whatsapp, discord, telegram } = SOCIAL_LINKS;
    const labels = (clan.labels || []).map(renderLabel).join('');

    container.innerHTML = `
        <div class="p-3 md:p-5 w-full flex flex-col gap-4">
            <!-- Header Paling Atas: Nama Clan, Tag & Tombol Settings -->
            <div class="w-full max-w-xl mx-auto">
                <div class="flex items-center justify-between gap-3 mb-2">
                    <div class="flex items-center gap-3 min-w-0">
                        <img
                            src="${clan.badgeUrls?.medium || ''}"
                            class="w-10 h-10 md:w-12 md:h-12 shrink-0"
                            alt="Clan Badge"
                        >
                        <div class="min-w-0">
                            <h1 class="text-xl md:text-2xl font-bold text-white leading-tight truncate">
                                ${clan.name || 'Unknown Clan'}
                            </h1>
                            <p class="text-xs text-gray-400 font-mono">
                                ${clan.tag || ''}
                            </p>
                        </div>
                    </div>

                    <!-- Tombol Settings -->
                    <div class="shrink-0">
                        ${renderSettingsButton()}
                    </div>
                </div>

                <!-- Garis Pemisah -->
                <hr class="border-t border-[#2A2A2A]">
            </div>

            <!-- Kartu 1: Clan Info (Deskripsi, Labels, Social Links) -->
            <div class="w-full max-w-xl mx-auto overflow-hidden
                        bg-[#1E1E1E] border border-[#3A3A3A]
                        p-3 md:p-4 rounded-xl flex flex-col gap-3">

                <!-- Deskripsi Clan -->
                <div class="pb-3 border-b border-[#2A2A2A]">
                    <div class="text-sm font-bold text-gray-200 mb-1">Description</div>
                    <div class="text-xs md:text-sm text-gray-300 break-words whitespace-pre-line m-0">
                        ${clan.description || ''}
                    </div>
                </div>

                <!-- Clan Labels -->
                <div class="pb-3 border-b border-[#2A2A2A]">
                    <div class="text-sm font-bold text-gray-200 mb-1.5">Clan Labels</div>
                    <div class="flex flex-wrap gap-1.5">${labels}</div>
                </div>

                <!-- Link Media Sosial -->
                <div>
                    <div class="text-sm font-bold text-gray-200 mb-1.5">Social Links</div>
                    <div class="flex flex-col gap-2">
                        <div class="flex">${renderLinkButton(whatsapp)}</div>
                        <div class="flex gap-2">
                            ${renderLinkButton(discord)}
                            ${renderLinkButton(telegram)}
                        </div>
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
        </div>
    </div>
    `;

    document.getElementById('settingsBtn')
        ?.addEventListener('click', openSettings);
}


// =====================================================
// 9. HALAMAN MEMBERS
// =====================================================
// Daftar anggota klan. Urutan bisa diganti lewat tombol di atas daftar.
// Container #membersContent dibuat otomatis kalau belum ada di HTML.

const MEMBER_PAGE_SORTS = {
    rank:      MEMBER_SORTS.rank,
    trophies:  MEMBER_SORTS.trophies,
    donations: MEMBER_SORTS.donations,
    name:      MEMBER_SORTS.name,
    role:      (a, b) => (roleWeight[b.role] || 0) - (roleWeight[a.role] || 0)
                         || (a.clanRank || 0) - (b.clanRank || 0),
};

const MEMBER_SORT_BUTTONS = [
    { id: 'rank',      label: 'Rank' },
    { id: 'trophies',  label: 'Trofi' },
    { id: 'donations', label: 'Donasi' },
    { id: 'role',      label: 'Role' },
    { id: 'name',      label: 'Nama' },
];

let membersSortKey = 'rank';

// Mencari #membersContent, kalau belum ada dibuat di bawah #section-about
function getMembersContainer() {
    const existing = document.getElementById('membersContent');
    if (existing) return existing;

    const about = document.getElementById('section-about');
    if (!about || !about.parentNode) return null;

    const section = document.createElement('div');
    section.id = 'section-members';
    section.className = 'hidden-section';

    const container = document.createElement('div');
    container.id = 'membersContent';

    section.appendChild(container);
    about.parentNode.insertBefore(section, about.nextSibling);
    return container;
}

const renderSortButton = ({ id, label }) => {
    const active = id === membersSortKey;
    const style = active
        ? 'bg-amber-500 text-black border-amber-500'
        : 'bg-transparent text-gray-400 border-[#3A3A3A]';
    return `
        <button type="button" data-sort="${id}"
                class="px-3 py-1.5 rounded-full text-xs font-semibold border ${style}">
            ${label}
        </button>
    `;
};

const renderMemberRow = (member, index) => `
    <div class="flex items-center gap-3 bg-[#1E1E1E] border border-[#3A3A3A] rounded-xl p-3">
        <span class="w-6 text-center text-xs text-gray-500 font-mono">${index + 1}</span>
        <img
            src="${getTHImage(member.townHallLevel)}"
            class="w-10 h-10 shrink-0 object-contain"
            alt="TH${member.townHallLevel}"
            onerror="this.style.visibility='hidden'"
        >
        <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-white truncate">${escapeHtml(member.name)}</p>
            <p class="text-[11px] text-gray-400 truncate">
                ${roleMap[member.role] || member.role} · TH${member.townHallLevel}
            </p>
        </div>
        <div class="text-right shrink-0">
            <p class="text-sm font-bold text-amber-500">${member.trophies}</p>
            <p class="text-[10px] text-gray-500">Donasi ${member.donations}/${member.donationsReceived}</p>
        </div>
    </div>
`;

export function renderMembers(clan) {
    const container = getMembersContainer();
    if (!container || !clan) return;

    const sorter = MEMBER_PAGE_SORTS[membersSortKey] || MEMBER_PAGE_SORTS.rank;
    const members = [...(clan.memberList || [])].sort(sorter);

    const buttons = MEMBER_SORT_BUTTONS.map(renderSortButton).join('');
    const rows = members.length
        ? members.map(renderMemberRow).join('')
        : '<p class="text-sm text-gray-500 text-center py-6">Data anggota belum tersedia.</p>';

    container.innerHTML = `
        <div class="p-3 md:p-5 pb-28 w-full">
            <div class="w-full max-w-xl mx-auto">
                <div class="flex items-center justify-between mb-3">
                    <h2 class="text-lg font-bold text-white">Members</h2>
                    <span class="text-xs text-gray-400">${clan.members ?? members.length}/50</span>
                </div>
                <div class="flex flex-wrap gap-2 mb-3">${buttons}</div>
                <div class="flex flex-col gap-2">${rows}</div>
            </div>
        </div>
    `;

    // Ketuk tombol urutan -> daftar digambar ulang
    container.onclick = (event) => {
        const button = event.target.closest('[data-sort]');
        if (!button) return;
        membersSortKey = button.dataset.sort;
        renderMembers(clan);
    };
    
}

// =====================================================
// 10. HALAMAN COMPETITIVE (WAR)
// =====================================================
export function renderWar(war) {
    const container = document.getElementById('warDataContainer');
    if (!container) return;

    if (!war || !war.clan) {
        container.innerHTML = `
            <div class="bg-[#1E1E1E] border border-[#3A3A3A] p-4 rounded-xl text-center text-gray-400">
                Data war/competitive belum tersedia atau belum diisi.
            </div>
        `;
        return;
    }

    const clan = war.clan;
    const opponent = war.opponent;
    const state = war.state || 'ended';

    const members = [...(clan.members || [])].sort((a, b) => (a.mapPosition || 0) - (b.mapPosition || 0));

    container.innerHTML = `
        <div class="flex flex-col gap-4">
            <!-- War Overview Card -->
            <div class="bg-[#1E1E1E] border border-[#3A3A3A] p-4 rounded-xl flex flex-col gap-3">
                <div class="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                    <div class="flex items-center gap-2">
                        <img src="${clan.badgeUrls?.small || ''}" class="w-8 h-8" alt="" onerror="this.style.display='none'">
                        <div>
                            <p class="font-bold text-white text-sm">${escapeHtml(clan.name)}</p>
                            <p class="text-xs text-amber-500 font-bold">★ ${clan.stars || 0} (${(clan.destructionPercentage || 0).toFixed(1)}%)</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold text-gray-400">VS</span>
                    <div class="flex items-center gap-2 text-right">
                        <div>
                            <p class="font-bold text-white text-sm">${escapeHtml(opponent?.name || 'Musuh')}</p>
                            <p class="text-xs text-amber-500 font-bold">★ ${opponent?.stars || 0} (${(opponent?.destructionPercentage || 0).toFixed(1)}%)</p>
                        </div>
                        <img src="${opponent?.badgeUrls?.small || ''}" class="w-8 h-8" alt="" onerror="this.style.display='none'">
                    </div>
                </div>
                <div class="text-xs text-gray-400 flex justify-between">
                    <span>Status: <strong class="text-white capitalize">${state}</strong></span>
                    <span>Ukuran Tim: <strong class="text-white">${war.teamSize || members.length} vs ${war.teamSize || members.length}</strong></span>
                </div>
            </div>

            <!-- Member War Performance List -->
            <div class="flex flex-col gap-2">
                <h3 class="text-sm font-bold text-gray-200">Daftar Anggota War</h3>
                ${members.map((m, idx) => `
                    <div class="flex items-center gap-3 bg-[#1E1E1E] border border-[#3A3A3A] rounded-xl p-3">
                        <span class="w-6 text-center text-xs text-gray-500 font-mono">${idx + 1}</span>
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-bold text-white truncate">${escapeHtml(m.name)}</p>
                            <p class="text-[11px] text-gray-400">TH${m.townhallLevel || '-'} · Posisi #${m.mapPosition || '-'}</p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-xs font-bold text-amber-500">
                                Serangan: ${m.attacks?.length || 0}/${war.attacksPerMember || 2}
                            </p>
                            <p class="text-[10px] text-gray-400">
                                Total Bintang: ★ ${totalStars(m)} (${averageDestruction(m)})
                            </p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}