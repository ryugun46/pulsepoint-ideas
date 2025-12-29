// OpenRouter API client for LLM calls with automatic model selection

export interface OpenRouterConfig {
  apiKey: string;
  model?: string;
}

// Valid severity levels
const VALID_SEVERITIES = ['low', 'medium', 'high'] as const;
type Severity = typeof VALID_SEVERITIES[number];

/**
 * Normalize severity values from AI responses.
 * Handles variations like "medium-high", "medium high", "Medium", etc.
 * Falls back to "medium" if the value is unrecognized.
 */
export function normalizeSeverity(value: string | undefined | null): Severity {
  if (!value) {
    console.warn('[OpenRouter] Missing severity value, defaulting to "medium"');
    return 'medium';
  }
  
  const normalized = value.toLowerCase().trim();
  
  // Direct match
  if (VALID_SEVERITIES.includes(normalized as Severity)) {
    return normalized as Severity;
  }
  
  // Handle variations like "medium-high", "medium high", "high-medium"
  if (normalized.includes('high') && normalized.includes('medium')) {
    console.log(`[OpenRouter] Normalizing severity "${value}" to "high" (combined value)`);
    return 'high';
  }
  if (normalized.includes('high') && normalized.includes('low')) {
    console.log(`[OpenRouter] Normalizing severity "${value}" to "medium" (combined value)`);
    return 'medium';
  }
  if (normalized.includes('medium') && normalized.includes('low')) {
    console.log(`[OpenRouter] Normalizing severity "${value}" to "medium" (combined value)`);
    return 'medium';
  }
  
  // Handle single mentions
  if (normalized.includes('high')) {
    return 'high';
  }
  if (normalized.includes('medium') || normalized.includes('moderate')) {
    return 'medium';
  }
  if (normalized.includes('low') || normalized.includes('minor')) {
    return 'low';
  }
  
  console.warn(`[OpenRouter] Unrecognized severity "${value}", defaulting to "medium"`);
  return 'medium';
}

// Preferred models for cost/performance balance (in order of preference)
const PREFERRED_MODELS = [
  'google/gemini-flash-1.5',
  'anthropic/claude-3-haiku',
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.1-8b-instruct',
];

