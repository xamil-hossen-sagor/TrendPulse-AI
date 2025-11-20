
import { GoogleGenAI, Chat } from "@google/genai";
import { KeywordData, TrendPrediction, SearchSource, RelatedKeyword } from '../types';

// Ensure API key is present from environment as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches current trending keywords using Google Search Grounding.
 * Uses 'gemini-2.5-flash' for speed and tool access.
 */
export const fetchLiveTrends = async (): Promise<{ 
  trends: KeywordData[], 
  sources: SearchSource[], 
  rawText: string 
}> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Find 8 specific, niche, long-tail keywords that are emerging right now but have **LOW daily search volume (specifically between 10 to 100 searches)**.
      
      I need a 50/50 split:
      - 50% MUST be **"New"** Breakout terms (first-time ever searches today).
      - 50% can be **"Trending"** niche terms.

      Criteria:
      1. **Volume**: Must be low, between 10 and 100 searches/day.
      2. **"New" Status**: Identify terms likely searched on Google for the **first time ever** today (e.g. specific error code, local news detail).
      3. **Time Detected**: Estimate how long ago this started trending (e.g., "2 hours ago", "45 mins ago").

      IMPORTANT: Output the data in a structured text format I can parse, like this:
      KEYWORD | VOLUME | STATUS | CATEGORY | TIME_AGO
      
      Example:
      error code 0x80042405-a0 | 45 | New | Tech Support | 45 mins ago
      vintage ceramic capacitor 102k | 80 | Trending | Electronics | 6 hours ago
      local council meeting minutes dhaka | 15 | New | Local News | 2 hours ago
      
      Do not use Markdown tables, just plain lines with pipe separators.
      After the list, provide a brief summary.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const sources: SearchSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.flatMap(chunk => chunk.web ? [{ title: chunk.web.title || 'Source', uri: chunk.web.uri || '#' }] : [])
      || [];

    // Basic parsing logic
    const trends: KeywordData[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.includes('|')) {
        // Robust split handling for potential markdown tables
        const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
        
        if (parts.length >= 3) {
          // Ignore header rows
          if (parts[0].toLowerCase().includes('keyword') || parts[0].includes('---')) return;

          let volume = 0;
          const volumeRaw = parts[1].toLowerCase();
          const numVal = parseFloat(volumeRaw.replace(/[^0-9.]/g, ''));
          
          if (volumeRaw.includes('k')) volume = numVal * 1000;
          else if (volumeRaw.includes('m')) volume = numVal * 1000000;
          else volume = numVal;

          // Basic validation to ensure it's a data row
          if (!isNaN(volume) && volume > 0) {
            trends.push({
              keyword: parts[0],
              volume: Math.floor(volume),
              status: parts[2].includes('New') ? 'New' : 'Trending',
              change: '+--', 
              category: parts[3] || 'General',
              firstSeen: parts[4] || 'Today' // Capture the time detected column
            });
          }
        }
      }
    });

    return { trends, sources, rawText: text };
  } catch (error) {
    console.error("Error fetching live trends:", error);
    throw error;
  }
};

/**
 * Generates related keywords with metrics based on a seed term.
 */
export const fetchRelatedKeywords = async (seed: string): Promise<RelatedKeyword[]> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Act as an SEO Specialist. Generate 6-8 specific, long-tail related keywords for the seed term: "${seed}".
      
      For each keyword, provide:
      1. Topic Match Score (0-100% relevance to "${seed}")
      2. Estimated Monthly Volume Range (e.g. "50-200")
      3. Competition Level (Low, Medium, or High)
      4. Estimated CPC (e.g. "$1.20" or "N/A")

      Format output as pipe-separated values:
      KEYWORD | TOPIC MATCH | VOLUME | COMPETITION | CPC

      Example:
      ${seed} best practices | 95 | 100-500 | Low | $2.50
      how to fix ${seed} error | 88 | 50-150 | Medium | $1.10

      Do not verify with live tools, use your knowledge base to estimate these metrics accurately.
      Do not use Markdown tables.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text || '';
    const results: RelatedKeyword[] = [];
    
    const lines = text.split('\n');
    lines.forEach(line => {
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 4 && !parts[0].toLowerCase().includes('keyword')) {
          results.push({
            keyword: parts[0],
            topicMatch: parseInt(parts[1].replace(/[^0-9]/g, '')) || 0,
            volume: parts[2],
            competition: (parts[3] as any) || 'Medium',
            cpc: parts[4] || '-'
          });
        }
      }
    });

    return results;
  } catch (error) {
    console.error("Error fetching related keywords:", error);
    throw error;
  }
};

/**
 * Predicts future trends using 'gemini-3-pro-preview' with Thinking.
 * This uses deep reasoning to analyze the provided context (current trends/news).
 */
export const predictFutureTrends = async (currentContext: string): Promise<{ 
  predictions: TrendPrediction[], 
  reasoning: string 
}> => {
  try {
    const model = 'gemini-3-pro-preview';
    
    const prompt = `
      Context: Here is a summary of current niche search trends:
      ${currentContext}

      Task: Analyze this context along with your internal knowledge of emerging micro-trends for the next 3 days.
      
      Predict 3 specific low-volume keywords that are likely to start appearing in the next 24-72 hours.
      
      For each prediction, explain your reasoning chain in depth.
      
      Format the final output clearly so I can extract:
      1. The Keyword
      2. Probability Score (0-100)
      3. The "Why"
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking budget for deep analysis
      }
    });

    const text = response.text || '';
    
    return { predictions: [], reasoning: text };
  } catch (error) {
    console.error("Error predicting trends:", error);
    throw error;
  }
};

/**
 * Chatbot instance creator
 */
export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a helpful Trend Analysis Assistant. You help users understand keyword data and search trends.",
    }
  });
};
