'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
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
        <nav className="flex items-center gap-4">
          <Link href="/challenges" className="text-[var(--text-secondary)] hover:text-white transition-colors">
            Wyzwania
          </Link>
          <Link href="/history" className="text-[var(--text-secondary)] hover:text-white transition-colors">
            Historia
          </Link>
          <Link href="/onboarding" className="btn-primary text-sm py-2 px-4">
            Rozpocznij
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Breathing circle */}
        <div className="relative mb-12">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-500/20 animate-breathe" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/40 to-blue-500/40 animate-breathe"
                 style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🧘
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Medytacja stworzona dla Ciebie
        </h1>

        <p className="text-[var(--text-secondary)] text-lg md:text-xl max-w-2xl mb-10">
          AI poznaje Twoje potrzeby i codziennie generuje unikalną, spersonalizowaną sesję medytacyjną
          z naturalnym głosem.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/onboarding" className="btn-primary text-lg px-8 py-4">
            Rozpocznij za darmo
          </Link>
          <button className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            Demo
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Jak to dziala?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-semibold text-lg mb-2">1. Poznajemy Cie</h3>
              <p className="text-[var(--text-secondary)]">
                Krotki onboarding - kilka pytan o Twoj poziom stresu, cele i preferencje
              </p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-semibold text-lg mb-2">2. AI generuje</h3>
              <p className="text-[var(--text-secondary)]">
                Codziennie tworzymy dla Ciebie unikalny skrypt medytacji dopasowany do Twojego nastroju
              </p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">🎧</div>
              <h3 className="font-semibold text-lg mb-2">3. Sluchasz</h3>
              <p className="text-[var(--text-secondary)]">
                Naturalny glos prowadzi Cie przez medytacje - w domu, w pracy, gdziekolwiek
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Proste cennik
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="glass-card p-8">
              <h3 className="font-semibold text-xl mb-2">Free</h3>
              <p className="text-[var(--text-muted)] mb-4">Na poczatek</p>
              <div className="text-3xl font-bold mb-6">0 zl</div>
              <ul className="space-y-3 mb-8 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 1 medytacja dziennie
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Max 10 minut
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 2 glosy
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Historia 7 dni
                </li>
              </ul>
              <button className="btn-secondary w-full">
                Wybierz Free
              </button>
            </div>

            {/* Premium */}
            <div className="glass-card p-8 border-purple-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-500 text-xs font-semibold px-3 py-1 rounded-bl-lg">
                POPULARNE
              </div>
              <h3 className="font-semibold text-xl mb-2">Premium</h3>
              <p className="text-[var(--text-muted)] mb-4">Pelne doswiadczenie</p>
              <div className="text-3xl font-bold mb-6">19.99 zl<span className="text-lg font-normal text-[var(--text-muted)]">/mies</span></div>
              <ul className="space-y-3 mb-8 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Nielimitowane medytacje
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Do 30 minut
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 10+ glosow
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Pelna historia
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Pobieranie offline
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Brak reklam
                </li>
              </ul>
              <button className="btn-primary w-full">
                Wybierz Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-[var(--border-color)] text-center text-[var(--text-muted)]">
        <p>MindFlow &copy; 2026 - Made with 🧘 by Exhuman</p>
      </footer>
    </main>
  )
}
