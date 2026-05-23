import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  ArrowDownCircle, 
  Eye, 
  Headset, 
  Share2, 
  Layout, 
  Brain,
  Code2,
  Terminal,
  Cpu,
  Sparkles,
  Search,
  Globe,
  Zap,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Skill {
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  technicalIndicator: string;
  details: string[];
  tech: string[];
}

const INITIAL_SKILLS: Skill[] = [
  {
    title: "Visual Experience",
    category: "Cérebro",
    description: "Componentes visuais que impactam a percepção estética e usabilidade, focando em Design Systems e Acessibilidade.",
    icon: <Eye className="w-6 h-6 text-yellow-500" />,
    technicalIndicator: "UX/UI Visual",
    details: [
      "Design Systems (Shadcn UI, IBM Carbon)",
      "UI Prototyping (Figma, Adobe XD)",
      "Animações CSS/JS (Framer Motion)",
      "Design Responsivo & Mobile-First",
      "Acessibilidade Web (WCAG/ARIA)"
    ],
    tech: ["CSS3", "SVG", "Tailwind", "Figma"]
  },
  {
    title: "3D Interactive",
    category: "Cérebro",
    description: "Criação e manipulação de objetos e ambientes 3D em tempo real com suporte a WebXR.",
    icon: <Headset className="w-6 h-6 text-red-500" />,
    technicalIndicator: "WebXR / 3D",
    details: [
      "Modelagem 3D (glTF/PBR)",
      "Shaders Customizados (GLSL)",
      "Física 3D (Cannon.js/Ammo.js)",
      "Realidade Virtual e Aumentada",
      "Otimização de Draw Calls"
    ],
    tech: ["Three.js", "Babylon.js", "WebGPU", "Blender"]
  },
  {
    title: "Frontend Design",
    category: "Cérebro",
    description: "Fusão de design visual e desenvolvimento técnico para criar interfaces dinâmicas e de código limpo.",
    icon: <Layout className="w-6 h-6 text-cyan-500" />,
    technicalIndicator: "Design Implementation",
    details: [
      "Componentização Avançada (React)",
      "Clean Architecture no Frontend",
      "State Management (Redux/Context)",
      "Automação de Build (Vite/Webpack)",
      "Testes de UI/UX (Playwright)"
    ],
    tech: ["HTML5", "TypeScript", "Vite", "React"]
  },
  {
    title: "Pesquisa Inteligente",
    category: "Cérebro",
    description: "Módulo de pesquisa web que integra agregação multi-fonte, NLP e extração de dados para o Cérebro.",
    icon: <Globe className="w-6 h-6 text-emerald-500" />,
    technicalIndicator: "Intelligent Search",
    details: [
      "Módulo de Interface de Busca (MIS)",
      "Agregação de Resultados Web (MARW)",
      "Processamento de Linguagem Natural",
      "Extração de Info Relevante (MEIR)",
      "Persistência Automática no MFA"
    ],
    tech: ["Search APIs", "Scraping", "NLP Expansion", "JSON MFA"]
  },
  {
    title: "Aprendizagem Autônoma",
    category: "Cérebro",
    description: "Sistema de 'Segundo Cérebro' digital que adapta seu conhecimento através de interações e feedback.",
    icon: <Cpu className="w-6 h-6 text-purple-500" />,
    technicalIndicator: "Self-Learning AI",
    details: [
      "Banco de Dados Vetorial/Grafo",
      "Aquisição por Feedback Direto",
      "Mecanismo de Auto-Reflexão",
      "Recuperação Semântica",
      "Esquecimento Gradual Simulado"
    ],
    tech: ["Supabase", "NLP", "Vector DB", "Embeddings"]
  },
  {
    title: "3D Animation (Fiber)",
    category: "Cérebro",
    description: "Animações complexas utilizando Three.js e sua integração profunda com React.",
    icon: <Box className="w-6 h-6 text-blue-500" />,
    technicalIndicator: "R3F / Three.js",
    details: ["R3F Hooks", "Luzes e Sombras", "Camera Controller"],
    tech: ["React Three Fiber", "Drei"]
  },
  {
    title: "Scroll & Parallax",
    category: "Cérebro",
    description: "Profundidade visual e gatilhos de animação baseados na rolagem da página.",
    icon: <ArrowDownCircle className="w-6 h-6 text-green-500" />,
    technicalIndicator: "GSAP / Observer",
    details: ["Intersection Observer", "ScrollTrigger", "Parallax Layers"],
    tech: ["GSAP", "Locomotive Scroll"]
  },
  {
    title: "Stitch (GraphQL)",
    category: "Cérebro",
    description: "Orquestração de microsserviços e unificação de schemas GraphQL.",
    icon: <Share2 className="w-6 h-6 text-pink-500" />,
    technicalIndicator: "Apollo Federation",
    details: ["Schema Stitching", "Federated Graphs", "Micro-frontends"],
    tech: ["Apollo", "GraphQL"]
  }
];

