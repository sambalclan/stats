"""config.py - pengaturan untuk main.py (Clash of Clans API).

Token itu rahasia: jangan commit config.py ke GitHub kalau token sudah
diisi (masukkan ke .gitignore). Alternatif aman: set env var COC_API_TOKEN
(cocok untuk GitHub Actions secrets) dan biarkan baris API_TOKEN apa adanya.
"""
import os

# Token dari https://developer.clashofclans.com -> My Account -> Create New Key.
# Key terikat ke IP publik yang kamu daftarkan saat membuatnya.
API_TOKEN = os.getenv("COC_API_TOKEN", "ISI_TOKEN_KAMU_DI_SINI")

# Base URL API.
# Default: langsung ke API resmi (IP kamu harus sama dengan IP di key).
BASE_URL = os.getenv("COC_BASE_URL", "https://api.clashofclans.com/v1")
# IP dinamis / GitHub Actions? Buat key dengan IP 45.79.218.79, lalu pakai
# proxy RoyaleAPI dengan mengganti baris di atas menjadi:
# BASE_URL = "https://cocproxy.royaleapi.dev/v1"

# Tag klan & pemain (dengan atau tanpa '#').
CLAN_TAG = "#2RVRP900V"
PLAYER_TAG = ""  # opsional, hanya dipakai untuk `python main.py player`

TIMEOUT = 15         # detik per request
RETRIES = 3          # ulangi kalau kena 429 / 500 / 503 / koneksi putus
OUTPUT_DIR = "data"  # hasil disimpan sebagai data/<nama>.json
