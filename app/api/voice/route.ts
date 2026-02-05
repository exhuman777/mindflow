import { NextRequest, NextResponse } from 'next/server'
import { synthesizeMeditationStream, MEDITATION_VOICES, VoiceId, getQuota } from '@/lib/elevenlabs'

// POST - Synthesize text to speech
export async function POST(request: NextRequest) {
  try {
    const { text, voiceId = 'bella' } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Check if voice exists
    if (!(voiceId in MEDITATION_VOICES)) {
      return NextResponse.json(
        { error: 'Invalid voice ID' },
        { status: 400 }
      )
    }

    // Stream the audio response
    const audioStream = await synthesizeMeditationStream(text, {
      voiceId: voiceId as VoiceId,
      stability: 0.75,
      style: 0.3,
    })

    return new NextResponse(audioStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Voice API error:', error)
    return NextResponse.json(
      { error: 'Failed to synthesize audio' },
      { status: 500 }
    )
  }
}

// GET - List available voices and quota
export async function GET() {
  try {
    let quota = null

    // Try to get quota if API key is configured
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        quota = await getQuota()
      } catch (e) {
        console.error('Failed to get quota:', e)
      }
    }

    // Return available voices with metadata
    const voices = Object.entries(MEDITATION_VOICES).map(([key, voice]) => ({
      key,
      ...voice,
    }))

    return NextResponse.json({
      voices,
      quota,
      defaultVoice: 'bella',
    })
  } catch (error) {
    console.error('Voice GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get voices' },
      { status: 500 }
    )
  }
}
