import { describe, it, expect } from 'vitest';
import { INITIAL_PROFILE, MOCK_FUNDING_PROGRAMS } from './constants';
import { SchoolProfile, FundingProgram } from './types';

describe('constants', () => {
  describe('INITIAL_PROFILE', () => {
    it('should have all required SchoolProfile fields', () => {
      const profile: SchoolProfile = INITIAL_PROFILE;
      
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('location');
      expect(profile).toHaveProperty('state');
      expect(profile).toHaveProperty('studentCount');
      expect(profile).toHaveProperty('socialIndex');
      expect(profile).toHaveProperty('focusAreas');
      expect(profile).toHaveProperty('needsDescription');
    });

    it('should have empty string for name', () => {
      expect(INITIAL_PROFILE.name).toBe('');
    });

    it('should have empty string for location', () => {
      expect(INITIAL_PROFILE.location).toBe('');
    });

    it('should have empty string for state', () => {
      expect(INITIAL_PROFILE.state).toBe('');
    });

    it('should have zero for studentCount', () => {
      expect(INITIAL_PROFILE.studentCount).toBe(0);
    });

    it('should have default socialIndex of 3', () => {
      expect(INITIAL_PROFILE.socialIndex).toBe(3);
    });

    it('should have empty array for focusAreas', () => {
      expect(INITIAL_PROFILE.focusAreas).toEqual([]);
      expect(Array.isArray(INITIAL_PROFILE.focusAreas)).toBe(true);
    });

    it('should have empty string for needsDescription', () => {
      expect(INITIAL_PROFILE.needsDescription).toBe('');
    });

    it('should have optional fields initialized', () => {
      expect(INITIAL_PROFILE.website).toBe('');
      expect(INITIAL_PROFILE.missionStatement).toBe('');
      expect(INITIAL_PROFILE.address).toBe('');
      expect(INITIAL_PROFILE.email).toBe('');
      expect(INITIAL_PROFILE.teacherCount).toBe(0);
      expect(INITIAL_PROFILE.awards).toEqual([]);
      expect(INITIAL_PROFILE.partners).toEqual([]);
    });
  });

  describe('MOCK_FUNDING_PROGRAMS', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(MOCK_FUNDING_PROGRAMS)).toBe(true);
      expect(MOCK_FUNDING_PROGRAMS.length).toBeGreaterThan(0);
    });

    it('should have at least 10 funding programs', () => {
      expect(MOCK_FUNDING_PROGRAMS.length).toBeGreaterThanOrEqual(10);
    });

    it('should have unique IDs for all programs', () => {
      const ids = MOCK_FUNDING_PROGRAMS.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    describe('each program should have required fields', () => {
      MOCK_FUNDING_PROGRAMS.forEach((program) => {
        it(`program "${program.id}" should have all required fields`, () => {
          expect(program.id).toBeTruthy();
          expect(typeof program.id).toBe('string');
          
          expect(program.title).toBeTruthy();
          expect(typeof program.title).toBe('string');
          
          expect(program.provider).toBeTruthy();
          expect(typeof program.provider).toBe('string');
          
          expect(program.budget).toBeTruthy();
          expect(typeof program.budget).toBe('string');
          
          expect(program.deadline).toBeTruthy();
          expect(typeof program.deadline).toBe('string');
          
          expect(program.focus).toBeTruthy();
          expect(typeof program.focus).toBe('string');
          
          expect(program.description).toBeTruthy();
          expect(typeof program.description).toBe('string');
          
          expect(program.requirements).toBeTruthy();
          expect(typeof program.requirements).toBe('string');
          
          expect(Array.isArray(program.region)).toBe(true);
          expect(program.region.length).toBeGreaterThan(0);
        });
      });
    });

    describe('each program should have extended fields', () => {
      MOCK_FUNDING_PROGRAMS.forEach((program) => {
        it(`program "${program.id}" should have extended fields`, () => {
          expect(program.targetGroup).toBeTruthy();
          expect(program.fundingQuota).toBeTruthy();
          expect(Array.isArray(program.detailedCriteria)).toBe(true);
          expect(program.detailedCriteria.length).toBeGreaterThan(0);
          expect(program.submissionMethod).toBeTruthy();
          expect(Array.isArray(program.requiredDocuments)).toBe(true);
          expect(program.fundingPeriod).toBeTruthy();
        });
      });
    });

    describe('region codes should be valid', () => {
      const validRegionCodes = [
        'DE', 'DE-BW', 'DE-BY', 'DE-BE', 'DE-BB', 'DE-HB', 'DE-HH',
        'DE-HE', 'DE-MV', 'DE-NI', 'DE-NW', 'DE-RP', 'DE-SL',
        'DE-SN', 'DE-ST', 'DE-SH', 'DE-TH'
      ];

      MOCK_FUNDING_PROGRAMS.forEach((program) => {
        it(`program "${program.id}" should have valid region codes`, () => {
          program.region.forEach(region => {
            expect(validRegionCodes).toContain(region);
          });
        });
      });
    });

    describe('federal programs (DE region)', () => {
      it('should include programs available nationwide', () => {
        const federalPrograms = MOCK_FUNDING_PROGRAMS.filter(p => 
          p.region.includes('DE')
        );
        expect(federalPrograms.length).toBeGreaterThan(0);
      });
    });

    describe('state-specific programs', () => {
      it('should include NRW-specific programs', () => {
        const nrwPrograms = MOCK_FUNDING_PROGRAMS.filter(p => 
          p.region.includes('DE-NW')
        );
        expect(nrwPrograms.length).toBeGreaterThan(0);
      });

      it('should include Bavaria-specific programs', () => {
        const bayernPrograms = MOCK_FUNDING_PROGRAMS.filter(p => 
          p.region.includes('DE-BY')
        );
        expect(bayernPrograms.length).toBeGreaterThan(0);
      });

      it('should include Baden-Württemberg-specific programs', () => {
        const bwPrograms = MOCK_FUNDING_PROGRAMS.filter(p => 
          p.region.includes('DE-BW')
        );
        expect(bwPrograms.length).toBeGreaterThan(0);
      });
    });

    describe('program focus areas', () => {
      it('should have programs covering different focus areas', () => {
        const focusAreas = new Set(MOCK_FUNDING_PROGRAMS.map(p => p.focus));
        expect(focusAreas.size).toBeGreaterThanOrEqual(5);
      });

      it('should include reading/language programs', () => {
        const readingPrograms = MOCK_FUNDING_PROGRAMS.filter(p => 
          p.focus.toLowerCase().includes('sprach') || 
          p.focus.toLowerCase().includes('lesen')
        );
        expect(readingPrograms.length).toBeGreaterThan(0);
      });

      it('should include digitalization programs', () => {
        const digitalPrograms = MOCK_FUNDING_PROGRAMS.filter(p => 
          p.focus.toLowerCase().includes('digital')
        );
        expect(digitalPrograms.length).toBeGreaterThan(0);
      });
    });

    describe('official links', () => {
      MOCK_FUNDING_PROGRAMS.forEach((program) => {
        if (program.officialLink) {
          it(`program "${program.id}" should have valid URL format`, () => {
            expect(program.officialLink).toMatch(/^https?:\/\//);
          });
        }
      });
    });
  });
});
