/**
 * Strips HTML that Android clipboard may inject (e.g. <!DOCTYPE html>...)
 * and filters key characters to keep only alphanumeric, hyphens, underscores, colons, and dots.
 */
export const sanitizeApiKey = (value: string): string => {
  let text = value;
  if (value.includes("<")) {
    try {
      const doc = new DOMParser().parseFromString(value, "text/html");
      text = doc.body?.textContent ?? value;
    } catch {
      // fallback: strip all tags manually
      text = value.replace(/<[^>]*>/g, "");
    }
  }
  // Keep only characters that appear in API keys: alphanumeric, hyphens, underscores, colons, dots
  return text.replace(/[^A-Za-z0-9\-_:.]/g, "").trim();
};
