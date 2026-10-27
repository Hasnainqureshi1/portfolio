// Optional server-side quota for the existing public PageSpeed workflow.
// The browser never receives the API key. Only Google's fixed API endpoint is called.
export function publicPage(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80', '443'].includes(url.port))) return null;
    if (host === 'localhost' || /\.(?:local|localhost|internal)$/.test(host) || !host.includes('.') || host.includes(':')) return null;
    if (/^(?:0|10|127|169\.254|192\.168|172\.(?:1[6-9]|2\d|3[01]))(?:\.|$)/.test(host)) return null;
    url.hash = '';
    return url.href;
  } catch (_) { return null; }
}

const limits = new Map();
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: { message: 'Use GET for a website check.' } }); }
  const url = publicPage(req.query?.url);
  const strategy = req.query?.strategy || 'mobile';
  if (!url || !['mobile', 'desktop'].includes(strategy)) return res.status(400).json({ error: { message: 'Choose a public website and mobile or desktop.' } });
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return res.status(503).json({ error: { code: 'PAGESPEED_KEY_MISSING', message: 'Managed quota is unavailable.' } });
  const now = Date.now(), address = String(req.headers?.['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  for (const [ip, entry] of limits) if (entry.until <= now) limits.delete(ip);
  const entry = limits.get(address) || { count: 0, until: now + 60000 };
  if (entry.count >= 5 || limits.size > 10000) return res.status(429).json({ error: { message: 'Too many checks. Wait a minute before trying again.' } });
  entry.count++; limits.set(address, entry);
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url); endpoint.searchParams.set('strategy', strategy); endpoint.searchParams.set('key', key);
  for (const category of ['performance', 'seo', 'accessibility', 'best-practices']) endpoint.searchParams.append('category', category);
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 85000);
  try {
    const upstream = await fetch(endpoint, { signal: controller.signal });
    if (!upstream.ok) return res.status(upstream.status === 429 ? 429 : 502).json({ error: { message: upstream.status === 429 ? 'The test provider is at its quota limit. Try again later.' : 'The test provider could not finish this check.' } });
    const result = await upstream.json();
    return res.status(200).json(result);
  } catch (_) {
    return res.status(502).json({ error: { message: 'The test provider did not respond in time.' } });
  } finally { clearTimeout(timer); }
}
