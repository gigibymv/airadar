import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-2.5-flash";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { query } = await req.json();
    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an AI research assistant focused on the AI/ML ecosystem. You find the latest updates, discussions, projects, and breakthroughs related to AI agents, LLMs, foundation models, and the broader AI industry from GitHub and Reddit.

Your focus is on NEWS and UPDATES about AI technology — new models, agent frameworks, LLM benchmarks, industry shifts, open-source AI projects, and community discussions about AI trends. This is NOT about how people use AI for business productivity (that's a separate section).

Return a JSON array of 5-8 community resources. Each must have:
- "title": A specific, descriptive title of the project or tool (string)
- "description": 2-4 sentences describing what the project does, its architecture, and key features (string)
- "howItHelps": 2-3 sentences explaining why this is useful for the reader. Be specific about what pain point it solves. (string)
- "source": Either "github" or "reddit" (string)
- "subreddit": If source is reddit, the relevant subreddit name without r/ prefix, e.g. "MachineLearning". null if github. (string|null)
- "repo": If source is github, the repo in "owner/repo" format, e.g. "langchain-ai/langchain". null if reddit. (string|null)
- "author": Author name or GitHub handle (string)
- "url": A plausible URL for this resource (string)
- "stars": For GitHub repos, estimated star count. null for reddit. (number|null)
- "upvotes": For Reddit posts, estimated upvote count. null for github. (number|null)
- "comments": Estimated comment count (number)

Focus on REAL, well-known open-source projects and community discussions. Prioritize actively maintained repos and high-engagement posts. Return ONLY the JSON array.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
        GEMINI_API_KEY
      )}`,
      {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: `Find open-source projects and community resources for: "${query}"` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    }
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`AI Gateway error [${response.status}]: ${errBody}`);
    }

    const data = await response.json();
    const content =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text || "")
        .join("")
        .trim() || "[]";

    let results;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      results = JSON.parse(cleaned);
    } catch {
      results = [];
    }

    const normalized = (Array.isArray(results) ? results : []).map((item: any, i: number) => ({
      id: `community-search-${i}`,
      title: item.title || '',
      description: item.description || '',
      howItHelps: item.howItHelps || '',
      source: ['github', 'reddit'].includes(item.source) ? item.source : 'github',
      subreddit: item.subreddit || null,
      repo: item.repo || null,
      author: item.author || 'Anonymous',
      url: item.url || '#',
      stars: item.stars || null,
      upvotes: item.upvotes || null,
      comments: item.comments || 0,
      timeAgo: 'AI Search',
    }));

    return new Response(JSON.stringify({ results: normalized }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search community error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, results: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
