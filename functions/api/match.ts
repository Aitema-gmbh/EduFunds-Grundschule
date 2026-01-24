import { GoogleGenAI, Schema, Type } from "@google/genai";

const isProgramActive = (deadlineStr) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    if (!deadlineStr) return true; // Safety check

    // Case 1: "Laufend" or "Permanent" -> Always active
    if (deadlineStr.toLowerCase().includes('laufend') || deadlineStr.toLowerCase().includes('permanent')) {
        return true;
    }

    // Case 2: Explicit Date "DD.MM.YYYY"
    const dateMatch = deadlineStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1; // JS months are 0-indexed
        const year = parseInt(dateMatch[3]);
        const deadlineDate = new Date(year, month, day);
        
        // If deadline is in the past (yesterday or earlier), return false
        if (deadlineDate < today) return false;
        return true;
    }

    // Case 3: Just a year check (e.g. "Herbst 2025")
    // If it explicitly mentions a past year, filter it.
    if (deadlineStr.includes((currentYear - 1).toString())) return false;

    return true;
};

export const onRequestPost = async (context) => {
  try {
    const { request, env } = context;
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 500 });
    }

    const { profile, programs } = await request.json();

    // 1. Strict Filtering (Geo & Date) BEFORE AI
    const eligiblePrograms = programs.filter(p => {
        // Geo Check
        const regionMatch = p.region.includes('DE') || (profile.state && p.region.includes(profile.state));
        if (!regionMatch) return false;

        // Date Check
        const dateActive = isProgramActive(p.deadline);
        if (!dateActive) return false;
        
        return true;
    });

    if (eligiblePrograms.length === 0) {
        return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
    }

    const ai = new GoogleGenAI({ apiKey });
    const MODEL_FAST = 'gemini-2.5-flash';

    const matchResponseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          programId: { type: Type.STRING },
          score: { type: Type.NUMBER, description: "Relevance score between 0 and 100" },
          reasoning: { type: Type.STRING, description: "Short explanation why this fits (in German)" },
          tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Short tags like 'Geo-Match', 'Topic-Match', 'Social-Bonus'" 
          }
        },
        required: ["programId", "score", "reasoning", "tags"]
      }
    };

    const todayDate = new Date().toLocaleDateString('de-DE');

    const prompt = `
      HEUTIGES DATUM: ${todayDate}
      KONTEXT: GRUNDSCHULE / PRIMARSTUFE (Klasse 1-4, Alter 6-10).

      Bewerte die Passung (0-100) für folgende Förderprogramme für diese Schule:
      
      SCHULE:
      Name: ${profile.name}
      Ort: ${profile.location} (${profile.state})
      Profil: ${profile.focusAreas.join(', ')}
      Sozialindex: ${profile.socialIndex}
      Leitbild: ${profile.missionStatement}

      PROGRAMME:
      ${JSON.stringify(eligiblePrograms.map(p => ({
          id: p.id,
          title: p.title,
          focus: p.focus,
          targetGroup: p.targetGroup,
          requirements: p.requirements
      })))}

      LOGIK:
      1. Zielgruppe: Muss für Grundschule (Klasse 1-4) passen. Wenn Programm für "Berufsvorbereitung" oder "Oberstufe" ist -> SCORE 0.
      2. Sozialindex: Hoher Index (4-5) + "Startchancen" oder "Soziale Benachteiligung" -> Score Boost.
      3. Thematisch: Wenn Schule "Bewegung" Profil hat und Programm "Schulhof" fördert -> Score 90+.
      
      TAGS:
      Erstelle kurze Tags (Max 3) wie "Ideal für Primarstufe", "Sozial-Bonus", "Thema passt".

      Return JSON Array.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: matchResponseSchema
      }
    });

    const text = response.text;
    if (!text) return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
    
    const aiResults = JSON.parse(text);

    return new Response(JSON.stringify(aiResults), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Match Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
