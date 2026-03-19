
-- Create news categories enum
CREATE TYPE public.news_category AS ENUM ('LLMs', 'Robotics', 'Research', 'Industry', 'Policy');

-- Create TLDR categories enum
CREATE TYPE public.tldr_category AS ENUM ('headlines', 'research', 'tools', 'launches');

-- Create community source enum
CREATE TYPE public.community_source AS ENUM ('github', 'reddit');

-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- News articles table (replaces mockNews)
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  takeaways TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  category news_category NOT NULL,
  is_breaking BOOLEAN NOT NULL DEFAULT false,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TLDR items table (replaces mockTldrItems)
CREATE TABLE public.tldr_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  url TEXT NOT NULL,
  read_time TEXT NOT NULL DEFAULT '2 min',
  category tldr_category NOT NULL,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community posts table (replaces mockCommunityPosts)
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source community_source NOT NULL,
  subreddit TEXT,
  repo TEXT,
  description TEXT NOT NULL,
  how_it_helps TEXT NOT NULL,
  author TEXT NOT NULL,
  url TEXT NOT NULL,
  upvotes INTEGER,
  stars INTEGER,
  comments INTEGER NOT NULL DEFAULT 0,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tldr_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Public read access (this is a public dashboard)
CREATE POLICY "Anyone can read news articles" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "Anyone can read tldr items" ON public.tldr_items FOR SELECT USING (true);
CREATE POLICY "Anyone can read community posts" ON public.community_posts FOR SELECT USING (true);

-- Only service role can insert/update/delete (via edge functions)
CREATE POLICY "Service role can manage news" ON public.news_articles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage tldr" ON public.tldr_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage community" ON public.community_posts FOR ALL USING (auth.role() = 'service_role');

-- Indexes for date-based queries
CREATE INDEX idx_news_published_date ON public.news_articles (published_date DESC);
CREATE INDEX idx_tldr_published_date ON public.tldr_items (published_date DESC);
CREATE INDEX idx_community_published_date ON public.community_posts (published_date DESC);

-- Update triggers
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tldr_items_updated_at BEFORE UPDATE ON public.tldr_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
