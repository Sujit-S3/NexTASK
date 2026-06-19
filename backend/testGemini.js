require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const history = [{ role: 'model', parts: [{ text: "Hi! I'm your NexTASK AI Assistant. How can I help you manage your tasks today?" }] }];
    let formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts[0].text }],
    }));

    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    console.log("Formatted History:", JSON.stringify(formattedHistory));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessageStream("Hello");

    for await (const chunk of result.stream) {
      process.stdout.write(chunk.text());
    }
    console.log();
  } catch (err) {
    console.error("ERROR:", err);
  }
}

test();
