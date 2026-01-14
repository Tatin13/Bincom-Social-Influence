
import { GoogleGenAI, Type } from "@google/genai";
import { UTMState } from "../types";

export const getSuggestions = async (state: UTMState, type: 'content' | 'id'): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const prompt = `You are a digital marketing expert for Bincom Social Influence. 
    Analyze the destination: ${state.baseUrl}
    Campaign: ${state.campaign}
    Source: ${state.source}
    
    Suggest 5 professional and standard values for the UTM ${type} parameter. 
    Values should be lowercase, kebab-case, and highly relevant to the context.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    const data = JSON.parse(response.text || '{"suggestions": []}');
    return data.suggestions || [];
  } catch (error) {
    console.error("AI Suggestion Error:", error);
    return [];
  }
};
