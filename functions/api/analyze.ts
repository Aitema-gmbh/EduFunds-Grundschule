import { GoogleGenAI } from "@google/genai";

export const onRequestPost = async (context) => {
  try {
    const { request, env } = context;
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 500 });
    }

    const { name, city } = await request.json();

    const ai = new GoogleGenAI({ apiKey });
    const MODEL_SMART = 'gemini-2.5-flash';

    const prompt = `
      Recherchiere die GRUNDSCHULE: "${name}" in "${city}".
      
      Ziel: Erstelle ein Profil für Förderanträge (Primarstufe).
      
      1. Finde die offizielle Website.
      2. Ermittle das Bundesland und gib den ISO-Code zurück (z.B. "DE-BY").
      3. Suche nach "Leitbild", "Schulprogramm" oder "Pädagogisches Konzept".
      4. Suche Schülerzahl (meist ca. 100-400 bei Grundschulen).
      5. Suche nach speziellen Grundschul-Profilen (z.B. "Bewegte Schule", "Montessori", "MINT-freundlich").
      
      ANTWORTE NUR MIT VALIDEM JSON (kein Markdown).
      
      Struktur:
      {
        "website": "URL",
        "state": "ISO Code (z.B. DE-BW)",
        "studentCount": Zahl,
        "teacherCount": Zahl,
        "focusAreas": ["Lesen", "Bewegung", "Musik", "MINT"],
        "missionStatement": "Text",
        "socialIndex": Zahl (1-5, schätze anhand Lage),
        "address": "Straße Hausnummer, PLZ Stadt",
        "email": "Kontakt Email",
        "awards": ["Auszeichnung 1"],
        "partners": ["Partner 1"]
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let text = response.text;
    if (!text) return new Response(JSON.stringify({}), { status: 200 });

    if (text.includes('```json')) {
      text = text.split('```json')[1].split('```')[0];
    } else if (text.includes('```')) {
      text = text.split('```')[1].split('```')[0];
    }
    text = text.trim();

    const data = JSON.parse(text);

    // Defaults for Primary Schools
    if (!data.studentCount) data.studentCount = 200;
    if (!data.socialIndex) data.socialIndex = 3;
    if (!data.state) data.state = 'DE';

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
