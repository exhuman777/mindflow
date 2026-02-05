'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FeedbackEntry {
  meditationId: string
  rating: number
  moodBefore: number
  moodAfter: number
  date: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<FeedbackEntry[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgRating: 0,
    avgMoodImprovement: 0,
    streak: 0,
  })

  useEffect(() => {
    const stored = localStorage.getItem('mindflow_history')
    if (stored) {
      const data = JSON.parse(stored) as FeedbackEntry[]
      setHistory(data.reverse()) // Most recent first

      // Calculate stats
      if (data.length > 0) {
        const totalRating = data.reduce((sum, e) => sum + e.rating, 0)
        const totalImprovement = data.reduce((sum, e) => sum + (e.moodAfter - e.moodBefore), 0)

        setStats({
          totalSessions: data.length,
          avgRating: totalRating / data.length,
          avgMoodImprovement: totalImprovement / data.length,
          streak: calculateStreak(data),
        })
      }
    }
  }, [])

  const calculateStreak = (data: FeedbackEntry[]) => {
    // Simple streak calculation
    let streak = 0
    const today = new Date()
    const sortedDates = data
      .map(e => new Date(e.date).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i) // Unique dates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      if (sortedDates[i] === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-8">Twoja historia</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.totalSessions}</div>
            <div className="text-sm text-[var(--text-muted)]">Sesje</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {stats.avgRating.toFixed(1)} ⭐
            </div>
            <div className="text-sm text-[var(--text-muted)]">Srednia ocena</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-green-400">
              {stats.avgMoodImprovement > 0 ? '+' : ''}{stats.avgMoodImprovement.toFixed(1)}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Poprawa nastroju</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.streak} 🔥</div>
            <div className="text-sm text-[var(--text-muted)]">Seria dni</div>
          </div>
        </div>

        {/* History list */}
        {history.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p className="text-xl mb-4">Brak historii</p>
            <p>Ukoncz pierwsza medytacje, aby zobaczyc swoj postep.</p>
            <Link href="/meditate" className="btn-primary inline-block mt-6">
              Rozpocznij medytacje
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, i) => (
              <div key={i} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{formatDate(entry.date)}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    Nastroj: {entry.moodBefore} → {entry.moodAfter}
                    <span className={entry.moodAfter > entry.moodBefore ? 'text-green-400' : 'text-red-400'}>
                      {' '}({entry.moodAfter > entry.moodBefore ? '+' : ''}{entry.moodAfter - entry.moodBefore})
                    </span>
                  </div>
                </div>
                <div className="text-xl">
                  {'⭐'.repeat(entry.rating)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
