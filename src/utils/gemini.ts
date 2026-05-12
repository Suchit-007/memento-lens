import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIContextExtraction } from '../types';

// Helper to get API Key safely
const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

// Fallback generator for zero-config demo resilience
function getFallbackExtraction(text: string): AIContextExtraction {
  const lower = text.toLowerCase();
  
  const where: string[] = [];
  if (lower.includes('pharmacy') || lower.includes('cvs') || lower.includes('walgreens')) where.push('Pharmacy');
  if (lower.includes('grocery') || lower.includes('store') || lower.includes('market') || lower.includes('milk') || lower.includes('eggs')) where.push('Grocery Store');
  if (lower.includes('office') || lower.includes('work') || lower.includes('desk')) where.push('Office');
  if (lower.includes('home') || lower.includes('house')) where.push('Home');
  if (lower.includes('hardware')) where.push('Hardware Store');

  const who: string[] = [];
  if (lower.includes('manager') || lower.includes('boss')) who.push('Manager');
  if (lower.includes('sarah')) who.push('Sarah');
  if (lower.includes('partner') || lower.includes('wife') || lower.includes('husband')) who.push('Partner');
  if (lower.includes('alone')) who.push('Alone');

  const contextTriggers: string[] = [];
  if (lower.includes('driving') || lower.includes('car')) contextTriggers.push('Driving');
  if (lower.includes('walking')) contextTriggers.push('Walking');
  if (lower.includes('working')) contextTriggers.push('Working');
  if (lower.includes('focus')) contextTriggers.push('High Focus');
  if (lower.includes('morning')) contextTriggers.push('Morning Routine');

  return {
    what: text.length > 60 ? text.substring(0, 57) + '...' : text,
    when: lower.includes('morning') ? ['Morning'] : lower.includes('afternoon') ? ['Afternoon'] : [],
    where,
    who,
    contextTriggers: contextTriggers.length ? contextTriggers : ['Active/Engaged'],
  };
}

export async function extractContextFromCapture(text: string): Promise<AIContextExtraction> {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'placeholder_or_your_actual_api_key_here') {
    console.warn('VITE_GEMINI_API_KEY is not set or placeholder. Using robust local fallback context extraction.');
    // Simulated processing latency for authentic user feel
    await new Promise((resolve) => setTimeout(resolve, 800));
    return getFallbackExtraction(text);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
    You are an AI context extraction engine for Memento Lens, an app for prospective memory offloading.
    Analyze the user's raw input thought/task and extract structured metadata adhering strictly to this JSON schema:
    {
      "what": "Concise actionable summary of the task or memory",
      "when": ["Implicit/explicit time slots like 'Morning', 'Weekend', etc."],
      "where": ["Locations or spatial boundaries like 'Pharmacy', 'Grocery Store', 'Office', 'Home'"],
      "who": ["Associated people/roles like 'Manager', 'Sarah', 'Alone'"],
      "contextTriggers": ["User activity states like 'Driving', 'Walking', 'Working', 'High Focus'"]
    }
    Input thought: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText) as AIContextExtraction;
    
    // Ensure all required properties exist
    return {
      what: parsed.what || text,
      when: Array.isArray(parsed.when) ? parsed.when : [],
      where: Array.isArray(parsed.where) ? parsed.where : [],
      who: Array.isArray(parsed.who) ? parsed.who : [],
      contextTriggers: Array.isArray(parsed.contextTriggers) ? parsed.contextTriggers : [],
    };
  } catch (err) {
    console.error('Gemini API extraction failed, using graceful fallback:', err);
    return getFallbackExtraction(text);
  }
}

export async function summarizeRememberThis(text: string): Promise<{ summaryBullets: string[]; extraction: AIContextExtraction }> {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'placeholder_or_your_actual_api_key_here') {
    console.warn('VITE_GEMINI_API_KEY is not set. Using local rich summarizer fallback.');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    // Simple robust bullet generator
    const sentences = text
      .split(/(?:\. |\n)+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
      
    const summaryBullets = sentences.slice(0, 4).map(s => s.replace(/^[•*-]\s*/, ''));
    if (summaryBullets.length === 0) {
      summaryBullets.push('Key context recorded successfully for quick reference.');
      summaryBullets.push('Review specific details in raw text dump.');
    }

    return {
      summaryBullets,
      extraction: getFallbackExtraction(text),
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
    You are an AI context synthesizer for Memento Lens. The user has captured a large block of dense ambient text/context using "Remember This".
    Synthesize this text into 3 to 5 highly actionable, ultra-concise bullet points, and extract relevant metadata tags.
    Output strictly as a JSON object adhering to this schema:
    {
      "summaryBullets": ["Bullet 1", "Bullet 2", "Bullet 3"],
      "extraction": {
        "what": "High level title/summary of the document",
        "when": ["Relevant time windows"],
        "where": ["Associated locations/spaces"],
        "who": ["Associated people"],
        "contextTriggers": ["Recommended activity state triggers"]
      }
    }
    Text content: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      summaryBullets: Array.isArray(parsed?.summaryBullets) ? parsed.summaryBullets : ['Synthesized context recorded.'],
      extraction: {
        what: parsed?.extraction?.what || 'Long-form Memory Capture',
        when: Array.isArray(parsed?.extraction?.when) ? parsed.extraction.when : [],
        where: Array.isArray(parsed?.extraction?.where) ? parsed.extraction.where : [],
        who: Array.isArray(parsed?.extraction?.who) ? parsed.extraction.who : [],
        contextTriggers: Array.isArray(parsed?.extraction?.contextTriggers) ? parsed.extraction.contextTriggers : ['Deep Work', 'Reviewing'],
      }
    };
  } catch (err) {
    console.error('Gemini API summarize failed, using fallback:', err);
    return {
      summaryBullets: ['Context saved and indexed for ambient reference.', 'Contains raw multi-sentence details.'],
      extraction: getFallbackExtraction(text),
    };
  }
}
