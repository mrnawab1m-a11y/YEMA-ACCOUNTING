export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const response = await fetch('https://sarafi.af/fa/exchange-rates/sarai-shahzada/USD-AFN', {
      headers: { 'User-Agent': 'YEMA-Accounting/1.0', 'Accept-Language': 'fa,en;q=0.8' },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Rate provider returned ' + response.status);
    const html = await response.text();
    const text = html
      .replace(/<script[\\s\\S]*?<\\/script>/gi, ' ')
      .replace(/<style[\\s\\S]*?<\\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\\s+/g, ' ');
    const marker = text.search(/USD\\s*[-–/]\\s*(?:دالر|US Dollar)/i);
    const section = marker >= 0 ? text.slice(marker, marker + 1200) : text;
    const buyMatch = section.match(/خرید\\s*[:：]?\\s*(\\d{2,3}(?:\\.\\d{1,4})?)/i);
    const sellMatch = section.match(/فروش\\s*[:：]?\\s*(\\d{2,3}(?:\\.\\d{1,4})?)/i);
    const buyRate = buyMatch ? Number(buyMatch[1]) : NaN;
    const sellRate = sellMatch ? Number(sellMatch[1]) : NaN;
    if (!Number.isFinite(buyRate) || !Number.isFinite(sellRate) || buyRate < 20 || sellRate > 300 || sellRate < buyRate) {
      throw new Error('Could not parse valid Sarai Shahzada buy/sell rates');
    }
    return res.status(200).json({
      buyRate,
      sellRate,
      updatedAt: new Date().toISOString(),
      source: 'Sarafi.af · Sarai Shahzada',
      note: 'Indicative market rates; confirm with your saraf before a large transaction.'
    });
  } catch (error) {
    return res.status(503).json({ error: 'Unable to retrieve Sarai Shahzada buy/sell rates right now.' });
  }
}