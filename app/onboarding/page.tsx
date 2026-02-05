'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CHALLENGE_TEMPLATES } from '@/lib/gamification'

const MOODS = ['😫', '😔', '😐', '🙂', '😊']

const GOALS = [
  { id: 'sleep', label: 'Lepszy sen', icon: '😴', desc: 'Zasypianie, jakość snu' },
  { id: 'anxiety', label: 'Mniej stresu', icon: '🧘', desc: 'Spokój, redukcja lęku' },
  { id: 'focus', label: 'Koncentracja', icon: '🎯', desc: 'Jasność umysłu, produktywność' },
  { id: 'energy', label: 'Więcej energii', icon: '⚡', desc: 'Witalność, przebudzenie' },
  { id: 'abundance', label: 'Obfitość', icon: '💎', desc: 'Manifestacja, dobrobyt' },
  { id: 'healing', label: 'Uzdrawianie', icon: '💚', desc: 'Ciało, emocje, trauma' },
]

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Początkujący', icon: '🌱', desc: 'Dopiero zaczynam lub próbowałem kilka razy' },
  { id: 'intermediate', label: 'Praktykujący', icon: '🌿', desc: 'Medytuję od czasu do czasu' },
  { id: 'advanced', label: 'Zaawansowany', icon: '🌳', desc: 'Regularna praktyka od miesięcy/lat' },
]

const MEDITATION_STYLES = [
  { id: 'guided', label: 'Prowadzona', icon: '🎙️', desc: 'Głos prowadzi przez całą medytację' },
  { id: 'breathing', label: 'Oddechowa', icon: '🌬️', desc: 'Skupienie na oddechu' },
  { id: 'visualization', label: 'Wizualizacja', icon: '🌈', desc: 'Obrazy, światło, energia' },
  { id: 'bodyscan', label: 'Body scan', icon: '🫀', desc: 'Skanowanie ciała, rozluźnienie' },
  { id: 'mantra', label: 'Mantra', icon: '🕉️', desc: 'Powtarzanie słów/fraz' },
]

const DURATIONS = [5, 10, 15, 20, 30]

const TIMES = [
  { id: 'morning', label: 'Rano', icon: '🌅', desc: 'Przed dniem' },
  { id: 'afternoon', label: 'W ciągu dnia', icon: '☀️', desc: 'Przerwa, reset' },
  { id: 'evening', label: 'Wieczorem', icon: '🌙', desc: 'Przed snem' },
  { id: 'anytime', label: 'Różnie', icon: '🕐', desc: 'Kiedy potrzebuję' },
]

const TRIGGERS = [
  { id: 'work', label: 'Praca', icon: '💼' },
  { id: 'relationships', label: 'Relacje', icon: '❤️' },
  { id: 'health', label: 'Zdrowie', icon: '🏥' },
  { id: 'money', label: 'Finanse', icon: '💰' },
  { id: 'future', label: 'Przyszłość', icon: '🔮' },
  { id: 'self', label: 'Ja sam/a', icon: '🪞' },
]

const SLEEP_ISSUES = [
  { id: 'falling_asleep', label: 'Trudności z zasypianiem', icon: '😵‍💫' },
  { id: 'staying_asleep', label: 'Budzę się w nocy', icon: '👀' },
  { id: 'racing_thoughts', label: 'Myśli nie dają zasnąć', icon: '💭' },
  { id: 'anxiety_night', label: 'Lęk przed nocą', icon: '😰' },
  { id: 'quality', label: 'Słaba jakość snu', icon: '😴' },
]

const CHALLENGE_OPTIONS = [
  { id: 'none', label: 'Na razie bez wyzwania', icon: '🚶', days: 0 },
  { id: 'start_3', label: '3 dni - pierwszy krok', icon: '🎯', days: 3 },
  { id: 'consistency_7', label: '7 dni - budowanie nawyku', icon: '⭐', days: 7 },
  { id: 'transform_21', label: '21 dni - pełna transformacja', icon: '🦋', days: 21 },
]

