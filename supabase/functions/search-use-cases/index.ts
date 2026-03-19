import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-2.5-flash";

function normalizeUseCaseType(value: unknown): "person" | "company" {
  if (typeof value !== "string") return "person";
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "company" ||
    normalized === "organization" ||
    normalized === "org" ||
    normalized === "enterprise" ||
    normalized === "business" ||
    normalized === "team"
  ) {
    return "company";
  }

  return "person";
}

function hasFirstPersonSignal(text: string): boolean {
  return /\b(i|my|me|we|our)\b/i.test(text);
}

function looksOrganizationLike(author: unknown, text: string): boolean {
  const authorText = typeof author === "string" ? author : "";
  const combined = `${authorText} ${text}`.toLowerCase();
  return /\b(inc|corp|llc|ltd|company|startup|enterprise|team|official|press|ai labs?)\b/.test(combined);
}

function classifyUseCaseType(input: {
  type: unknown;
  title?: unknown;
  summary?: unknown;
  author?: unknown;
  source?: unknown;
}): "person" | "company" {
  const base = normalizeUseCaseType(input.type);
  const title = typeof input.title === "string" ? input.title : "";
  const summary = typeof input.summary === "string" ? input.summary : "";
  const source = typeof input.source === "string" ? input.source.toLowerCase() : "";
  const combined = `${title} ${summary}`;
  const firstPerson = hasFirstPersonSignal(combined);
  const orgLike = looksOrganizationLike(input.author, combined);

  if (base === "person") {
    if (!firstPerson || orgLike) return "company";
    return "person";
  }
  if ((source === "reddit" || source === "linkedin" || source === "github") && firstPerson && !orgLike) {
    return "person";
  }
  return "company";
}

function normalizeUseCaseCategory(value: unknown): string {
  if (typeof value !== "string") return "productivity";
  const normalized = value.trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (!normalized) return "productivity";

  if (normalized === "healthcare" || normalized === "health-care") return "healthcare";
  if (normalized === "finance" || normalized === "financial") return "finance";
  if (normalized === "marketing" || normalized === "growth") return "marketing";
  if (normalized === "customer-support" || normalized === "support" || normalized === "customer-service") {
    return "customer-support";
  }
  if (normalized === "operations" || normalized === "ops") return "operations";
  if (normalized === "engineering" || normalized === "software-engineering") return "engineering";
  if (normalized === "education" || normalized === "edtech") return "education";
  if (normalized === "legal" || normalized === "compliance") return "legal";
  if (normalized === "hr" || normalized === "human-resources" || normalized === "recruiting") return "hr";
  if (normalized === "other") return "other";
  return "productivity";
}

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

    const systemPrompt = `You are an AI use case research assistant. Given a user's pain point or search query, find and describe real-world AI use cases where REAL PEOPLE have applied AI to solve that specific problem — either for their business or for personal productivity.

Your focus is strictly on PRACTICAL APPLICATION stories: how someone automated a workflow, saved time, built a tool for their team, or improved their personal productivity using AI. This is NOT about AI model releases, benchmarks, or industry news (that's covered elsewhere).

Return a JSON array of 10 use cases total: target 5 "person" and 5 "company" when possible from reliable evidence.
Each use case must have:
- "title": A compelling, specific title describing the use case — like a real post title (string)
- "summary": 3-5 sentence detailed description of the workflow: what they built, how AI fits in, and the step-by-step process (string)
- "toolsUsed": Array of specific AI tools/services used, e.g. ["Claude", "Zapier", "Google Slides API"] (string[])
- "productivityGain": One clear sentence with a specific, measurable result, e.g. "4 hours saved per week — fully automated weekly reporting pipeline" (string)
- "howItHelpsYou": 2-3 sentences explaining why this matters for the reader's business. Be specific: what pain point it eliminates, what ROI to expect, and how to get started. Write as if advising an executive. (string)
- "implementationSteps": Array of 3-4 short, actionable steps to replicate this use case, e.g. ["Connect CRM data source to AI pipeline", "Create prompt template for slide formatting", "Set up weekly cron trigger via Zapier"] (string[])
- "source": Where this type of solution is commonly discussed - one of "reddit", "linkedin", "github" (string)
- "author": A realistic author name or handle (string)
- "url": A plausible URL where one might find this kind of solution (string)
- "type": Taxonomy classification: "person" for individual workflows, "company" for organizational deployments (string)
- "category": One domain category from: "productivity", "healthcare", "finance", "marketing", "customer-support", "operations", "engineering", "education", "legal", "hr", "other" (string)

STRICT TYPE RULES:
- "person" must read like first-person practitioner evidence (e.g. "I use AI to...", "my workflow", "we run this in our small team"), not company PR language.
- "company" is for enterprise/organizational deployments, product launches, or press-style announcements.
- If first-person evidence is weak, classify as "company".

Focus on REAL, PRACTICAL use cases that people have actually deployed. Be specific about tools, workflows, and measurable results. Tailor results precisely to the user's query/pain point. The howItHelpsYou field should speak directly to the reader — make it personal and actionable.

Return ONLY the JSON array, no markdown, no explanation.`;

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
            parts: [{ text: `Find AI use cases for this pain point: "${query}"` }],
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
    
    // Parse the JSON from the response, handling potential markdown wrapping
    let results;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      results = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("search-use-cases parse error:", parseError);
      results = [];
    }

    // Normalize and add IDs
    const normalized = (Array.isArray(results) ? results : []).map((item: any, i: number) => ({
      id: `search-${i}`,
      title: item.title || '',
      summary: item.summary || '',
      toolsUsed: Array.isArray(item.toolsUsed) ? item.toolsUsed : [],
      productivityGain: item.productivityGain || '',
      howItHelpsYou: item.howItHelpsYou || '',
      implementationSteps: Array.isArray(item.implementationSteps) ? item.implementationSteps : [],
      source: ['reddit', 'linkedin', 'github'].includes(item.source) ? item.source : 'reddit',
      author: item.author || 'Anonymous',
      url: item.url || '#',
      type: classifyUseCaseType({
        type: item.type,
        title: item.title,
        summary: item.summary,
        author: item.author,
        source: item.source,
      }),
      category: normalizeUseCaseCategory(item.category),
      timeAgo: 'AI Search',
      comments: 0,
    }));

    return new Response(JSON.stringify({ results: normalized }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search use cases error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, results: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
