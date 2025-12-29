// OpenRouter API client for LLM calls

export interface OpenRouterConfig {
  apiKey: string;
  model?: string;
}

export class OpenRouterClient {
  private config: OpenRouterConfig;
  private model: string;

  constructor(config: OpenRouterConfig) {
    this.config = config;
    this.model = config.model || 'anthropic/claude-3.5-sonnet';
  }

  private async call(
    messages: Array<{ role: string; content: string }>,
    temperature = 0.7,
    maxTokens = 4000
  ): Promise<string> {
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
      return Array.isArray(clusters) ? clusters : [];
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

