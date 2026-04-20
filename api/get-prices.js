const https = require('https');

export default function handler(req, res) {
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = "e899e308df1642d8828b457aac3e9cbf";
  
  if (!NOTION_API_KEY) {
    return res.status(401).json({ 
      error: "Vercel Configuration Error", 
      message: "The NOTION_API_KEY is missing in Vercel Environment Variables.",
      status: "MISSING"
    });
  }

  const options = {
    hostname: 'api.notion.com',
    path: `/v1/databases/${DATABASE_ID}/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    }
  };

  const notionReq = https.request(options, (notionRes) => {
    let chunks = [];
    notionRes.on('data', (d) => chunks.push(d));
    notionRes.on('end', () => {
      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString());
        if (!payload.results) {
          return res.status(notionRes.statusCode || 500).json({ 
            error: "Notion API Error", 
            message: payload.message || "Unknown error",
            code: payload.code || "unknown"
          });
        }

        const cleanData = payload.results.map(page => {
          const name = page.properties.Name?.title?.[0]?.plain_text || "Unnamed";
          const details = (page.properties.Slug?.rich_text || []).map(t => t.plain_text).join(' ');
          const imgFiles = page.properties.Image?.files || [];
          
          let image = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80';
          if (imgFiles.length > 0) {
            image = imgFiles[0].file?.url || imgFiles[0].external?.url || image;
          }
          return { name, details, image };
        });

        // --- MANDATORY CUSTOM ORDER ---
        const userOrder = [
          "Mini",
          "Sedan",
          "SUV (Tavera A/C)",
          "SUV(Tavera A/C)",
          "SUV (Innova A/C)",
          "SUV (Innova Crysta)",
          "Tempo 14 seater",
          "Tempo 18 seater",
          "21 Seater 407 Coach A/C",
          "21  Seater 407 Coach A/C",
          "21 Seater Coach non A/C"
        ];

        cleanData.sort((a, b) => {
          const normalize = (s) => s.replace(/\s+/g, '').toLowerCase();
          let indexA = userOrder.findIndex(n => normalize(n) === normalize(a.name));
          let indexB = userOrder.findIndex(n => normalize(n) === normalize(b.name));
          if (indexA === -1) indexA = 999;
          if (indexB === -1) indexB = 999;
          return indexA - indexB;
        });

        res.status(200).json(cleanData);
      } catch (e) {
        res.status(500).json({ error: "Parsing error" });
      }
    });
  });

  notionReq.on('error', (e) => res.status(500).json({ error: e.message }));
  notionReq.write(JSON.stringify({}));
  notionReq.end();
}
