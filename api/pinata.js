import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true
    });

    const parseForm = () => new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = await parseForm();
    
    // Get the file
    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Handle both array and single file cases
    const uploadFile = Array.isArray(file) ? file[0] : file;

    // Create a new FormData instance for the Pinata request
    const formData = new FormData();
    
    // Add the file to FormData
    formData.append('file', fs.createReadStream(uploadFile.filepath), {
      filename: uploadFile.originalFilename || uploadFile.newFilename,
      contentType: uploadFile.mimetype,
    });

    // Add metadata if provided
    if (fields.pinataMetadata) {
      const metadata = Array.isArray(fields.pinataMetadata) 
        ? fields.pinataMetadata[0] 
        : fields.pinataMetadata;
      formData.append('pinataMetadata', metadata);
    }

    console.log('📤 Uploading to Pinata IPFS...');
    
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
      console.error('Pinata API error:', response.status, errorText);
      
      // Clean up the temporary file
      try {
        fs.unlinkSync(uploadFile.filepath);
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }
      
      return res.status(response.status).json({ 
        error: `Pinata upload failed: ${response.status}`,
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('✅ Uploaded to Pinata:', data.IpfsHash);
    
    // Clean up the temporary file
    try {
      fs.unlinkSync(uploadFile.filepath);
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr);
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Pinata API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}