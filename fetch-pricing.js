const https = require('https');
const fs = require('fs');
const path = require('path');

const NOTION_API_KEY_ENV = process.env.NOTION_API_KEY || (fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8').split('\n').find(l => l.startsWith('NOTION_API_KEY=')).split('=')[1].trim() : "");
const NOTION_API_KEY = NOTION_API_KEY_ENV;
const DATABASE_ID = "e899e308df1642d8828b457aac3e9cbf";
const IMG_DIR = path.join(__dirname, 'images', 'fleet');

if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(`Failed to download image: ${res.statusCode}`);
      }
    }).on('error', (err) => {
      // Allow graceful failure for external links
      console.error("Image download err", err);
      resolve();
    });
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

const req = https.request(options, (res) => {
  let chunks = [];

  res.on('data', (d) => {
    chunks.push(d);
  });

  res.on('end', async () => {
    try {
      const rawBody = Buffer.concat(chunks).toString();
      const payload = JSON.parse(rawBody);
      
      if (payload.results) {
        let cleanData = [];
        
        for (const page of payload.results) {
          const name = page.properties.Name?.title?.[0]?.plain_text;
          if (!name) continue;
          
          const slugText = (page.properties.Slug?.rich_text || [])
            .map(t => t.plain_text)
            .join(' ');
            
          const imgFiles = page.properties.Image?.files || [];
          let imgUrl = '';
          if (imgFiles.length > 0) {
              imgUrl = imgFiles[0].file?.url || imgFiles[0].external?.url || '';
          }
          
          let safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          let localImagePath = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80'; // fallback
          
          if (imgUrl) {
            const destPath = path.join(IMG_DIR, `${safeName}.png`);
            console.log(`Downloading original Notion image for ${name}...`);
            await downloadImage(imgUrl, destPath);
            localImagePath = `./images/fleet/${safeName}.png`;
          }
            
          cleanData.push({ name, details: slugText, image: localImagePath });
        }
        
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

        fs.writeFileSync('prices.json', JSON.stringify(cleanData, null, 2));
        fs.writeFileSync('prices.js', 'window.LIVE_PRICES = ' + JSON.stringify(cleanData, null, 2) + ';');
        console.log('Successfully saved (Forced Order Applied)!');
      } else {
        console.error("No results found or error:", payload);
      }
    } catch (e) {
      console.error("Error parsing response:", e);
    }
  });

});

req.on('error', (error) => {
  console.error(error);
});

req.write(JSON.stringify({}));
req.end();
