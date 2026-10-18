const HARI_INDONESIA = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getIndonesianLiveTime(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const dayName = HARI_INDONESIA[date.getDay()];
  const day = date.getDate();
  const monthName = BULAN_INDONESIA[date.getMonth()];
  const year = date.getFullYear();

  return {
    time: `${hours}:${minutes}`,
    timeWithSeconds: `${hours}:${minutes}:${seconds}`,
    dateStr: `${dayName}, ${day} ${monthName} ${year}`,
    dayName,
    year
  };
}

export function formatSimpleDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return `${d.getDate()} ${BULAN_INDONESIA[d.getMonth()]} ${d.getFullYear()}`;
  } catch (_) {
    return isoString;
  }
}
