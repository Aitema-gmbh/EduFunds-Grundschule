import { GoogleGenAI } from "@google/genai";

export const onRequestPost = async (context) => { // Changed to POST to be consistent, or GET? No args needed. Let's use GET or POST. POST is fine.
  try {
    const { env } = context;
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const MODEL_SMART = 'gemini-2.5-flash';

    const todayYear = new Date().getFullYear();
    const nextYear = todayYear + 1;
    
    const prompt = `
      Führe eine umfassende "Deep Search" nach Förderprogrammen für deutsche Grundschulen durch.
      Ziel: Finde 10-15 hochwertige, AKTIVE Programme für den Zeitraum ${todayYear}/${nextYear}.
      
      STRATEGIE (Sub-Searches):
      1. Suche nach "Digitalpakt Schule 2.0" oder Nachfolgeprogrammen & Landesinitiativen zur Digitalisierung.
      2. Suche nach "Schulhofumgestaltung Förderung ${todayYear}" (Klimaanpassung, Entsiegelung).
      3. Suche nach "Kulturelle Bildung Grundschule Förderung" (Musik, Theater, Zirkus).
      4. Suche nach "MINT Förderung Grundschule" (Stiftungen, Technik).
      5. Suche nach "Sozialarbeit an Schulen Förderung" (Chancengleichheit).
      6. Suche nach "EU-Fördermittel für Schulen Kleinprojekte" (Erasmus+, eTwinning).

      FILTER-KRITERIEN:
      - MUSS für Grundschulen (Primarstufe) offen sein.
      - MUSS aktuell bewerbbar sein (Deadline in Zukunft oder "Laufend").
      - KEINE reinen Wettbewerbe mit geringer Gewinnchance, Fokus auf strukturelle Förderung.
      
      EXTRAHIERE DIE ADRESSE:
      Suche aktiv nach der Postanschrift des Fördermittelgebers (im Impressum oder Kontaktbereich).
      
      REQUIRED JSON STRUCTURE (Array of objects):
      {
        "id": "unique-slug-string",
        "title": "Name des Programms",
        "provider": "Stiftung oder Behörde",
        "address": "Straße Hausnummer, PLZ Stadt",
        "budget": "Max. Summe oder 'Sachmittel'",
        "deadline": "DD.MM.YYYY oder 'Laufend'",
        "focus": "Thema (z.B. Inklusion, Bau, Digital, Kultur)",
        "description": "Kurze Beschreibung",
        "requirements": "Wer darf sich bewerben? (Muss Grundschule sein)",
        "targetGroup": "z.B. 'Klasse 1-4', 'Bildungsbenachteiligte'",
        "region": ["DE"] oder ["DE-NW"] (ISO Codes Array!),
        "fundingQuota": "z.B. '100% Förderung' oder 'Max. 5000€'",
        "detailedCriteria": ["Kriterium 1", "Kriterium 2"],
        "submissionMethod": "z.B. 'Online-Portal', 'Email'",
        "requiredDocuments": ["Dokument 1", "Dokument 2"],
        "fundingPeriod": "z.B. '12 Monate'",
        "officialLink": "URL"
      }
      
      Antworte NUR mit dem JSON Array.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let text = response.text;
    if (!text) return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });

    if (text.includes('```json')) {
      text = text.split('```json')[1].split('```')[0];
    } else if (text.includes('```')) {
        text = text.split('```')[1].split('```')[0];
    }
    text = text.trim();

    const rawData = JSON.parse(text);
    
    const validatedPrograms = rawData.map((item, index) => ({
        id: item.id || `live-gen-${Date.now()}-${index}`,
        title: item.title || 'Unbekanntes Programm',
        provider: item.provider || 'Unbekannt',
        address: item.address || '',
        budget: item.budget || 'Auf Anfrage',
        deadline: item.deadline || 'Unbekannt',
        focus: item.focus || 'Allgemein',
        description: item.description || '',
        requirements: item.requirements || '',
        region: Array.isArray(item.region) ? item.region : ['DE'],
        targetGroup: item.targetGroup || 'Grundschule',
        fundingQuota: item.fundingQuota || 'Varies',
        detailedCriteria: Array.isArray(item.detailedCriteria) ? item.detailedCriteria : [],
        submissionMethod: item.submissionMethod || 'Siehe Website',
        requiredDocuments: Array.isArray(item.requiredDocuments) ? item.requiredDocuments : [],
        fundingPeriod: item.fundingPeriod || '1 Jahr',
        officialLink: item.officialLink
    }));

    return new Response(JSON.stringify(validatedPrograms), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Search Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
