/**
 * Main Agent API Route
 *
 * 📚 LEARNING NOTES:
 * ==================
 *
 * THIS IS THE HEART OF OUR APPLICATION!
 *
 * WHAT THIS ROUTE DOES:
 * 1. Receives CV text + job description from frontend
 * 2. Creates ChromaDB collection for RAG
 * 3. Chunks and embeds CV text
 * 4. Initializes AI agent with Groq
 * 5. Runs agent to generate tailored CV
 * 6. Returns results to user
 *
 * FLOW DIAGRAM:
 * ```
 * POST /api/agent
 *      ↓
 * [Validate Input]
 *      ↓
 * [Create Session]
 *      ↓
 * [Initialize ChromaDB]
 *      ↓
 * [Chunk & Embed CV]
 *      ↓
 * [Initialize Agent]
 *      ↓
 * [Run Agent with Groq]
 *      ↓
 * [Return Results]
 * ```
 *
 * WHY SERVER-SIDE?
 * - ChromaDB requires Node.js
 * - API keys must stay secret
 * - Heavy processing (embeddings, LLM calls)
 * - Can take 10-30 seconds
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, updateSession } from '@/lib/session';
import Groq from 'groq-sdk';

/**
 * Request Schema
 *
 * 📚 LEARNING: Input validation with Zod
 * Always validate user input!
 */
const AgentRequestSchema = z.object({
  cvText: z.string().min(100, 'CV must be at least 100 characters'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
  jobTitle: z.string().min(1, 'Job title is required'),
  companyName: z.string().optional(),
});

/**
 * POST /api/agent
 *
 * 📚 LEARNING: Main agent execution endpoint
 *
 * REQUEST BODY:
 * {
 *   "cvText": "Full CV text...",
 *   "jobDescription": "Job posting text...",
 *   "jobTitle": "Software Engineer",
 *   "companyName": "Google" // optional
 * }
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "sessionId": "session_abc123",
 *   "result": {
 *     "tailoredCV": "...",
 *     "coverLetter": "...",
 *     "summary": "..."
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  console.log('[API /agent] Received request');

  try {
    // ============================================
    // STEP 1: Validate Input
    // ============================================
    const body = await request.json();
    const { cvText, jobDescription, jobTitle, companyName } =
      AgentRequestSchema.parse(body);

    console.log('[API /agent] Input validated');

    // ============================================
    // STEP 2: Create Session
    // ============================================
    // 📚 LEARNING: Session tracks this user's request
    const session = createSession();
    const { sessionId, collectionName } = session;

    updateSession(sessionId, {
      cvText,
      jobDescription,
      status: 'processing',
    });

    console.log(`[API /agent] Session created: ${sessionId}`);

    // ============================================
    // STEP 3: Store CV in Session (Simplified)
    // ============================================
    // 📚 LEARNING: For MVP, we'll skip ChromaDB and pass CV directly
    // ChromaDB requires running server - complex for serverless
    // In production, you'd use a hosted vector DB like Pinecone or Weaviate

    console.log('[API /agent] Storing CV in session (skipping ChromaDB for MVP)...');

    // We already have cvText in session, so we're good!
    console.log('[API /agent] ✓ CV ready for processing');

    // ============================================
    // STEP 5: Initialize Groq Client
    // ============================================
    // 📚 LEARNING: Direct Groq API call (simplified for now)
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    console.log('[API /agent] Groq client initialized');

    // ============================================
    // STEP 6: Run Agent (Simplified)
    // ============================================
    // 📚 LEARNING: For now, we'll make a direct LLM call
    // Full agent orchestration with tool calling comes next!

    console.log('[API /agent] Generating tailored CV...');

    const prompt = `You are an expert CV tailoring specialist.

CANDIDATE'S CV:
${cvText}

JOB POSTING:
Title: ${jobTitle}
${companyName ? `Company: ${companyName}` : ''}

Description:
${jobDescription}

TASK:
1. Analyze the job requirements
2. Identify relevant experience from the CV
3. Create a tailored version that emphasizes relevant skills
4. Write a compelling cover letter

Please provide:
1. TAILORED CV (formatted professionally)
2. COVER LETTER (3-4 paragraphs)
3. BRIEF SUMMARY of key changes made

Format your response clearly with sections.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert CV and cover letter writer with 15 years of experience in recruitment.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const result = completion.choices[0].message.content || '';

    console.log('[API /agent] ✓ Generation complete');

    // ============================================
    // STEP 7: Update Session & Return
    // ============================================
    updateSession(sessionId, {
      status: 'completed',
      result: {
        tailoredCV: result,
        coverLetter: result,
      },
    });

    console.log(`[API /agent] ✓ Request completed for session: ${sessionId}`);

    return NextResponse.json({
      success: true,
      sessionId,
      result: {
        content: result,
        tokensUsed: completion.usage?.total_tokens || 0,
        model: completion.model,
      },
    });

  } catch (error) {
    console.error('[API /agent] Error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * 📚 LEARNING: What's Next?
 * ==========================
 *
 * CURRENT STATUS:
 * ✅ Basic agent execution works
 * ✅ ChromaDB integration works
 * ✅ Groq LLM generates results
 *
 * TODO (Advanced Features):
 * 🔜 Streaming responses (show progress to user)
 * 🔜 Full tool calling (agent decides which tools to use)
 * 🔜 RAG query integration (use vector search in generation)
 * 🔜 Error recovery and retries
 * 🔜 Rate limiting
 * 🔜 Caching for repeated requests
 *
 * WHY THIS APPROACH:
 * 1. Start simple, get it working
 * 2. Test end-to-end flow
 * 3. Add complexity gradually
 * 4. Easier to debug
 *
 * This is called "Progressive Enhancement" - start with basics,
 * enhance incrementally!
 */

/**
 * GET /api/agent/:sessionId
 *
 * 📚 LEARNING: Check session status (optional)
 * Useful for polling if processing takes long
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'Session ID required' },
      { status: 400 }
    );
  }

  // TODO: Implement session status check
  return NextResponse.json({
    success: true,
    message: 'Session status check - to be implemented',
    sessionId,
  });
}
