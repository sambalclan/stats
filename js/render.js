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
 *   8. Tampilan About
 */


// =====================================================
// 1. PENGATURAN LAPORAN
// =====================================================
// Ubah di sini kalau mau ganti judul, warna, atau kolom.
//
//   Theme  : 'light' atau 'dark'
//   Scale  : 1, 2, atau 3 (makin besar makin tajam)
//   Format : 'png' atau 'jpeg'
//   Sort   : rank, trophies, donations, received, th, name (khusus Members)
//   Cols   : kolom yang ikut tampil

const BASE_STYLE = {
    Footer: '',
    Accent: '#d4a017',
    Theme: 'light',
    Scale: 2,
    Format: 'png',
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
// Members otomatis diambil dari clan.memberList (lewat renderAbout).
// War: panggil setWarData(war) setelah data war diambil dari API.

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
// Tiap kolom: id (dipakai di Cols), label (judul kolom), get (isi sel).

const ROLE_NAMES = {
    leader: 'Leader',
    coLeader: 'Co-leader',
    admin: 'Elder',
    member: 'Member',
};

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
    const used = member.attacks?.length || 0;
    const max = warData?.attacksPerMember || 2;
    return used + '/' + max;
}

const WAR_COLS = [
    { id: 'no',          label: 'No',         get: (m, i) => i + 1 },
    { id: 'name',        label: 'Nama',       get: (m) => m.name },
    { id: 'th',          label: 'TH',         get: (m) => m.townhallLevel ?? '-' },
    { id: 'attacks',     label: 'Serangan',   get: (m) => attacksUsed(m) },
    { id: 'stars',       label: 'Bintang',    get: (m) => totalStars(m) },
    { id: 'destruction', label: 'Destruksi',  get: (m) => averageDestruction(m) },
    { id: 'defense',     label: 'Pertahanan', get: (m) => m.bestOpponentAttack ? m.bestOpponentAttack.stars + '★' : '-' },
];

const MEMBER_COLS = [
    { id: 'no',        label: 'No',       get: (m, i) => i + 1 },
    { id: 'name',      label: 'Nama',     get: (m) => m.name },
    { id: 'tag',       label: 'Tag',      get: (m) => m.tag },
    { id: 'role',      label: 'Role',     get: (m) => ROLE_NAMES[m.role] || m.role || '-' },
    { id: 'th',        label: 'TH',       get: (m) => m.townHallLevel ?? '-' },
    { id: 'trophies',  label: 'Trofi',    get: (m) => m.trophies ?? '-' },
    { id: 'donations', label: 'Donasi',   get: (m) => m.donations ?? '-' },
    { id: 'received',  label: 'Diterima', get: (m) => m.donationsReceived ?? '-' },
];

