/**
 * Export Service - Provides PDF and CSV export functionality
 * for funding programs and school data
 */

import { FundingProgram, SchoolProfile, MatchResult } from '../types';

// Date formatting for German locale
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

// Number formatting for German locale (currency)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

// Escape CSV values to handle special characters
const escapeCSVValue = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return '';
  const stringValue = String(value);
  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// CSV Export for Funding Programs
export const exportProgramsToCSV = (
  programs: FundingProgram[],
  matches?: MatchResult[]
): void => {
  const matchMap = new Map(matches?.map(m => [m.programId, m]) || []);

  const headers = [
    'ID',
    'Titel',
    'Anbieter',
    'Budget',
    'Frist',
    'Fokus',
    'Beschreibung',
    'Anforderungen',
    'Region',
    'Zielgruppe',
    'Förderquote',
    'Match-Score (%)',
    'Match-Begründung',
  ];

  const rows = programs.map(program => {
    const match = matchMap.get(program.id);
    return [
      escapeCSVValue(program.id),
      escapeCSVValue(program.title),
      escapeCSVValue(program.provider),
      escapeCSVValue(program.budget),
      escapeCSVValue(program.deadline),
      escapeCSVValue(program.focus),
      escapeCSVValue(program.description),
      escapeCSVValue(program.requirements),
      escapeCSVValue(program.region.join('; ')),
      escapeCSVValue(program.targetGroup),
      escapeCSVValue(program.fundingQuota),
      escapeCSVValue(match?.score ?? ''),
      escapeCSVValue(match?.reasoning ?? ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadFile(csvContent, `foerderprogramme_${formatDate(new Date()).replace(/\./g, '-')}.csv`, 'text/csv;charset=utf-8;');
};

// CSV Export for School Profile
export const exportProfileToCSV = (profile: SchoolProfile): void => {
  const headers = [
    'Feld',
    'Wert',
  ];

  const rows = [
    ['Name', profile.name],
    ['Standort', profile.location],
    ['Bundesland', profile.state],
    ['Website', profile.website || ''],
    ['Leitbild', profile.missionStatement || ''],
    ['Schülerzahl', String(profile.studentCount)],
    ['Sozialindex', String(profile.socialIndex)],
    ['Förderschwerpunkte', profile.focusAreas.join('; ')],
    ['Bedarfsbeschreibung', profile.needsDescription],
    ['Adresse', profile.address || ''],
    ['E-Mail', profile.email || ''],
    ['Lehrkräfte', String(profile.teacherCount || '')],
    ['Auszeichnungen', profile.awards?.join('; ') || ''],
    ['Partner', profile.partners?.join('; ') || ''],
  ].map(row => row.map(escapeCSVValue).join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadFile(csvContent, `schulprofil_${formatDate(new Date()).replace(/\./g, '-')}.csv`, 'text/csv;charset=utf-8;');
};

// Helper to download files
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob(['\ufeff' + content], { type: mimeType }); // BOM for Excel UTF-8 support
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// PDF Export using jsPDF
export const exportProgramsToPDF = async (
  programs: FundingProgram[],
  matches?: MatchResult[],
  profile?: SchoolProfile
): Promise<void> => {
  // Dynamic import of jsPDF
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const matchMap = new Map(matches?.map(m => [m.programId, m]) || []);

  // Colors
  const primaryColor: [number, number, number] = [41, 37, 36]; // stone-800
  const secondaryColor: [number, number, number] = [120, 113, 108]; // stone-500

  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('EduFunds - Förderprogramme', margin, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`Erstellt am: ${formatDate(new Date())}`, margin, yPos);

  if (profile) {
    yPos += 5;
    doc.text(`Schule: ${profile.name} | ${profile.location} (${profile.state})`, margin, yPos);
  }

  yPos += 15;
  doc.setDrawColor(...primaryColor);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Summary
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`Insgesamt ${programs.length} Förderprogramme`, margin, yPos);

  if (matches && matches.length > 0) {
    const highMatches = matches.filter(m => m.score >= 70).length;
    yPos += 6;
    doc.setFontSize(10);
    doc.text(`Davon ${highMatches} mit hoher Übereinstimmung (≥70%)`, margin, yPos);
  }

  yPos += 15;

  // Programs list
  for (const program of programs) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    const match = matchMap.get(program.id);

    // Program title with score
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    const titleText = match ? `${program.title} (${match.score}% Match)` : program.title;
    doc.text(titleText, margin, yPos);

    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text(`${program.provider} | Budget: ${program.budget} | Frist: ${program.deadline}`, margin, yPos);

    yPos += 5;
    // Description (wrapped)
    const descLines = doc.splitTextToSize(program.description, contentWidth);
    doc.text(descLines.slice(0, 2), margin, yPos);
    yPos += descLines.slice(0, 2).length * 4 + 3;

    // Match reasoning if available
    if (match?.reasoning) {
      doc.setFontSize(8);
      doc.setTextColor(34, 139, 34); // green
      const reasonLines = doc.splitTextToSize(`Match: ${match.reasoning}`, contentWidth);
      doc.text(reasonLines.slice(0, 2), margin, yPos);
      yPos += reasonLines.slice(0, 2).length * 3 + 2;
    }

    yPos += 8;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
  }

  // Footer on last page
  const pageCount = doc.internal.pages.length - 1;
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Seite ${i} von ${pageCount} | EduFunds.org`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`foerderprogramme_${formatDate(new Date()).replace(/\./g, '-')}.pdf`);
};

// Export dashboard summary to PDF
export const exportDashboardToPDF = async (
  profile: SchoolProfile,
  programs: FundingProgram[],
  matches: MatchResult[]
): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const primaryColor: [number, number, number] = [41, 37, 36];
  const secondaryColor: [number, number, number] = [120, 113, 108];

  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('EduFunds - Dashboard Übersicht', margin, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`Erstellt am: ${formatDate(new Date())}`, margin, yPos);

  yPos += 15;
  doc.setDrawColor(...primaryColor);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // School Profile Summary
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('Schulprofil', margin, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.text(`Name: ${profile.name}`, margin, yPos);
  yPos += 5;
  doc.text(`Standort: ${profile.location} (${profile.state})`, margin, yPos);
  yPos += 5;
  doc.text(`Schülerzahl: ${profile.studentCount} | Sozialindex: ${profile.socialIndex}`, margin, yPos);
  yPos += 5;
  doc.text(`Förderschwerpunkte: ${profile.focusAreas.join(', ')}`, margin, yPos);

  yPos += 15;

  // Statistics
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('Statistiken', margin, yPos);

  yPos += 8;
  doc.setFontSize(10);
  const highMatches = matches.filter(m => m.score >= 70).length;
  const avgScore = matches.length > 0
    ? Math.round(matches.reduce((sum, m) => sum + m.score, 0) / matches.length)
    : 0;

  doc.text(`Programme gefunden: ${programs.length}`, margin, yPos);
  yPos += 5;
  doc.text(`Hohe Übereinstimmungen (≥70%): ${highMatches}`, margin, yPos);
  yPos += 5;
  doc.text(`Durchschnittlicher Match-Score: ${avgScore}%`, margin, yPos);

  yPos += 15;

  // Top matches
  const topMatches = [...matches]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (topMatches.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('Top 5 Empfehlungen', margin, yPos);
    yPos += 10;

    for (const match of topMatches) {
      const program = programs.find(p => p.id === match.programId);
      if (program) {
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text(`${match.score}% - ${program.title}`, margin, yPos);
        yPos += 5;
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);
        doc.text(`${program.provider} | ${program.budget} | Frist: ${program.deadline}`, margin + 5, yPos);
        yPos += 8;
      }
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(
    'EduFunds.org - Fördermittel leicht gemacht',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`dashboard_uebersicht_${formatDate(new Date()).replace(/\./g, '-')}.pdf`);
};

// Trigger browser print dialog
export const printPage = (): void => {
  window.print();
};
