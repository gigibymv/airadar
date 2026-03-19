export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          category: string
          data: Json
          id: string
          item_id: string
          saved_at: string
          source: string
          title: string
          url: string
          user_id: string
        }
        Insert: {
          category: string
          data?: Json
          id?: string
          item_id: string
          saved_at?: string
          source: string
          title: string
          url: string
          user_id: string
        }
        Update: {
          category?: string
          data?: Json
          id?: string
          item_id?: string
          saved_at?: string
          source?: string
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author: string
          comments: number
          created_at: string
          description: string
          how_it_helps: string
          id: string
          published_date: string
          repo: string | null
          source: Database["public"]["Enums"]["community_source"]
          stars: number | null
          subreddit: string | null
          title: string
          updated_at: string
          upvotes: number | null
          url: string
        }
        Insert: {
          author: string
          comments?: number
          created_at?: string
          description: string
          how_it_helps: string
          id?: string
          published_date?: string
          repo?: string | null
          source: Database["public"]["Enums"]["community_source"]
          stars?: number | null
          subreddit?: string | null
          title: string
          updated_at?: string
          upvotes?: number | null
          url: string
        }
        Update: {
          author?: string
          comments?: number
          created_at?: string
          description?: string
          how_it_helps?: string
          id?: string
          published_date?: string
          repo?: string | null
          source?: Database["public"]["Enums"]["community_source"]
          stars?: number | null
          subreddit?: string | null
          title?: string
          updated_at?: string
          upvotes?: number | null
          url?: string
        }
        Relationships: []
      }
      executive_briefings: {
        Row: {
          africa_items: Json | null
          africa_no_update: boolean
          created_at: string
          global_items: Json
          id: string
          published_date: string
          signals_to_watch: Json
          updated_at: string
        }
        Insert: {
          africa_items?: Json | null
          africa_no_update?: boolean
          created_at?: string
          global_items?: Json
          id?: string
          published_date?: string
          signals_to_watch?: Json
          updated_at?: string
        }
        Update: {
          africa_items?: Json | null
          africa_no_update?: boolean
          created_at?: string
          global_items?: Json
          id?: string
          published_date?: string
          signals_to_watch?: Json
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          category: Database["public"]["Enums"]["news_category"]
          created_at: string
          id: string
          is_breaking: boolean
          published_date: string
          source: string
          summary: string
          takeaways: string[]
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category: Database["public"]["Enums"]["news_category"]
          created_at?: string
          id?: string
          is_breaking?: boolean
          published_date?: string
          source: string
          summary: string
          takeaways?: string[]
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: Database["public"]["Enums"]["news_category"]
          created_at?: string
          id?: string
          is_breaking?: boolean
          published_date?: string
          source?: string
          summary?: string
          takeaways?: string[]
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      pipeline_runs: {
        Row: {
          counts: Json | null
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          mode: string
          started_at: string
          status: string
        }
        Insert: {
          counts?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          mode?: string
          started_at?: string
          status?: string
        }
        Update: {
          counts?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          mode?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      tldr_items: {
        Row: {
          category: Database["public"]["Enums"]["tldr_category"]
          created_at: string
          id: string
          published_date: string
          read_time: string
          summary: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category: Database["public"]["Enums"]["tldr_category"]
          created_at?: string
          id?: string
          published_date?: string
          read_time?: string
          summary: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: Database["public"]["Enums"]["tldr_category"]
          created_at?: string
          id?: string
          published_date?: string
          read_time?: string
          summary?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      use_cases: {
        Row: {
          author: string
          category: Database["public"]["Enums"]["use_case_category"]
          comments: number | null
          created_at: string
          highlighted_date: string | null
          highlighted_rank: number | null
          id: string
          is_highlighted: boolean
          likes: number | null
          productivity_gain: string
          published_date: string
          source: string
          stars: number | null
          summary: string
          title: string
          tools_used: string[]
          type: Database["public"]["Enums"]["use_case_type"]
          updated_at: string
          upvotes: number | null
          url: string
        }
        Insert: {
          author?: string
          category?: Database["public"]["Enums"]["use_case_category"]
          comments?: number | null
          created_at?: string
          highlighted_date?: string | null
          highlighted_rank?: number | null
          id?: string
          is_highlighted?: boolean
          likes?: number | null
          productivity_gain?: string
          published_date?: string
          source?: string
          stars?: number | null
          summary: string
          title: string
          tools_used?: string[]
          type?: Database["public"]["Enums"]["use_case_type"]
          updated_at?: string
          upvotes?: number | null
          url: string
        }
        Update: {
          author?: string
          category?: Database["public"]["Enums"]["use_case_category"]
          comments?: number | null
          created_at?: string
          highlighted_date?: string | null
          highlighted_rank?: number | null
          id?: string
          is_highlighted?: boolean
          likes?: number | null
          productivity_gain?: string
          published_date?: string
          source?: string
          stars?: number | null
          summary?: string
          title?: string
          tools_used?: string[]
          type?: Database["public"]["Enums"]["use_case_type"]
          updated_at?: string
          upvotes?: number | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      community_source: "github" | "reddit"
      news_category: "LLMs" | "Robotics" | "Research" | "Industry" | "Policy"
      tldr_category: "headlines" | "research" | "tools" | "launches"
      use_case_category:
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
        | "other"
      use_case_type: "person" | "company"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      community_source: ["github", "reddit"],
      news_category: ["LLMs", "Robotics", "Research", "Industry", "Policy"],
      tldr_category: ["headlines", "research", "tools", "launches"],
      use_case_category: [
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
      ],
      use_case_type: ["person", "company"],
    },
  },
} as const
