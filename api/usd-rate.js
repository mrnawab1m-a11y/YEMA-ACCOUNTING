export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const response = await fetch('https://t.me/s/kabul_dalarr_Toman', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YEMA-Accounting/1.0)',
        'Accept-Language': 'fa,en;q=0.8'
      },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Telegram channel returned ' + response.status);

    const html = await response.text();
    const messages = [...html.matchAll(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)]
      .map(match => match[1]
        .replace(/<br\s*\/?\s*>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;|&#160;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
        .replace(/[\u200e\u200f\u202a-\u202e]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim());

    const normalizeDigits = value => value
      .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

    const normalizeText = value => value
      .replace(/[يى]/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[ـ\u0640]/g, '')
      .replace(/\s+/g, ' ');

    // Newest Telegram posts first. Require a Kabul marker and a USD-to-AFN marker.
    for (const rawText of messages) {
      const text = normalizeText(normalizeDigits(rawText));
      if (!/کابل/.test(text)) continue;
      if (!/دالر\s*(?:به\s*)?افغانی/.test(text)) continue;
      if (/هرات|جلال\s*آباد|مزار|قندهار|غزنی|خوست/.test(text)) continue;

      const buyMatch = text.match(/خرید\s*[:：]?\s*(\d{2,3}(?:\.\d{1,4})?)/);
      const sellMatch = text.match(/فروش\s*[:：]?\s*(\d{2,3}(?:\.\d{1,4})?)/);
      if (!buyMatch || !sellMatch) continue;

      const buyRate = Number(buyMatch[1]);
      const sellRate = Number(sellMatch[1]);
      if (!Number.isFinite(buyRate) || !Number.isFinite(sellRate) ||
          buyRate < 20 || buyRate > 300 || sellRate < 20 || sellRate > 300 ||
          sellRate < buyRate) continue;

      return res.status(200).json({
        buyRate,
        sellRate,
        updatedAt: new Date().toISOString(),
        source: 'کانال کابل نرخ دالر kabul',
        sourceUrl: 'https://t.me/kabul_dalarr_Toman'
      });
    }

    throw new Error('No valid Kabul USD/AFN buy and sell post found');
  } catch (error) {
    console.error('YEMA USD rate fetch failed:', error);
    return res.status(503).json({
      error: 'Unable to retrieve Kabul USD/AFN rates from the Telegram channel.'
    });
  }
}