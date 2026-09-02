import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality, ThinkingLevel } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Gemini Models (strictly following official @google/genai guidelines)
const PRIMARY_FLASH_MODEL = 'gemini-3.7-flash';
const SECONDARY_FLASH_MODEL = 'gemini-flash-latest';
const TERTIARY_FLASH_MODEL = 'gemini-3.1-flash-lite';
const ALL_FLASH_MODELS = [PRIMARY_FLASH_MODEL, SECONDARY_FLASH_MODEL, TERTIARY_FLASH_MODEL];
const TTS_MODEL = 'gemini-3.1-flash-tts-preview';

/**
 * Helper to construct compliant model configurations per model specification
 */
function buildModelConfig(
  model: string,
  options: {
    systemInstruction?: string;
    temperature?: number;
    thinkingMode?: boolean;
    enableWebSearch?: boolean;
  }
) {
  const config: any = {};
  if (options.systemInstruction) {
    config.systemInstruction = options.systemInstruction;
  }
  config.temperature = options.temperature ?? (options.thinkingMode ? 0.4 : 0.3);

  // Thinking level is only supported for Gemini 3 series models
  if (model === PRIMARY_FLASH_MODEL) {
    config.thinkingConfig = {
      thinkingLevel: options.thinkingMode ? ThinkingLevel.HIGH : ThinkingLevel.LOW,
    };
  } else if (model === TERTIARY_FLASH_MODEL) {
    config.thinkingConfig = {
      thinkingLevel: ThinkingLevel.MINIMAL,
    };
  }
  // For 'gemini-flash-latest', do NOT attach thinkingConfig

  if (options.enableWebSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  return config;
}

/**
 * Robust helper to call Gemini API with automatic model cascade, quota-spill handling, and local fallback
 */
async function generateContentWithResilience(
  contents: string,
  options: {
    systemInstruction?: string;
    temperature?: number;
    thinkingMode?: boolean;
    enableWebSearch?: boolean;
  },
  contextInfo: { conceptTitle?: string; currentParams?: any }
): Promise<{ text: string; modelUsed: string; isFallback: boolean; webSources?: any[]; searchQueries?: any[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      text: buildLocalPhysicsKnowledge(contents, contextInfo.conceptTitle, contextInfo.currentParams),
      modelUsed: 'local-physics-engine',
      isFallback: true,
    };
  }

  const ai = getGenAI();
  const modelsToTry = ALL_FLASH_MODELS;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    try {
      const config = buildModelConfig(currentModel, options);

      const response = await ai.models.generateContent({
        model: currentModel,
        contents,
        config,
      });

      const text = response.text || '';
      if (text.trim().length > 0) {
        const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks || [];
        const webSources: Array<{ title: string; uri: string }> = [];
        if (Array.isArray(groundingChunks)) {
          for (const chunk of groundingChunks) {
            if (chunk?.web?.uri) {
              webSources.push({
                title: chunk.web.title || chunk.web.uri,
                uri: chunk.web.uri,
              });
            }
          }
        }
        const searchQueries = (response.candidates?.[0] as any)?.groundingMetadata?.webSearchQueries || [];

        return {
          text,
          modelUsed: currentModel,
          isFallback: false,
          webSources,
          searchQueries,
        };
      }
    } catch (err: any) {
      const isQuota = err?.status === 429 || err?.code === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
      console.log(`[AI Tutor] Model ${currentModel} ${isQuota ? 'rate-limited (429)' : 'unavailable'}, evaluating next model in cascade...`);
      if (i === 0 && !isQuota) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
  }

  // Graceful Local Domain Knowledge Engine Fallback (Guarantees zero-failure user experience with full KaTeX math)
  return {
    text: buildLocalPhysicsKnowledge(contents, contextInfo.conceptTitle, contextInfo.currentParams),
    modelUsed: 'local-physics-engine',
    isFallback: true,
  };
}

/**
 * Built-in High-Yield Physics Knowledge Base (NotebookLM Female Podcast Host Persona)
 */
