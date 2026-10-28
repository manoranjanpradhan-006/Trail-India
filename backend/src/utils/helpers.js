import crypto from 'crypto';

export function safeJsonParse(data, fallback = []) {
  if (!data) return fallback;
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch (_) {
    return fallback;
  }
}

export function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(prefix = 'id') {
  return `${prefix}-${crypto.randomBytes(6).toString('hex')}`;
}

