require('dotenv').config();
const fs = require('fs');
async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`);
    const data = await response.json();
    fs.writeFileSync('models.json', JSON.stringify(data.models.map(m => m.name), null, 2));
  } catch(err) {
    console.log("ERROR", err);
  }
}
listModels();
