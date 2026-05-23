import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Layers, 
  ArrowDownCircle, 
  Eye, 
  VrHeadset, 
  BookOpen, 
  Crown, 
  Zap, 
  Share2, 
  Layout, 
  Brain,
  Info
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Skill {
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  technicalIndicator: string;
}

const skills: Skill[] = [
  {
    title: "3D Animation (Three.js/Fiber)",
    category: "Brain",
    description: "Capacidade de implementar animações complexas em três dimensões utilizando Three.js e React Three Fiber. Inclui manipulação de modelos 3D, câmeras, luzes e materiais para experiências web imersivas.",
    icon: <Box className="w-6 h-6 text-blue-500 animate-bounce" />,
    technicalIndicator: "Three.js / R3F"
  },
  {
    title: "Parallax Effect (JS/CSS)",
    category: "Brain",
    description: "Criação de efeitos de rolagem dinâmica onde elementos de fundo se movem em velocidades diferentes, adicionando profundidade e imersão visual com performance otimizada.",
    icon: <Layers className="w-6 h-6 text-purple-500" />,
    technicalIndicator: "Dynamic Z-Index"
  },
  {
    title: "Scroll Effect (Intersection Observer/GSAP)",
    category: "Brain",
    description: "Interações visuais acionadas por rolagem utilizando Intersection Observer API para detecção eficiente e GSAP para animações fluidas e controladas por linha do tempo.",
    icon: <ArrowDownCircle className="w-6 h-6 text-green-500" />,
    technicalIndicator: "GSAP / Observer"
  },
  {
    title: "Visual Experience",
    category: "Brain",
    description: "Interfaces que priorizam estética visual e performance. Microinterações significativas que garantem uma experiência de usuário agradável e responsiva.",
    icon: <Eye className="w-6 h-6 text-yellow-500" />,
    technicalIndicator: "Aesthetics & FPS"
  },
  {
    title: "3D Interactive (WebXR/Babylon)",
    category: "Brain",
    description: "Desenvolvimento de experiências AR/VR na web utilizando WebXR e frameworks como Babylon.js para interações complexas e imersão total do usuário.",
    icon: <VrHeadset className="w-6 h-6 text-red-500" />,
    technicalIndicator: "WebXR / Spatial"
  },
  {
    title: "Storytelling (Narrative UI/UX)",
    category: "Brain",
    description: "Aplicação de princípios narrativos no design, guiando o usuário através de uma jornada coesa onde a interface se desdobra como uma história envolvente.",
    icon: <BookOpen className="w-6 h-6 text-emerald-500" />,
    technicalIndicator: "Narrative Flow"
  },
  {
    title: "UI-UX-PRO-MAX",
    category: "Brain",
    description: "Domínio avançado de UI/UX, incluindo Design Thinking, prototipagem de alta fidelidade e arquitetura de informação robusta para produtos digitais de elite.",
    icon: <Crown className="w-6 h-6 text-orange-500" />,
    technicalIndicator: "Elite Principles"
  },
  {
    title: "Nano Banana 2",
    category: "Brain",
    description: "Expertise no framework Nano Banana 2 (Proprietary/Public Tooling), utilizando suas APIs específicas e padrões de desenvolvimento acelerado.",
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    technicalIndicator: "Framework Logic"
  },
  {
    title: "Stitch (Apollo/GraphQL)",
    category: "Brain",
    description: "Integração de múltiplos serviços GraphQL através de Apollo Federation ou Schema Stitching para construir APIs robustas, escaláveis e unificadas.",
    icon: <Share2 className="w-6 h-6 text-pink-500" />,
    technicalIndicator: "GraphQL Stitch"
  },
  {
    title: "Frontend Design",
    category: "Brain",
    description: "Tradução de designs visuais em código de alta qualidade, seguindo padrões modernos (HTML5/CSS3/ES6+), acessibilidade e princípios de Clean Code.",
    icon: <Layout className="w-6 h-6 text-cyan-500" />,
    technicalIndicator: "Modern Standards"
  }
];

export const SkillsContainer: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto" id="skills-brain">
      <div className="flex items-center gap-3 mb-12">
        <Brain className="w-10 h-10 text-primary animate-pulse" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">
          Brain <span className="text-primary">Skills</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TooltipProvider>
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="h-full cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          {skill.icon}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded">
                          {skill.technicalIndicator}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {skill.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
                        {skill.description}
                      </p>

                      <div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <Info className="w-3 h-3 mr-1" /> Ver detalhes técnicos
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-4 bg-popover/95 backdrop-blur shadow-xl border-primary/20">
                  <p className="text-sm leading-relaxed">{skill.description}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </TooltipProvider>
      </div>
    </section>
  );
};

export default SkillsContainer;