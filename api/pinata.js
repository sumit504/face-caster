export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, fileType, fileData } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    // Create form data
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('file', buffer, {
      filename: fileName,
      contentType: fileType,
    });

    formData.append('pinataMetadata', JSON.stringify({
      name: `face-caster-${Date.now()}`,
    }));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata error:', errorText);
      return res.status(response.status).json({ error: 'Pinata upload failed' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Pinata API error:', error);
    return res.status(500).json({ error: error.message });
  }
}