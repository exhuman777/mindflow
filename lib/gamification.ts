// Gamification system for MindFlow

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
  earned?: boolean
  earnedAt?: string
}

export interface Level {
  level: number
  name: string
  minMinutes: number
  icon: string
}

export interface Challenge {
  id: string
  name: string
  description: string
  duration: number // days
  goal: string
  reward: string
  progress?: number
  startedAt?: string
  completedAt?: string
}

export interface UserStats {
  totalSessions: number
  totalMinutes: number
  currentStreak: number
  longestStreak: number
  avgMoodImprovement: number
  badges: string[] // badge IDs
  level: number
  activeChallenge?: Challenge
  completedChallenges: string[]
}

// Badge definitions
export const BADGES: Badge[] = [
  {
    id: 'first_meditation',
    name: 'Pierwsza Medytacja',
    description: 'Ukończyłeś swoją pierwszą medytację',
    icon: '🌱',
    requirement: 'Complete 1 meditation',
  },
  {
    id: 'streak_3',
    name: 'Początek Drogi',
    description: '3 dni medytacji z rzędu',
    icon: '🔥',
    requirement: '3-day streak',
  },
  {
    id: 'streak_7',
    name: 'Tydzień Spokoju',
    description: '7 dni medytacji z rzędu',
    icon: '⭐',
    requirement: '7-day streak',
  },
  {
    id: 'streak_21',
    name: 'Nawyk Ukształtowany',
    description: '21 dni medytacji z rzędu - gratulacje, to już nawyk!',
    icon: '🏆',
    requirement: '21-day streak',
  },
  {
    id: 'streak_30',
    name: 'Mistrz Konsekwencji',
    description: '30 dni medytacji z rzędu',
    icon: '👑',
    requirement: '30-day streak',
  },
  {
    id: 'hour_total',
    name: 'Pierwsza Godzina',
    description: 'Łącznie 60 minut medytacji',
    icon: '⏱️',
    requirement: '60 total minutes',
  },
  {
    id: 'five_hours',
    name: 'Pięć Godzin Spokoju',
    description: 'Łącznie 300 minut medytacji',
    icon: '🕐',
    requirement: '300 total minutes',
  },
  {
    id: 'mood_master',
    name: 'Władca Nastroju',
    description: 'Średnia poprawa nastroju powyżej 3 punktów',
    icon: '😊',
    requirement: 'Avg mood improvement > 3',
  },
  {
    id: 'early_bird',
    name: 'Ranny Ptaszek',
    description: '10 porannych medytacji',
    icon: '🌅',
    requirement: '10 morning meditations',
  },
  {
    id: 'night_owl',
    name: 'Nocna Sowa',
    description: '10 wieczornych medytacji',
    icon: '🌙',
    requirement: '10 evening meditations',
  },
  {
    id: 'explorer',
    name: 'Odkrywca',
    description: 'Wypróbowałeś wszystkie 5 celów medytacji',
    icon: '🧭',
    requirement: 'Try all 5 goals',
  },
  {
    id: 'challenge_3',
    name: 'Wyzwanie 3 Dni',
    description: 'Ukończyłeś 3-dniowe wyzwanie',
    icon: '🎯',
    requirement: 'Complete 3-day challenge',
  },
  {
    id: 'challenge_7',
    name: 'Wyzwanie Tygodnia',
    description: 'Ukończyłeś 7-dniowe wyzwanie',
    icon: '🎖️',
    requirement: 'Complete 7-day challenge',
  },
  {
    id: 'challenge_21',
    name: 'Transformacja',
    description: 'Ukończyłeś 21-dniowe wyzwanie - jesteś zmieniony',
    icon: '🦋',
    requirement: 'Complete 21-day challenge',
  },
]

// Level definitions
export const LEVELS: Level[] = [
  { level: 1, name: 'Początkujący', minMinutes: 0, icon: '🌱' },
  { level: 2, name: 'Uczeń', minMinutes: 60, icon: '🌿' },
  { level: 3, name: 'Praktykujący', minMinutes: 180, icon: '🌳' },
  { level: 4, name: 'Adept', minMinutes: 360, icon: '🌲' },
  { level: 5, name: 'Mistrz', minMinutes: 600, icon: '🏔️' },
  { level: 6, name: 'Guru', minMinutes: 1200, icon: '🌟' },
  { level: 7, name: 'Oświecony', minMinutes: 2400, icon: '☀️' },
]

