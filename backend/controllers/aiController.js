const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the SDK. We do this inside the function or globally if key is available.
const getModel = (modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash') => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * @route   POST /api/ai/suggest
 * @desc    Generate structured task breakdown (subtasks, priority, time estimate)
 * @access  Private
 */
exports.suggestTaskBreakdown = async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Task title is required.' });
  }

  try {
    const model = getModel();

    const prompt = `
      You are an expert project manager and agile coach. 
      Analyze the following task and break it down into a highly structured JSON response.

      Task Title: "${title}"
      Task Description: "${description || ''}"

      Respond ONLY with a valid JSON object matching this schema, without markdown blocks or formatting:
      {
        "description": "A polished and professional version of the description. If none was provided, generate a good one.",
        "subtasks": [
          { "title": "Subtask 1", "status": "todo" }
        ],
        "priority": "low | medium | high | critical",
        "estimatedHours": number,
        "dependencies": ["List of potential blocking concepts or tasks"]
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = result.response.text();
    let suggestions;
    try {
      suggestions = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", responseText);
      return res.status(500).json({ success: false, message: 'AI returned invalid format.' });
    }

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate suggestions.' });
  }
};

/**
 * @route   POST /api/ai/chat
 * @desc    Conversational endpoint for the AI Assistant panel (supports streaming)
 * @access  Private
 */
exports.chat = async (req, res) => {
  const { message, history = [], systemInstruction } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: systemInstruction || "You are an expert NexTASK AI assistant. You help project managers and developers break down tasks, plan sprints, and summarize progress. Format your responses in clean markdown. Be concise, professional, and actionable."
    });

    // Format history for Gemini API. Google SDK requires the first message in history to be from 'user'.
    // And it MUST strictly alternate: user, model, user, model...
    let formattedHistory = [];
    let expectedRole = 'user';
    
    // Process the history to ensure valid alternating sequence
    for (let msg of history) {
      const msgRole = msg.role === 'user' ? 'user' : 'model';
      const msgText = (msg.parts && msg.parts[0] && msg.parts[0].text) || ' ';
      
      if (msgRole === expectedRole) {
        formattedHistory.push({
          role: msgRole,
          parts: [{ text: msgText }], // prevent empty text errors
        });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      } else if (formattedHistory.length > 0) {
        // If we get two of the same role in a row, replace the previous one with the newest one,
        // or just append to it. Let's replace it to avoid weird concatenated outputs.
        formattedHistory[formattedHistory.length - 1].parts[0].text += '\n' + msgText;
      }
    }

    // If history ends with a user message (because the frontend sent it by mistake or odd number),
    // Gemini expects the chat history passed to startChat to end with 'model' if we are about to send a user message.
    // However, if the new message is 'user', the history MUST end with 'model'. 
    // If it ends with 'user', we should remove it.
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
      formattedHistory.pop();
    }
    
    // If history starts with 'model', remove it (Google requires starting with 'user')
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
      },
    });

    // Start streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await chat.sendMessageStream(message);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Gemini API Streaming Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message || 'Chat generation failed.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
};
