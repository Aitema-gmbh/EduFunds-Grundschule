import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  analyzeSchoolWithGemini,
  matchProgramsWithGemini,
  generateApplicationDraft,
  refineApplicationDraft,
  searchLiveFunding
} from './geminiService';
import type { SchoolProfile, FundingProgram, GeneratedApplication } from '../types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Sample test data
const mockSchoolProfile: SchoolProfile = {
  name: 'Test Grundschule',
  location: 'Berlin',
  state: 'DE-BE',
  studentCount: 250,
  socialIndex: 3,
  focusAreas: ['MINT', 'Musik'],
  needsDescription: 'Neue Ausstattung für digitales Lernen'
};

const mockFundingProgram: FundingProgram = {
  id: 'prog-1',
  title: 'Digitalpakt Schule',
  provider: 'BMBF',
  budget: '€50,000',
  deadline: '2024-12-31',
  focus: 'Digitalisierung',
  description: 'Förderung digitaler Infrastruktur',
  requirements: 'Schulen aller Träger',
  region: ['DE'],
  targetGroup: 'Grundschulen',
  fundingQuota: '90%',
  detailedCriteria: ['Medienkonzept', 'IT-Support'],
  submissionMethod: 'Online-Portal',
  requiredDocuments: ['Antrag', 'Kostenplan'],
  fundingPeriod: '12 Monate'
};

const mockGeneratedApplication: GeneratedApplication = {
  subject: 'Antrag Digitalpakt',
  body: 'Sehr geehrte Damen und Herren...',
  executiveSummary: 'Kurzzusammenfassung des Antrags'
};

