-- Create table for search queries and optimization
CREATE TABLE public.brain_search_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    original_query TEXT NOT NULL,
    optimized_queries TEXT[], -- MPLN Output
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for structured web results
CREATE TABLE public.brain_search_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    search_id UUID REFERENCES public.brain_search_history(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    snippet TEXT,
    content TEXT,
    relevance_score FLOAT DEFAULT 0,
    source_reputation FLOAT DEFAULT 0.5,
    extracted_data JSONB DEFAULT '[]'::jsonb, -- MEIR Output
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brain_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_search_results ENABLE ROW LEVEL SECURITY;

-- Public policies for the matrix
CREATE POLICY "Public access for search history" ON public.brain_search_history FOR ALL USING (true);
CREATE POLICY "Public access for search results" ON public.brain_search_results FOR ALL USING (true);