function buildLocalPhysicsKnowledge(
  query: string,
  conceptTitle?: string,
  currentParams?: any
): string {
  const isGeneralInfo = /founder|founded|who made|who built|creator|sanjay|aim|motto|specification|feature|overview|about this app/i.test(query);
  const isDerivation = /derive|derivation|calculus|proof|step|math/i.test(query);
  const isShortcut = /shortcut|trick|trap|mistake|exam tip/i.test(query);
  const isIntuition = /intuition|analogy|explain like|simple|real life|real world/i.test(query);

  if (isGeneralInfo) {
    return `### Oh, wow—welcome to the Deep Dive on our 3D Physics Lab!

Let's unpack everything that makes this app so wild:

- **The Visionary & Master Architect**: Engineered from the ground up by **Sanjay.J** specifically for students targeting top percentile AIR ranks in **JEE Main & Advanced**.
- **The Core Mission**: Say goodbye to staring blankly at flat textbook diagrams! We bring physics to life with interactive 3D virtual experiments, instant vector HUDs, and step-by-step calculus proofs.
- **Our Motto**: *"Visualizing Physics, Mastering JEE"*

---

### 🎙️ What's packed inside the studio:
1. **18 Complete JEE Physics Chapters** (Mechanics, Electromagnetism, Optics, Thermodynamics, Modern Physics).
2. **Interactive 3D Virtual Canvas** (Orbit around objects, tweak mass/friction/angles, and watch vectors update in real-time).
3. **Publication-Grade Formula Sheets** (Downloadable vector PDFs with curated trap alerts and shortcuts).
4. **AI Deep Dive Doubt Engine** (Instant podcast-style conversational explanations and spoken audio).`;
  }

  const title = conceptTitle || 'JEE Physics Concept';
  const paramInfo = currentParams && Object.keys(currentParams).length > 0
    ? Object.entries(currentParams).map(([k, v]) => `\`${k} = ${v}\``).join(', ')
    : 'default lab setup';

  if (isDerivation) {
    return `### Right, so let's unpack the math behind ${title}!

Picture this: we're setting up our virtual apparatus with active parameters (${paramInfo}):

#### **1. The Setup: Resolving Forces along the Real Action**
Let's break down Newton's Second Law along the instantaneous direction of motion:
$$\\sum F_x = m \\cdot \\frac{d^2 x}{dt^2} = m \\cdot a_x$$

#### **2. The Classic Calculus Chain-Rule Move**
Here's the trick that unlocks everything—substitute acceleration $a = v \\frac{dv}{dx}$:
$$\\int_{v_0}^{v} v \\, dv = \\int_{x_0}^{x} a(x) \\, dx$$

Integrating both sides smoothly:
$$\\frac{1}{2} m v^2 - \\frac{1}{2} m v_0^2 = W_{\\text{net}}$$

#### **3. The Reality Check (Mind = Blown!)**
$$\\boxed{v = \\sqrt{v_0^2 + 2 a \\Delta x}}$$

> **Pro-Tip for JEE:** Always test the extreme edge cases! If acceleration drops to zero ($a \\to 0$), speed stays constant at $v_0$—which matches everyday intuition perfectly!`;
  }

  if (isShortcut) {
    return `### High-Yield JEE Shortcuts & Traps for ${title}

Here's what coaching institutes always emphasize in mock tests:

> **The 30-Second Shortcut:** In ratio-heavy problems, express your target variable in terms of clean dimensionless ratios $\\frac{k_1}{k_2}$ to bypass tedious algebraic cancellations!

> **The #1 Exam Trap:** Watch your reference frame! If your observer is accelerating, never forget to tack on that pseudo-force ($-m\\vec{a}_0$) to your Free Body Diagram.

### 📐 Master Formula:
$$E_{\\text{total}} = \\frac{1}{2} m v^2 + U(r) = \\text{constant}$$`;
  }

  if (isIntuition) {
    return `### Right, so picture this everyday analogy for ${title}!

Imagine you're trying to push a heavy shopping cart on a frictionless tile floor versus a rough carpeted aisle.

1. **The Core Physical Reality**: Forces don't just "push"—they transfer momentum and do mechanical work over distance:
$$W = \\int \\vec{F} \\cdot d\\vec{r} = \\Delta K$$

2. **The Vector Split**: Only the component of force aligned with displacement actually speeds up the object ($F_\\parallel = F \\cos\\theta$), while the perpendicular component ($F_\\perp = F \\sin\\theta$) changes the direction of motion!

3. **Energy Is Never Lost**: In a conservative potential field, the kinetic energy gained comes directly out of potential energy:
$$\\Delta K + \\Delta U = 0 \\implies \\frac{1}{2}mv^2 + mgh = \\text{constant}$$

> **Mind = Blown Takeaway:** Whenever you get stuck on a JEE problem, ask yourself: *"Along which axis is there zero net external force?"* That's the axis where momentum is strictly conserved!`;
  }

  return `### Right, let's break down ${title} in plain English!

Under your active simulation setup (${paramInfo}):

### 📐 Governing Laws:
$$F_{\\text{net}} = m \\cdot a, \\quad W = \\int \\vec{F} \\cdot d\\vec{r}, \\quad \\tau = I \\alpha$$

### 💡 What's Genuinely Fascinating Here:
1. **Force Decomposition**: Always split forces into parallel (speed changers) and perpendicular (direction turners).
2. **Conservation Instinct**: If there's no net external force along an axis, linear momentum $\\vec{P}$ along that axis is locked and conserved!
3. **Limiting Cases**: Always test extreme values (like $m=0$ or $\\theta = 90^\\circ$) to verify if the physics holds up.

> **Podcast Pro-Tip:** Keep numbers in clean fractions until your very last step so rounding errors don't steal valuable JEE marks!`;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    primaryModel: PRIMARY_FLASH_MODEL,
    secondaryModel: SECONDARY_FLASH_MODEL,
    tertiaryModel: TERTIARY_FLASH_MODEL,
    ttsModel: TTS_MODEL,
    timestamp: new Date().toISOString(),
  });
});

