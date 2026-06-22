// src/lib/groq.ts
import Groq from 'groq-sdk';

// 1. Initialize Groq purely for Node.js Server execution
// Notice 'dangerouslyAllowBrowser' has been deleted forever.
const apiKey = process.env.GROQ_API_KEY;

const groq = new Groq({
  apiKey: apiKey || 'fallback-key',
});

export async function getFoodRescueSummary(listingsCount: number, totalKg: number): Promise<string> {
  if (!apiKey || apiKey === 'fallback-key') {
    console.warn("Backend Warning: GROQ_API_KEY is missing from the server environment.");
    return "Impact summary running in offline mode. Your automated food rescue efforts are actively diverting organic surplus from municipal landfills.";
  }

  try {
    const prompt = `Act as an expert sustainability analyst for FoodOrbit, a three-tier food rescue network (Tier 1: Human Consumption, Tier 2: Animal Feed, Tier 3: Composting). 
    We currently have ${listingsCount} active surplus food listings and have successfully rescued ${totalKg} kg of food.
    Write a brief, motivating 2-sentence environmental impact summary and offer one practical tip for event organizers to minimize buffet waste. Keep the tone professional, uplifting, and formatted cleanly.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile', // Locked to your tested, working Versatile model
    });

    return chatCompletion.choices[0]?.message?.content || 
      "Incredible progress! Your food redistribution efforts are actively curbing landfill methane emissions and bridging the gap between abundance and need.";
  } catch (error) {
    console.error("Groq Server-Side API API Error:", error);
    return "AI Impact summary is temporarily running in offline mode. Every kilogram rescued brings us closer to a circular food economy!";
  }
}