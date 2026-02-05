# MindFlow Knowledge Base

Tu wrzucaj materiały które AI będzie używać do generowania medytacji.

## Struktura

```
knowledge/
├── techniques/       # Techniki medytacyjne
├── scripts/          # Przykładowe skrypty medytacji
├── philosophy/       # Filozofia, podejście
├── prompts/          # Sprawdzone prompty/frazy
└── courses/          # Materiały z kursów
```

## Format

Markdown (.md) preferowany. AI czyta te pliki i używa jako kontekst.

## Przykłady co wrzucić

- Techniki oddechowe które stosujesz
- Wizualizacje które działają
- Struktura waszych medytacji z kursów
- Frazy/słowa które dobrze działają po polsku
- Czego unikać
- Specyficzne podejście do różnych celów (sen, stres, focus)
- Praca z czakrami - wasze podejście
- Elementy które wyróżniają wasze medytacje

## Jak to działa

`lib/knowledge.ts` ładuje wszystkie pliki .md z tego folderu i dodaje do system prompt dla AI. Im więcej kontekstu, tym lepsze medytacje.
