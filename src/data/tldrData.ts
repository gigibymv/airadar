export interface TldrItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  readTime: string;
  category: "headlines" | "research" | "tools" | "launches";
  published_date?: string;
}

export const mockTldrItems: TldrItem[] = [
  {
    id: "tldr1",
    title: "Meta Acquired Moltbook",
    summary: "Meta has acquired Moltbook, a Reddit-like network where AI agents built with the OpenClaw framework interact with each other and maintain an always-on directory of agents.",
    url: "https://techcrunch.com/2026/03/10/meta-acquired-moltbook-the-ai-agent-social-network-that-went-viral-because-of-fake-posts/",
    readTime: "3 min",
    category: "headlines",
  },
  {
    id: "tldr2",
    title: "Google Launches Multimodal Gemini Embedding 2",
    summary: "Gemini Embedding 2 unifies text, images, videos, audio, and documents in over 100 languages. Processes up to 8,192 text tokens, six images, 120-second videos, and six-page PDFs with Matryoshka Representation Learning for customizable output dimensions.",
    url: "https://www.testingcatalog.com/google-launches-new-multimodal-gemini-embedding-2-model/",
    readTime: "2 min",
    category: "launches",
  },
  {
    id: "tldr3",
    title: "Nvidia Invests in Mira Murati's Thinking Machines Lab",
    summary: "Nvidia and Thinking Machines Lab have formed a multiyear partnership deploying at least one gigawatt of cutting-edge chips to train frontier models. The startup has 120 employees and is competing fiercely for AI researcher talent.",
    url: "https://www.wsj.com/tech/ai/nvidia-invests-in-mira-muratis-thinking-machines-lab-db29dedb",
    readTime: "2 min",
    category: "headlines",
  },
  {
    id: "tldr4",
    title: "Codex, File My Taxes. Make No Mistakes",
    summary: "Codex can be used to file personal taxes more accurately than a human accountant. The immediate feedback helps users understand their situation and the tax code better. Accountants' other duties are likely much harder to automate.",
    url: "https://x.com/corbtt/status/2031438751822721251",
    readTime: "11 min",
    category: "tools",
  },
  {
    id: "tldr5",
    title: "The State of Consumer AI: Engagement and Retention",
    summary: "ChatGPT's DAU:MAU sits at 45% vs Gemini's 22%. WAU:MAU climbed from 50% in mid-2023 to 82%, ahead of Gmail and Spotify. Week 4 retention of 66% beats every enterprise app and is more than double Perplexity's 24%.",
    url: "https://x.com/apoorv03/status/2031345485123039720",
    readTime: "4 min",
    category: "research",
  },
  {
    id: "tldr6",
    title: "The Anatomy of an Agent Harness",
    summary: "An agent is a model with a harness. Harness engineering turns models into work engines by building systems around them. Models contain the intelligence; the harness makes that intelligence useful.",
    url: "https://blog.langchain.com/the-anatomy-of-an-agent-harness/",
    readTime: "9 min",
    category: "research",
  },
  {
    id: "tldr7",
    title: "RCLI — On-Device Voice AI for macOS",
    summary: "Open-source on-device voice AI that can control apps and perform 38 macOS actions via voice. Users can choose from local AIs and ingest local documents for querying. MIT licensed.",
    url: "https://github.com/RunanywhereAI/rcli",
    readTime: "GitHub",
    category: "tools",
  },
  {
    id: "tldr8",
    title: "Amazon Wins Court Order to Block Perplexity's AI Shopping Agent",
    summary: "Perplexity's Comet AI browser has been blocked from accessing Amazon's site. Amazon alleges the startup concealed its AI agents to scrape its website without approval, posing risks to customer data and its advertising business.",
    url: "https://www.cnbc.com/2026/03/10/amazon-wins-court-order-to-block-perplexitys-ai-shopping-agent.html",
    readTime: "3 min",
    category: "headlines",
  },
  {
    id: "tldr9",
    title: "GitHub Copilot SDK: Execution Is the New Interface",
    summary: "GitHub Copilot SDK enables AI-driven execution directly within applications, moving beyond simple text interactions. The era of 'AI as text' is over.",
    url: "https://github.blog/ai-and-ml/github-copilot/the-era-of-ai-as-text-is-over-execution-is-the-new-interface/",
    readTime: "5 min",
    category: "launches",
  },
  {
    id: "tldr10",
    title: "OpenAI's Instruction Hierarchy Challenge for Safer LLMs",
    summary: "IH-Challenge is a dataset designed to train models to prioritize instructions based on trust level across system prompts, developers, users, and external data.",
    url: "https://openai.com/index/instruction-hierarchy-challenge/",
    readTime: "6 min",
    category: "research",
  },
];