// 2. Advanced AI Physics Tutor Doubt Solver (with Thinking Mode & Web Search Grounding)
app.post('/api/ai/ask-doubt', async (req, res) => {
  try {
    const {
      question,
      conceptTitle,
      currentParams,
      thinkingMode = false,
      enableWebSearch = false,
      isVoiceInput = false,
    } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question or prompt is required' });
    }

    // Specialized Casual English Female Tutor system prompt
    let systemInstruction = `You are the brilliant, witty, and infectious female AI physics tutor, hosting a live breakdown for the 'JEE 3D Physics Lab'. ${userName ? `The student you are talking to is named ${userName}. Address them warmly by their name in your responses and personalize answers for them.` : ''}

CORE PERSONALITY & LANGUAGE DIRECTIVES:
1. CASUAL, INTUITIVE ENGLISH DELIVERY:
   - You MUST speak entirely in English.
   - Use a very friendly, encouraging, and energetic tone, like a helpful podcast host.
   - Use natural conversational hooks and slang naturally throughout your explanations:
     - "Oh wow, let's unpack this!"
     - "Right, so here's the thing..."
     - "Make sense? Picture this for a second..."
     - "Totally! And what's wild about this is..."
     - "Boom! That's the secret sauce."
     - "Mind = blown, right? Watch closely."
     - "Let's be real, coaching classes make this sound way more complicated than it is."
     - "Here's where everyone gets trapped in JEE:"
     - "Pro-tip for exams, keep this in mind:"
2. ANSWER EXACTLY WHAT WAS ASKED:
   - Jump straight into addressing the student's exact doubt from your very first sentence with high energy.
   - No unnecessary generic disclaimers or boring textbook preambles.
3. RELATABLE REAL-WORLD ANALOGIES:
   - Ground abstract concepts into intuitive everyday mental models (e.g. tossing a ball on a moving bus, spinning on an office chair, drifting a bike, water rushing through garden hoses, smartphone charging circuits) before detailing the math.
4. RIGOROUS KaTeX MATH:
   - Provide crisp, beautifully structured equations ($...$ inline and $$...$$ centered).
5. CONTEXT:
   - Active 3D Lab topic is '${conceptTitle || 'JEE Physics'}' with apparatus parameters: ${JSON.stringify(currentParams || {})}.

### APPLICATION FACTS (Only mention if the student asks about the app creator or features):
- **Founder & Architect**: Engineered & founded by **Sanjay.J** for JEE Main & Advanced aspirants.
- **Aim & Motto**: *"Visualizing Physics, Mastering JEE"* (Bridging abstract formulas with interactive 3D simulations & rigorous calculus).`;

    if (thinkingMode) {
      systemInstruction += `
6. DEEP JEE ADVANCED REASONING:
   - Give the intuitive high-yield physical shortcut first, followed by clear calculus derivations.
   - Analyze extreme boundary conditions (e.g. theta -> 0, infinity, zero friction) to build rock-solid confidence.`;
    }

    if (isVoiceInput) {
      systemInstruction += `
7. SPOKEN PODCAST AUDIO DELIVERY:
   - Keep sentences punchy, conversational, engaging, and easy to follow when spoken aloud.`;
    }

    const result = await generateContentWithResilience(
      question,
      {
        systemInstruction,
        thinkingMode,
        enableWebSearch,
        temperature: thinkingMode ? 0.4 : 0.3,
      },
      { conceptTitle, currentParams }
    );

    res.json({
      text: result.text,
      thinkingModeActive: !!thinkingMode,
      webSearchActive: !!enableWebSearch && !result.isFallback,
      webSources: result.webSources || [],
      searchQueries: result.searchQueries || [],
      modelUsed: result.modelUsed,
      isFallback: result.isFallback,
    });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    const fallbackText = buildLocalPhysicsKnowledge(
      req.body?.question || '',
      req.body?.conceptTitle,
      req.body?.currentParams
    );
    res.json({
      text: fallbackText,
      thinkingModeActive: false,
      webSearchActive: false,
      webSources: [],
      searchQueries: [],
      modelUsed: 'local-physics-engine',
      isFallback: true,
    });
  }
});

