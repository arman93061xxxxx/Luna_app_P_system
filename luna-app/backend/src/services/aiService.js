const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // gemini-2.0-flash-lite has the highest free tier quota
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
}

const SYSTEM_PROMPT = `You are Luna, an empathetic AI health assistant specializing in menstrual health and women's wellness.
You provide medically-informed, compassionate, and practical advice.
Always recommend consulting a doctor for serious concerns.
Keep responses concise, warm, and actionable.
Never diagnose conditions — only provide general health information and suggestions.`;

/**
 * Generate AI insights after a new period log
 */
const generateCycleInsights = async (logData, predictions, recentLogs) => {
  if (!model) {
    return {
      observation: 'Your cycle data has been recorded. Keep tracking for better insights.',
      suggestions: [
        'Stay hydrated — aim for 8 glasses of water daily.',
        'Light exercise like yoga can help reduce cramps.',
        'Maintain a consistent sleep schedule for hormonal balance.',
      ],
    };
  }

  const prompt = `${SYSTEM_PROMPT}

Analyze this menstrual cycle data and provide health insights:

Latest Period Log:
- Start Date: ${logData.startDate}
- End Date: ${logData.endDate || 'ongoing'}
- Flow Intensity: ${logData.flowIntensity}
- Symptoms: ${JSON.stringify(logData.symptoms)}
- Mood: ${logData.mood}
- Notes: ${logData.notes || 'none'}

Cycle Statistics:
- Average Cycle Length: ${predictions.averageCycleLength} days
- Current Cycle Day: ${predictions.currentCycleDay}
- Irregularity Score: ${predictions.irregularityScore}/100
- Late Status: ${predictions.lateStatus}
- Missed Status: ${predictions.missedStatus}
- Recent logs count: ${recentLogs.length}

Respond ONLY with valid JSON in this exact format:
{"observation":"2-3 sentence observation about cycle health","suggestions":["suggestion 1","suggestion 2","suggestion 3"]}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Extract JSON from response (Gemini sometimes wraps in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (err) {
    // Silently fallback to default insights (no error logging)
    return {
      observation: 'Your cycle data has been recorded. Keep tracking for better insights.',
      suggestions: [
        'Stay hydrated — aim for 8 glasses of water daily.',
        'Light exercise like yoga can help reduce cramps.',
        'Maintain a consistent sleep schedule for hormonal balance.',
      ],
    };
  }
};

/**
 * AI Chat assistant
 */
const chatWithAssistant = async (userMessage, conversationHistory, userContext) => {
  if (!model) {
    return "I'm Luna, your cycle health assistant. Gemini API key is not configured. Please add your API key to enable AI chat.";
  }

  const contextBlock = `User Context:
- Average Cycle Length: ${userContext.averageCycleLength} days
- Current Cycle Day: ${userContext.currentCycleDay || 'unknown'}
- Next Period: ${userContext.nextPeriodDate ? new Date(userContext.nextPeriodDate).toDateString() : 'unknown'}
- Late Status: ${userContext.lateStatus}
- Recent Symptoms: ${JSON.stringify(userContext.recentSymptoms || {})}`;

  // Build conversation for Gemini (it uses a different format)
  const history = conversationHistory.slice(-6).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const chat = model.startChat({
      history,
      generationConfig: { maxOutputTokens: 350 },
      systemInstruction: `${SYSTEM_PROMPT}\n\n${contextBlock}`,
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    // Silently fallback to default message (no error logging)
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};

module.exports = { generateCycleInsights, chatWithAssistant };
