'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Meditation {
  id: string
  title: string
  script: string
  audioUrl?: string
  duration: number
  theme: string
}

export default function MeditatePage() {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [meditation, setMeditation] = useState<Meditation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [moodBefore, setMoodBefore] = useState(5)
  const [moodAfter, setMoodAfter] = useState(5)
  const [rating, setRating] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    loadOrGenerateMeditation()
  }, [])

  const loadOrGenerateMeditation = async () => {
    setLoading(true)
    try {
      // Check if we have a meditation stored today
      const stored = localStorage.getItem('mindflow_today_meditation')
      if (stored) {
        const data = JSON.parse(stored)
        const today = new Date().toDateString()
        if (data.date === today) {
          setMeditation(data.meditation)
          setLoading(false)
          return
        }
      }

      // Generate new meditation
      await generateMeditation()
    } catch (error) {
      console.error('Error loading meditation:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMeditation = async () => {
    setGenerating(true)
    try {
      const preferences = JSON.parse(localStorage.getItem('mindflow_preferences') || '{}')

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) throw new Error('Failed to generate')

      const data = await response.json()
      setMeditation(data.meditation)

      // Store for today
      localStorage.setItem('mindflow_today_meditation', JSON.stringify({
        date: new Date().toDateString(),
        meditation: data.meditation,
      }))
    } catch (error) {
      console.error('Error generating meditation:', error)
      // Fallback mock meditation
      const mockMeditation: Meditation = {
        id: 'mock-1',
        title: 'Wieczorny Spokoj',
        script: `Witaj. Znajdz wygodna pozycje i zamknij oczy.

[PAUZA 3s]

Wez gleboki oddech... wdech przez nos... i powoli wydech przez usta.

[PAUZA 5s]

Poczuj jak Twoje cialo sie relaksuje. Kazdy wydech uwalnia napiecie.

[PAUZA 5s]

Wyobraz sobie spokojna, ciepla energie, ktora przeplywa przez Twoje cialo.
Zaczyna od stop... przez nogi... brzuch... klatke piersiowa... ramiona... az do czubka glowy.

[PAUZA 8s]

Jestes tu i teraz. Bezpieczny. Spokojny.

[PAUZA 5s]

Za chwile zakonczymy. Wez jeszcze jeden gleboki oddech.
Powoli otwieraj oczy, czujac sie odswiezony i spokojny.

Dziekuje za wspolna praktuke.`,
        duration: 180,
        theme: 'relax',
      }
      setMeditation(mockMeditation)
    } finally {
      setGenerating(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current && meditation?.audioUrl) {
      // Will implement with real audio
    }
    setIsPlaying(!isPlaying)

    // Simulate progress for demo
    if (!isPlaying && meditation) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            setShowFeedback(true)
            return 100
          }
          return prev + (100 / (meditation.duration))
        })
        setCurrentTime(prev => prev + 1)
      }, 1000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const submitFeedback = async () => {
    // Save feedback
    const feedback = {
      meditationId: meditation?.id,
      rating,
      moodBefore,
      moodAfter,
      date: new Date().toISOString(),
    }

    const history = JSON.parse(localStorage.getItem('mindflow_history') || '[]')
    history.push(feedback)
    localStorage.setItem('mindflow_history', JSON.stringify(history))

    setShowFeedback(false)
    alert('Dziekujemy za opinie! Jutro wygenerujemy jeszcze lepsza medytacje.')
  }

  if (loading || generating) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-500/30 animate-breathe mx-auto mb-8 flex items-center justify-center">
            <span className="text-5xl">🧘</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {generating ? 'Generowanie medytacji...' : 'Ladowanie...'}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {generating ? 'AI tworzy dla Ciebie unikalny skrypt' : 'Moment...'}
          </p>
        </div>
      </main>
    )
  }

  if (showFeedback) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="glass-card p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-8">
            Jak sie czujesz?
          </h2>

          <div className="mb-8">
            <p className="text-[var(--text-secondary)] mb-4 text-center">
              Nastroj przed medytacja
            </p>
            <div className="flex justify-between">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => setMoodBefore(n)}
                  className={`w-8 h-8 rounded-full text-sm ${
                    moodBefore === n
                      ? 'bg-purple-600 text-white'
                      : 'bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[var(--text-secondary)] mb-4 text-center">
              Nastroj po medytacji
            </p>
            <div className="flex justify-between">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => setMoodAfter(n)}
                  className={`w-8 h-8 rounded-full text-sm ${
                    moodAfter === n
                      ? 'bg-green-600 text-white'
                      : 'bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[var(--text-secondary)] mb-4 text-center">
              Ocena medytacji
            </p>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className="text-3xl"
                >
                  {n <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={submitFeedback}
            className="btn-primary w-full"
          >
            Zapisz opinie
          </button>
        </div>
      </main>
    )
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
        <Link href="/history" className="text-[var(--text-secondary)] hover:text-white transition-colors">
          Historia
        </Link>
      </header>

      {/* Player */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Visualization */}
        <div className="relative mb-12">
          <div className={`w-64 h-64 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-500/20 ${
            isPlaying ? 'animate-breathe' : ''
          } flex items-center justify-center`}>
            <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-purple-600/40 to-blue-500/40 ${
              isPlaying ? 'animate-breathe' : ''
            } flex items-center justify-center`}
                 style={{ animationDelay: '0.3s' }}>
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 ${
                isPlaying ? 'animate-pulse-glow' : ''
              } flex items-center justify-center`}>
                {isPlaying ? (
                  <div className="audio-visualizer">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="audio-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                ) : (
                  <span className="text-5xl">🧘</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2 text-center">
          {meditation?.title || 'Dzisiejsza Medytacja'}
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          {formatTime(meditation?.duration || 0)}
        </p>

        {/* Progress */}
        <div className="w-full max-w-md mb-4">
          <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-[var(--text-muted)] mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(meditation?.duration || 0)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button className="text-[var(--text-secondary)] hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-4a1 1 0 00-.555-.832l-4-2a1 1 0 00-.89 1.664L7.764 10l-3.21 1.168a1 1 0 00.89 1.664l4-2z" />
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 10H4V6h12v8z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setShowFeedback(true)}
            className="text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Script preview (collapsible) */}
      <details className="border-t border-[var(--border-color)]">
        <summary className="p-4 cursor-pointer text-[var(--text-secondary)] hover:text-white">
          Zobacz skrypt medytacji
        </summary>
        <div className="p-4 pt-0 max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-[var(--text-secondary)] font-sans">
            {meditation?.script}
          </pre>
        </div>
      </details>
    </main>
  )
}
