export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
    console.log('[metrics]', {
      id: body.id,
      name: body.name,
      value: body.value,
      rating: body.rating,
      navigationType: body.navigationType,
      delta: body.delta,
      t: Date.now(),
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[metrics:error]', err);
    res.status(500).json({ error: 'internal_error' });
  }
}


