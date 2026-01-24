
export enum ViewState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  PROFILE = 'PROFILE',
  MATCHING = 'MATCHING',
  WRITER = 'WRITER',
  RESULT = 'RESULT',
  NOTIFICATIONS = 'NOTIFICATIONS'
}

export interface SchoolProfile {
  name: string;
  location: string; // City
  state: string; // ISO Code (e.g. "DE-BW", "DE-NW")
  website?: string;
  missionStatement?: string;
  studentCount: number;
  socialIndex: number; // 1-5 scale
  focusAreas: string[];
  needsDescription: string;
  // Deep Data
  address?: string;
  email?: string;
  phone?: string;
  teacherCount?: number;
  awards?: string[]; // e.g. "Schule ohne Rassismus"
  partners?: string[]; // e.g. "Musikschule XY"
}

export interface FundingProgram {
  id: string;
  title: string;
  provider: string;
  budget: string;
  deadline: string;
  focus: string;
  description: string;
  requirements: string;
  region: string[]; // Array of ISO codes (e.g. ["DE"] for federal, ["DE-BY"] for Bavaria)
  // Deep Data
  targetGroup: string;
  fundingQuota: string;
  detailedCriteria: string[];
  // Expert Data
  submissionMethod: string; // e.g. "Online-Portal (easy-Online)" or "Postalisch"
  requiredDocuments: string[]; // e.g. ["Schulkonferenzbeschluss", "Kostenplan", "Vergleichsangebote"]
  fundingPeriod: string; // e.g. "12 Monate" or "Schuljahr 2026/27"
  officialLink?: string;
  address?: string; // Physical address of the provider
}

export interface MatchResult {
  programId: string;
  score: number; // 0-100
  reasoning: string;
  tags?: string[];
}

export interface GeneratedApplication {
  subject: string;
  body: string;
  executiveSummary: string;
}

export interface NotificationPreferences {
  email: string;
  enabled: boolean;
  reminders: {
    sevenDays: boolean;
    oneDay: boolean;
  };
  subscribedPrograms: string[]; // Array of program IDs
}

export interface ScheduledReminder {
  programId: string;
  programTitle: string;
  deadline: string;
  reminderType: 'seven_days' | 'one_day';
  scheduledDate: string;
  sent: boolean;
}
