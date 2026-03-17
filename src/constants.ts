import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getGeminiModel = () => {
  return ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: "Hello" }] }],
    config: {
      systemInstruction: "You are a friendly Maths tutor for Class 5 students named Mathix. Explain step-by-step in simple English and Hindi. If the student is wrong, explain the mistake clearly and kindly. Use emojis to be engaging. Keep explanations simple for 9-11 year olds.",
    },
  });
};

export const MATH_TOPICS = [
  "Numbers & Place Value",
  "Addition & Subtraction",
  "Multiplication & Division",
  "Fractions & Decimals",
  "Measurement (Length, Weight, Capacity)",
  "Time & Money",
  "Geometry & Shapes",
  "Data Handling",
  "Logic & Patterns"
];

export const ENGLISH_TOPICS = [
  "Nouns & Pronouns",
  "Verbs & Tenses",
  "Adjectives & Adverbs",
  "Prepositions & Conjunctions",
  "Sentence Structure",
  "Vocabulary & Synonyms",
  "Reading Comprehension",
  "Punctuation"
];

export const EVS_TOPICS = [
  "Our Body & Health",
  "Plants & Animals",
  "Environment & Pollution",
  "Natural Resources",
  "Space & Solar System",
  "States of Matter",
  "Force, Work & Energy",
  "Indian History & Culture"
];

export const LOGIC_TOPICS = [
  "Number Series",
  "Letter Patterns",
  "Coding & Decoding",
  "Blood Relations",
  "Direction Sense",
  "Venn Diagrams",
  "Analogies",
  "Puzzle Solving"
];

export const SUBJECTS = [
  { id: 'maths', name: 'Maths', icon: 'Calculator', topics: MATH_TOPICS },
  { id: 'english', name: 'English', icon: 'Book', topics: ENGLISH_TOPICS },
  { id: 'evs', name: 'EVS', icon: 'Globe', topics: EVS_TOPICS },
  { id: 'logic', name: 'Logic', icon: 'Brain', topics: LOGIC_TOPICS }
];
