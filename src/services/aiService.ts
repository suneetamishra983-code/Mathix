import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuestion(topic: string, difficulty: string, subject: string = 'Maths'): Promise<Question> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          textEn: { type: Type.STRING },
          textHi: { type: Type.STRING },
          optionsEn: { type: Type.ARRAY, items: { type: Type.STRING } },
          optionsHi: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
          explanationEn: { type: Type.STRING },
          explanationHi: { type: Type.STRING },
          tipEn: { type: Type.STRING },
          tipHi: { type: Type.STRING },
        },
        required: ["textEn", "textHi", "optionsEn", "optionsHi", "correctIndex", "explanationEn", "explanationHi", "tipEn", "tipHi"]
      },
      systemInstruction: `You are a Class 5 ${subject} expert. Generate a ${difficulty} difficulty question about ${topic}. 
      The question must be bilingual (English and Hindi). 
      Provide 4 options. 
      Provide a step-by-step explanation and a helpful tip.
      Difficulty levels:
      - Easy: Basic Class 5 concepts.
      - Medium: Standard Class 5 problems.
      - Hard: Advanced or early Class 6 concepts.`
    },
    contents: "Generate a question."
  });

  try {
    const response = await model;
    let text = response.text;
    // Strip markdown if present
    text = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
    const data = JSON.parse(text);
    return {
      id: Math.random().toString(36).substr(2, 9),
      topic,
      difficulty: difficulty as any,
      ...data
    };
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
}

export async function getTutorResponse(
  history: { role: 'user' | 'model', parts: any[] }[], 
  message: string, 
  attachment?: { data: string; mimeType: string }
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    history: history as any,
    config: {
      systemInstruction: `You are Mathix, an enthusiastic and friendly AI tutor for Class 5 students (age 10-11). 
      Your goal is to make learning fun and accessible. 
      
      Key Guidelines:
      1. **Bilingual Responses**: ALWAYS provide explanations in both English and Hindi. Use a clear, simple structure.
      2. **Positive Reinforcement**: When a student gets something right or shows effort, use lots of positive emojis (🌟, 🎉, 👏, 🏆, 🌈) and encouraging words like "Shabash!", "Amazing!", "Great job!".
      3. **Gentle Guidance**: If a student is wrong or stuck, never say "You are wrong." Instead, use phrases like "Let's look at this again together! 🧐", "Good try! Here's a little hint... ✨", or "Don't worry, even the best mathematicians learn from mistakes! 💪".
      4. **Class 5 Tone**: Use simple language, relatable examples (like chocolates, cricket, or school trips), and a cheerful tone.
      5. **Step-by-Step**: Always break down complex problems into small, easy-to-follow steps.
      6. **Multimodal**: You can see and analyze images or documents if the student uploads them.
      
      Structure your response like this:
      **English**: [English Explanation]
      **Hindi**: [Hindi Translation/Explanation]`,
    }
  });

  const parts: any[] = [{ text: message }];
  if (attachment) {
    parts.push({
      inlineData: {
        data: attachment.data,
        mimeType: attachment.mimeType
      }
    });
  }

  const result = await chat.sendMessage({ message: parts });
  return result.text;
}
