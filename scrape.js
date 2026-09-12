const https = require('https');

function getUrls(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = data.match(/https:\/\/(?:static|vignette)\.wikia\.nocookie\.net\/avatar\/images\/[^"']+\/(?:revision|scale)[^"']+/g);
        resolve(matches ? matches.slice(0, 5) : []);
      });
    });
  });
}

async function main() {
  console.log("Aang:", await getUrls('https://avatar.fandom.com/wiki/Aang'));
  console.log("Katara:", await getUrls('https://avatar.fandom.com/wiki/Katara'));
  console.log("Toph:", await getUrls('https://avatar.fandom.com/wiki/Toph_Beifong'));
  console.log("Zuko:", await getUrls('https://avatar.fandom.com/wiki/Zuko'));
}
main();
