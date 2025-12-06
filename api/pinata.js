export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS headers - must be first
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  console.log('📨 Received request:', req.method);

  // Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight');
    return res.status(200).end();
  }

  // Handle GET (for testing)
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Pinata API endpoint is working',
      hasJWT: !!process.env.PINATA_JWT,
      jwtLength: process.env.PINATA_JWT?.length || 0
    });
  }

  // Handle POST
  if (req.method !== 'POST') {
    console.error('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed', received: req.method });
  }

  try {
    console.log('📥 Processing POST request');
    
    const { fileName, fileType, fileData } = req.body || {};

    if (!fileName || !fileType || !fileData) {
      console.error('❌ Missing fields:', { fileName: !!fileName, fileType: !!fileType, fileData: !!fileData });
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { fileName: !!fileName, fileType: !!fileType, fileData: !!fileData }
      });
    }

    console.log('📤 Uploading to Pinata:', fileName, fileType);

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    // Create boundary
    const boundary = `----FormBoundary${Date.now()}`;
    
    // Build multipart form data
    const parts = [];
    
    // File part
    parts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: ${fileType}\r\n\r\n`
    ));
    parts.push(buffer);
    parts.push(Buffer.from('\r\n'));
    
    // Metadata part
    const metadata = JSON.stringify({ name: `face-caster-${Date.now()}` });
    parts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="pinataMetadata"\r\n\r\n` +
      metadata + '\r\n'
    ));
    
    parts.push(Buffer.from(`--${boundary}--\r\n`));
    
    const body = Buffer.concat(parts);

    // Upload to Pinata
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });

    const responseText = await pinataResponse.text();
    
    if (!pinataResponse.ok) {
      console.error('❌ Pinata error:', pinataResponse.status, responseText);
      return res.status(pinataResponse.status).json({ 
        error: 'Pinata upload failed',
        details: responseText 
      });
    }

    const data = JSON.parse(responseText);
    console.log('✅ Success:', data.IpfsHash);
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}