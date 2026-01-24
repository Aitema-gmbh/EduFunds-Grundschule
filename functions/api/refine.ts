import { GoogleGenAI, Schema, Type } from "@google/genai";

export const onRequestPost = async (context) => {
  try {
    const { request, env } = context;
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 500 });
    }

    const { currentDraft, instruction } = await request.json();

    const ai = new GoogleGenAI({ apiKey });
    const MODEL_FAST = 'gemini-2.5-flash';

    const applicationResponseSchema = {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING, description: "Formal subject line for the email/letter including the program name" },
        executiveSummary: { type: Type.STRING, description: "A 2-3 sentence summary of the proposal" },
        body: { type: Type.STRING, description: "The full proposal text in Markdown format" }
      },
      required: ["subject", "executiveSummary", "body"]
    };

    const prompt = `
        Rolle: Lektor für Grundschul-Förderanträge.
        
        AUFGABE:
        Überarbeite den folgenden Antragstext basierend auf dieser Instruktion: "${instruction}".
        Achte darauf, dass der pädagogische Fokus (Grundschule) erhalten bleibt.
        
        AKTUELLER TEXT:
        Betreff: ${currentDraft.subject}
        Body: ${currentDraft.body}
        
        Format: JSON (subject, executiveSummary, body).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: applicationResponseSchema
      }
    });

    const text = response.text;
    if (!text) return new Response(JSON.stringify({}), { status: 500 });
    
    const data = JSON.parse(text);

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Refine Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
