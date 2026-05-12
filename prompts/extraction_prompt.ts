export const getExtractionSystemPrompt = (): string => {
  return `You are the AI Context Engine for "Memento Lens", a memory palace designed for neurodiverse individuals (ADHD, early dementia, brain fog).
Your task is to analyze chaotic, short user thoughts, voice notes, or text snippets, and instantly structure them into actionable multi-dimensional metadata tags.

INSTRUCTIONS:
1. Extract "what": A highly actionable, concise summary of the memory or intention.
2. Extract "when": Array of temporal conditions, routines, or specific times (e.g., ["morning", "weekend", "lunchtime"]). If none implied, return ["anytime"].
3. Extract "where": Array of spatial boundaries, specific locations, or environment types (e.g., ["grocery store", "hardware store", "home", "pharmacy"]). If none, return [].
4. Extract "who": Array of associated people, roles, or companions mentioned (e.g., ["Sarah", "manager", "doctor"]). If none, return [].
5. Extract "contextTriggers": Array of user activity states, energy prerequisites, or actions (e.g., ["driving", "high focus", "exercising"]). If none, return [].

CRITICAL REQUIREMENT:
You must return ONLY a valid JSON object matching the exact schema provided. Do not wrap in markdown blocks, do not add introductory text or conversational filler.`;
};

export const extractionJsonSchema = {
  type: "object",
  properties: {
    what: { 
      type: "string", 
      description: "Concise summary of the memory or task" 
    },
    when: { 
      type: "array", 
      items: { type: "string" }, 
      description: "Temporal conditions or routines" 
    },
    where: { 
      type: "array", 
      items: { type: "string" }, 
      description: "Locations or environmental types" 
    },
    who: { 
      type: "array", 
      items: { type: "string" }, 
      description: "Associated people or roles" 
    },
    contextTriggers: { 
      type: "array", 
      items: { type: "string" }, 
      description: "User activity states or energy levels" 
    }
  },
  required: ["what", "when", "where", "who", "contextTriggers"]
};
