import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const imageUrl = req.query.url as string;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    
    res.send(buffer);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy image' });
  }
}
