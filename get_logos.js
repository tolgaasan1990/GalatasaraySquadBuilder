const fs = require('fs');

const ids = {
  'Başakşehir': 1294,
  'Göztepe': 109,
  'Trabzonspor': 25,
  'Kocaelispor': 1316,
  'Gençlerbirliği': 18,
  'Fenerbahçe': 15,
  'Samsunspor': 1274,
  'Antalyaspor': 1433,
  'Kasımpaşa': 1288
};

async function getLogo(id) {
    const res = await fetch(`https://www.futbollogo.com/takim.php?id=${id}`);
    const html = await res.text();
    const m = html.match(/(?:resimler|logolar)\/[^"]+\.(?:png|jpg|jpeg|gif|svg)/i);
    if (m) {
        return `https://www.futbollogo.com/${m[0]}`;
    }
    return null;
}

async function run() {
    let rawdata = fs.readFileSync('data/fixtures.json');
    let fixtures = JSON.parse(rawdata);
    
    for (const [name, id] of Object.entries(ids)) {
        const logo = await getLogo(id);
        if (logo) {
            fixtures.forEach(f => {
                if (f.opponent === name || f.opponent === 'Gençlerbirliği') { // Some edge case
                   if (f.opponent === name) {
                       f.opponentLogo = logo;
                   }
                }
            });
            console.log(`Updated ${name} with ${logo}`);
        }
    }
    fs.writeFileSync('data/fixtures.json', JSON.stringify(fixtures, null, 2));
    console.log("Done updating fixtures.json");
}
run();