// Cara mengurutkan anggota (dipilih lewat Sort di pengaturan)
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
// Hasilnya satu objek: judul, subjudul, header tabel, baris tabel, dll.

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

    let subtitle = clanLabel();
    if (warData?.clan?.name && warData?.opponent?.name) {
        subtitle = warData.clan.name + ' vs ' + warData.opponent.name;
    }

    return makeReport({
        config: REPORT_CONFIG.war,
        allCols: WAR_COLS,
        items: members,
        subtitle,
        emptyNote: 'Belum ada data war. Panggil setWarData(war) setelah data war diambil.',
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

function makeReportByType(type) {
    return type === 'war' ? makeWarReport() : makeMembersReport();
}


// =====================================================
// 5. MENGGAMBAR LAPORAN JADI GAMBAR
// =====================================================
// Digambar langsung di canvas, jadi tidak butuh library tambahan.

const FONT = 'Arial, Helvetica, sans-serif';

const LAYOUT = {
    pad: 24,         // jarak tepi
    cellPad: 12,     // jarak isi sel
    rowH: 30,        // tinggi baris
    headH: 34,       // tinggi baris judul kolom
    headBlock: 88,   // tinggi bagian atas (logo + judul)
    minWidth: 520,
};

const THEMES = {
    light: { bg: '#ffffff', text: '#111111', sub: '#555555', line: '#dddddd', zebra: '#f5f5f5' },
    dark:  { bg: '#121212', text: '#f2f2f2', sub: '#a0a0a0', line: '#2e2e2e', zebra: '#1b1b1b' },
};

// Memuat logo. Kalau gagal (misalnya tidak diizinkan server), logo dilewati.
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

// Lebar tiap kolom mengikuti isi terpanjang
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

// Resolusi diturunkan kalau gambar terlalu tinggi
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

// Menggambar tabel mulai dari posisi y, mengembalikan posisi y berikutnya
function drawTable(ctx, report, widths, startY, theme) {
    const { pad, cellPad, rowH, headH } = LAYOUT;
    const tableW = widths.reduce((a, b) => a + b, 0);
    let y = startY;

    // baris judul kolom
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

    // baris data
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

    return y;
}

function drawCenteredText(ctx, text, width, y, font, color) {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.fillText(text, width / 2, y);
    ctx.textAlign = 'left';
}

async function createReportImage(type) {
    const report = makeReportByType(type);
    const { config } = report;
    const theme = THEMES[config.Theme] || THEMES.light;
    const { pad, rowH, headH, headBlock, minWidth } = LAYOUT;

    const logo = await loadImage(report.logoUrl);
    const widths = measureColumns(report);

    // ukuran gambar
    const tableW = widths.reduce((a, b) => a + b, 0);
    const width = Math.max(minWidth, tableW + pad * 2);
    const tableH = report.rows.length ? headH + report.rows.length * rowH : 60;
    const footerH = config.Footer ? 44 : 12;
    const height = pad + headBlock + tableH + footerH + pad;
    const scale = pickScale(config.Scale, height);

    // kanvas
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
// Menampilkan gambar + tombol Simpan Gambar di tab baru.

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

// Supaya tab Settings bisa memanggil fungsi ini
if (typeof window !== 'undefined') {
    window.buildImagePage = createImagePage;
}


// =====================================================
// 7. HALAMAN SETTINGS
// =====================================================
// Tab baru berisi dua kartu: War dan Members.
// Ketuk salah satu -> gambar langsung dibuat.

const SETTINGS_PAGE = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Settings</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined">
<style>
  body { margin: 0; padding: 16px; background: #121212; color: #fff; font-family: Arial, sans-serif; }
  .wrap { max-width: 560px; margin: 0 auto; }
  .top { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .top h1 { margin: 0; font-size: 20px; }
  .close { width: 40px; height: 40px; border: 0; border-radius: 50%;
           background: rgba(255,255,255,0.1); color: #fff; }
  .card { width: 100%; display: flex; align-items: center; gap: 16px; margin-bottom: 12px;
          padding: 16px; text-align: left; color: #fff; background: #1e1e1e;
          border: 1px solid #3a3a3a; border-radius: 16px; }
  .card:active { background: #252525; }
  .icon { flex: none; width: 48px; height: 48px; display: flex; align-items: center;
          justify-content: center; border-radius: 12px; background: rgba(245,158,11,0.15);
          color: #f59e0b; }
  .text b { display: block; font-size: 16px; }
  .text small { display: block; margin-top: 2px; font-size: 14px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <button id="closeBtn" class="close"><span class="material-symbols-outlined">close</span></button>
      <h1>Settings</h1>
    </div>

    <button class="card" data-type="war">
      <span class="icon"><span class="material-symbols-outlined">swords</span></span>
      <span class="text"><b>War</b><small>Ketuk untuk membuat gambar laporan war.</small></span>
    </button>

    <button class="card" data-type="members">
      <span class="icon"><span class="material-symbols-outlined">groups</span></span>
      <span class="text"><b>Members</b><small>Ketuk untuk membuat gambar daftar anggota.</small></span>
    </button>
  </div>

  <script>
    // Buka tab baru, tampilkan "Membuat gambar...", lalu isi dengan hasilnya
    function makeImage(type) {
      var build = window.buildImagePage || (window.opener && window.opener.buildImagePage);
      if (!build) {
        alert('Kembali ke dashboard lalu buka Settings lagi.');
        return;
      }

      var tab = window.open('', '_blank');
      if (!tab) {
        alert('Pop-up diblokir. Izinkan pop-up lalu coba lagi.');
        return;
      }

      tab.document.open();
      tab.document.write('<body style="background:#121212;color:#fff;font-family:sans-serif;padding:24px">Membuat gambar...</body>');
      tab.document.close();

      build(type)
        .then(function (html) {
          tab.document.open();
          tab.document.write(html);
          tab.document.close();
        })
        .catch(function (error) {
          tab.document.body.textContent = 'Gagal membuat gambar: ' + error.message;
        });
    }

    document.getElementById('closeBtn').onclick = function () { window.close(); };

    document.querySelectorAll('[data-type]').forEach(function (card) {
      card.onclick = function () { makeImage(card.dataset.type); };
    });
  <\/script>
</body>
</html>`;

export function openSettings() {
    const tab = window.open('', '_blank');
    if (!tab) return;

    tab.document.open();
    tab.document.write(SETTINGS_PAGE);
    tab.document.close();

    tab.buildImagePage = createImagePage;
}


// =====================================================
// 8. TAMPILAN ABOUT
// =====================================================
// ===== Link sosial =====
const SOCIAL_LINKS = {
    whatsapp: {
        label: 'Whatsaap',
        url: 'https://chat.whatsapp.com/CLvfxE1XiRk64DQPmGDVfG?s=sh&p=a&mlu=4&ilr=4',
        icon: 'chat',
    },
    discord: {
        label: 'Discord',
        url: 'https://discord.gg/GANTI_DISINI',
        icon: 'forum',
    },
    telegram: {
        label: 'Telegram',
        url: 'https://t.me/GANTI_DISINI',
        icon: 'send',
    },
};

// ===== Komponen kecil =====
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
        class="absolute top-3 right-3 flex items-center justify-center
               w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
               text-gray-200 transition-all duration-300
               hover:rotate-45 active:scale-95"
    >
        <span class="material-symbols-outlined text-[22px]">settings</span>
    </button>
`;

// ===== Render utama =====
export function renderAbout(clan) {
    const container = document.getElementById('aboutContent');
    if (!container || !clan) return;
    setClanData(clan);

    const { whatsapp, discord, telegram } = SOCIAL_LINKS;
    const labels = (clan.labels || []).map(renderLabel).join('');

    container.innerHTML = `
        <div class="p-3 md:p-5 w-full">
            <div class="relative w-full max-w-xl mx-auto overflow-hidden
                        bg-[#1E1E1E] border border-[#3A3A3A]
                        p-3 md:p-4 rounded-xl">

                <!-- Settings -->
                ${renderSettingsButton()}

                <!-- Header -->
                <div class="flex items-center gap-3 mb-4 pr-12">
                    <img
 