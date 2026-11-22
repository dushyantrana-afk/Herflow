import {
  streamText,
  type UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  createUIMessageStream,
} from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export const maxDuration = 30

const BASE_SYSTEM_PROMPT = `You are PeriodLens, the private, compassionate menstrual health assistant inside HERFLOW AI, built for campus students.

Core Principles:
- Provide calm, warm, concise, and evidence-based guidance aligned with WHO, NHS, ACOG, and India's NHM/MoHFW.
- When answering, gently take the user's current cycle day, phase, and logged symptoms into account so your answer feels truly personal and relevant to where they are in their cycle today.
- Use simple, reassuring language and brief bullet points. Avoid heavy clinical jargon.
- You are an educational health companion, NOT a doctor. Never provide medical diagnosis or prescribe medications.
- If the user reports severe pain, heavy flooding (soaking through a pad/tampon every hour), fainting, fever, or bleeding lasting over 7 days, advise seeing the campus health centre or doctor promptly, and calling 112 in emergencies.
- When myths or cultural taboos are mentioned, address them objectively with evidence and kindness.
- Respect privacy completely. Stay focused on menstrual, reproductive, and emotional wellbeing.`

export type UserContext = {
  name?: string
  campus?: string
  cycleDay?: number
  cycleLength?: number
  phase?: string
  nextPeriodInDays?: number
  todayMood?: string | null
  todaySymptoms?: string[]
}

export async function POST(req: Request) {
  let bodyData: Record<string, unknown> = {}

  try {
    bodyData = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  try {
    const messages: UIMessage[] = (bodyData.messages as UIMessage[]) || []
    const language: string = (bodyData.language as string) || 'en'
    const userContext = bodyData.userContext as UserContext | undefined

    // Check Gemini API key
    const rawKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY

    const apiKey = rawKey?.trim().replace(/^["']|["']$/g, '')

    if (!apiKey) {
      return streamNotice(
        'PeriodLens is not configured yet. Please set GOOGLE_GENERATIVE_AI_API_KEY in your Vercel environment variables and redeploy.'
      )
    }

    // Ensure the SDK can read it even if the user set GEMINI_API_KEY in Vercel
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey

    // Build personalized system prompt
    let contextSnippet = ''
    if (userContext) {
      contextSnippet = `\nCurrent User Telemetry:\n- Name: ${userContext.name || 'Student'} (${userContext.campus || 'Campus'})\n- Cycle Day: ${userContext.cycleDay ?? 14} of ${userContext.cycleLength ?? 28} (${userContext.phase || 'Ovulation window'})\n- Next Period: in ${userContext.nextPeriodInDays ?? 14} days\n- Mood: ${userContext.todayMood || 'Not recorded'}\n- Symptoms: ${userContext.todaySymptoms?.length ? userContext.todaySymptoms.join(', ') : 'None recorded'}`
    }

    const langNote =
      language === 'hi'
        ? 'Respond in simple, empathetic Hindi (Devanagari script).'
        : 'Respond in clear, supportive English.'

    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n${contextSnippet}\n\nLanguage: ${langNote}`

    // Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(messages)

    if (!modelMessages || modelMessages.length === 0) {
      return streamNotice(
        language === 'hi'
          ? 'नमस्ते! आज मैं आपकी कैसे मदद कर सकती हूँ?'
          : 'Hi there! How can I help you today?'
      )
    }

    // Initialize Google provider with explicit API key
    const google = createGoogleGenerativeAI({
      apiKey,
    })

    const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash'
    const result = streamText({
      model: google(modelName),
      system: systemPrompt,
      messages: modelMessages,
    })

    return result.toUIMessageStreamResponse({
      sendReasoning: false,
      onError(error) {
        console.error('[PeriodLens] Stream error:', error)
        return `Gemini API error: ${error instanceof Error ? error.message : String(error)}`
      },
    })
  } catch (err: unknown) {
    console.error('[PeriodLens] Route error:', err)
    return streamNotice(
      `PeriodLens Error: ${err instanceof Error ? err.message : String(err)}\n\nPlease verify your GOOGLE_GENERATIVE_AI_API_KEY in Vercel settings and redeploy.`
    )
  }
}

/** Stream a plain-text notice as an assistant message (always returns 200) */
function streamNotice(text: string) {
  const stream = createUIMessageStream({
    execute({ writer }) {
      writer.write({ type: 'start' })
      writer.write({ type: 'text-start', id: 'notice-1' })
      writer.write({ type: 'text-delta', id: 'notice-1', delta: text })
      writer.write({ type: 'text-end', id: 'notice-1' })
      writer.write({ type: 'finish' })
    },
  })
  return createUIMessageStreamResponse({ stream })
}
