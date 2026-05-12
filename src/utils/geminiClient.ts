import { AIContextExtraction } from '../types';

const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';

const DEFAULT_SYSTEM_PROMPT = `You are the core intelligence engine for Memento Lens, a proactive cognitive memory agent. 
Analyze the user's raw input thought and output a strictly formatted JSON object adhering to this schema:
{
  "what": "ultra-concise summary of the memory or task payload",
  "when": ["array of explicit times or fuzzy routine slots like 'slow morning'"],
  "where": ["array of locations, specific POIs, or environment types like 'hardware store'"],
  "who": ["array of associated people, roles, or entities"],
  "contextTriggers": ["array of required user states or activity levels like 'driving', 'high focus'"]
}
Rules:
- Respond ONLY with pure valid JSON. Do not wrap in markdown code blocks.
- If a dimension has no relevant data, return an empty array.
- Be highly intelligent in extracting implied contexts.`;

export const geminiClient = {
  async extractContext(
    rawText: string,
    customPrompt?: string,
    signal?: AbortSignal
  ): Promise<AIContextExtraction> {
    const trimmed = rawText.trim();
    if (!trimmed) {
      throw new Error('Input text is empty.');
    }

    if (!GEMINI_API_KEY) {
      console.warn('VITE_GEMINI_API_KEY is missing. Using smart stage-demo simulated client extraction.');
      return simulateExtraction(trimmed);
    }

    const systemInstruction = customPrompt || DEFAULT_SYSTEM_PROMPT;

    try {
      // Use gemini-1.5-flash standard active model endpoint to ensure stability and compatibility
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemInstruction}\n\nUser Input: "${trimmed}"` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal
      });

      if (!response.ok) {
        console.warn(`Gemini API returned status ${response.status}. Executing stage-demo simulation logic.`);
        return simulateExtraction(trimmed);
      }

      const data = await response.json();
      const rawJsonString = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawJsonString) {
        throw new Error('Empty or malformed JSON content block returned from Gemini API.');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(rawJsonString);
      } catch (jsonErr) {
        throw new Error('Malformed JSON payload received from extraction engine.');
      }

      return {
        what: parsed?.what || trimmed,
        when: Array.isArray(parsed?.when) ? parsed.when : [],
        where: Array.isArray(parsed?.where) ? parsed.where : [],
        who: Array.isArray(parsed?.who) ? parsed.who : [],
        contextTriggers: Array.isArray(parsed?.contextTriggers) ? parsed.contextTriggers : []
      };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error('Extraction request timed out after 8 seconds.');
      }
      console.warn('Gemini extraction API failed. Gracefully falling back to simulated analysis:', err);
      return simulateExtraction(trimmed);
    }
  }
};

function simulateExtraction(text: string): AIContextExtraction {
  const lower = text.toLowerCase();
  
  const when: string[] = [];
  const where: string[] = [];
  const who: string[] = [];
  const contextTriggers: string[] = [];

  if (lower.includes('morning')) when.push('Morning');
  if (lower.includes('afternoon')) when.push('Afternoon');
  if (lower.includes('evening') || lower.includes('night')) when.push('Evening');
  if (lower.includes('weekend')) when.push('Weekend');
  if (lower.includes('lunch') || lower.includes('noon')) when.push('Lunchtime');

  if (lower.includes('pharmacy') || lower.includes('prescription')) where.push('Pharmacy');
  if (lower.includes('grocery') || lower.includes('store') || lower.includes('milk') || lower.includes('eggs')) where.push('Grocery Store');
  if (lower.includes('hardware')) where.push('Hardware Store');
  if (lower.includes('office') || lower.includes('desk') || lower.includes('roadmap')) where.push('Office');
  if (lower.includes('home') || lower.includes('house')) where.push('Home');

  if (lower.includes('sarah')) who.push('Sarah');
  if (lower.includes('manager') || lower.includes('boss')) who.push('Manager');
  if (lower.includes('doctor') || lower.includes('dr')) who.push('Doctor');
  if (lower.includes('partner') || lower.includes('wife') || lower.includes('husband')) who.push('Partner');

  if (lower.includes('driving') || lower.includes('car')) contextTriggers.push('Driving');
  if (lower.includes('walking') || lower.includes('running')) contextTriggers.push('Walking');
  if (lower.includes('working') || lower.includes('focus') || lower.includes('discuss')) contextTriggers.push('Working');
  if (lower.includes('call') || lower.includes('phone') || lower.includes('podcast')) contextTriggers.push('On Call');

  let what = text;
  if (text.length > 55) {
    what = text.split('.')[0];
    if (what.length > 55) what = what.substring(0, 52) + '...';
  }

  return {
    what,
    when,
    where,
    who,
    contextTriggers
  };
}
