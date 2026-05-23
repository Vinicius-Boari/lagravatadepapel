import React, { useMemo } from 'react';
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
  Terminal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

// Sub-componente para otimizar renderização via memoization se necessário no futuro
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
              Optimized Skill Matrix v2.1
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border/50 px-4 py-2 rounded-full bg-muted/30">
          <Terminal className="w-4 h-4" />
          <span>Status: Optimized & Operational</span>
        </div>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memoizedSkills.map((skill, index) => (
            <SkillCard key={skill.title} skill={skill} index={index} />
          ))}
        </div>
      </TooltipProvider>
    </section>
  );
};

export default SkillsContainer;