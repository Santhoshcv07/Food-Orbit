// src/app/api/ai/route.ts
import { NextResponse } from 'next/server';
import { getFoodRescueSummary } from '@/lib/groq';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activeCount, totalKg } = body;

    // This code executes 100% inside the secure Node.js cloud instance
    const summary = await getFoodRescueSummary(Number(activeCount || 0), Number(totalKg || 0));

    return NextResponse.json({ summary: summary });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("AI API Route Error:", error.message);
    return NextResponse.json(
      { summary: "AI Impact analysis service is temporarily unreachable." },
      { status: 500 }
    );
  }
}