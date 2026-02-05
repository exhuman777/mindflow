# MindFlow - Continue Session

## Prompt do wklejenia:

```
kontynuujemy MindFlow (~/Rufus/projects/mindflow)

Stan:
- Frontend gotowy (Next.js 16, Tailwind, dark theme)
- Onboarding 8 kroków z wyborem wyzwania 3/7/21 dni
- Gamifikacja (badges, levels, streaki)
- Knowledge base gotowe na moje materiały
- API routes gotowe, czekają na klucze

Do zrobienia dziś:
1. Wrzucam bazę wiedzy medytacyjnej (ja + żona, kursy) do /knowledge
2. Setup Supabase + klucze API (Kimi, ElevenLabs)
3. Test generowania medytacji
4. Decyzja o TTS: ElevenLabs vs tańsze alternatywy dla scale
5. Deploy na Vercel

Opcjonalnie:
- Dodaj alternatywne TTS (OpenAI, Google) dla oszczędności
- Pre-generated pool medytacji
- Audio caching strategy
```

## Gdzie wrzucić wiedzę:

```
knowledge/
├── techniques/    ← techniki oddechowe, body scan, wizualizacje
├── scripts/       ← przykładowe skrypty medytacji które działają
├── philosophy/    ← wasza filozofia, podejście, wartości
├── prompts/       ← frazy po polsku które dobrze brzmią
└── courses/       ← materiały z waszych kursów
```

Format: pliki .md, AI automatycznie je ładuje.

## Klucze do zdobycia:

- [ ] Kimi: https://moonshot.cn
- [ ] ElevenLabs: https://elevenlabs.io
- [ ] Supabase: https://supabase.com (darmowy tier OK)

## Komendy:

```bash
cd ~/Rufus/projects/mindflow
npm run dev        # localhost:3000
npm run build      # test przed deploy
```
