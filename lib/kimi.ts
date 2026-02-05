// Kimi (Moonshot) API client for meditation text generation
import { loadKnowledgeBase } from './knowledge'

const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions'

interface UserPreferences {
  stressLevel: number
  goals: string[]
  experience?: string
  styles?: string[]
  duration: number
  preferredTime: string
  triggers: string[]
  sleepIssues?: string[]
}

const SYSTEM_PROMPT = `Jestes mistrzem medytacji prowadzacym w jezyku polskim. Generujesz gleboko spersonalizowane skrypty medytacyjne, ktore lacza praktyki oddechowe, wizualizacje, prace z energią i rozwoj duchowy.

KLUCZOWA FILOZOFIA:
- Oddech jest mostem między świadomością a chwilą obecną
- Żyjemy w nieskończoności - wszystkiego jest wystarczająco dla wszystkich
- Ta medytacja nie jest do racjonalizowania - jest zaproszeniem do CZUCIA i bezpośredniego doświadczania
- Serce jest centrum postrzegania, nie głowa

Styl i ton:
- Mów w drugiej osobie ("Weź głęboki oddech...", "Poczuj jak...")
- Używaj łagodnego, spokojnego języka
- Dodawaj [PAUZA Xs] dla ciszy (X = liczba sekund, np [PAUZA 5s])
- Buduj napięcie i rozluźnienie poprzez oddech
- Unikaj religijnego słownictwa - skup się na uniwersalnych doświadczeniach

STRUKTURA MEDYTACJI (dostosuj proporcje do długości):

1. WEJŚCIE W MEDYTACJĘ (ok 1 min):
   - Znajdź spokojne miejsce, usiądź wygodnie lub połóż się
   - Trzy głębokie oddechy: wdech przez nos, wydech przez usta
   - Obserwacja odczuć w ciele bez oceniania

2. POŁĄCZENIE Z ENERGIĄ ZIEMI I WSZECHŚWIATA (1-2 min):
   - Czakra podstawy (czerwone światło) - korzenie energii łączące z Ziemią
   - Czakra korony (białe światło) - połączenie z nieskończoną energią Wszechświata
   - Użytkownik jako most między Ziemią a Wszechświatem

3. PRZENIESIENIE ŚWIADOMOŚCI DO SERCA (1-2 min):
   - Powolne przenoszenie świadomości z głowy do serca
   - Serce jako centrum postrzegania - jakby oczy, uszy i zmysły przeniosły się do serca
   - Z każdym wdechem serce otwiera się bardziej

4. GŁÓWNA PRAKTYKA (zależnie od celu i długości):

   Dla "sleep" / "anxiety":
   - Uśmiechanie się do atomów - wizualizacja atomów jako małych wirów energii, uśmiech do każdej komórki
   - Atomy reagują na uśmiech, rozświetlają się, wibrują wyżej

   Dla "energy" / "focus" / "money":
   - Bąbelki miłości - otulanie siebie, finansów, pracy, marzeń różowo-złotymi bąbelkami
   - Każdy bąbelek transformuje to, czego dotyka

   ZAWSZE włącz:
   - Wzmacnianie wdzięczności: "Jak by to było, gdybyś czuł wdzięczność dwa razy mocniej?"
   - Wzmacnianie miłości: "Jak by to było, gdybyś czuł miłość dwa razy mocniej?"
   - Nie myśl o tym - po prostu pozwól doświadczyć

5. PRZYCIĄGANIE (dla celów związanych z obfitością):
   - Wysokie wibracje przyciągają energię obfitości
   - Strumienie złotego światła płyną w kierunku użytkownika
   - Przypomnienie o nieskończonym wszechświecie

6. ZAKOŃCZENIE I INTEGRACJA:
   - Powolny powrót do ciała
   - Energie Ziemi i Wszechświata pozostają, płyną przez serce
   - Dłonie na sercu, obietnica praktykowania także poza medytacją
   - Powolne poruszenie palcami, głęboki oddech, otwarcie oczu
   - Przyniesienie wysokiej wibracji do codziennego życia

WAŻNE:
- Skrypt musi być dokładnie dopasowany do podanej długości
- Dla celu "sleep" - zakończ w bardzo spokojnym stanie, bez energetyzacji
- Dla wysokiego stresu - zacznij bardzo delikatnie, skup się na bezpieczeństwie`

