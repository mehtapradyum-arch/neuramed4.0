
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { requireVerifiedSession } from "@/lib/validator";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export const runtime = "edge";

export async function POST(req: Request) {
  const session = await requireVerifiedSession();
  const data = await req.formData();
  const file = data.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });

  // Store image
  const arrayBuffer = await file.arrayBuffer();
  const { url } = await put(`scans/${session.user.id}/${Date.now()}.jpg`, new Uint8Array(arrayBuffer), {
    access: "public",
    token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
    contentType: file.type || "image/jpeg",
  });

  try {
    const prompt = `You are a careful pill identification assistant. 
Return JSON with keys: nameCandidates (array), likelyUses (array), confidence (0-1), guidance (string).
Assess image, list likely pill names and uses, include confidence and safe next steps.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url } },
          ],
        },
      ],
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);
    await prisma.visionScan.create({
      data: {
        userId: session.user.id,
        imageUrl: url,
        predictionText: JSON.stringify(parsed),
        confidence: Number(parsed.confidence || 0),
      },
    });

    return NextResponse.json({ imageUrl: url, prediction: parsed });
  } catch (e) {
    await prisma.visionScan.create({
      data: {
        userId: session.user.id,
        imageUrl: url,
        predictionText: "unknown",
        confidence: 0,
      },
    });
    return NextResponse.json({
      imageUrl: url,
      prediction: { nameCandidates: [], likelyUses: [], confidence: 0, guidance: "Unable to identify. Please enter manually." },
    });
  }
}
