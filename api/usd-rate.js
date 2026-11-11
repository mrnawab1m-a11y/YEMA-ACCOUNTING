export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const response = await fetch('https://sarafi.af/fa/exchange-rates/sarai-shahzada/USD-AFN', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YEMA-Accounting/1.0)',
        'Accept-Language': 'fa,en;q=0.8'
      },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Rate provider returned ' + response.status);

    const html = await response.text();
    const pageText = html
      .replace(/<script[\\s\\S]*?<\\/script>/gi, ' ')
      .replace(/<style[\\s\\S]*?<\\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&#(\\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/[\\u200e\\u200f\\u202a-\\u202e]/g, ' ')
      .replace(/\\s+/g, ' ');

    const normalized = pageText
      .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

    // Sarafi.af labels this market as "USD - دالر آمریکا" (not "USD/AFN").
    const marker = normalized.search(/USD\\s*(?:\\/\\s*AFN|[-–—]\\s*دالر)/i);
    if (marker < 0) throw new Error('USD market section not found');

    const section = normalized.slice(marker, marker + 700);
    const buyMatch = section.match(/خرید\\s*[:：]?\\s*(\\d{2,3}(?:\\.\\d{1,4})?)/i);
    const sellMatch = section.match(/فروش\\s*[:：]?\\s*(\\d{2,3}(?:\\.\\d{1,4})?)/i);
    const buyRate = buyMatch ? Number(buyMatch[1]) : NaN;
    const sellRate = sellMatch ? Number(sellMatch[1]) : NaN;

    if (!Number.isFinite(buyRate) || !Number.isFinite(sellRate) ||
        buyRate < 20 || buyRate > 300 || sellRate < 20 || sellRate > 300 ||
        sellRate < buyRate) {
      throw new Error('Could not validate USD buy/sell rates in Sarafi.af response');
    }

    return res.status(200).json({
      buyRate,
      sellRate,
      updatedAt: new Date().toISOString(),
      source: 'Sarafi.af · Sarai Shahzada'
    });
  } catch (error) {
    console.error('YEMA USD rate fetch failed:', error);
    return res.status(503).json({
      error: 'Unable to retrieve Sarai Shahzada USD/AFN rates.'
    });
  }
}
