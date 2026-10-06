export function formatIncidentType(type: string): string {
  try {
    return decodeURIComponent(type);
  } catch {
    return type;
  }
}
