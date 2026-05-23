-- Create brain_knowledge table
CREATE TABLE public.brain_knowledge (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('conceito', 'fato', 'ação', 'regra')),
    source TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
    metadata JSONB DEFAULT '{}'::jsonb,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create brain_relationships table
CREATE TABLE public.brain_relationships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES public.brain_knowledge(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.brain_knowledge(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('eh_parte_de', 'eh_um_exemplo_de', 'causa', 'consequencia', 'sinonimo_de', 'relacionado_a')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(source_id, target_id, relation_type)
);

-- Create brain_interactions table
CREATE TABLE public.brain_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    knowledge_id UUID REFERENCES public.brain_knowledge(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brain_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies (Public access for this demo/matrix)
CREATE POLICY "Public read access for brain_knowledge" ON public.brain_knowledge FOR SELECT USING (true);
CREATE POLICY "Public insert access for brain_knowledge" ON public.brain_knowledge FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for brain_knowledge" ON public.brain_knowledge FOR UPDATE USING (true);

CREATE POLICY "Public read access for brain_relationships" ON public.brain_relationships FOR SELECT USING (true);
CREATE POLICY "Public insert access for brain_relationships" ON public.brain_relationships FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access for brain_interactions" ON public.brain_interactions FOR SELECT USING (true);
CREATE POLICY "Public insert access for brain_interactions" ON public.brain_interactions FOR INSERT WITH CHECK (true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_brain_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brain_knowledge_updated_at
BEFORE UPDATE ON public.brain_knowledge
FOR EACH ROW EXECUTE FUNCTION public.handle_brain_updated_at();