const TOTAL_STEPS = 8

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [preferences, setPreferences] = useState({
    stressLevel: 5,
    goals: [] as string[],
    experience: 'beginner',
    styles: [] as string[],
    duration: 10,
    preferredTime: 'evening',
    triggers: [] as string[],
    sleepIssues: [] as string[],
    challenge: 'none',
  })

  const handleNext = () => {
    // Skip sleep issues step if sleep not selected
    if (step === 6 && !preferences.goals.includes('sleep')) {
      setStep(7)
      return
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    // Skip sleep issues step when going back
    if (step === 7 && !preferences.goals.includes('sleep')) {
      setStep(5)
      return
    }
    if (step > 1) setStep(step - 1)
  }

  const toggleArrayItem = (key: 'goals' | 'styles' | 'triggers' | 'sleepIssues', itemId: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: prev[key].includes(itemId)
        ? prev[key].filter((i: string) => i !== itemId)
        : [...prev[key], itemId]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      localStorage.setItem('mindflow_preferences', JSON.stringify(preferences))

      // Start challenge if selected
      if (preferences.challenge !== 'none') {
        const template = CHALLENGE_TEMPLATES.find(c => c.id === preferences.challenge)
        if (template) {
          const challenge = {
            ...template,
            progress: 0,
            startedAt: new Date().toISOString(),
          }
          localStorage.setItem('mindflow_active_challenge', JSON.stringify(challenge))
        }
      }

      router.push('/meditate')
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 2: return preferences.goals.length > 0
      case 4: return preferences.styles.length > 0
      case 7: return preferences.triggers.length > 0
      default: return true
    }
  }

  // Calculate actual step number for display (accounting for skipped steps)
  const displayStep = () => {
    if (step <= 5) return step
    if (!preferences.goals.includes('sleep') && step >= 7) return step - 1
    return step
  }

  const displayTotal = () => {
    return preferences.goals.includes('sleep') ? TOTAL_STEPS : TOTAL_STEPS - 1
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-xl">
            🧘
          </div>
          <span className="font-semibold text-lg">MindFlow</span>
        </div>
        <span className="text-[var(--text-muted)]">
          Krok {displayStep()} z {displayTotal()}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--bg-tertiary)]">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-300"
          style={{ width: `${(displayStep() / displayTotal()) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-lg mx-auto w-full overflow-y-auto">

        {/* Step 1: Stress Level */}
        {step === 1 && (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Jak się dziś czujesz?</h2>
            <p className="text-[var(--text-secondary)] mb-8">Twój obecny poziom stresu</p>

            <div className="flex justify-between items-center mb-4 text-4xl">
              {MOODS.map((mood, i) => (
                <button
                  key={i}
                  onClick={() => setPreferences(prev => ({ ...prev, stressLevel: (i + 1) * 2 }))}
                  className={`p-2 rounded-xl transition-all ${
                    Math.ceil(preferences.stressLevel / 2) === i + 1
                      ? 'bg-purple-600/30 scale-125'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={preferences.stressLevel}
              onChange={(e) => setPreferences(prev => ({ ...prev, stressLevel: parseInt(e.target.value) }))}
              className="w-full mb-4"
            />

            <p className="text-[var(--text-secondary)]">
              Poziom stresu: <span className="font-bold text-white">{preferences.stressLevel}/10</span>
            </p>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Co chcesz osiągnąć?</h2>
            <p className="text-[var(--text-secondary)] mb-6">Wybierz jeden lub więcej celów</p>

            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleArrayItem('goals', goal.id)}
                  className={`glass-card p-4 text-left transition-all ${
                    preferences.goals.includes(goal.id)
                      ? 'border-purple-500 bg-purple-600/20'
                      : 'hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{goal.icon}</div>
                  <div className="font-medium text-sm">{goal.label}</div>
                  <div className="text-xs text-[var(--text-muted)]">{goal.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Experience */}
        {step === 3 && (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Twoje doświadczenie</h2>
            <p className="text-[var(--text-secondary)] mb-6">Jak długo medytujesz?</p>

            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setPreferences(prev => ({ ...prev, experience: level.id }))}
                  className={`w-full glass-card p-4 text-left transition-all flex items-center gap-4 ${
                    preferences.experience === level.id
                      ? 'border-purple-500 bg-purple-600/20'
                      : 'hover:border-purple-500/50'
                  }`}
                >
                  <span className="text-3xl">{level.icon}</span>
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm text-[var(--text-muted)]">{level.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Meditation Style */}
        {step === 4 && (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Preferowany styl</h2>
            <p className="text-[var(--text-secondary)] mb-6">Co Ci najbardziej odpowiada?</p>

            <div className="space-y-3">
              {MEDITATION_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => toggleArrayItem('styles', style.id)}
                  className={`w-full glass-card p-4 text-left transition-all flex items-center gap-4 ${
                    preferences.styles.includes(style.id)
                      ? 'border-purple-500 bg-purple-600/20'
                      : 'hover:border-purple-500/50'
                  }`}
                >
                  <span className="text-2xl">{style.icon}</span>
                  <div>
                    <div className="font-medium">{style.label}</div>
                    <div className="text-sm text-[var(--text-muted)]">{style.desc}</div>
                  </div>
                  {preferences.styles.includes(style.id) && (
                    <span className="ml-auto text-purple-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Duration & Time */}
        {step === 5 && (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Czas na medytację</h2>
            <p className="text-[var(--text-secondary)] mb-6">Jak długo i kiedy?</p>

            <div className="mb-8">
              <p className="text-sm text-[var(--text-muted)] mb-3">Długość sesji</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setPreferences(prev => ({ ...prev, duration: dur }))}
                    className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                      preferences.duration === dur
                        ? 'bg-gradient-to-br from-purple-600 to-blue-500 scale-110'
                        : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <span className="font-bold">{dur}</span>
                    <span className="text-xs text-[var(--text-muted)]">min</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-[var(--text-muted)] mb-3">Pora dnia</p>
              <div className="grid grid-cols-2 gap-3">
                {TIMES.map((time) => (
                  <button
                    key={time.id}
                    onClick={() => setPreferences(prev => ({ ...prev, preferredTime: time.id }))}
                    className={`glass-card p-3 text-center transition-all ${
                      preferences.preferredTime === time.id
                        ? 'border-purple-500 bg-purple-600/20'
                        : 'hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{time.icon}</div>
                    <div className="text-sm font-medium">{time.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Sleep Issues (conditional) */}
        {step === 6 && preferences.goals.includes('sleep') && (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Problemy ze snem</h2>
            <p className="text-[var(--text-secondary)] mb-6">Z czym się zmagasz?</p>

            <div className="space-y-3">
              {SLEEP_ISSUES.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => toggleArrayItem('sleepIssues', issue.id)}
                  className={`w-full glass-card p-4 text-left transition-all flex items-center gap-4 ${
                    preferences.sleepIssues.includes(issue.id)
                      ? 'border-purple-500 bg-purple-600/20'
                      : 'hover:border-purple-500/50'
                  }`}
                >
                  <span className="text-2xl">{issue.icon}</span>
                  <span className="font-medium">{issue.label}</span>
                  {preferences.sleepIssues.includes(issue.id) && (
                    <span className="ml-auto text-purple-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Triggers */}
        {step === 7 && (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Źródła stresu</h2>
            <p className="text-[var(--text-secondary)] mb-6">Co najbardziej Cię obciąża?</p>

            <div className="grid grid-cols-2 gap-3">
              {TRIGGERS.map((trigger) => (
                <button
                  key={trigger.id}
                  onClick={() => toggleArrayItem('triggers', trigger.id)}
                  className={`glass-card p-4 text-center transition-all ${
                    preferences.triggers.includes(trigger.id)
                      ? 'border-purple-500 bg-purple-600/20'
                      : 'hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{trigger.icon}</div>
                  <div className="font-medium">{trigger.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Challenge */}
        {step === 8 && (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Zobowiązanie</h2>
            <p className="text-[var(--text-secondary)] mb-6">Chcesz rozpocząć wyzwanie?</p>

            <div className="space-y-3">
              {CHALLENGE_OPTIONS.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => setPreferences(prev => ({ ...prev, challenge: challenge.id }))}
                  className={`w-full glass-card p-4 text-left transition-all flex items-center gap-4 ${
                    preferences.challenge === challenge.id
                      ? 'border-purple-500 bg-purple-600/20'
                      : 'hover:border-purple-500/50'
                  }`}
                >
                  <span className="text-3xl">{challenge.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{challenge.label}</div>
                    {challenge.days > 0 && (
                      <div className="text-sm text-[var(--text-muted)]">
                        Medytuj codziennie przez {challenge.days} dni
                      </div>
                    )}
                  </div>
                  {preferences.challenge === challenge.id && (
                    <span className="text-purple-400">✓</span>
                  )}
                </button>
              ))}
            </div>

            {preferences.challenge !== 'none' && (
              <div className="mt-6 p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <p className="text-sm">
                  🎯 Rozpoczniesz wyzwanie zaraz po pierwszej medytacji.
                  Codzienne praktykowanie buduje nawyk i przynosi najlepsze efekty.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-[var(--border-color)] flex justify-between">
        <button
          onClick={handleBack}
          className={`btn-secondary ${step === 1 ? 'invisible' : ''}`}
        >
          Wstecz
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Zapisywanie...' : step === TOTAL_STEPS ? 'Rozpocznij medytację' : 'Dalej'}
        </button>
      </div>
    </main>
  )
}