describe('geminiService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('analyzeSchoolWithGemini', () => {
    it('should successfully analyze school data', async () => {
      const mockResponse = {
        name: 'Test Grundschule',
        location: 'Berlin',
        state: 'DE-BE',
        studentCount: 300,
        website: 'https://test-grundschule.de'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await analyzeSchoolWithGemini('Test Grundschule', 'Berlin');

      expect(mockFetch).toHaveBeenCalledWith('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Grundschule', city: 'Berlin' })
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return default profile when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await analyzeSchoolWithGemini('Test Grundschule', 'Berlin');

      expect(result).toEqual({
        name: 'Test Grundschule',
        location: 'Berlin',
        state: 'DE'
      });
    });

    it('should return default profile on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await analyzeSchoolWithGemini('Test Grundschule', 'Berlin');

      expect(result).toEqual({
        name: 'Test Grundschule',
        location: 'Berlin',
        state: 'DE'
      });
      expect(console.error).toHaveBeenCalledWith('School Analysis Error:', expect.any(Error));
    });

    it('should handle empty school name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: '', location: 'Berlin', state: 'DE-BE' })
      });

      const result = await analyzeSchoolWithGemini('', 'Berlin');
      expect(result.location).toBe('Berlin');
    });

    it('should handle special characters in school name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'Schüler-Förder-Schule', location: 'München' })
      });

      const result = await analyzeSchoolWithGemini('Schüler-Förder-Schule', 'München');
      expect(mockFetch).toHaveBeenCalledWith('/api/analyze', expect.objectContaining({
        body: JSON.stringify({ name: 'Schüler-Förder-Schule', city: 'München' })
      }));
    });
  });

  describe('matchProgramsWithGemini', () => {
    it('should successfully match programs', async () => {
      const mockMatches = [
        { programId: 'prog-1', score: 85, reasoning: 'Gute Passung' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMatches)
      });

      const result = await matchProgramsWithGemini(mockSchoolProfile, [mockFundingProgram]);

      expect(mockFetch).toHaveBeenCalledWith('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: mockSchoolProfile, programs: [mockFundingProgram] })
      });
      expect(result).toEqual(mockMatches);
    });

    it('should return empty array when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      const result = await matchProgramsWithGemini(mockSchoolProfile, [mockFundingProgram]);

      expect(result).toEqual([]);
    });

    it('should return empty array on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await matchProgramsWithGemini(mockSchoolProfile, [mockFundingProgram]);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Matching Error:', expect.any(Error));
    });

    it('should handle empty programs array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      const result = await matchProgramsWithGemini(mockSchoolProfile, []);

      expect(result).toEqual([]);
    });

    it('should handle multiple programs', async () => {
      const programs = [mockFundingProgram, { ...mockFundingProgram, id: 'prog-2' }];
      const mockMatches = [
        { programId: 'prog-1', score: 85, reasoning: 'Gute Passung' },
        { programId: 'prog-2', score: 70, reasoning: 'Moderate Passung' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMatches)
      });

      const result = await matchProgramsWithGemini(mockSchoolProfile, programs);

      expect(result).toHaveLength(2);
    });
  });

  describe('generateApplicationDraft', () => {
    it('should successfully generate application draft', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeneratedApplication)
      });

      const result = await generateApplicationDraft(
        mockSchoolProfile,
        mockFundingProgram,
        'Projekt für digitale Tablets'
      );

      expect(mockFetch).toHaveBeenCalledWith('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: mockSchoolProfile,
          program: mockFundingProgram,
          projectSpecifics: 'Projekt für digitale Tablets'
        })
      });
      expect(result).toEqual(mockGeneratedApplication);
    });

    it('should return null when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await generateApplicationDraft(
        mockSchoolProfile,
        mockFundingProgram,
        'Projekt'
      );

      expect(result).toBeNull();
    });

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await generateApplicationDraft(
        mockSchoolProfile,
        mockFundingProgram,
        'Projekt'
      );

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Drafting Error:', expect.any(Error));
    });

    it('should handle empty project specifics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeneratedApplication)
      });

      const result = await generateApplicationDraft(
        mockSchoolProfile,
        mockFundingProgram,
        ''
      );

      expect(result).toEqual(mockGeneratedApplication);
    });

    it('should handle long project descriptions', async () => {
      const longDescription = 'A'.repeat(5000);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeneratedApplication)
      });

      await generateApplicationDraft(
        mockSchoolProfile,
        mockFundingProgram,
        longDescription
      );

      expect(mockFetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        body: expect.stringContaining(longDescription)
      }));
    });
  });

  describe('refineApplicationDraft', () => {
    it('should successfully refine application draft', async () => {
      const refinedApplication = {
        ...mockGeneratedApplication,
        body: 'Verbesserter Antrag...'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(refinedApplication)
      });

      const result = await refineApplicationDraft(
        mockGeneratedApplication,
        'Bitte formeller formulieren'
      );

      expect(mockFetch).toHaveBeenCalledWith('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDraft: mockGeneratedApplication,
          instruction: 'Bitte formeller formulieren'
        })
      });
      expect(result).toEqual(refinedApplication);
    });

    it('should return null when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await refineApplicationDraft(
        mockGeneratedApplication,
        'Verbessern'
      );

      expect(result).toBeNull();
    });

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await refineApplicationDraft(
        mockGeneratedApplication,
        'Verbessern'
      );

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Refinement Error', expect.any(Error));
    });

    it('should handle empty instruction', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeneratedApplication)
      });

      const result = await refineApplicationDraft(mockGeneratedApplication, '');

      expect(result).toEqual(mockGeneratedApplication);
    });

    it('should handle multiple refinement requests', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...mockGeneratedApplication, body: 'First refinement' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...mockGeneratedApplication, body: 'Second refinement' })
        });

      const result1 = await refineApplicationDraft(mockGeneratedApplication, 'First change');
      const result2 = await refineApplicationDraft(result1!, 'Second change');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result2?.body).toBe('Second refinement');
    });
  });

  describe('searchLiveFunding', () => {
    it('should successfully search for live funding programs', async () => {
      const mockPrograms = [mockFundingProgram];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrograms)
      });

      const result = await searchLiveFunding();

      expect(mockFetch).toHaveBeenCalledWith('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockPrograms);
    });

    it('should return empty array when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503
      });

      const result = await searchLiveFunding();

      expect(result).toEqual([]);
    });

    it('should return empty array on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await searchLiveFunding();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Live Search Error:', expect.any(Error));
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      const result = await searchLiveFunding();

      expect(result).toEqual([]);
    });

    it('should handle large response with many programs', async () => {
      const manyPrograms = Array(100).fill(mockFundingProgram).map((p, i) => ({
        ...p,
        id: `prog-${i}`
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(manyPrograms)
      });

      const result = await searchLiveFunding();

      expect(result).toHaveLength(100);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle JSON parsing errors in analyzeSchoolWithGemini', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await analyzeSchoolWithGemini('Test', 'Berlin');

      expect(result).toEqual({
        name: 'Test',
        location: 'Berlin',
        state: 'DE'
      });
    });

    it('should handle JSON parsing errors in matchProgramsWithGemini', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await matchProgramsWithGemini(mockSchoolProfile, [mockFundingProgram]);

      expect(result).toEqual([]);
    });

    it('should handle JSON parsing errors in generateApplicationDraft', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await generateApplicationDraft(mockSchoolProfile, mockFundingProgram, 'Test');

      expect(result).toBeNull();
    });

    it('should handle JSON parsing errors in refineApplicationDraft', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await refineApplicationDraft(mockGeneratedApplication, 'Test');

      expect(result).toBeNull();
    });

    it('should handle JSON parsing errors in searchLiveFunding', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await searchLiveFunding();

      expect(result).toEqual([]);
    });
  });
});
