/**
 * Constants & Utilities
 */

// Mengambil gambar Town Hall
export const getTHImage = (level) =>
    `assets/Town_Hall${level}.webp`;

// Mengubah tanggal Clash of Clans
export function parseCoCDate(date) {
    if (!date) return null;

    return new Date(
        `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(9, 11)}:${date.slice(11, 13)}:${date.slice(13, 15)}Z`
    );
}