// Challenge templates
export const CHALLENGE_TEMPLATES: Omit<Challenge, 'progress' | 'startedAt' | 'completedAt'>[] = [
  {
    id: 'start_3',
    name: 'Pierwszy Krok',
    description: 'Medytuj przez 3 dni z rzędu. Idealne na początek.',
    duration: 3,
    goal: '3 medytacje pod rząd',
    reward: 'Badge "Wyzwanie 3 Dni" + 50 XP',
  },
  {
    id: 'morning_7',
    name: 'Poranne Przebudzenie',
    description: 'Medytuj rano przez 7 dni. Rozpocznij każdy dzień świadomie.',
    duration: 7,
    goal: '7 porannych medytacji',
    reward: 'Badge "Ranny Ptaszek" + 100 XP',
  },
  {
    id: 'evening_7',
    name: 'Wieczorny Spokój',
    description: 'Medytuj wieczorem przez 7 dni. Zakończ dzień w harmonii.',
    duration: 7,
    goal: '7 wieczornych medytacji',
    reward: 'Badge "Nocna Sowa" + 100 XP',
  },
  {
    id: 'consistency_7',
    name: 'Tydzień Konsekwencji',
    description: 'Codziennie przez tydzień. Buduj nawyk.',
    duration: 7,
    goal: '7 medytacji pod rząd',
    reward: 'Badge "Tydzień Spokoju" + 150 XP',
  },
  {
    id: 'deep_7',
    name: 'Głęboka Praktyka',
    description: '7 dni medytacji po minimum 15 minut każda.',
    duration: 7,
    goal: '7 medytacji 15+ minut',
    reward: '200 XP + odblokowanie dłuższych medytacji',
  },
  {
    id: 'transform_21',
    name: 'Transformacja 21 Dni',
    description: 'Klasyczne wyzwanie budowania nawyku. Po 21 dniach medytacja stanie się naturalną częścią Twojego życia.',
    duration: 21,
    goal: '21 medytacji pod rząd',
    reward: 'Badge "Transformacja" + 500 XP + specjalny głos',
  },
  {
    id: 'abundance_21',
    name: 'Ścieżka Obfitości',
    description: '21 dni medytacji na obfitość. Zmień swoją relację z dostatkiem.',
    duration: 21,
    goal: '21 medytacji z celem "abundance"',
    reward: 'Badge "Transformacja" + 500 XP',
  },
  {
    id: 'sleep_14',
    name: 'Lepszy Sen',
    description: '14 wieczornych medytacji na sen. Transformuj jakość odpoczynku.',
    duration: 14,
    goal: '14 wieczornych medytacji na sen',
    reward: '300 XP + specjalna medytacja na głęboki sen',
  },
]

// Helper functions

export function calculateLevel(totalMinutes: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalMinutes >= LEVELS[i].minMinutes) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}

export function getNextLevel(currentLevel: number): Level | null {
  const nextIndex = LEVELS.findIndex(l => l.level === currentLevel) + 1
  return nextIndex < LEVELS.length ? LEVELS[nextIndex] : null
}

export function calculateXpToNextLevel(totalMinutes: number): { current: number; needed: number; progress: number } {
  const currentLevel = calculateLevel(totalMinutes)
  const nextLevel = getNextLevel(currentLevel.level)

  if (!nextLevel) {
    return { current: totalMinutes, needed: totalMinutes, progress: 100 }
  }

  const current = totalMinutes - currentLevel.minMinutes
  const needed = nextLevel.minMinutes - currentLevel.minMinutes
  const progress = Math.round((current / needed) * 100)

  return { current, needed, progress }
}

export function checkNewBadges(stats: UserStats): Badge[] {
  const newBadges: Badge[] = []

  for (const badge of BADGES) {
    if (stats.badges.includes(badge.id)) continue

    let earned = false

    switch (badge.id) {
      case 'first_meditation':
        earned = stats.totalSessions >= 1
        break
      case 'streak_3':
        earned = stats.currentStreak >= 3 || stats.longestStreak >= 3
        break
      case 'streak_7':
        earned = stats.currentStreak >= 7 || stats.longestStreak >= 7
        break
      case 'streak_21':
        earned = stats.currentStreak >= 21 || stats.longestStreak >= 21
        break
      case 'streak_30':
        earned = stats.currentStreak >= 30 || stats.longestStreak >= 30
        break
      case 'hour_total':
        earned = stats.totalMinutes >= 60
        break
      case 'five_hours':
        earned = stats.totalMinutes >= 300
        break
      case 'mood_master':
        earned = stats.avgMoodImprovement > 3
        break
      case 'challenge_3':
        earned = stats.completedChallenges.some(c => c.includes('_3'))
        break
      case 'challenge_7':
        earned = stats.completedChallenges.some(c => c.includes('_7'))
        break
      case 'challenge_21':
        earned = stats.completedChallenges.some(c => c.includes('_21'))
        break
    }

    if (earned) {
      newBadges.push({ ...badge, earned: true, earnedAt: new Date().toISOString() })
    }
  }

  return newBadges
}

// Format streak with fire emojis
export function formatStreak(streak: number): string {
  if (streak === 0) return '0'
  if (streak < 3) return `${streak}`
  if (streak < 7) return `${streak} 🔥`
  if (streak < 21) return `${streak} 🔥🔥`
  if (streak < 30) return `${streak} 🔥🔥🔥`
  return `${streak} 🔥🔥🔥👑`
}

// Get motivational message based on stats
export function getMotivationalMessage(stats: UserStats): string {
  if (stats.totalSessions === 0) {
    return 'Rozpocznij swoją podróż już dziś'
  }
  if (stats.currentStreak === 0) {
    return 'Wróć na ścieżkę - każdy dzień to nowy początek'
  }
  if (stats.currentStreak === 1) {
    return 'Dobry początek! Jutro zrób to znowu'
  }
  if (stats.currentStreak < 3) {
    return 'Budujesz momentum - nie przerywaj!'
  }
  if (stats.currentStreak < 7) {
    return 'Świetna passa! Tydzień na wyciągnięcie ręki'
  }
  if (stats.currentStreak < 21) {
    return 'Niesamowite! 21 dni to formowanie nawyku'
  }
  return 'Jesteś inspiracją. Medytacja jest teraz częścią Ciebie.'
}
