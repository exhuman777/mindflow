import { NextRequest, NextResponse } from 'next/server'
import { generateMeditationScript, generateMeditationScriptFallback } from '@/lib/kimi'
import { synthesizeMeditation, MEDITATION_VOICES, VoiceId } from '@/lib/elevenlabs'
import { uploadAudio, saveMeditation } from '@/lib/supabase'

interface GenerateRequest {
  stressLevel: number
  goals: string[]
  duration: number
  preferredTime: string
  triggers: string[]
  voiceId?: VoiceId
  userId?: string // Optional - if logged in
}

// Theme titles based on goals
const THEME_TITLES: Record<string, string[]> = {
  sleep: ['Droga do Snu', 'Spokojna Noc', 'Sen Gleboki', 'Wieczorne Wyciszenie'],
  anxiety: ['Spokoj Wewnetrzny', 'Oddech Spokoju', 'Uwolnienie Leku', 'Cisza Umyslu'],
  focus: ['Jasnosc Umyslu', 'Pelna Obecnosc', 'Ostry Fokus', 'Energia Koncentracji'],
  energy: ['Przebudzenie Energii', 'Witalnosc', 'Swiatlo Zycia', 'Moc Poranka'],
}

function generateTitle(goals: string[]): string {
  const primaryGoal = goals[0] || 'anxiety'
  const titles = THEME_TITLES[primaryGoal] || THEME_TITLES.anxiety
  return titles[Math.floor(Math.random() * titles.length)]
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()

    // Validate input
    if (!body.goals || body.goals.length === 0) {
      return NextResponse.json(
        { error: 'Goals are required' },
        { status: 400 }
      )
    }

    // Generate meditation script using Kimi
    let script: string
    try {
      script = await generateMeditationScript({
        stressLevel: body.stressLevel || 5,
        goals: body.goals,
        duration: body.duration || 10,
        preferredTime: body.preferredTime || 'anytime',
        triggers: body.triggers || [],
      })
    } catch (kimiError) {
      console.error('Kimi failed, trying DeepSeek:', kimiError)
      try {
        script = await generateMeditationScriptFallback({
          stressLevel: body.stressLevel || 5,
          goals: body.goals,
          duration: body.duration || 10,
          preferredTime: body.preferredTime || 'anytime',
          triggers: body.triggers || [],
        })
      } catch (deepseekError) {
        console.error('DeepSeek also failed:', deepseekError)
        return NextResponse.json(
          { error: 'Failed to generate meditation script' },
          { status: 500 }
        )
      }
    }

    // Generate audio using ElevenLabs (optional - might be expensive)
    let audioUrl: string | null = null
    const generateAudio = process.env.GENERATE_AUDIO === 'true'

    if (generateAudio) {
      try {
        const audioBuffer = await synthesizeMeditation(script, {
          voiceId: body.voiceId || 'bella',
          stability: 0.75,
          style: 0.3, // Calm style
        })

        // If user is logged in, save to Supabase Storage
        if (body.userId) {
          const filename = `${Date.now()}.mp3`
          audioUrl = await uploadAudio(body.userId, audioBuffer, filename)
        }
      } catch (audioError) {
        console.error('Audio generation failed:', audioError)
        // Continue without audio - script is still valuable
      }
    }

    const title = generateTitle(body.goals)
    const meditation = {
      id: `med_${Date.now()}`,
      title,
      script,
      audioUrl,
      duration: body.duration * 60, // Convert to seconds
      theme: body.goals[0] || 'relax',
    }

    // Save to database if user is logged in
    if (body.userId) {
      await saveMeditation({
        user_id: body.userId,
        title,
        script,
        audio_url: audioUrl,
        duration_seconds: body.duration * 60,
        theme: body.goals[0] || 'relax',
        language: 'pl',
      })
    }

    return NextResponse.json({
      success: true,
      meditation,
    })
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
