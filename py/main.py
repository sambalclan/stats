"""main.py - ambil data dari Clash of Clans API (developer.clashofclans.com).

Setup:
    pip install requests
    lalu isi API_TOKEN dan CLAN_TAG di config.py

Pakai:
    python main.py                   # clan + members + war + warlog
    python main.py clan members      # pilih sendiri
    python main.py cwl raids player  # liga perang, raid capital, 1 pemain

Pilihan: clan, members, war, warlog, cwl, raids, player
Hasil disimpan di folder data/ sebagai file JSON.
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from urllib.parse import quote

import requests

import config

PESAN_ERROR = {
    400: "Parameter salah.",
    403: "Akses ditolak: token salah, IP tidak cocok dengan IP di key, "
         "atau war log klan diset private.",
    404: "Tidak ditemukan, cek tag klan/pemain.",
    429: "Kena rate limit.",
    500: "Error di server Supercell.",
    503: "API sedang maintenance.",
}


class CoCError(Exception):
    """Error saat mengambil data dari API."""


def enc(tag: str) -> str:
    """'#2abc' -> '%232ABC'. Tag wajib di-encode di URL; huruf O dianggap 0."""
    tag = (tag or "").strip().upper().lstrip("#").replace("O", "0")
    if not tag:
        raise CoCError("Tag kosong, isi CLAN_TAG / PLAYER_TAG di config.py")
    return quote("#" + tag, safe="")


def get(path: str, params: dict | None = None) -> dict:
    """GET ke API; ulangi otomatis untuk error sementara."""
    url = config.BASE_URL.rstrip("/") + path
    headers = {
        "Authorization": f"Bearer {config.API_TOKEN.strip()}",
        "Accept": "application/json",
    }
    for percobaan in range(1, config.RETRIES + 1):
        try:
            r = requests.get(url, headers=headers, params=params,
                             timeout=config.TIMEOUT)
        except requests.RequestException as e:
            if percobaan == config.RETRIES:
                raise CoCError(f"Koneksi gagal: {e}") from e
            time.sleep(2 * percobaan)
            continue

        if r.status_code == 200:
            return r.json()

        if r.status_code in (429, 500, 503) and percobaan < config.RETRIES:
            time.sleep(2 * percobaan)
            continue

        try:
            body = r.json()
            detail = (body.get("message") or body.get("reason") or ""
                      if isinstance(body, dict) else "")
        except ValueError:
            detail = r.text[:200]
        pesan = PESAN_ERROR.get(r.status_code, "Error tidak dikenal.")
        raise CoCError(f"HTTP {r.status_code}: {pesan} {detail}".strip())

    raise CoCError("Gagal setelah beberapa percobaan.")


def clan(suffix: str = "") -> str:
    return f"/clans/{enc(config.CLAN_TAG)}{suffix}"


# pilihan: (nama file hasil, fungsi pembuat path endpoint)
ENDPOINTS = {
    "clan":    ("clan",          clan),
    "members": ("members",       lambda: clan("/members")),
    "war":     ("current_war",   lambda: clan("/currentwar")),
    "warlog":  ("war_log",       lambda: clan("/warlog")),
    "cwl":     ("cwl_group",     lambda: clan("/currentwar/leaguegroup")),
    "raids":   ("capital_raids", lambda: clan("/capitalraidseasons")),
    "player":  ("player",        lambda: f"/players/{enc(config.PLAYER_TAG)}"),
}
DEFAULT = ["clan", "members", "war", "warlog"]


def simpan(nama: str, data) -> Path:
    folder = Path(config.OUTPUT_DIR)
    folder.mkdir(parents=True, exist_ok=True)
    file = folder / f"{nama}.json"
    file.write_text(json.dumps(data, ensure_ascii=False, indent=2),
                    encoding="utf-8")
    return file


def ringkas(data: dict) -> str:
    """Info singkat satu baris untuk ditampilkan di terminal."""
    if "items" in data:
        return f"({len(data['items'])} data)"
    if "state" in data:
        return f"(status: {data['state']})"
    if "name" in data:
        return f"({data['name']})"
    return ""


def main() -> int:
    if config.API_TOKEN.startswith("ISI_"):
        print("Isi API_TOKEN di config.py dulu (atau set env COC_API_TOKEN).")
        return 1

    pilihan = sys.argv[1:] or DEFAULT
    salah = [p for p in pilihan if p not in ENDPOINTS]
    if salah:
        print(f"Pilihan tidak dikenal: {', '.join(salah)}")
        print(f"Yang tersedia: {', '.join(ENDPOINTS)}")
        return 1

    gagal = 0
    for nama in pilihan:
        berkas, buat_path = ENDPOINTS[nama]
        try:
            data = get(buat_path())
            file = simpan(berkas, data)
            print(f"[OK]    {nama:<8} -> {file} {ringkas(data)}")
        except CoCError as e:
            gagal += 1
            print(f"[GAGAL] {nama:<8} {e}")
    return 1 if gagal else 0


if __name__ == "__main__":
    sys.exit(main())
