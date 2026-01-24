import { FundingProgram, MatchResult, SchoolProfile, GeneratedApplication } from "../types";

export const analyzeSchoolWithGemini = async (name: string, city: string): Promise<Partial<SchoolProfile>> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, city })
        });

        if (!response.ok) return { name, location: city, state: 'DE' };
        return await response.json();
    } catch (error) {
        console.error("School Analysis Error:", error);
        return { name, location: city, state: 'DE' };
    }
};

export const matchProgramsWithGemini = async (
  profile: SchoolProfile,
  programs: FundingProgram[]
): Promise<MatchResult[]> => {
  try {
    const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, programs })
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Matching Error:", error);
    return [];
  }
};

export const generateApplicationDraft = async (
  profile: SchoolProfile,
  program: FundingProgram,
  projectSpecifics: string
): Promise<GeneratedApplication | null> => {
    try {
      const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, program, projectSpecifics })
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Drafting Error:", error);
      return null;
    }
};

export const refineApplicationDraft = async (
    currentDraft: GeneratedApplication,
    instruction: string
): Promise<GeneratedApplication | null> => {
    try {
        const response = await fetch('/api/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentDraft, instruction })
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Refinement Error", error);
        return null;
    }
}

export const searchLiveFunding = async (): Promise<FundingProgram[]> => {
  try {
    const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Live Search Error:", error);
    return [];
  }
};