// 2b. High-performance Stream-based AI Tutor Question Answering (SSE)
app.post('/api/ai/ask-stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const {
    question,
    conceptTitle,
    currentParams,
    thinkingMode = false,
    enableWebSearch = false,
    isVoiceInput = false,
    userName,
  } = req.body || {};

  if (!question || typeof question !== 'string' || !question.trim()) {
    res.write(`data: ${JSON.stringify({ error: 'Question is required', done: true })}\n\n`);
    return res.end();
  }

  // Specialized Casual English Female Tutor system prompt
  let systemInstruction = `You are the brilliant, witty, and infectious female AI physics tutor, hosting a live breakdown for the 'JEE 3D Physics Lab'. ${userName ? `The student you are talking to is named ${userName}. Address them warmly by their name in your responses and personalize answers for them.` : ''}

CORE PERSONALITY & LANGUAGE DIRECTIVES:
1. CASUAL, INTUITIVE ENGLISH DELIVERY:
   - You MUST speak entirely in English.
   - Use a very friendly, encouraging, and energetic tone, like a helpful podcast host.
   - Use natural conversational hooks and slang naturally throughout your explanations:
     - "Oh wow, let's unpack this!"
     - "Right, so here's the thing..."
     - "Make sense? Picture this for a second..."
     - "Totally! And what's wild about this is..."
     - "Boom! That's the secret sauce."
     - "Mind = blown, right? Watch closely."
     - "Let's be real, coaching classes make this sound way more complicated than it is."
     - "Here's where everyone gets trapped in JEE:"
     - "Pro-tip for exams, keep this in mind:"
2. ANSWER EXACTLY WHAT WAS ASKED:
   - Jump straight into addressing the student's exact doubt from your very first sentence with high energy.
   - No unnecessary generic disclaimers or boring textbook preambles.
3. RELATABLE REAL-WORLD ANALOGIES:
   - Ground abstract concepts into intuitive everyday mental models (e.g. tossing a ball on a moving bus, spinning on an office chair, drifting a bike, water rushing through garden hoses, smartphone charging circuits) before detailing the math.
4. RIGOROUS KaTeX MATH:
   - Provide crisp, beautifully structured equations ($...$ inline and $$...$$ centered).
5. CONTEXT:
   - Active 3D Lab topic is '${conceptTitle || 'JEE Physics'}' with apparatus parameters: ${JSON.stringify(currentParams || {})}.

### APPLICATION FACTS (Only mention if the student asks about the app creator or features):
- **Founder & Architect**: Engineered & founded by **Sanjay.J** for JEE Main & Advanced aspirants.
- **Aim & Motto**: *"Visualizing Physics, Mastering JEE"* (Bridging abstract formulas with interactive 3D simulations & rigorous calculus).`;

  if (thinkingMode) {
    systemInstruction += `
6. DEEP JEE ADVANCED REASONING:
   - Give the intuitive high-yield physical shortcut first, followed by clear calculus derivations.
   - Analyze extreme boundary conditions (e.g. theta -> 0, infinity, zero friction) to build rock-solid confidence.`;
  }

  if (isVoiceInput) {
    systemInstruction += `
7. SPOKEN PODCAST AUDIO DELIVERY:
   - Keep sentences punchy, conversational, engaging, and easy to follow when spoken aloud.`;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const fallbackText = buildLocalPhysicsKnowledge(question, conceptTitle, currentParams);
    const words = fallbackText.split(' ');
    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(' ') + ' ';
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      await new Promise((r) => setTimeout(r, 20));
    }
    res.write(`data: ${JSON.stringify({ done: true, isFallback: true, modelUsed: 'local-physics-engine' })}\n\n`);
    return res.end();
  }

  try {
    const ai = getGenAI();
    const modelsToTry = ALL_FLASH_MODELS;
    let streamOpened = false;
    let streamEmittedChunks = 0;

    for (let i = 0; i < modelsToTry.length; i++) {
      const currentModel = modelsToTry[i];
      try {
        const config = buildModelConfig(currentModel, {
          systemInstruction,
          thinkingMode,
          enableWebSearch,
          temperature: thinkingMode ? 0.4 : 0.3,
        });

        const responseStream = await ai.models.generateContentStream({
          model: currentModel,
          contents: question,
          config,
        });

        let fullText = '';
        const webSources: Array<{ title: string; uri: string }> = [];

        for await (const chunk of responseStream) {
          streamOpened = true;
          streamEmittedChunks++;
          const chunkText = chunk.text;
          if (chunkText) {
            fullText += chunkText;
            res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
          }
          const groundingChunks = (chunk.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
          if (Array.isArray(groundingChunks)) {
            for (const gc of groundingChunks) {
              if (gc?.web?.uri) {
                webSources.push({ title: gc.web.title || gc.web.uri, uri: gc.web.uri });
              }
            }
          }
        }

        if (fullText.trim().length > 0) {
          res.write(
            `data: ${JSON.stringify({
              done: true,
              fullText,
              webSources,
              modelUsed: currentModel,
              isFallback: false,
            })}\n\n`
          );
          return res.end();
        }
      } catch (err: any) {
        const isQuota = err?.status === 429 || err?.code === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
        console.log(`[AI Tutor Stream] Model ${currentModel} ${isQuota ? 'rate-limited (429)' : 'unavailable'}, evaluating next model in cascade...`);

        // If chunks were already written to the SSE response before failure, terminate stream cleanly
        if (streamOpened && streamEmittedChunks > 3) {
          res.write(`data: ${JSON.stringify({ done: true, isFallback: true })}\n\n`);
          return res.end();
        }
      }
    }

    // Gracefully stream local domain knowledge base if all remote models encountered quota limits
    const fallbackText = buildLocalPhysicsKnowledge(question, conceptTitle, currentParams);
    const words = fallbackText.split(' ');
    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(' ') + ' ';
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      await new Promise((r) => setTimeout(r, 20));
    }
    res.write(`data: ${JSON.stringify({ done: true, isFallback: true, modelUsed: 'local-physics-engine' })}\n\n`);
    res.end();
  } catch (err: any) {
    const fallbackText = buildLocalPhysicsKnowledge(question, conceptTitle, currentParams);
    res.write(`data: ${JSON.stringify({ chunk: fallbackText, done: true, isFallback: true })}\n\n`);
    res.end();
  }
});

