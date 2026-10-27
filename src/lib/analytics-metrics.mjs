/**
 * Pure analytics metrics shared by the API and unit tests.
 * Missing attendance is unreported data, not perfect attendance.
 */
export function attendanceRate(records) {
  if (!Array.isArray(records) || records.length === 0) return null;
  const present = records.filter((record) => record.status === "present").length;
  const late = records.filter((record) => record.status === "late").length;
  const excused = records.filter((record) => record.status === "excused").length;
  return Math.round(((present + late * 0.7 + excused * 0.85) / records.length) * 100);
}

/**
 * Reweight the available indicators when attendance has not been recorded,
 * so missing data neither inflates nor unfairly penalizes the index.
 */
export function calculatePerformanceIndex({ avgScore, hwAvg, attRate, hwCompletion }) {
  const components = [
    { value: avgScore, weight: 0.45 },
    { value: hwAvg, weight: 0.2 },
    { value: Math.min(hwCompletion, 100), weight: 0.15 },
  ];
  if (typeof attRate === "number" && Number.isFinite(attRate)) {
    components.push({ value: attRate, weight: 0.2 });
  }
  const availableWeight = components.reduce((sum, item) => sum + item.weight, 0);
  return Math.round(components.reduce((sum, item) => sum + item.value * item.weight, 0) / availableWeight);
}
