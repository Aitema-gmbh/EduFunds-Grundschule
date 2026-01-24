
import { FundingProgram, SchoolProfile } from './types';

export const INITIAL_PROFILE: SchoolProfile = {
  name: '',
  location: '',
  state: '',
  website: '',
  missionStatement: '',
  studentCount: 0,
  socialIndex: 3,
  focusAreas: [],
  needsDescription: '',
  address: '',
  email: '',
  teacherCount: 0,
  awards: [],
  partners: []
};

// ISO Codes for German States
// DE-BW (Baden-Württemberg), DE-BY (Bayern), DE-BE (Berlin), DE-BB (Brandenburg), 
// DE-HB (Bremen), DE-HH (Hamburg), DE-HE (Hessen), DE-MV (Mecklenburg-Vorpommern), 
// DE-NI (Niedersachsen), DE-NW (Nordrhein-Westfalen), DE-RP (Rheinland-Pfalz), 
// DE-SL (Saarland), DE-SN (Sachsen), DE-ST (Sachsen-Anhalt), DE-SH (Schleswig-Holstein), DE-TH (Thüringen)

export const MOCK_FUNDING_PROGRAMS: FundingProgram[] = [
  // --- BUNDESWEIT (DE) ---
  {
    id: 'startchancen-grundschule-2026',
    title: 'Startchancen-Programm (Primarstufe)',
    provider: 'Bund & Länder',
    budget: 'Investiv & Chancenbudget',
    deadline: 'Laufend 2026',
    focus: 'Basiskompetenzen',
    description: 'Schwerpunktförderung für Grundschulen zur Stärkung der Basiskompetenzen (Lesen, Schreiben, Rechnen) und sozial-emotionalen Entwicklung.',
    requirements: 'Hoher Anteil an sozial benachteiligten Schülern (Sozialindex).',
    targetGroup: 'Grundschüler Klasse 1-4',
    fundingQuota: '100% (Bundesmittel + Landesmittel)',
    detailedCriteria: [
      'Leseförderung: Konkrete Konzepte zur Steigerung der Lesekompetenz',
      'Elternarbeit: Einbindung der Eltern in den Bildungsprozess',
      'Multiprofessionelle Teams: Schulsozialarbeit in der Grundschule'
    ],
    region: ['DE'],
    submissionMethod: 'Verwaltungsweg (Schulamt/Bezirksregierung)',
    requiredDocuments: ['Schulentwicklungsplan Primar', 'Sozialdaten', 'Konzept Basiskompetenzen'],
    fundingPeriod: '10 Jahre (Laufzeit Programm)',
    officialLink: 'https://www.bmbf.de/bmbf/de/bildung/startchancen/startchancen-programm.html'
  },
  {
    id: 'stiftung-lesen-leseclubs-gs',
    title: 'Leseclubs an Grundschulen',
    provider: 'Stiftung Lesen',
    budget: 'Ausstattung & Medienpaket',
    deadline: 'Laufend (Warteliste)',
    focus: 'Sprachförderung',
    description: 'Einrichtung von Leseclubs als freizeitorientierte Lernumgebung. Ausstattung mit kindgerechten Möbeln, Bilderbüchern und Tablets.',
    requirements: 'Bereitstellung eines Raumes und ehrenamtlicher Betreuer.',
    targetGroup: 'Kinder 6-10 Jahre',
    fundingQuota: 'Sachmittel (Möbel, Bücher, Technik)',
    detailedCriteria: [
      'Regelmäßigkeit: Öffnungszeiten mind. 2x pro Woche im Ganztag',
      'Ehrenamt: Einbindung von Vorlesepaten',
      'Raumkonzept: Gemütliche Atmosphäre, Kuschelecken'
    ],
    region: ['DE'],
    submissionMethod: 'Email / Bewerbungsbogen',
    requiredDocuments: ['Raumskizze', 'Fotos des geplanten Raums', 'Benennung der Betreuer'],
    fundingPeriod: 'Dauerhaft (mind. 3 Jahre Verpflichtung)',
    officialLink: 'https://www.stiftunglesen.de/mitmachen/leseclubs'
  },
  {
    id: 'dkhw-schulhoefe',
    title: 'Schulhöfe als Spielräume',
    provider: 'Deutsches Kinderhilfswerk',
    budget: 'Max. 5.000€',
    deadline: '31.03.2026',
    focus: 'Bewegung/Bau',
    description: 'Umgestaltung von grauen Beton-Schulhöfen zu naturnahen Bewegungslandschaften für Grundschulkinder.',
    requirements: 'Partizipation der Kinder ist Pflicht (z.B. Malwettbewerb "Mein Traumschulhof").',
    targetGroup: 'Grundschüler (Bewegungsförderung)',
    fundingQuota: 'Max. 50% der Gesamtkosten',
    detailedCriteria: [
      'Partizipation: Kinder müssen an der Planung beteiligt werden',
      'Motorik: Förderung von Klettern, Balancieren, Verstecken',
      'Ökologie: Entsiegelung von Flächen'
    ],
    region: ['DE'],
    submissionMethod: 'Online-Portal DKHW',
    requiredDocuments: ['Protokolle Kinder-Beteiligung', 'Finanzierungsplan', 'Fotos Bestand'],
    fundingPeriod: '12 Monate',
    officialLink: 'https://www.dkhw.de/foerderung/'
  },
  {
    id: 'internet-abc-schule',
    title: 'Internet-ABC-Schule (Medienkompetenz)',
    provider: 'Landesmedienanstalten',
    budget: 'Zertifizierung & Material',
    deadline: 'Laufend',
    focus: 'Digitalisierung',
    description: 'Förderung der ersten Schritte im Netz. Qualifizierung für Lehrkräfte und Materialien für den Sachunterricht Klasse 3/4.',
    requirements: 'Teilnahme an Fortbildungen, Umsetzung im Curriculum.',
    targetGroup: 'Klasse 3-4',
    fundingQuota: 'Kostenloses Material & Siegel',
    detailedCriteria: [
      'Elternarbeit: Informationsabend zur Mediennutzung',
      'Curriculum: Feste Verankerung im Sachunterricht',
      'Schutz: Kindgerechte Interneteinstellungen an Schul-PCs'
    ],
    region: ['DE'],
    submissionMethod: 'Online-Anmeldung',
    requiredDocuments: ['Konzept Medienbildung', 'Nachweis Fortbildung'],
    fundingPeriod: 'Zertifikat (Gültigkeit 2 Jahre)',
    officialLink: 'https://www.internet-abc.de/lehrkraefte/internet-abc-schule/'
  },

  // --- NRW SPEZIFISCH ---
  {
    id: 'nrw-ogs-ausbau',
    title: 'Förderung Ganztagsausbau (OGS)',
    provider: 'Land NRW',
    budget: 'Investiv (Bau/Ausstattung)',
    deadline: '31.12.2026',
    focus: 'Bau/Sanierung',
    description: 'Mittel für den Ausbau von Mensen, Ruheräumen und Spielbereichen im Offenen Ganztag der Primarstufe.',
    requirements: 'Nachweis des Bedarfs an OGS-Plätzen.',
    targetGroup: 'Grundschüler im Ganztag',
    fundingQuota: '85-90% je nach Finanzkraft',
    detailedCriteria: [
      'Qualität: Raumkonzept muss pädagogischen Standards entsprechen',
      'Multifunktionalität: Nutzung von Klassenräumen am Nachmittag',
      'Inklusion: Barrierefreiheit der OGS-Räume'
    ],
    region: ['DE-NW'],
    submissionMethod: 'Über Schulträger bei Bezirksregierung',
    requiredDocuments: ['Raumprogramm', 'Kostenschätzung Architekt', 'Beschluss Schulausschuss'],
    fundingPeriod: 'Baumaßnahme',
    officialLink: 'https://www.schulministerium.nrw/ganztag'
  },
  {
    id: 'je-kits-nrw',
    title: 'JeKits - Jedem Kind Instrumente, Tanzen, Singen',
    provider: 'Land NRW',
    budget: 'Personalmittel Musikschule',
    deadline: '31.01.2026',
    focus: 'Kultur',
    description: 'Kulturelle Bildung in der Grundschule. Kooperation mit Musikschulen für den Musikunterricht im Tandem (Lehrkraft + Musiker).',
    requirements: 'Kooperationsvertrag mit lokaler Musikschule.',
    targetGroup: 'Klasse 1 (Pflicht) & 2-4 (Wahl)',
    fundingQuota: 'Land trägt Personalkosten Musikschule',
    detailedCriteria: [
      'Kooperation: Feste Zeiten im Stundenplan',
      'Teilhabe: Kostenbefreiung für Empfänger von Sozialleistungen',
      'Schwerpunkt: Wahl zwischen Singen, Tanzen oder Instrumente'
    ],
    region: ['DE-NW'],
    submissionMethod: 'Online-Verfahren JeKits-Stiftung',
    requiredDocuments: ['Kooperationsvertrag', 'Schulkonferenzbeschluss'],
    fundingPeriod: 'Schuljahr 2026/27',
    officialLink: 'https://www.jekits.de/'
  },

  // --- BAYERN SPEZIFISCH ---
  {
    id: 'bayern-schwimmfoerderung',
    title: 'Sonderprogramm Schwimmförderung',
    provider: 'StMUK Bayern',
    budget: 'Pauschale pro Kurs (500€+)',
    deadline: 'Laufend 2026',
    focus: 'Sport/Gesundheit',
    description: 'Förderung von zusätzlichen Schwimmkursen für Grundschüler zum Erwerb des "Seepferdchen" (Vorbereitung oder Nachholung).',
    requirements: 'Zusatzangebot außerhalb des Pflichtunterrichts.',
    targetGroup: 'Grundschüler (Nichtschwimmer)',
    fundingQuota: 'Festbetragsfinanzierung',
    detailedCriteria: [
      'Qualifikation: Übungsleiter mit Rettungsschwimmer-Abzeichen',
      'Gruppengröße: Kleine Gruppen für intensive Betreuung',
      'Ziel: Erwerb der Schwimmfähigkeit (Sicherheit)'
    ],
    region: ['DE-BY'],
    submissionMethod: 'Antrag über Schulamt',
    requiredDocuments: ['Kursliste', 'Qualifikationsnachweis', 'Bestätigung Durchführung'],
    fundingPeriod: 'Schuljahr',
    officialLink: 'https://www.km.bayern.de/'
  },

   // --- BADEN-WÜRTTEMBERG ---
   {
    id: 'bw-grundschule-lesen',
    title: 'Starke BASIS! - Leseförderung',
    provider: 'Kultusministerium BW',
    budget: 'Fortbildungen & Material',
    deadline: 'Laufend',
    focus: 'Sprachförderung',
    description: 'Programm zur systematischen Leseförderung in der Grundschule (Lese-Tandems, Diagnose).',
    requirements: 'Verankerung im Schulcurriculum.',
    targetGroup: 'Klasse 1-4',
    fundingQuota: 'Materialbereitstellung',
    detailedCriteria: [
      'Diagnostik: Regelmäßige Lernstandserhebungen',
      'Methodik: Einsatz evidenzbasierter Lesemethoden (z.B. Lautleseverfahren)',
      'Team: Gemeinsame Fortbildung des Kollegiums'
    ],
    region: ['DE-BW'],
    submissionMethod: 'Dienstweg',
    requiredDocuments: ['Konzept Leseförderung'],
    fundingPeriod: 'Dauerhaft',
    officialLink: 'https://km-bw.de/'
  },

  // --- SONSTIGE / EU ---
  {
    id: 'eu-schulfrucht',
    title: 'EU-Schulprogramm (Obst, Gemüse, Milch)',
    provider: 'EU / Landwirtschaftsministerien',
    budget: 'Kostenlose Lebensmittel',
    deadline: 'April 2026 (für nächstes Schuljahr)',
    focus: 'Gesundheit',
    description: 'Regelmäßige Belieferung von Grundschulen mit frischem Obst, Gemüse und Milch. Pädagogische Begleitmaßnahmen Pflicht.',
    requirements: 'Suche eines zugelassenen Lieferanten. Durchführung von Aktionen (Bauernhofbesuch, gesundes Frühstück).',
    targetGroup: 'Alle Grundschüler',
    fundingQuota: '100% (Produkte sind kostenlos)',
    detailedCriteria: [
      'Pädagogik: Thema "Gesunde Ernährung" im Unterricht',
      'Verteilung: Kostenlose Abgabe an die Kinder (kein Verkauf)',
      'Hygiene: Einhaltung der Lebensmittelstandards'
    ],
    region: ['DE'],
    submissionMethod: 'Online-Bewerbung beim Land',
    requiredDocuments: ['Vereinbarung mit Lieferant', 'Pädagogisches Konzept Ernährung'],
    fundingPeriod: 'Ein Schuljahr',
    officialLink: 'https://ec.europa.eu/agriculture/school-scheme_de'
  },
  {
    id: 'telekom-stiftung-miniphänomenta',
    title: 'Miniphänomenta (MINT)',
    provider: 'Nordmetall / Telekom Stiftung',
    budget: 'Experimentierstationen',
    deadline: 'Laufend',
    focus: 'MINT',
    description: 'Interaktive Experimentierstationen für den Schulflur. Kinder forschen selbstständig an physikalischen Phänomenen.',
    requirements: 'Schule muss Stationen selbst nachbauen (Eltern-Kind-Tage).',
    targetGroup: 'Klasse 1-4',
    fundingQuota: 'Materialzuschuss & Baupläne',
    detailedCriteria: [
      'Elternarbeit: Gemeinsamer Bau der Stationen',
      'Freies Forschen: Stationen müssen frei zugänglich im Flur stehen',
      'Nachhaltigkeit: Langfristige Nutzung im Schulalltag'
    ],
    region: ['DE'], // Verfügbar in vielen BL
    submissionMethod: 'Bewerbung bei Projektträger',
    requiredDocuments: ['Bewerbungsschreiben', 'Terminvorschlag Bautage'],
    fundingPeriod: 'Einmalig',
    officialLink: 'https://miniphaenomenta.de/'
  }
];