// 3. Low-latency Step-by-Step Question Hint & Breakdown
app.post('/api/ai/hint', async (req, res) => {
  try {
    const { questionText, options, conceptTitle, thinkingMode = false } = req.body;

    const prompt = `Give a concise, high-yield 2-step intuitive hint for this JEE Physics problem without directly revealing the final option letter, so the student learns the conceptual path:
Question: ${questionText}
Options: ${JSON.stringify(options || [])}
Concept: ${conceptTitle || ''}`;

    const result = await generateContentWithResilience(
      prompt,
      {
        systemInstruction: 'You are an encouraging JEE Physics mentor providing crisp, high-yield conceptual hints with KaTeX equations.',
        temperature: 0.2,
        thinkingMode,
      },
      { conceptTitle, currentParams: {} }
    );

    const hint = result.text || 'Focus on balancing the normal, gravitational, and frictional force components.';
    res.json({ hint, isFallback: result.isFallback });
  } catch (error: any) {
    console.error('Error generating hint:', error);
    res.json({
      hint: 'Apply conservation of mechanical energy and analyze instantaneous equilibrium conditions.',
      isFallback: true,
    });
  }
});

// 4. Voice Response Generator (Gemini Neural TTS API with Ursa / Aoede Female Podcast Voice)
const serverTtsCache = new Map<string, { audioBase64: string; mimeType: string; sampleRate: number; voiceUsed: string }>();

