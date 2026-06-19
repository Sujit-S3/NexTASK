require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModel(modelName) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessageStream("Hi");
    for await (const chunk of result.stream) { }
    console.log(modelName, "SUCCESS");
  } catch (err) {
    console.log(modelName, "FAILED:", err.message);
  }
}

async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-1.5-flash-latest');
  await testModel('gemini-1.0-pro');
  await testModel('gemini-pro');
}
run();
