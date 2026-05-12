import { useState, useEffect, useCallback } from 'react';
import { AIContextExtraction } from '../types';
import { geminiClient } from '../utils/geminiClient';

export interface UseGeminiExtractionReturn {
  extractedData: AIContextExtraction | null;
  loading: boolean;
  error: string | null;
  extract: (textToProcess: string) => Promise<AIContextExtraction | null>;
}

const CUSTOM_EXTRACTION_PROMPT = `You are Memento Lens AI Context Extractor. Analyze the chaotic, unformatted prospective thought provided by the user. Output ONLY pure, valid JSON matching this structure exactly:
{
  "what": "Refined, actionable summary of the intention",
  "when": ["Array of explicit dates, times, or implicit situational routines"],
  "where": ["Array of distinct locations, POIs, or spatial zones"],
  "who": ["Array of individuals, social entities, or companions"],
  "contextTriggers": ["Array of required activity states, focus tiers, or physical preconditions"]
}
Ensure strict JSON validity. Do not include markdown code block syntax.`;

export function useGeminiExtraction(rawText: string): UseGeminiExtractionReturn {
  const [extractedData, setExtractedData] = useState<AIContextExtraction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeExtraction = useCallback(async (textToProcess: string): Promise<AIContextExtraction | null> => {
    const trimmed = textToProcess.trim();
    if (!trimmed) {
      setExtractedData(null);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 8000);

    try {
      const data = await geminiClient.extractContext(
        trimmed,
        CUSTOM_EXTRACTION_PROMPT,
        controller.signal
      );
      setExtractedData(data);
      setLoading(false);
      clearTimeout(timeoutId);
      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      setLoading(false);
      const message = err?.message || 'Extraction failed due to malformed JSON or server timeout.';
      setError(message);
      return null;
    }
  }, []);

  useEffect(() => {
    if (rawText.trim()) {
      executeExtraction(rawText);
    } else {
      setExtractedData(null);
      setError(null);
    }
  }, [rawText, executeExtraction]);

  return {
    extractedData,
    loading,
    error,
    extract: executeExtraction
  };
}