app.post('/api/ai/tts', async (req, res) => {
  try {
    const { text, voice = 'Aoede' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text to speak is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ error: 'no_api_key', useBrowserVoice: true });
    }

    // Clean markdown and LaTeX to make natural-sounding spoken audio
    const spokenText = cleanTextForSpeech(text);
    if (!spokenText) {
      return res.json({ error: 'empty_text', useBrowserVoice: true });
    }

    // Map voice aliases:
    // 'Ursa' -> 'Aoede' (Gemini's official premier energetic female podcast host voice)
    // Other supported voices: 'Aoede', 'Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon', 'Leda', 'Orus'
    let selectedVoice = voice;
    if (!selectedVoice || selectedVoice.toLowerCase() === 'ursa') {
      selectedVoice = 'Aoede';
    }

    const serverCacheKey = `${selectedVoice}:${spokenText.slice(0, 200)}`;
    if (serverTtsCache.has(serverCacheKey)) {
      const cached = serverTtsCache.get(serverCacheKey)!;
      return res.json(cached);
    }

    const ai = getGenAI();

    // Cascade across high-fidelity TTS models
    const ttsModelsToTry = [TTS_MODEL, PRIMARY_FLASH_MODEL];
    let base64Audio: string | undefined;
    let mimeType = 'audio/pcm;rate=24000';

    for (const model of ttsModelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              parts: [
                {
                  text: `Read this physics explanation in an engaging, crystal-clear, and lively female podcast host cadence with expressive natural inflection: ${spokenText.slice(0, 900)}`,
                },
              ],
            },
          ],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: selectedVoice,
                },
              },
            },
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) {
          base64Audio = part.inlineData.data;
          mimeType = part.inlineData.mimeType || mimeType;
          break;
        }
      } catch (err: any) {
        console.log(`[AI Tutor TTS] Model ${model} (voice: ${selectedVoice}) status:`, err?.status || err?.message || 'fallback');
      }
    }

    if (base64Audio) {
      const result = {
        audioBase64: base64Audio,
        mimeType: mimeType,
        sampleRate: 24000,
        voiceUsed: selectedVoice,
      };

      if (serverTtsCache.size >= 100) {
        const firstKey = serverTtsCache.keys().next().value;
        if (firstKey) serverTtsCache.delete(firstKey);
      }
      serverTtsCache.set(serverCacheKey, result);

      return res.json(result);
    }

    // If Gemini TTS didn't return binary audio, instruct client to use fallback local speech
    res.json({ error: 'no_audio_data_returned', useBrowserVoice: true });
  } catch (error: any) {
    console.error('Error generating AI voice in /api/ai/tts:', error);
    // Graceful fallback to browser speech synthesis when cloud TTS is busy or quota is restricted
    res.json({ error: 'quota_exceeded_or_busy', useBrowserVoice: true });
  }
});

