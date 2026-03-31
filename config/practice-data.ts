import { PRACTICE_PLAN_VALUES, type PracticePlan } from './environment.js';

export const PRACTICE_DEFAULT_SIGN_IN_STATUS = 'Waiting for sign-in input.';
export const PRACTICE_RESET_SIGN_IN_STATUS = 'Form reset. Waiting for sign-in input.';

export interface PracticeCard {
  id: string;
  tag: string;
  title: string;
  description: string;
  searchableText: string;
}

export interface PracticePreferences {
  focusMode: boolean;
  dailyDigest: boolean;
  autoArchive: boolean;
}

export interface PracticeReleaseNotes {
  monthLabel: string;
  title: string;
  summary: string;
  bullets: string[];
}

export interface PracticeState {
  plans: PracticePlan[];
  cards: PracticeCard[];
  tasks: string[];
  preferences: PracticePreferences;
  releaseNotes: PracticeReleaseNotes;
  signInStatus: string;
}

export interface PracticeSummary {
  visibleCards: number;
  taskCount: number;
  mode: 'Calm' | 'Focus';
  preferencesStatus: string;
  signInStatus: string;
}

const seedCards: PracticeCard[] = [
  {
    id: 'launch-outline',
    tag: 'Roadmap',
    title: 'Launch Outline',
    description: 'Finalize launch priorities and confirm which milestones fit the next sprint.',
    searchableText: 'roadmap launch priorities',
  },
  {
    id: 'trend-review',
    tag: 'Metrics',
    title: 'Trend Review',
    description: 'Compare weekly dashboard movement and flag the most surprising changes.',
    searchableText: 'metrics dashboard weekly trends',
  },
  {
    id: 'interview-notes',
    tag: 'Research',
    title: 'Interview Notes',
    description: 'Turn raw interviews into themes that the team can use in planning.',
    searchableText: 'research interviews notes synthesis',
  },
];

const seedTasks = ['Draft weekly summary', 'Confirm release notes'];

const seedPreferences: PracticePreferences = {
  focusMode: false,
  dailyDigest: true,
  autoArchive: false,
};

const seedReleaseNotes: PracticeReleaseNotes = {
  monthLabel: 'March Release',
  title: 'Release Notes Summary',
  summary:
    'The latest update improves card filtering, makes status messages clearer, and adds a local practice flow for browser automation demos.',
  bullets: [
    'Search now updates the visible card count immediately.',
    'Task creation updates the board without a page refresh.',
    'Preference toggles write friendly confirmation text.',
  ],
};

export function createPracticeSeedState(): PracticeState {
  return {
    plans: [...PRACTICE_PLAN_VALUES],
    cards: seedCards.map((card) => ({ ...card })),
    tasks: [...seedTasks],
    preferences: { ...seedPreferences },
    releaseNotes: {
      ...seedReleaseNotes,
      bullets: [...seedReleaseNotes.bullets],
    },
    signInStatus: PRACTICE_DEFAULT_SIGN_IN_STATUS,
  };
}

export function buildPreferencesStatus(preferences: PracticePreferences): string {
  const focusText = preferences.focusMode ? 'on' : 'off';
  const digestText = preferences.dailyDigest ? 'enabled' : 'disabled';
  const archiveText = preferences.autoArchive ? 'Auto archive is on.' : 'Auto archive is off.';

  return `Daily digest is ${digestText}. Focus mode is ${focusText}. ${archiveText}`;
}

export function buildPracticeSummary(state: PracticeState): PracticeSummary {
  return {
    visibleCards: state.cards.length,
    taskCount: state.tasks.length,
    mode: state.preferences.focusMode ? 'Focus' : 'Calm',
    preferencesStatus: buildPreferencesStatus(state.preferences),
    signInStatus: state.signInStatus,
  };
}
