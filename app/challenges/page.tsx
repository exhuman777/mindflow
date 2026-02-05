'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CHALLENGE_TEMPLATES,
  BADGES,
  LEVELS,
  calculateLevel,
  calculateXpToNextLevel,
  formatStreak,
  getMotivationalMessage,
  type Challenge,
  type UserStats,
} from '@/lib/gamification'

export default function ChallengesPage() {
  const [stats, setStats] = useState<UserStats>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    avgMoodImprovement: 0,
    badges: [],
    level: 1,
    completedChallenges: [],
  })
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<typeof CHALLENGE_TEMPLATES[0] | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    // Load from localStorage (will be Supabase later)
    const storedStats = localStorage.getItem('mindflow_stats')
    if (storedStats) {
      setStats(JSON.parse(storedStats))
    }

    const storedChallenge = localStorage.getItem('mindflow_active_challenge')
    if (storedChallenge) {
      setActiveChallenge(JSON.parse(storedChallenge))
    }

    // Calculate from history
    const history = JSON.parse(localStorage.getItem('mindflow_history') || '[]')
    if (history.length > 0) {
      const totalSessions = history.length
      // Estimate 10 min average if not stored
      const totalMinutes = history.length * 10

      const avgMoodImprovement = history.reduce(
        (sum: number, h: any) => sum + (h.moodAfter - h.moodBefore),
        0
      ) / history.length

      // Calculate streak
      const dates: string[] = history.map((h: any) => new Date(h.date).toDateString())
      const uniqueDates: string[] = Array.from(new Set(dates)).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
      )

      let currentStreak = 0
      const today = new Date()
      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date(today)
        expectedDate.setDate(expectedDate.getDate() - i)
        if (uniqueDates.includes(expectedDate.toDateString())) {
          currentStreak++
        } else {
          break
        }
      }

      const newStats: UserStats = {
        ...stats,
        totalSessions,
        totalMinutes,
        currentStreak,
        longestStreak: Math.max(currentStreak, stats.longestStreak),
        avgMoodImprovement,
        level: calculateLevel(totalMinutes).level,
      }

      setStats(newStats)
      localStorage.setItem('mindflow_stats', JSON.stringify(newStats))
    }
  }

  const startChallenge = (template: typeof CHALLENGE_TEMPLATES[0]) => {
    const challenge: Challenge = {
      ...template,
      progress: 0,
      startedAt: new Date().toISOString(),
    }
    setActiveChallenge(challenge)
    localStorage.setItem('mindflow_active_challenge', JSON.stringify(challenge))
    setShowChallengeModal(false)
  }

  const abandonChallenge = () => {
    if (confirm('Na pewno chcesz porzucić wyzwanie? Postęp zostanie utracony.')) {
      setActiveChallenge(null)
      localStorage.removeItem('mindflow_active_challenge')
    }
  }

  const currentLevel = calculateLevel(stats.totalMinutes)
  const xpProgress = calculateXpToNextLevel(stats.totalMinutes)
  const earnedBadges = BADGES.filter(b => stats.badges.includes(b.id))
  const availableBadges = BADGES.filter(b => !stats.badges.includes(b.id))

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-xl">
            🧘
          </div>
          <span className="font-semibold text-lg">MindFlow</span>
        </Link>
        <Link href="/meditate" className="btn-primary text-sm py-2 px-4">
          Medytuj
        </Link>
      </header>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* Profile Card */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center gap-6">
            {/* Level */}
            <div className="text-center">
              <div className="text-5xl mb-2">{currentLevel.icon}</div>
              <div className="font-semibold">{currentLevel.name}</div>
              <div className="text-sm text-[var(--text-muted)]">Poziom {currentLevel.level}</div>
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.totalSessions}</div>
                <div className="text-sm text-[var(--text-muted)]">Sesje</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.totalMinutes}</div>
                <div className="text-sm text-[var(--text-muted)]">Minut</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{formatStreak(stats.currentStreak)}</div>
                <div className="text-sm text-[var(--text-muted)]">Seria</div>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--text-secondary)]">Postęp do następnego poziomu</span>
              <span className="text-[var(--text-muted)]">{xpProgress.current}/{xpProgress.needed} min</span>
            </div>
            <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all"
                style={{ width: `${xpProgress.progress}%` }}
              />
            </div>
          </div>

          {/* Motivational message */}
          <p className="mt-4 text-center text-[var(--text-secondary)] italic">
            "{getMotivationalMessage(stats)}"
          </p>
        </div>

        {/* Active Challenge */}
        {activeChallenge ? (
          <div className="glass-card p-6 mb-8 border-yellow-500/30">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-yellow-400 mb-1">AKTYWNE WYZWANIE</div>
                <h2 className="text-xl font-bold">{activeChallenge.name}</h2>
              </div>
              <button
                onClick={abandonChallenge}
                className="text-sm text-[var(--text-muted)] hover:text-red-400"
              >
                Porzuć
              </button>
            </div>
            <p className="text-[var(--text-secondary)] mb-4">{activeChallenge.description}</p>

            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Postęp: {activeChallenge.progress || 0}/{activeChallenge.duration} dni</span>
              <span className="text-sm text-[var(--text-muted)]">
                {Math.round(((activeChallenge.progress || 0) / activeChallenge.duration) * 100)}%
              </span>
            </div>
            <div className="h-4 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                style={{ width: `${((activeChallenge.progress || 0) / activeChallenge.duration) * 100}%` }}
              />
            </div>

            <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-sm text-[var(--text-muted)]">Nagroda:</div>
              <div className="text-sm">{activeChallenge.reward}</div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 mb-8 text-center">
            <h2 className="text-xl font-bold mb-2">Rozpocznij Wyzwanie</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              Wybierz wyzwanie i zobowiąż się do regularnej praktyki
            </p>
            <button
              onClick={() => setShowChallengeModal(true)}
              className="btn-primary"
            >
              Wybierz wyzwanie
            </button>
          </div>
        )}

        {/* Badges */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Odznaki ({earnedBadges.length}/{BADGES.length})</h2>

          {earnedBadges.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mb-4">
              {earnedBadges.map(badge => (
                <div key={badge.id} className="glass-card p-4 text-center">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="text-xs font-medium">{badge.name}</div>
                </div>
              ))}
            </div>
          )}

          <details className="glass-card">
            <summary className="p-4 cursor-pointer text-[var(--text-secondary)]">
              Do zdobycia ({availableBadges.length})
            </summary>
            <div className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableBadges.map(badge => (
                <div key={badge.id} className="p-3 bg-[var(--bg-tertiary)] rounded-lg opacity-50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl grayscale">{badge.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{badge.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{badge.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* All Challenges */}
        <div>
          <h2 className="text-xl font-bold mb-4">Dostępne Wyzwania</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {CHALLENGE_TEMPLATES.map(challenge => (
              <div
                key={challenge.id}
                className={`glass-card p-4 ${
                  stats.completedChallenges.includes(challenge.id)
                    ? 'opacity-50'
                    : 'cursor-pointer hover:border-purple-500/50'
                }`}
                onClick={() => {
                  if (!activeChallenge && !stats.completedChallenges.includes(challenge.id)) {
                    setSelectedChallenge(challenge)
                    setShowChallengeModal(true)
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{challenge.name}</h3>
                  <span className="text-sm px-2 py-1 rounded bg-[var(--bg-tertiary)]">
                    {challenge.duration} dni
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{challenge.description}</p>
                {stats.completedChallenges.includes(challenge.id) && (
                  <div className="text-sm text-green-400">✓ Ukończone</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Challenge Selection Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="glass-card p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Wybierz Wyzwanie</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {CHALLENGE_TEMPLATES.filter(c => !stats.completedChallenges.includes(c.id)).map(challenge => (
                <button
                  key={challenge.id}
                  onClick={() => startChallenge(challenge)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedChallenge?.id === challenge.id
                      ? 'bg-purple-600/30 border border-purple-500'
                      : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{challenge.name}</span>
                    <span className="text-sm text-[var(--text-muted)]">{challenge.duration} dni</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{challenge.description}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowChallengeModal(false)}
              className="btn-secondary w-full mt-4"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
