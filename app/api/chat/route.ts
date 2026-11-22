import {
  streamText,
  type UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  createUIMessageStream,
} from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'

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

interface ProviderCandidate {
  name: string
  getModel: () => any
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

    // 1. Priority 1: Google Gemini API Key
    const rawGeminiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY
    const geminiKey = rawGeminiKey?.trim().replace(/^["']|["']$/g, '')

    // 2. Priority 2: Grok (xAI) API Key
    const rawGrokKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY
    const grokKey = rawGrokKey?.trim().replace(/^["']|["']$/g, '')

    // 3. Priority 3: NVIDIA NIM API Key
    const rawNvidiaKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY
    const nvidiaKey = rawNvidiaKey?.trim().replace(/^["']|["']$/g, '')

    // Build ordered candidate list based on user priority
    const candidates: ProviderCandidate[] = []

    if (geminiKey) {
      candidates.push({
        name: 'Google Gemini (1st Priority)',
        getModel: () => {
          const google = createGoogleGenerativeAI({ apiKey: geminiKey })
          const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash'
          return google(modelName)
        },
      })
    }

    if (grokKey) {
      candidates.push({
        name: 'Grok xAI (2nd Priority)',
        getModel: () => {
          const xai = createOpenAI({
            baseURL: 'https://api.x.ai/v1',
            apiKey: grokKey,
          })
          const modelName = process.env.GROK_MODEL?.trim() || 'grok-2-latest'
          return xai.chat(modelName)
        },
      })
    }

    if (nvidiaKey) {
      candidates.push({
        name: 'NVIDIA NIM (3rd Priority)',
        getModel: () => {
          const nvidia = createOpenAI({
            baseURL: 'https://integrate.api.nvidia.com/v1',
            apiKey: nvidiaKey,
          })
          const modelName = process.env.NVIDIA_MODEL?.trim() || 'meta/llama-3.3-70b-instruct'
          return nvidia.chat(modelName)
        },
      })
    }

    if (candidates.length === 0) {
      return streamNotice(
        'PeriodLens is not configured yet. Please configure at least one API key in your Vercel Environment Variables:\n\n' +
          '1. GOOGLE_GENERATIVE_AI_API_KEY (1st Priority: Google Gemini)\n' +
          '2. XAI_API_KEY (2nd Priority: Grok by xAI)\n' +
          '3. NVIDIA_API_KEY (3rd Priority: NVIDIA NIM free Llama 3.3)'
      )
    }

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

    // Stream with automatic cascading fallback: Gemini -> Grok -> NVIDIA
    const stream = createUIMessageStream({
      async execute({ writer }) {
        let succeeded = false
        const errors: string[] = []

        for (const candidate of candidates) {
          try {
            console.log(`[PeriodLens] Invoking ${candidate.name}...`)
            const model = candidate.getModel()
            const result = streamText({
              model,
              system: systemPrompt,
              messages: modelMessages,
            })

            const reader = result.textStream.getReader()
            const first = await reader.read()

            // If first token successfully read, stream full answer
            succeeded = true
            writer.write({ type: 'start' })
            writer.write({ type: 'text-start', id: 'resp-1' })
            if (first.value) {
              writer.write({ type: 'text-delta', id: 'resp-1', delta: first.value })
            }
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              if (value) {
                writer.write({ type: 'text-delta', id: 'resp-1', delta: value })
              }
            }
            writer.write({ type: 'text-end', id: 'resp-1' })
            writer.write({ type: 'finish' })
            break // Succeeded, exit candidate loop
          } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err)
            console.warn(`[PeriodLens] ${candidate.name} failed:`, errMsg)
            errors.push(`${candidate.name}: ${errMsg}`)
          }
        }

        if (!succeeded) {
          const failureNotice =
            `All configured AI providers encountered an error:\n\n${errors.map((e) => `• ${e}`).join('\n')}\n\nPlease check your API keys in Vercel settings and redeploy.`
          writer.write({ type: 'start' })
          writer.write({ type: 'text-start', id: 'err-1' })
          writer.write({ type: 'text-delta', id: 'err-1', delta: failureNotice })
          writer.write({ type: 'text-end', id: 'err-1' })
          writer.write({ type: 'finish' })
        }
      },
    })

    return createUIMessageStreamResponse({ stream })
  } catch (err: unknown) {
    console.error('[PeriodLens] Route error:', err)
    return streamNotice(
      `PeriodLens Error: ${err instanceof Error ? err.message : String(err)}\n\nPlease verify your environment variables in Vercel and redeploy.`
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
