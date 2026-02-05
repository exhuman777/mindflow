// ElevenLabs TTS client for meditation voice synthesis

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'

// Available voices for meditation - calm, soothing voices
export const MEDITATION_VOICES = {
  // Female voices
  rachel: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', description: 'Warm, calm' },
  domi: { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', description: 'Soft, gentle' },
  bella: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', description: 'Soothing, meditative' },
  elli: { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'female', description: 'Clear, peaceful' },

  // Male voices
  adam: { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', description: 'Deep, calming' },
  antoni: { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', description: 'Warm, reassuring' },
  josh: { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male', description: 'Smooth, relaxing' },

  // Premium voices (require higher tier)
  charlotte: { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female', description: 'Professional, clear' },
  dorothy: { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', gender: 'female', description: 'Mature, wise' },
}

export type VoiceId = keyof typeof MEDITATION_VOICES

interface SynthesizeOptions {
  voiceId?: VoiceId
  stability?: number // 0-1, higher = more consistent
  similarityBoost?: number // 0-1, higher = more similar to original
  style?: number // 0-1, higher = more expressive
  useSpeakerBoost?: boolean
}

// Process meditation script to handle [PAUZA Xs] markers
function processScript(script: string): string {
  // Replace [PAUZA Xs] with SSML-like breaks
  // ElevenLabs doesn't support SSML, so we add periods which create natural pauses
  return script
    .replace(/\[PAUZA\s*(\d+)s?\]/gi, (_, seconds) => {
      const dots = '.'.repeat(Math.min(parseInt(seconds), 10))
      return `${dots}`
    })
    .replace(/\.\.\./g, '...') // Normalize ellipsis
}

export async function synthesizeMeditation(
  script: string,
  options: SynthesizeOptions = {}
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured')
  }

  const voiceId = options.voiceId
    ? MEDITATION_VOICES[options.voiceId].id
    : MEDITATION_VOICES.bella.id // Default to Bella - soothing, meditative

  const processedScript = processScript(script)

  const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: processedScript,
      model_id: 'eleven_multilingual_v2', // Supports Polish
      voice_settings: {
        stability: options.stability ?? 0.75, // More stable for meditation
        similarity_boost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0.3, // Lower style = calmer, less dramatic
        use_speaker_boost: options.useSpeakerBoost ?? true,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('ElevenLabs API error:', error)
    throw new Error(`ElevenLabs API error: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// Stream synthesis for longer meditations
export async function synthesizeMeditationStream(
  script: string,
  options: SynthesizeOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured')
  }

  const voiceId = options.voiceId
    ? MEDITATION_VOICES[options.voiceId].id
    : MEDITATION_VOICES.bella.id

  const processedScript = processScript(script)

  const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: processedScript,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: options.stability ?? 0.75,
        similarity_boost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0.3,
        use_speaker_boost: options.useSpeakerBoost ?? true,
      },
    }),
  })

  if (!response.ok || !response.body) {
    throw new Error(`ElevenLabs streaming error: ${response.status}`)
  }

  return response.body
}

// Get remaining character quota
export async function getQuota(): Promise<{ used: number; limit: number; remaining: number }> {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured')
  }

  const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
    headers: {
      'xi-api-key': apiKey,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get quota')
  }

  const data = await response.json()
  return {
    used: data.character_count,
    limit: data.character_limit,
    remaining: data.character_limit - data.character_count,
  }
}