// Componente do Centro de Inteligência do Cérebro
const BrainIntelligenceCenter = () => {
  const [activeTab, setActiveTab] = useState("learning");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'brain', text: string, type?: string }[]>([
    { role: 'brain', text: "Módulo Cérebro ativo. Pronto para processar novas informações ou realizar pesquisas complexas." }
  ]);

  const [searchResults, setSearchResults] = useState<{ title: string; url: string; snippet: string; confidence: number }[]>([]);

  const handleAction = async () => {
    if (!query.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    const currentQuery = query;
    setQuery("");

    if (activeTab === "learning") {
      setTimeout(() => {
        let response = "";
        if (currentQuery.toLowerCase().includes("ensine") || currentQuery.toLowerCase().includes("aprenda")) {
          response = "Informação processada pelo MFA e integrada ao grafo de conhecimento (Confiança: 0.92). Relações semânticas estabelecidas.";
        } else if (currentQuery.toLowerCase().includes("errou")) {
          response = "Correção recebida. Nó de conhecimento atualizado. Confiança na versão anterior resetada para 0.1.";
        } else {
          response = "Baseado no meu banco vetorial, identifiquei este padrão em suas interações passadas. Deseja reforçar esta conexão?";
        }
        setMessages(prev => [...prev, { role: 'brain', text: response }]);
      }, 600);
    } else {
      setIsSearching(true);
      // Simulação do fluxo: MIS -> MPLN -> MARW -> MEIR -> MFA
      setTimeout(() => {
        setSearchResults([
          { title: "Documentação Oficial React Three Fiber", url: "https://docs.pmnd.rs", snippet: "Extraído: Hooks avançados para performance R3F.", confidence: 0.98 },
          { title: "WebXR API Standards", url: "https://w3c.github.io/webxr", snippet: "Fato: Padrões de imersão para browsers modernos.", confidence: 0.95 }
        ]);
        setMessages(prev => [...prev, { role: 'brain', text: "Pesquisa concluída. 2 novas fontes de alta confiança identificadas e formatadas para aprendizagem automática." }]);
        setIsSearching(false);
      }, 1500);
    }
  };

  return (
    <Card className="mt-12 border-primary/20 bg-background/40 backdrop-blur-xl overflow-hidden shadow-2xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="p-4 border-b border-primary/10 bg-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary animate-pulse" />
            <TabsList className="bg-background/50 border border-primary/20">
              <TabsTrigger value="learning" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs uppercase font-bold tracking-tighter">
                <Sparkles className="w-3 h-3 mr-2" /> Aprendizagem
              </TabsTrigger>
              <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs uppercase font-bold tracking-tighter">
                <Globe className="w-3 h-3 mr-2" /> Pesquisa Inteligente
              </TabsTrigger>
            </TabsList>
          </div>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary self-start md:self-auto">
            Integrated Hub v3.1
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 border-r border-primary/10">
            <ScrollArea className="h-[350px] p-6">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((m, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none shadow-lg' 
                          : 'bg-muted/80 backdrop-blur border border-border/50 rounded-tl-none'
                      }`}>
                        {m.text}
                      </div>
                    </motion.div>
                  ))}
                  {isSearching && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-muted/80 p-4 rounded-2xl rounded-tl-none border border-primary/20 flex items-center gap-3">
                        <Zap className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-xs font-mono uppercase tracking-widest text-primary">Pesquisando Web...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-primary/10 bg-muted/20 flex gap-2">
              <Input 
                placeholder={activeTab === 'learning' ? "Ensine algo ao Cérebro..." : "O que deseja pesquisar na web?"} 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAction()}
                className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12"
              />
              <Button onClick={handleAction} size="icon" className="h-12 w-12 shadow-lg">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="bg-muted/10 p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-primary/10 pb-4">
              <Filter className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Status do Processamento</h4>
            </div>
            
            {activeTab === 'search' && searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((res, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-[10px] font-bold truncate pr-4">{res.title}</h5>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500">{res.confidence * 100}%</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground line-clamp-2 mb-2 italic">"{res.snippet}"</p>
                    <Badge variant="secondary" className="text-[8px] h-4 bg-primary/5 text-primary border-none">MFA Ready</Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center opacity-30">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p className="text-[10px] font-mono uppercase tracking-widest">Nenhum dado pendente</p>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-primary/10">
              <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground mb-2">
                <span>Latência de Busca</span>
                <span className="text-primary">1.2s</span>
              </div>
              <div className="w-full bg-primary/10 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isSearching ? "100%" : "30%" }}
                  className="bg-primary h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </Card>
  );
};

// Sub-componente para otimizar renderização via memoization
const SkillCard = React.memo(({ skill, index }: { skill: Skill; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    viewport={{ once: true, margin: "-50px" }}
  >
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="h-full border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md shadow-xl hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden will-change-transform">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 rounded-2xl bg-background/50 shadow-inner group-hover:scale-105 transition-transform duration-300">
                {skill.icon}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  {skill.technicalIndicator}
                </span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-3">
              {skill.title}
            </h3>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
              {skill.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
              {skill.tech.slice(0, 3).map(t => (
                <span key={t} className="text-[10px] font-mono text-muted-foreground/70 border border-border/50 px-2 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="top" className="w-80 p-6 bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl z-50">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-tighter">
            <Code2 className="w-4 h-4" />
            <span>Especialidades</span>
          </div>
          <ul className="space-y-2">
            {skill.details.map((d, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" />
                {d}
              </li>
            ))}
          </ul>
          <div className="pt-4 border-t border-border/50">
            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Stack Completa</div>
            <div className="flex flex-wrap gap-1">
              {skill.tech.map(t => (
                <span key={t} className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </motion.div>
));

SkillCard.displayName = 'SkillCard';

export const SkillsContainer: React.FC = () => {
  // Memoize skills to prevent unnecessary recalculations if the component re-renders
  const memoizedSkills = useMemo(() => INITIAL_SKILLS, []);

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto" id="skills-brain">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase">
              Cérebro <span className="text-primary font-light italic">Core</span>
            </h2>
            <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
              Optimized Skill Matrix v3.1
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border/50 px-4 py-2 rounded-full bg-muted/30">
          <Terminal className="w-4 h-4" />
          <span>Status: Research & Learning Hub Active</span>
        </div>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memoizedSkills.map((skill, index) => (
            <SkillCard key={skill.title} skill={skill} index={index} />
          ))}
        </div>
      </TooltipProvider>

      <BrainIntelligenceCenter />
    </section>
  );
};

export default SkillsContainer;