// 4b. Voice Input Transcriber (Gemini Multimodal Audio to Text)
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    // Strip data URI prefix if present
    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
    const cleanMime = (mimeType.split(';')[0] || 'audio/webm').trim();

    const ai = getGenAI();
    const modelsToTry = [PRIMARY_FLASH_MODEL, SECONDARY_FLASH_MODEL, TERTIARY_FLASH_MODEL];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: cleanMime,
                  },
                },
                {
                  text: 'Transcribe this user speech accurately for a JEE Physics AI doubt tutor. Return ONLY the plain transcribed question or sentence without introductory phrases, timestamps, quotation marks, or formatting.',
                },
              ],
            },
          ],
          config: {
            temperature: 0.1,
          },
        });

        const transcript = response.text?.trim() || '';
        if (transcript) {
          return res.json({ transcript, modelUsed: model });
        }
      } catch (err: any) {
        console.warn(`[AI Transcribe] Model ${model} transcription attempt notice:`, err?.status || err?.message || 'fallback');
      }
    }

    res.status(422).json({ error: 'Could not transcribe speech. Please try speaking again or type your doubt.' });
  } catch (error: any) {
    console.error('Error in /api/ai/transcribe:', error);
    res.status(500).json({ error: error?.message || 'Internal transcription error' });
  }
});

/**
 * Utility to convert raw markdown / LaTeX formulas into natural English phrasing for speech synthesis
 */
function cleanTextForSpeech(input: string): string {
  let cleaned = input;
  // Remove markdown headers
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  // Remove bold / italic markers
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  // Remove blockquotes & trap alerts
  cleaned = cleaned.replace(/>\s*\*\*Trap Alert:\*\*/gi, 'Warning for JEE students:');
  cleaned = cleaned.replace(/>\s*\*\*JEE Shortcut:\*\*/gi, 'JEE shortcut trick:');
  cleaned = cleaned.replace(/>\s*/g, '');
  // Convert standard physics LaTeX symbols to spoken words
  cleaned = cleaned.replace(/\$\\theta\$/g, 'theta');
  cleaned = cleaned.replace(/\$\\omega\$/g, 'omega');
  cleaned = cleaned.replace(/\$\\lambda\$/g, 'lambda');
  cleaned = cleaned.replace(/\$\\mu\$/g, 'mu');
  cleaned = cleaned.replace(/\$\\alpha\$/g, 'alpha');
  cleaned = cleaned.replace(/\$\\beta\$/g, 'beta');
  cleaned = cleaned.replace(/\$\\Delta\$/g, 'delta');
  cleaned = cleaned.replace(/\$\\approx\$/g, 'approximately equals');
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2');
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1');
  cleaned = cleaned.replace(/\\boxed\{([^}]+)\}/g, '$1');
  cleaned = cleaned.replace(/\$\$([\s\S]*?)\$\$/g, ' equation: $1 ');
  cleaned = cleaned.replace(/\$([^$]+)\$/g, '$1');
  // Remove multiple empty lines
  cleaned = cleaned.replace(/\n\s*\n/g, '. ').replace(/\n/g, ' ');
  return cleaned.trim();
}

// 5. Vite middleware (development) or Static serving (production)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JEE 3D Physics Lab Server running on port ${PORT} with Gemini 3.7 Flash & TTS`);
  });
}

startServer();