const FALLBACK_MODEL = 'anthropic/claude-3.5-sonnet';

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export class OpenRouterClient {
  private config: OpenRouterConfig;
  private model: string;
  private modelSelected: boolean = false;

  constructor(config: OpenRouterConfig) {
    this.config = config;
    // Use provided model or fallback - actual selection happens on first call
    this.model = config.model || FALLBACK_MODEL;
  }

  /**
   * Selects the best available model from OpenRouter
   * Queries the models API and picks the best affordable model
   */
  private async selectBestModel(): Promise<string> {
    if (this.modelSelected) {
      return this.model;
    }

    try {
      console.log('[OpenRouter] Fetching available models...');
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('[OpenRouter] Failed to fetch models, using fallback');
        this.modelSelected = true;
        return this.model;
      }

      const data = await response.json() as { data: OpenRouterModel[] };
      const availableModels = new Set(data.data.map(m => m.id));

      console.log(`[OpenRouter] Found ${availableModels.size} available models`);

      // Try preferred models in order
      for (const preferredModel of PREFERRED_MODELS) {
        if (availableModels.has(preferredModel)) {
          console.log(`[OpenRouter] Selected model: ${preferredModel}`);
          this.model = preferredModel;
          this.modelSelected = true;
          return this.model;
        }
      }

      // If none of the preferred models are available, find a good alternative
      // Filter for models with good context length and low cost
      const goodModels = data.data.filter(m => {
        const promptCost = parseFloat(m.pricing.prompt);
        return (
          m.context_length >= 8000 &&
          promptCost < 0.01 &&
          !m.id.includes('vision') &&
          !m.id.includes('image')
        );
      });

      if (goodModels.length > 0) {
        // Sort by cost (cheapest first)
        goodModels.sort((a, b) => {
          const costA = parseFloat(a.pricing.prompt);
          const costB = parseFloat(b.pricing.prompt);
          return costA - costB;
        });

        this.model = goodModels[0].id;
        console.log(`[OpenRouter] Auto-selected model: ${this.model}`);
        this.modelSelected = true;
        return this.model;
      }

      // Fallback to default
      console.log(`[OpenRouter] Using fallback model: ${FALLBACK_MODEL}`);
      this.model = FALLBACK_MODEL;
      this.modelSelected = true;
      return this.model;

    } catch (error) {
      console.error('[OpenRouter] Error selecting model:', error);
      this.modelSelected = true;
      return this.model;
    }
  }

  private async call(
    messages: Array<{ role: string; content: string }>,
    temperature = 0.7,
    maxTokens = 4000
  ): Promise<string> {
    // Ensure we have selected the best model
    await this.selectBestModel();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pulsepoint-ideas.pages.dev',
        'X-Title': 'PulsePoint Ideas',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Get the currently selected model (for logging/debugging)
   */
  getSelectedModel(): string {
    return this.model;
  }

  async extractProblems(text: string, source: string): Promise<string[]> {
    const prompt = `You are analyzing ${source} to extract pain points and problems users are experiencing.

Text to analyze:
"""
${text.slice(0, 3000)}
"""

Extract 0-5 distinct problems or pain points mentioned in this text. Focus on:
- Specific problems or frustrations
- Unmet needs or desires
- Challenges or obstacles
- Feature requests that indicate problems

Return ONLY a JSON array of problem strings. Each should be a clear, concise statement (10-30 words).
If no clear problems are found, return an empty array [].

Example output format:
["Problem statement 1", "Problem statement 2"]`;

    try {
      const response = await this.call(
        [{ role: 'user', content: prompt }],
        0.5,
        1000
      );
      
      const cleaned = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const problems = JSON.parse(cleaned) as string[];
      return Array.isArray(problems) ? problems : [];
    } catch (error) {
      console.error('Error extracting problems:', error);
      return [];
    }
  }

  async clusterProblems(problems: string[]): Promise<Array<{
    title: string;
    summary: string;
    frequency: number;
    severity: string;
    memberIndices: number[];
  }>> {
    if (problems.length === 0) return [];

    const prompt = `You are clustering similar problems together to identify recurring themes.

Problems to cluster (${problems.length} total):
${problems.map((p, i) => `${i}. ${p}`).join('\n')}

Create 3-8 clusters of similar problems. For each cluster:
1. Give it a clear title (3-7 words)
2. Write a summary that captures the core issue
3. Estimate frequency (how many problems relate to this)
4. Assess severity: "low", "medium", or "high"
5. List the indices of problems that belong to this cluster

Return ONLY a JSON array of cluster objects.

Example format:
[
  {
    "title": "Integration Complexity",
    "summary": "Users struggle with complex API integration and lack of clear documentation",
    "frequency": 5,
    "severity": "high",
    "memberIndices": [0, 3, 7, 12, 15]
  }
]`;

    try {
      const response = await this.call(
        [{ role: 'user', content: prompt }],
        0.4,
        2000
      );
      
      const cleaned = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const clusters = JSON.parse(cleaned);
      
      if (!Array.isArray(clusters)) {
        return [];
      }
      
      // Normalize severity values to handle AI variations like "medium-high"
      return clusters.map(cluster => ({
        ...cluster,
        severity: normalizeSeverity(cluster.severity),
        frequency: typeof cluster.frequency === 'number' ? cluster.frequency : 1,
      }));
    } catch (error) {
      console.error('Error clustering problems:', error);
      return [];
    }
  }

  async generateIdea(cluster: {
    title: string;
    summary: string;
    frequency: number;
    severity: string;
  }): Promise<{
    title: string;
    oneLiner: string;
    targetUser: string;
    solution: string;
    mvp: string[];
    pricing: string;
    differentiators: string[];
    risks: string[];
    acquisitionChannel: string;
  } | null> {
    const prompt = `You are a micro-SaaS idea generator. Based on this recurring problem cluster, generate a concrete business idea.

Problem Cluster:
- Title: ${cluster.title}
- Summary: ${cluster.summary}
- Frequency: ${cluster.frequency} mentions
- Severity: ${cluster.severity}

Generate a focused micro-SaaS idea to solve this problem. Return ONLY a JSON object with:
- title: Product name (2-4 words)
- oneLiner: Value proposition (10-15 words)
- targetUser: Who this is for (1-2 sentences)
- solution: What it does (2-3 sentences)
- mvp: Array of 3-5 core features for MVP
- pricing: Suggested pricing model (1 sentence)
- differentiators: Array of 2-3 key differentiators
- risks: Array of 2-3 main risks
- acquisitionChannel: Best channel to reach users (1 sentence)

Example format:
{
  "title": "APIGuide",
  "oneLiner": "Turn your API into interactive documentation developers love",
  "targetUser": "...",
  ...
}`;

    try {
      const response = await this.call(
        [{ role: 'user', content: prompt }],
        0.7,
        1500
      );
      
      const cleaned = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const idea = JSON.parse(cleaned);
      return idea;
    } catch (error) {
      console.error('Error generating idea:', error);
      return null;
    }
  }
}
