// src/lib/groq.ts
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || 'placeholder-groq-key';

// Initialize the Groq client
export const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true, // Allows us to fetch fast AI insights directly in client components
});

/**
 * AI Helper function to generate instant sustainability summaries for FoodOrbit
 */
export async function getFoodRescueSummary(listingsCount: number, totalKg: number): Promise<string> {
  try {
    const prompt = `Act as an expert sustainability analyst for FoodOrbit, a three-tier food rescue network (Tier 1: Human Consumption, Tier 2: Animal Feed, Tier 3: Composting). 
    We currently have ${listingsCount} active surplus food listings and have successfully rescued ${totalKg} kg of food.
    Write a brief, motivating 2-sentence environmental impact summary and offer one practical tip for event organizers to minimize buffet waste. Keep the tone professional, uplifting, and formatted cleanly.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
    });

    return chatCompletion.choices[0]?.message?.content || 
      "Incredible progress! Your food redistribution efforts are actively curbing landfill methane emissions and bridging the gap between abundance and need.";
  } catch (error) {
    console.error("Groq AI API Error:", error);
    return "AI Impact summary is temporarily running in offline mode. Every kilogram rescued brings us closer to a circular food economy!";
  }
}