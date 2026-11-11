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
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ');
    const marker = text.search(/USD\s*[-–/]\s*(?:دالر|US Dollar)/i);
    const section = marker >= 0 ? text.slice(marker, marker + 700) : text;
    const values = [...section.matchAll(/(?:^|\s)(\d{2,3}(?:\.\d{1,4})?)(?=\s|$)/g)].map(x => Number(x[1])).filter(x => x >= 20 && x <= 300);
    if (!values.length) throw new Error('Could not parse Sarafi USD/AFN rate');
    // The USD-AFN detail page lists the buy rate first and the sell rate second.
    const rate = values.length > 1 ? values[1] : values[0];
    return res.status(200).json({
      rate,
      source: 'Sarafi.af · Sarai Shahzada',
      updatedAt: new Date().toISOString(),
      note: 'Reference market rate; confirm with your saraf before a large transaction.'
    });
  } catch (error) {
    return res.status(503).json({ error: 'Unable to retrieve Sarai Shahzada rate right now.' });
  }
}