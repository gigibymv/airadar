export type UseCaseType = "person" | "company";
export type UseCaseCategory =
  | "productivity"
  | "healthcare"
  | "finance"
  | "marketing"
  | "customer-support"
  | "operations"
  | "engineering"
  | "education"
  | "legal"
  | "hr"
  | "other";

export const USE_CASE_CATEGORIES: readonly UseCaseCategory[] = [
  "productivity",
  "healthcare",
  "finance",
  "marketing",
  "customer-support",
  "operations",
  "engineering",
  "education",
  "legal",
  "hr",
  "other",
];

export const USE_CASE_CATEGORY_LABELS: Record<UseCaseCategory, string> = {
  productivity: "Productivity",
  healthcare: "Healthcare",
  finance: "Finance",
  marketing: "Marketing",
  "customer-support": "Customer Support",
  operations: "Operations",
  engineering: "Engineering",
  education: "Education",
  legal: "Legal",
  hr: "HR",
  other: "Other",
};

export function normalizeUseCaseType(value: unknown): UseCaseType {
  if (typeof value !== "string") return "person";
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "person";

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

export function normalizeUseCaseCategory(value: unknown): UseCaseCategory {
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

export function isPersonUseCase(type: UseCaseType): boolean {
  return type === "person";
}

export function isCompanyUseCase(type: UseCaseType): boolean {
  return type === "company";
}

export interface UseCasePost {
  id: string;
  title: string;
  author: string;
  source: "reddit" | "linkedin" | "github";
  subreddit?: string;
  profileTitle?: string;
  repo?: string;
  summary: string;
  toolsUsed: string[];
  productivityGain: string;
  howItHelpsYou?: string;
  implementationSteps?: string[];
  url: string;
  timeAgo: string;
  upvotes?: number;
  likes?: number;
  stars?: number;
  comments: number;
  type: UseCaseType;
  category: UseCaseCategory;
  isHighlighted?: boolean;
  highlightedDate?: string;
  highlightedRank?: number;
}
