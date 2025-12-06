export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint parameter required' });
  }

  try {
    // Build the full URL - endpoint already includes query params
    const apiUrl = `https://api.neynar.com/v2/farcaster/${endpoint}`;
    
    console.log('Fetching from Neynar:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Neynar API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Neynar API error: ${response.status}`,
        details: errorText 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Neynar API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}