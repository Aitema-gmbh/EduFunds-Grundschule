import { GoogleGenAI, Schema, Type } from "@google/genai";

export const onRequestPost = async (context) => {
  try {
    const { request, env } = context;
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 500 });
    }

    const { profile, program, projectSpecifics } = await request.json();

    const ai = new GoogleGenAI({ apiKey });
    const MODEL_SMART = 'gemini-2.5-flash';

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
      Rolle: Pädagogischer Experte für Grundschul-Förderung & Schulentwicklung.
      Aufgabe: Erstelle einen professionellen, pädagogisch fundierten Antragstext für: ${program.title}.
      Zielgruppe des Antragslesers: Schulamt, Stiftung oder Ministerium.
      
      KONTEXT SCHULE (GRUNDSCHULE):
      Name: ${profile.name}, ${profile.location}
      Leitbild: "${profile.missionStatement}"
      Besonderheit: Primarstufe (Kinder 6-10 Jahre).
      
      PROGRAMM:
      Geber: ${program.provider}
      Kriterien: ${program.detailedCriteria?.join(', ')}
      Einreichungsweg: ${program.submissionMethod}
      
      WICHTIG - ANLAGEN:
      Geforderte Dokumente: ${program.requiredDocuments.join(', ')}.
      
      PROJEKTIDEE:
      ${projectSpecifics}

      STRATEGIE:
      - Nutze kindgerechte, pädagogische Begrifflichkeiten (z.B. "ganzheitliches Lernen", "Basiskompetenzen", "Spielerischer Zugang", "Partizipation der Kinder").
      - Argumentiere mit dem Schulleitbild.
      - Betone die Nachhaltigkeit für die Schulentwicklung.
      - Tonalität: Professionell, engagiert, pädagogisch wertvoll.
      
      Format: JSON (subject, executiveSummary, body). Body ist Markdown.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: applicationResponseSchema,
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const text = response.text;
    if (!text) return new Response(JSON.stringify({}), { status: 500 });

    const data = JSON.parse(text);

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Generate Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
