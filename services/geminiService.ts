import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, MCQ, MaterialStatus } from "../types";

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export interface StudyPackResponse {
  summary: string;
  flashcards: { front: string; back: string }[];
  mcqs: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  topics: string[];
}

export const generateStudyPack = async (text: string): Promise<StudyPackResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please configure process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Define schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: "A structured summary of the lecture material using Markdown formatting (headers, bullets).",
      },
      flashcards: {
        type: Type.ARRAY,
        description: "A list of 5-10 flashcards based on key concepts.",
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING, description: "The question or concept on the front of the card." },
            back: { type: Type.STRING, description: "The answer or definition on the back." },
          },
          required: ["front", "back"],
        },
      },
      mcqs: {
        type: Type.ARRAY,
        description: "A list of 3-5 multiple choice questions.",
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of 4 possible answers."
            },
            correctIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)." },
            explanation: { type: Type.STRING, description: "Explanation of why the answer is correct." },
          },
          required: ["question", "options", "correctIndex", "explanation"],
        },
      },
      topics: {
        type: Type.ARRAY,
        description: "List of 3-5 main topics covered.",
        items: { type: Type.STRING },
      }
    },
    required: ["summary", "flashcards", "mcqs", "topics"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a comprehensive study pack from the following lecture text. 
      Create a structured summary, a set of flashcards for spaced repetition, and multiple choice questions to test understanding.
      
      Lecture Text:
      ${text.substring(0, 30000)}`, // Limit text length for safety
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as StudyPackResponse;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};