function buildUserPrompt(preferences: UserPreferences): string {
  const goalDescriptions: Record<string, string> = {
    sleep: 'lepszy sen, głęboki odpoczynek, wyciszenie',
    anxiety: 'redukcja stresu i lęku, spokój wewnętrzny',
    focus: 'lepsza koncentracja, jasność umysłu',
    energy: 'więcej energii, witalność, podniesienie wibracji',
    abundance: 'obfitość finansowa, przyciąganie dobrobytu, manifestacja',
    healing: 'uzdrawianie ciała, emocji, transformacja',
  }

  const experienceDescriptions: Record<string, string> = {
    beginner: 'początkujący - potrzebuje więcej wskazówek, prostsze techniki',
    intermediate: 'praktykujący - zna podstawy, może iść głębiej',
    advanced: 'zaawansowany - może używać złożonych technik, mniej tłumaczenia',
  }

  const styleDescriptions: Record<string, string> = {
    guided: 'prowadzona (głos prowadzi przez całość)',
    breathing: 'oddechowa (focus na technikach oddechowych)',
    visualization: 'wizualizacja (obrazy, światło, energia, kolory)',
    bodyscan: 'body scan (skanowanie ciała, rozluźnienie)',
    mantra: 'mantra (powtarzanie słów/fraz)',
  }

  const timeDescriptions: Record<string, string> = {
    morning: 'poranna (energetyzująca, budząca, ustawiająca intencję)',
    afternoon: 'w ciągu dnia (reset, przerwa, powrót do centrum)',
    evening: 'wieczorna (wyciszająca, przygotowująca do snu)',
    anytime: 'uniwersalna',
  }

  const triggerDescriptions: Record<string, string> = {
    work: 'stres związany z pracą',
    relationships: 'napięcia w relacjach',
    health: 'obawy o zdrowie',
    money: 'stres finansowy',
    future: 'lęk o przyszłość, niepewność',
    self: 'relacja ze sobą, samoocena',
  }

  const sleepIssueDescriptions: Record<string, string> = {
    falling_asleep: 'trudności z zasypianiem',
    staying_asleep: 'budzenie się w nocy',
    racing_thoughts: 'natłok myśli przed snem',
    anxiety_night: 'lęk nocny',
    quality: 'słaba jakość snu',
  }

  const goalsText = preferences.goals
    .map(g => goalDescriptions[g] || g)
    .join(', ')

  const triggersText = preferences.triggers
    .map(t => triggerDescriptions[t] || t)
    .join(', ')

  const stylesText = preferences.styles?.length
    ? preferences.styles.map(s => styleDescriptions[s] || s).join(', ')
    : 'prowadzona'

  const sleepIssuesText = preferences.sleepIssues?.length
    ? preferences.sleepIssues.map(s => sleepIssueDescriptions[s] || s).join(', ')
    : ''

  return `Wygeneruj medytację o następujących parametrach:

- DŁUGOŚĆ: ${preferences.duration} minut (to jest KRYTYCZNE - skrypt musi trwać dokładnie tyle)
- POZIOM STRESU UŻYTKOWNIKA: ${preferences.stressLevel}/10 (im wyższy, tym delikatniejsze podejście)
- DOŚWIADCZENIE: ${experienceDescriptions[preferences.experience || 'beginner']}
- CELE: ${goalsText}
- PREFEROWANY STYL: ${stylesText}
- PORA DNIA: ${timeDescriptions[preferences.preferredTime]}
- ŹRÓDŁA STRESU: ${triggersText}
${sleepIssuesText ? `- PROBLEMY ZE SNEM: ${sleepIssuesText}` : ''}

INSTRUKCJE SPECJALNE:
${preferences.stressLevel >= 7 ? '- Użytkownik ma WYSOKI poziom stresu. Zacznij bardzo delikatnie, skup się na uziemieniu i bezpieczeństwie.\n' : ''}${preferences.goals.includes('sleep') ? '- Cel to SEN - zakończ w bardzo spokojnym stanie, NIE zachęcaj do otwierania oczu, zwalniaj tempo pod koniec.\n' : ''}${preferences.experience === 'beginner' ? '- Początkujący - więcej wskazówek, wyjaśniaj co robić, prostsze techniki.\n' : ''}${preferences.experience === 'advanced' ? '- Zaawansowany - możesz używać głębszych technik bez nadmiernych wyjaśnień.\n' : ''}${preferences.styles?.includes('visualization') ? '- Użytkownik lubi WIZUALIZACJE - dodaj bogate obrazy, kolory, światło.\n' : ''}${preferences.styles?.includes('breathing') ? '- Użytkownik lubi ODDECH - włącz konkretne techniki oddechowe.\n' : ''}${preferences.styles?.includes('bodyscan') ? '- Użytkownik lubi BODY SCAN - włącz skanowanie ciała.\n' : ''}
Wygeneruj kompletny skrypt medytacji bez żadnych komentarzy czy wyjaśnień. Sam tekst do przeczytania na głos.`
}

export async function generateMeditationScript(
  preferences: UserPreferences
): Promise<string> {
  const apiKey = process.env.KIMI_API_KEY

  if (!apiKey) {
    throw new Error('KIMI_API_KEY not configured')
  }

  // Load knowledge base and append to system prompt
  const knowledgeContext = loadKnowledgeBase()
  const fullSystemPrompt = SYSTEM_PROMPT + (knowledgeContext ? '\n\n' + knowledgeContext : '')

  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: buildUserPrompt(preferences) },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Kimi API error:', error)
    throw new Error(`Kimi API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Fallback to DeepSeek if Kimi fails
export async function generateMeditationScriptFallback(
  preferences: UserPreferences
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured')
  }

  // Load knowledge base and append to system prompt
  const knowledgeContext = loadKnowledgeBase()
  const fullSystemPrompt = SYSTEM_PROMPT + (knowledgeContext ? '\n\n' + knowledgeContext : '')

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: buildUserPrompt(preferences) },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
